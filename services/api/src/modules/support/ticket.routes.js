import { Router } from "express";
import { z } from "zod";
import { PERMISSIONS, TICKET_STATUS, SOCKET_EVENTS } from "@meiteimart/shared";
import { Ticket } from "./ticket.model.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requirePermissions } from "../../middlewares/rbac.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { getIo } from "../../sockets/index.js";

const router = Router();
router.use(requireAuth());

function ticketNumber() {
  return `TCK-${Date.now().toString(36).toUpperCase()}`;
}

const createTicketSchema = z.object({
  subject: z.string().min(3),
  category: z.enum(["order", "payment", "delivery", "product", "account", "other"]).default("other"),
  order: z.string().optional(),
  message: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

router.post(
  "/",
  requirePermissions(PERMISSIONS.TICKET_CREATE),
  asyncHandler(async (req, res) => {
    const body = createTicketSchema.parse(req.body);
    const ticket = await Ticket.create({
      ticketNumber: ticketNumber(),
      raisedBy: req.user.id,
      order: body.order,
      subject: body.subject,
      category: body.category,
      priority: body.priority,
      messages: [{ sender: req.user.id, message: body.message }],
    });
    return sendSuccess(res, { statusCode: 201, data: { ticket }, message: "Support ticket created" });
  })
);

router.get(
  "/",
  requirePermissions(PERMISSIONS.TICKET_READ_OWN),
  asyncHandler(async (req, res) => {
    const filter = req.user.isSuperAdmin || (req.user.permissions || []).includes(PERMISSIONS.TICKET_READ_ANY)
      ? {}
      : { raisedBy: req.user.id };
    const { status } = req.query;
    if (status) filter.status = status;
    const tickets = await Ticket.find(filter).populate("raisedBy", "name email phone").sort({ createdAt: -1 });
    return sendSuccess(res, { data: { tickets } });
  })
);

router.get(
  "/:id",
  requirePermissions(PERMISSIONS.TICKET_READ_OWN),
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).populate("raisedBy", "name email phone").populate("assignedAgent", "name");
    if (!ticket) throw ApiError.notFound("Ticket not found");
    if (
      String(ticket.raisedBy._id) !== req.user.id &&
      !req.user.isSuperAdmin &&
      !(req.user.permissions || []).includes(PERMISSIONS.TICKET_READ_ANY)
    ) {
      throw ApiError.forbidden();
    }
    return sendSuccess(res, { data: { ticket } });
  })
);

router.post(
  "/:id/messages",
  requirePermissions(PERMISSIONS.TICKET_READ_OWN),
  asyncHandler(async (req, res) => {
    const { message, attachments } = z
      .object({ message: z.string().min(1), attachments: z.array(z.string()).optional() })
      .parse(req.body);

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw ApiError.notFound("Ticket not found");

    ticket.messages.push({ sender: req.user.id, message, attachments: attachments || [] });
    if (ticket.status === TICKET_STATUS.OPEN) ticket.status = TICKET_STATUS.IN_PROGRESS;
    await ticket.save();

    getIo()?.to(`ticket:${ticket._id}`).emit(SOCKET_EVENTS.TICKET_MESSAGE, {
      ticketId: ticket._id,
      sender: req.user.id,
      message,
      sentAt: new Date().toISOString(),
    });

    return sendSuccess(res, { data: { ticket }, message: "Message sent" });
  })
);

router.patch(
  "/:id/assign",
  requirePermissions(PERMISSIONS.TICKET_ASSIGN),
  asyncHandler(async (req, res) => {
    const { agentId } = z.object({ agentId: z.string() }).parse(req.body);
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId, status: TICKET_STATUS.IN_PROGRESS },
      { new: true }
    );
    if (!ticket) throw ApiError.notFound("Ticket not found");
    return sendSuccess(res, { data: { ticket }, message: "Ticket assigned" });
  })
);

router.patch(
  "/:id/status",
  requirePermissions(PERMISSIONS.TICKET_RESPOND),
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(Object.values(TICKET_STATUS)) }).parse(req.body);
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) throw ApiError.notFound("Ticket not found");

    getIo()?.to(`ticket:${ticket._id}`).emit(SOCKET_EVENTS.TICKET_STATUS_UPDATED, { ticketId: ticket._id, status });
    return sendSuccess(res, { data: { ticket }, message: "Ticket status updated" });
  })
);

export default router;

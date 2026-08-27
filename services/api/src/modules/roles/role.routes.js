import { Router } from "express";
import { z } from "zod";
import { PERMISSIONS } from "@meiteimart/shared";
import { Role } from "./role.model.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requirePermissions } from "../../middlewares/rbac.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const router = Router();

const roleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
  permissions: z.array(z.string()).default([]),
  portals: z.array(z.enum(["admin", "customer", "seller", "delivery", "support"])).default([]),
});

router.use(requireAuth());

router.get(
  "/",
  requirePermissions(PERMISSIONS.ROLE_MANAGE),
  asyncHandler(async (req, res) => {
    const roles = await Role.find().sort({ createdAt: 1 });
    return sendSuccess(res, { data: { roles } });
  })
);

router.get("/permissions/catalogue", requirePermissions(PERMISSIONS.ROLE_MANAGE), (req, res) => {
  return sendSuccess(res, { data: { permissions: PERMISSIONS } });
});

router.post(
  "/",
  requirePermissions(PERMISSIONS.ROLE_MANAGE),
  asyncHandler(async (req, res) => {
    const body = roleSchema.parse(req.body);
    const existing = await Role.findOne({ name: body.name.toUpperCase() });
    if (existing) throw ApiError.conflict("A role with this name already exists");

    const role = await Role.create({ ...body, name: body.name.toUpperCase() });
    return sendSuccess(res, { statusCode: 201, data: { role }, message: "Role created" });
  })
);

router.patch(
  "/:id",
  requirePermissions(PERMISSIONS.ROLE_MANAGE),
  asyncHandler(async (req, res) => {
    const body = roleSchema.partial().parse(req.body);
    const role = await Role.findById(req.params.id);
    if (!role) throw ApiError.notFound("Role not found");
    if (role.isSystem && body.permissions) {
      // system roles can still have permissions tuned, but never renamed/deleted
      delete body.name;
    }
    Object.assign(role, body);
    await role.save();
    return sendSuccess(res, { data: { role }, message: "Role updated" });
  })
);

router.delete(
  "/:id",
  requirePermissions(PERMISSIONS.ROLE_MANAGE),
  asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id);
    if (!role) throw ApiError.notFound("Role not found");
    if (role.isSystem) throw ApiError.forbidden("System roles cannot be deleted");
    await role.deleteOne();
    return sendSuccess(res, { message: "Role deleted" });
  })
);

export default router;

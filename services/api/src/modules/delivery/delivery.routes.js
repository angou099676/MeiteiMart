import { Router } from "express";
import { z } from "zod";
import { PERMISSIONS, DELIVERY_PARTNER_STATUS, SOCKET_EVENTS } from "@meiteimart/shared";
import { DeliveryProfile } from "./deliveryProfile.model.js";
import { User } from "../users/user.model.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requirePermissions } from "../../middlewares/rbac.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { getIo } from "../../sockets/index.js";

const router = Router();
router.use(requireAuth());

const profileSchema = z.object({
  vehicleType: z.enum(["bike", "bicycle", "scooter", "van"]).optional(),
  vehicleNumber: z.string().optional(),
  documents: z.object({ idProofUrl: z.string().optional(), drivingLicenseUrl: z.string().optional() }).optional(),
});

router.post(
  "/profile",
  requirePermissions(PERMISSIONS.DELIVERY_ACCEPT),
  asyncHandler(async (req, res) => {
    const body = profileSchema.parse(req.body);
    const existing = await DeliveryProfile.findOne({ user: req.user.id });
    if (existing) throw ApiError.conflict("Delivery profile already exists");

    const profile = await DeliveryProfile.create({ user: req.user.id, ...body });
    await User.findByIdAndUpdate(req.user.id, { deliveryProfile: profile._id });
    return sendSuccess(res, { statusCode: 201, data: { profile }, message: "Delivery profile submitted for approval" });
  })
);

router.get(
  "/profile/me",
  requirePermissions(PERMISSIONS.DELIVERY_TRACK_SELF),
  asyncHandler(async (req, res) => {
    const profile = await DeliveryProfile.findOne({ user: req.user.id });
    if (!profile) throw ApiError.notFound("No delivery profile found");
    return sendSuccess(res, { data: { profile } });
  })
);

router.patch(
  "/status",
  requirePermissions(PERMISSIONS.DELIVERY_UPDATE_STATUS),
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(Object.values(DELIVERY_PARTNER_STATUS)) }).parse(req.body);
    const profile = await DeliveryProfile.findOneAndUpdate({ user: req.user.id }, { status }, { new: true });
    if (!profile) throw ApiError.notFound("Delivery profile not found");
    return sendSuccess(res, { data: { profile }, message: "Status updated" });
  })
);

// Live location ping — also broadcast over socket for real-time map tracking.
router.post(
  "/location",
  requirePermissions(PERMISSIONS.DELIVERY_TRACK_SELF),
  asyncHandler(async (req, res) => {
    const { lat, lng, orderId } = z
      .object({ lat: z.number(), lng: z.number(), orderId: z.string().optional() })
      .parse(req.body);

    await DeliveryProfile.findOneAndUpdate(
      { user: req.user.id },
      { currentLocation: { type: "Point", coordinates: [lng, lat] } }
    );

    if (orderId) {
      getIo()?.to(`order:${orderId}`).emit(SOCKET_EVENTS.DELIVERY_LOCATION_BROADCAST, {
        orderId,
        deliveryPartnerId: req.user.id,
        lat,
        lng,
        at: new Date().toISOString(),
      });
    }

    return sendSuccess(res, { message: "Location updated" });
  })
);

// Admin: list delivery partners / approve
router.get(
  "/",
  requirePermissions(PERMISSIONS.DELIVERY_PARTNER_MANAGE),
  asyncHandler(async (req, res) => {
    const profiles = await DeliveryProfile.find().populate("user", "name email phone isActive").sort({ createdAt: -1 });
    return sendSuccess(res, { data: { profiles } });
  })
);

router.patch(
  "/:id/approve",
  requirePermissions(PERMISSIONS.DELIVERY_PARTNER_MANAGE),
  asyncHandler(async (req, res) => {
    const profile = await DeliveryProfile.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!profile) throw ApiError.notFound("Delivery profile not found");
    return sendSuccess(res, { data: { profile }, message: "Delivery partner approved" });
  })
);

export default router;

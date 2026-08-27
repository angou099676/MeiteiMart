import { Router } from "express";
import { z } from "zod";
import { PERMISSIONS } from "@meiteimart/shared";
import { User } from "./user.model.js";
import { Role } from "../roles/role.model.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requirePermissions } from "../../middlewares/rbac.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const router = Router();
router.use(requireAuth());

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  roleName: z.string(),
});

// Admins/Super Admins create Seller / Delivery Partner / Support Agent accounts here.
// The user then just logs in via OTP on the relevant portal — no password ever needed.
router.post(
  "/",
  requirePermissions(PERMISSIONS.USER_MANAGE),
  asyncHandler(async (req, res) => {
    const body = createUserSchema.parse(req.body);
    if (!body.email && !body.phone) throw ApiError.badRequest("Provide an email or phone number");

    const role = await Role.findOne({ name: body.roleName.toUpperCase() });
    if (!role) throw ApiError.badRequest("Unknown role");

    const user = await User.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: role._id,
    });
    return sendSuccess(res, { statusCode: 201, data: { user }, message: "User created" });
  })
);

router.get(
  "/",
  requirePermissions(PERMISSIONS.USER_MANAGE),
  asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) {
      const roleDoc = await Role.findOne({ name: String(role).toUpperCase() });
      if (roleDoc) filter.role = roleDoc._id;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter)
      .populate("role", "name")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    return sendSuccess(res, { data: { users, total, page: Number(page), limit: Number(limit) } });
  })
);

router.get(
  "/:id",
  requirePermissions(PERMISSIONS.USER_MANAGE),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate("role");
    if (!user) throw ApiError.notFound("User not found");
    return sendSuccess(res, { data: { user } });
  })
);

router.patch(
  "/:id/status",
  requirePermissions(PERMISSIONS.USER_MANAGE),
  asyncHandler(async (req, res) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) throw ApiError.notFound("User not found");
    return sendSuccess(res, { data: { user }, message: `User ${isActive ? "activated" : "deactivated"}` });
  })
);

router.patch(
  "/me/profile",
  requirePermissions(PERMISSIONS.PROFILE_UPDATE_OWN),
  asyncHandler(async (req, res) => {
    const body = z
      .object({ name: z.string().min(2).optional(), avatarUrl: z.string().url().optional() })
      .parse(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, body, { new: true });
    return sendSuccess(res, { data: { user }, message: "Profile updated" });
  })
);

router.post(
  "/me/addresses",
  requirePermissions(PERMISSIONS.PROFILE_UPDATE_OWN),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        label: z.string().default("Home"),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        isDefault: z.boolean().optional(),
      })
      .parse(req.body);

    const user = await User.findById(req.user.id);
    if (!user) throw ApiError.notFound("User not found");

    if (body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({
      ...body,
      location: { type: "Point", coordinates: [body.lng || 0, body.lat || 0] },
    });
    await user.save();
    return sendSuccess(res, { statusCode: 201, data: { addresses: user.addresses }, message: "Address added" });
  })
);

export default router;

import { z } from "zod";
import { OTP_CHANNEL, ROLES, ROLE_PORTALS } from "@meiteimart/shared";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { requestOtp, verifyOtp, detectChannel } from "./otp.service.js";
import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";
import { issueAuthTokens, verifyRefreshToken, signAccessToken } from "../../services/tokenService.js";
import { env } from "../../config/env.js";

const requestOtpSchema = z.object({
  identifier: z.string().min(3),
});

const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6),
  name: z.string().min(2).max(80).optional(), // used for first-time signup
  portal: z.enum(["admin", "customer", "seller", "delivery", "support"]).default("customer"),
});

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
};

export const requestOtpHandler = asyncHandler(async (req, res) => {
  const { identifier } = requestOtpSchema.parse(req.body);
  const result = await requestOtp({ identifier, purpose: "login" });
  return sendSuccess(res, {
    message: `OTP sent via ${result.channel === OTP_CHANNEL.EMAIL ? "email" : "SMS"}`,
    data: { channel: result.channel, expiresInMinutes: result.expiresInMinutes },
  });
});

export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { identifier, code, name, portal } = verifyOtpSchema.parse(req.body);
  const { channel } = await verifyOtp({ identifier, code });

  const field = channel === OTP_CHANNEL.EMAIL ? "email" : "phone";
  let user = await User.findOne({ [field]: identifier }).populate("role");

  if (!user) {
    // Only the customer portal supports self-service signup. Seller/Delivery/Support/Admin
    // accounts must be created by an Admin first — otherwise a typo'd identifier on those
    // portals would silently register a bogus Customer account instead of failing clearly.
    if (portal !== "customer") {
      throw ApiError.notFound(
        `No ${portal} account found for this email/mobile. Ask an Admin to create your account first.`
      );
    }

    const customerRole = await Role.findOne({ name: ROLES.CUSTOMER });
    if (!customerRole) throw ApiError.internal("Default customer role is not seeded");

    user = await User.create({
      name: name || "New Customer",
      [field]: identifier,
      role: customerRole._id,
      isEmailVerified: channel === OTP_CHANNEL.EMAIL,
      isPhoneVerified: channel === OTP_CHANNEL.MOBILE,
    });
    user = await user.populate("role");
  } else {
    if (channel === OTP_CHANNEL.EMAIL) user.isEmailVerified = true;
    if (channel === OTP_CHANNEL.MOBILE) user.isPhoneVerified = true;
  }

  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const roleName = user.role.name;
  const allowedPortals = user.isSuperAdmin ? ["admin"] : ROLE_PORTALS[roleName] || [];
  if (!allowedPortals.includes(portal)) {
    throw ApiError.forbidden(`Role ${roleName} is not permitted to sign in to the ${portal} portal`);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueAuthTokens({
    _id: user._id,
    role: user.role,
    permissions: user.isSuperAdmin ? ["*"] : user.role.permissions,
  });

  res.cookie("accessToken", tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: roleName,
        isSuperAdmin: user.isSuperAdmin,
        permissions: user.isSuperAdmin ? ["*"] : user.role.permissions,
      },
    },
  });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized("Missing refresh token");

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub).populate("role");
  if (!user?.isActive) throw ApiError.unauthorized("Account not found or inactive");

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role.name,
    permissions: user.isSuperAdmin ? ["*"] : user.role.permissions,
  });

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  return sendSuccess(res, { data: { accessToken } });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return sendSuccess(res, { message: "Logged out" });
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("role").select("-refreshTokenVersion");
  return sendSuccess(res, { data: { user } });
});

// small helper export used elsewhere (e.g. admin-created seller/delivery accounts)
export { detectChannel };

import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const otpRequestRateLimiter = rateLimit({
  windowMs: env.otp.resendCooldownSeconds * 1000,
  limit: 1,
  keyGenerator: (req) => `${req.ip}:${req.body?.identifier || "unknown"}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Please wait before requesting another OTP." },
});

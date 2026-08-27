import { Router } from "express";
import { requestOtpHandler, verifyOtpHandler, refreshTokenHandler, logoutHandler, meHandler } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { otpRequestRateLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

router.post("/otp/request", otpRequestRateLimiter, requestOtpHandler);
router.post("/otp/verify", verifyOtpHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth(), meHandler);

export default router;

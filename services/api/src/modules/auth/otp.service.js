import { OTP_CHANNEL } from "@meiteimart/shared";
import { env } from "../../config/env.js";
import { Otp } from "./otp.model.js";
import { generateNumericOtp, hashOtp, isEmail, isMobile } from "../../utils/crypto.js";
import { sendOtpEmail } from "../../services/emailService.js";
import { sendOtpSms } from "../../services/smsService.js";
import { ApiError } from "../../utils/ApiError.js";

export function detectChannel(identifier) {
  if (isEmail(identifier)) return OTP_CHANNEL.EMAIL;
  if (isMobile(identifier)) return OTP_CHANNEL.MOBILE;
  throw ApiError.badRequest("Identifier must be a valid email address or mobile number");
}

export async function requestOtp({ identifier, purpose = "login" }) {
  const channel = detectChannel(identifier);
  const otp = generateNumericOtp(6);
  const codeHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);

  await Otp.create({ identifier, channel, codeHash, purpose, expiresAt });

  if (channel === OTP_CHANNEL.EMAIL) {
    await sendOtpEmail({ to: identifier, otp, purpose });
  } else {
    await sendOtpSms({ to: identifier, otp });
  }

  return { channel, expiresInMinutes: env.otp.expiryMinutes };
}

export async function verifyOtp({ identifier, code }) {
  const record = await Otp.findOne({ identifier, consumedAt: null }).sort({ createdAt: -1 });
  if (!record) throw ApiError.badRequest("No active OTP found. Please request a new one.");

  if (record.expiresAt < new Date()) {
    throw ApiError.badRequest("OTP has expired. Please request a new one.");
  }
  if (record.attempts >= env.otp.maxAttempts) {
    throw ApiError.tooMany("Maximum OTP attempts exceeded. Please request a new one.");
  }

  const isValid = record.codeHash === hashOtp(code);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Incorrect OTP code");
  }

  record.consumedAt = new Date();
  await record.save();
  return { channel: record.channel };
}

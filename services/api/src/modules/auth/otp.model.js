import mongoose from "mongoose";
import { OTP_CHANNEL } from "@meiteimart/shared";

const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    identifier: { type: String, required: true, index: true }, // email or phone
    channel: { type: String, enum: Object.values(OTP_CHANNEL), required: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["login", "signup"], default: "login" },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);

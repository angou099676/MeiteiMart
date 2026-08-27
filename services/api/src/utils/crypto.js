import crypto from "node:crypto";

export function generateNumericOtp(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function isEmail(identifier) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
}

export function isMobile(identifier) {
  return /^\+?[1-9]\d{7,14}$/.test(identifier);
}

export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `MM-${ts}-${rand}`;
}

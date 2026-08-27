import "dotenv/config";

function parseList(value) {
  return (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 8080,
  apiUrl: process.env.API_URL || "http://localhost:8080",
  corsOrigins: parseList(process.env.CORS_ORIGIN),

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "30d",
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.EMAIL_FROM || "onboarding@resend.dev",
    fromName: process.env.EMAIL_FROM_NAME || "MeiteiMart",
  },

  fast2sms: {
    apiKey: process.env.FAST2SMS_API_KEY,
    senderId: process.env.FAST2SMS_SENDER_ID,
    templateId: process.env.FAST2SMS_MESSAGE_TEMPLATE_ID,
    baseUrl: process.env.FAST2SMS_BASE_URL || "https://www.fast2sms.com/dev/bulkV2",
  },

  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 45,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  },

  blob: {
    readWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
  },

  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL,
    phone: process.env.SUPER_ADMIN_PHONE,
  },
};

export function assertRequiredEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push("MONGODB_URI");
  if (!env.jwt.secret) missing.push("JWT_SECRET");
  if (!env.jwt.refreshSecret) missing.push("JWT_REFRESH_SECRET");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

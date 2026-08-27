import { env } from "../config/env.js";

/**
 * Sends an OTP SMS via Fast2SMS. Falls back to console logging in dev when
 * credentials are not configured so the OTP flow remains testable end to end.
 */
export async function sendOtpSms({ to, otp }) {
  if (!env.fast2sms.apiKey) {
    console.log(`[sms:dev] OTP for ${to}: ${otp}`);
    return { simulated: true };
  }

  const params = new URLSearchParams({
    authorization: env.fast2sms.apiKey,
    route: "otp",
    variables_values: otp,
    numbers: to.replace(/^\+?91/, ""),
  });
  if (env.fast2sms.senderId) params.set("sender_id", env.fast2sms.senderId);
  if (env.fast2sms.templateId) params.set("message", env.fast2sms.templateId);

  const response = await fetch(`${env.fast2sms.baseUrl}?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fast2SMS request failed: ${response.status} ${body}`);
  }

  return response.json();
}

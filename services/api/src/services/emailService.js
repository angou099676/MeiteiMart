import { getResendClient } from "../config/resend.js";
import { env } from "../config/env.js";

export async function sendOtpEmail({ to, otp, purpose = "login" }) {
  const subject = "Your MeiteiMart verification code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#158a49;">MeiteiMart</h2>
      <p>Your one-time verification code (${purpose}) is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
      <p>This code expires in ${env.otp.expiryMinutes} minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const client = getResendClient();
  if (!client) {
    console.log(`[email:dev] OTP for ${to}: ${otp}`);
    return { simulated: true };
  }

  const result = await client.emails.send({
    from: `${env.resend.fromName} <${env.resend.fromEmail}>`,
    to,
    subject,
    html,
  });
  return result;
}

export async function sendTransactionalEmail({ to, subject, html }) {
  const client = getResendClient();
  if (!client) {
    console.log(`[email:dev] To ${to} — ${subject}`);
    return { simulated: true };
  }
  return client.emails.send({
    from: `${env.resend.fromName} <${env.resend.fromEmail}>`,
    to,
    subject,
    html,
  });
}

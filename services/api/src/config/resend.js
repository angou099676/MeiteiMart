import { Resend } from "resend";
import { env } from "./env.js";

let client = null;

export function getResendClient() {
  if (!env.resend.apiKey) {
    console.warn("[resend] RESEND_API_KEY not set — emails will be logged instead of sent.");
    return null;
  }
  if (!client) {
    client = new Resend(env.resend.apiKey);
  }
  return client;
}

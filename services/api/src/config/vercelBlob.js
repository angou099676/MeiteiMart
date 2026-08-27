import { put, del } from "@vercel/blob";
import { env } from "./env.js";

/**
 * Uploads a buffer to Vercel Blob storage and returns the public URL.
 * Used for product images, store logos, ticket attachments, delivery proof photos, etc.
 */
export async function uploadToBlob(pathname, buffer, contentType) {
  if (!env.blob.readWriteToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    token: env.blob.readWriteToken,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteFromBlob(url) {
  if (!env.blob.readWriteToken) return;
  await del(url, { token: env.blob.readWriteToken });
}

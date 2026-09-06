import { logger } from "./logger.js";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const STORAGE_BACKEND = process.env.STORAGE_BACKEND || "";

// Enabled only when STORAGE_BACKEND=supabase AND both Supabase values are set.
// Local development (no env) keeps the old disk-based uploads untouched.
export const isSupabaseStorageEnabled = () =>
  STORAGE_BACKEND === "supabase" && Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

// Private folders stay on the VPS disk (protected + backed up). Everything else
// (content images, banners, galleries) goes to the Supabase public bucket.
export const isPublicFolder = (folderName = "") => {
  const first = String(folderName || "").split("/")[0];
  return !["documents", "user"].includes(first);
};

/**
 * Upload a buffer to the public bucket.
 * @param {{ key: string, buffer: Buffer, contentType: string }} params
 * @returns {Promise<string|null>} public URL or null on failure
 */
export async function uploadToSupabaseStorage({ key, buffer, contentType }) {
  if (!isSupabaseStorageEnabled()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: buffer,
    });
    if (!res.ok) {
      const text = await res.text();
      logger.error("Supabase storage upload failed", { key, status: res.status, text });
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${key}`;
  } catch (error) {
    logger.error("Supabase storage upload error", { key, message: error.message });
    return null;
  }
}

/**
 * Delete an object from the public bucket.
 * Accepts either a full Supabase URL or a bucket key.
 */
export async function deleteSupabaseObject(keyOrUrl) {
  if (!isSupabaseStorageEnabled()) return false;
  const key = keyOrUrl.includes("/storage/v1/object/public/")
    ? keyOrUrl.split("/storage/v1/object/public/")[1]
    : keyOrUrl;
  if (!key) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${key}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    return res.ok;
  } catch (error) {
    logger.error("Supabase storage delete error", { key, message: error.message });
    return false;
  }
}
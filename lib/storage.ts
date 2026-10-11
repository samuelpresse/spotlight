import { del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export type StorageMode = "blob" | "blob-oidc" | "local";

export const storageMode: StorageMode = process.env.BLOB_READ_WRITE_TOKEN
  ? "blob"
  : process.env.BLOB_STORE_ID
    ? "blob-oidc"
    : "local";

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
export const LOCAL_FILE_PREFIX = "/api/files/";

export const ALLOWED_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export async function deleteFiles(urls: (string | null | undefined)[]) {
  const targets = urls.filter((u): u is string => !!u);
  if (targets.length === 0) return;

  if (storageMode !== "local") {
    const blobUrls = targets.filter((u) => u.includes(".blob.vercel-storage.com"));
    if (blobUrls.length) await del(blobUrls).catch(() => {});
    return;
  }

  await Promise.all(
    targets
      .filter((u) => u.startsWith(LOCAL_FILE_PREFIX))
      .map((u) =>
        fs.unlink(path.join(LOCAL_UPLOAD_DIR, path.basename(u.slice(LOCAL_FILE_PREFIX.length)))).catch(() => {})
      )
  );
}

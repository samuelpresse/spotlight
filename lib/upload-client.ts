import { upload, uploadPresigned } from "@vercel/blob/client";

export type StorageMode = "blob" | "blob-oidc" | "local";

const MULTIPART_THRESHOLD = 8 * 1024 * 1024;

const uniquePath = (file: File) => {
  const id = Math.random().toString(36).slice(2, 10);
  const name = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `magazines/${id}-${name}`;
};

export async function uploadFile(
  file: File,
  mode: StorageMode,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (mode === "blob") {
    const blob = await upload(`magazines/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type,
      multipart: file.size > MULTIPART_THRESHOLD,
      onUploadProgress: ({ percentage }) => onProgress?.(percentage),
    });
    return blob.url;
  }

  if (mode === "blob-oidc") {
    const blob = await uploadPresigned(uniquePath(file), file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type,
      multipart: file.size > MULTIPART_THRESHOLD,
      onUploadProgress: ({ percentage }) => onProgress?.(percentage),
    });
    return blob.url;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.((e.loaded / e.total) * 100);
    xhr.onload = () => {
      const json = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300 && json.url) resolve(json.url);
      else reject(new Error(json.error || `Échec de l'envoi (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'envoi"));
    xhr.send(body);
  });
}

export async function uploadFiles(
  files: File[],
  mode: StorageMode,
  onProgress?: (done: number, total: number) => void,
  concurrency = 4
): Promise<string[]> {
  const urls = new Array<string>(files.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < files.length) {
      const index = next++;
      urls[index] = await uploadFile(files[index], mode);
      onProgress?.(++done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return urls;
}

import { issueSignedToken } from "@vercel/blob";
import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  ALLOWED_CONTENT_TYPES,
  LOCAL_FILE_PREFIX,
  LOCAL_UPLOAD_DIR,
  MAX_UPLOAD_BYTES,
  storageMode,
} from "@/lib/storage";

export async function POST(request: Request) {
  if (storageMode === "blob") {
    const body = (await request.json()) as HandleUploadBody;
    try {
      const json = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          if (!(await isAdmin())) throw new Error("Non autorisé");
          return {
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: true,
          };
        },
      });
      return NextResponse.json(json);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  if (storageMode === "blob-oidc") {
    const body = (await request.json()) as HandleUploadPresignedBody;
    try {
      const json = await handleUploadPresigned({
        body,
        request,
        getSignedToken: async (pathname) => {
          if (!(await isAdmin())) throw new Error("Non autorisé");
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
          });
          return {
            token,
            urlOptions: { allowedContentTypes: ALLOWED_CONTENT_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES },
          };
        },
      });
      return NextResponse.json(json);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Stockage non configuré : ajoute un Blob store (accès Public) dans l'onglet Storage de Vercel." },
      { status: 500 }
    );
  }
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const name = `${slugify(path.basename(file.name, ext)) || "fichier"}-${randomBytes(4).toString("hex")}${ext}`;
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: LOCAL_FILE_PREFIX + name });
}

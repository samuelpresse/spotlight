"use client";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export type PdfInfo = { pageCount: number; cover: File };

export async function inspectPdf(file: File, coverWidth = 900): Promise<PdfInfo> {
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: coverWidth / base.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Rendu de la couverture impossible"))), "image/jpeg", 0.85)
    );
    const name = file.name.replace(/\.pdf$/i, "") + "-cover.jpg";
    return { pageCount: pdf.numPages, cover: new File([blob], name, { type: "image/jpeg" }) };
  } finally {
    await task.destroy();
  }
}

const PAGE_IMAGE_WIDTH = 1400;

const encodeCanvas = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

async function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  let blob = await encodeCanvas(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await encodeCanvas(canvas, "image/jpeg", 0.85);
  if (!blob) throw new Error("Conversion de la page impossible");
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${name}.${extension}`, { type: blob.type });
}

export type PdfPages = { pages: File[]; ratio: number };

export async function renderPdfPages(
  source: File | string,
  baseName: string,
  onProgress?: (done: number, total: number) => void
): Promise<PdfPages> {
  const task = pdfjs.getDocument(
    typeof source === "string" ? { url: source } : { data: new Uint8Array(await source.arrayBuffer()) }
  );
  try {
    const pdf = await task.promise;
    const pages: File[] = [];
    let ratio = 0;

    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      if (number === 1) ratio = base.height / base.width;
      const viewport = page.getViewport({ scale: PAGE_IMAGE_WIDTH / base.width });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;

      pages.push(await canvasToFile(canvas, `${baseName}-p${String(number).padStart(3, "0")}`));
      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
      onProgress?.(number, pdf.numPages);
    }

    return { pages, ratio };
  } finally {
    await task.destroy();
  }
}

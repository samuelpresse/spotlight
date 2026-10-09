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

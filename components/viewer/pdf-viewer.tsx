"use client";

import { Spinner, Stack, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Flipbook, PageSpinner, type RenderPage } from "./flipbook";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function PdfViewer({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [numPages, setNumPages] = useState(0);
  const [ratio, setRatio] = useState(1.414);

  const renderPage = useCallback<RenderPage>(
    (index, width, dpr) => (
      <Page
        className="magazine-page"
        pageNumber={index + 1}
        width={width}
        devicePixelRatio={dpr}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        loading={<PageSpinner />}
      />
    ),
    []
  );

  return (
    <Flipbook
      title={title}
      downloadHref={pdfUrl}
      numPages={numPages}
      ratio={ratio}
      renderPage={renderPage}
      wrap={(content) => (
        <Document
          file={pdfUrl}
          onLoadSuccess={async (pdf) => {
            const first = await pdf.getPage(1);
            const viewport = first.getViewport({ scale: 1 });
            setRatio(viewport.height / viewport.width);
            setNumPages(pdf.numPages);
          }}
          loading={
            <Stack align="center" gap="3" color="fg.muted">
              <Spinner size="lg" color="brand.solid" />
              <Text fontSize="sm">Chargement du magazine…</Text>
            </Stack>
          }
          error={
            <Text fontSize="sm" color="red.500" textAlign="center" px="4">
              Impossible de charger le magazine. Essaie de télécharger le PDF.
            </Text>
          }
        >
          {content}
        </Document>
      )}
    />
  );
}

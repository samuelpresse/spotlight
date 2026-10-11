"use client";

import { Center, Spinner } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const loading = () => (
  <Center h="60vh" bg="surface" rounded="3xl">
    <Spinner size="lg" color="brand.solid" />
  </Center>
);

const ImageViewer = dynamic(() => import("./image-viewer"), { ssr: false, loading });
const PdfViewer = dynamic(() => import("./pdf-viewer"), { ssr: false, loading });

type Props = { pdfUrl: string; title: string; pages: string[]; pageRatio: number };

export function MagazineViewer({ pdfUrl, title, pages, pageRatio }: Props) {
  if (pages.length > 0) {
    return <ImageViewer pages={pages} pageRatio={pageRatio} pdfUrl={pdfUrl} title={title} />;
  }
  return <PdfViewer pdfUrl={pdfUrl} title={title} />;
}

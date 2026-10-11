"use client";

import { Image } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Flipbook, type RenderPage } from "./flipbook";

const DEFAULT_RATIO = 1.414;

type Props = { pages: string[]; pageRatio: number; pdfUrl: string; title: string };

export default function ImageViewer({ pages, pageRatio, pdfUrl, title }: Props) {
  const [ratio, setRatio] = useState(pageRatio || DEFAULT_RATIO);

  useEffect(() => {
    if (pageRatio || pages.length === 0) return;
    const first = new window.Image();
    first.onload = () => first.naturalWidth && setRatio(first.naturalHeight / first.naturalWidth);
    first.src = pages[0];
  }, [pageRatio, pages]);

  const renderPage = useCallback<RenderPage>(
    (index, width) => (
      <Image
        className="magazine-page"
        src={pages[index]}
        alt={`Page ${index + 1}`}
        draggable={false}
        decoding="async"
        display="block"
        objectFit="contain"
        style={{ width, height: Math.floor(width * ratio) }}
      />
    ),
    [pages, ratio]
  );

  return <Flipbook title={title} downloadHref={pdfUrl} numPages={pages.length} ratio={ratio} renderPage={renderPage} />;
}

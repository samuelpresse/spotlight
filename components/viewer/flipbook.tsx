"use client";

import {
  Box,
  Center,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  IconButton,
  Portal,
  Separator,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuDownload,
  LuMaximize,
  LuMinimize,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";

const RENDER_WINDOW = 4;
const SPREAD_MIN_WIDTH = 720;
const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export type RenderPage = (index: number, width: number, dpr: number) => React.ReactNode;

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (page: number) => void;
    turnToPage: (page: number) => void;
  };
};

type FlipbookProps = {
  title: string;
  downloadHref: string;
  numPages: number;
  ratio: number;
  renderPage: RenderPage;
  wrap?: (content: React.ReactNode) => React.ReactNode;
};

const ViewerContext = createContext<{ current: number; width: number; dpr: number; renderPage: RenderPage }>({
  current: 0,
  width: 0,
  dpr: 1,
  renderPage: () => null,
});

const FlipPage = forwardRef<HTMLDivElement, { index: number }>(function FlipPage({ index }, ref) {
  const { current, width, dpr, renderPage } = useContext(ViewerContext);
  const visible = Math.abs(index - current) <= RENDER_WINDOW;
  return (
    <div ref={ref} style={{ background: "white", overflow: "hidden" }}>
      {visible && renderPage(index, width, dpr)}
    </div>
  );
});

export function PageSpinner() {
  return (
    <Center h="full" minH="40" color="gray.400">
      <Spinner />
    </Center>
  );
}

const downloadUrl = (url: string) => (url.includes(".blob.vercel-storage.com") ? `${url}?download=1` : url);

export function Flipbook({ title, downloadHref, numPages, ratio, renderPage, wrap }: FlipbookProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle>(null);

  const [current, setCurrent] = useState(0);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1.5);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const isFs = document.fullscreenElement === rootRef.current;
      setFullscreen(isFs);
      setDpr(Math.min(2, window.devicePixelRatio || 1));
      const next = {
        width: el.clientWidth,
        height: isFs ? window.innerHeight - 96 : Math.min(window.innerHeight * 0.82, 1100),
      };
      setStage((prev) =>
        Math.abs(prev.width - next.width) < 8 && Math.abs(prev.height - next.height) < 8 ? prev : next
      );
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measureSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    measure();
    const observer = new ResizeObserver(measureSoon);
    observer.observe(el);
    document.addEventListener("fullscreenchange", measure);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("fullscreenchange", measure);
    };
  }, []);

  const spread = stage.width >= SPREAD_MIN_WIDTH;
  const padding = spread ? 48 : 16;
  const pageWidth = Math.max(
    120,
    Math.floor(Math.min((stage.width - padding) / (spread ? 2 : 1), (stage.height - 24) / ratio))
  );
  const pageHeight = Math.floor(pageWidth * ratio);

  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const goTo = useCallback((page: number) => bookRef.current?.pageFlip()?.turnToPage(page), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.();
  };

  const visiblePages = useMemo(() => {
    if (!spread || current === 0) return [current];
    const left = current % 2 === 1 ? current : current - 1;
    return [left, left + 1].filter((p) => p < numPages);
  }, [spread, current, numPages]);

  const pageLabel = numPages === 0 ? "" : visiblePages.map((p) => p + 1).join("-") + ` / ${numPages}`;

  const shift = !spread
    ? 0
    : current === 0
      ? -pageWidth / 2
      : visiblePages.length === 1 && current >= numPages - 1
        ? pageWidth / 2
        : 0;

  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => <FlipPage key={i} index={i} />),
    [numPages]
  );
  const bookKey = `${pageWidth}x${pageHeight}-${spread}`;

  const atStart = current === 0;
  const atEnd = visiblePages[visiblePages.length - 1] >= numPages - 1;

  const content = numPages > 0 && stage.width > 0 && (
    <ViewerContext.Provider value={{ current, width: pageWidth, dpr, renderPage }}>
      <Box
        transform={`translateX(${shift}px)`}
        transition="transform 0.5s ease"
        filter="drop-shadow(0 20px 30px rgba(20, 10, 50, 0.25))"
      >
        <HTMLFlipBook
          key={bookKey}
          ref={bookRef}
          className="magazine-book"
          style={{}}
          startPage={current}
          size="fixed"
          width={pageWidth}
          height={pageHeight}
          minWidth={pageWidth}
          maxWidth={pageWidth}
          minHeight={pageHeight}
          maxHeight={pageHeight}
          drawShadow
          flippingTime={700}
          usePortrait={!spread}
          startZIndex={0}
          autoSize
          maxShadowOpacity={0.4}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          renderOnlyPageLengthChange
          onFlip={(e: { data: number }) => setCurrent(e.data)}
        >
          {pages}
        </HTMLFlipBook>
      </Box>

      <ZoomDialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        pages={visiblePages}
        zoom={zoom}
        setZoom={setZoom}
        container={rootRef}
        title={title}
        baseWidth={Math.min(stage.width, 900)}
      />
    </ViewerContext.Provider>
  );

  return (
    <Box
      ref={rootRef}
      bg={fullscreen ? "night.950" : "surface"}
      rounded={fullscreen ? "none" : "3xl"}
      borderWidth={fullscreen ? "0" : "1px"}
      borderColor="surfaceBorder"
      overflow="hidden"
      shadow={fullscreen ? "none" : "lg"}
      display="flex"
      flexDirection="column"
      h={fullscreen ? "100vh" : "auto"}
    >
      <Flex
        align="center"
        justify="space-between"
        gap="2"
        px={{ base: "2", md: "4" }}
        py="2.5"
        borderBottomWidth="1px"
        borderColor={fullscreen ? "whiteAlpha.200" : "surfaceBorder"}
        bg={fullscreen ? "night.900" : "surface"}
        color={fullscreen ? "white" : undefined}
      >
        <HStack gap="1">
          <IconButton asChild aria-label="Télécharger le PDF" variant="ghost" size="sm" colorPalette="gray">
            <a href={downloadUrl(downloadHref)} download target="_blank" rel="noopener">
              <LuDownload />
            </a>
          </IconButton>
          <Separator orientation="vertical" h="5" display={{ base: "none", sm: "block" }} />
          <IconButton
            aria-label="Zoomer sur la page"
            variant="ghost"
            size="sm"
            colorPalette="gray"
            onClick={() => setZoomOpen(true)}
            disabled={numPages === 0}
          >
            <LuZoomIn />
          </IconButton>
        </HStack>

        <HStack gap="1">
          <IconButton
            aria-label="Première page"
            variant="ghost"
            size="sm"
            colorPalette="gray"
            onClick={() => goTo(0)}
            disabled={atStart}
            display={{ base: "none", sm: "inline-flex" }}
          >
            <LuChevronsLeft />
          </IconButton>
          <IconButton
            aria-label="Page précédente"
            variant="outline"
            size="sm"
            rounded="full"
            colorPalette="gray"
            onClick={flipPrev}
            disabled={atStart}
          >
            <LuChevronLeft />
          </IconButton>
          <Text fontSize="sm" fontWeight="medium" minW="20" textAlign="center" fontVariantNumeric="tabular-nums">
            {pageLabel && `Page ${pageLabel}`}
          </Text>
          <IconButton
            aria-label="Page suivante"
            variant="outline"
            size="sm"
            rounded="full"
            colorPalette="gray"
            onClick={flipNext}
            disabled={atEnd}
          >
            <LuChevronRight />
          </IconButton>
          <IconButton
            aria-label="Dernière page"
            variant="ghost"
            size="sm"
            colorPalette="gray"
            onClick={() => goTo(numPages - 1)}
            disabled={atEnd}
            display={{ base: "none", sm: "inline-flex" }}
          >
            <LuChevronsRight />
          </IconButton>
        </HStack>

        <IconButton
          aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
          variant="ghost"
          size="sm"
          colorPalette="gray"
          onClick={toggleFullscreen}
        >
          {fullscreen ? <LuMinimize /> : <LuMaximize />}
        </IconButton>
      </Flex>

      <Box
        ref={stageRef}
        flex="1"
        py={{ base: "4", md: "8" }}
        bg={fullscreen ? "night.950" : { base: "brand.50", _dark: "blackAlpha.400" }}
        minH={numPages ? `${pageHeight + 48}px` : "60vh"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {wrap ? wrap(content) : content}
      </Box>
    </Box>
  );
}

function ZoomDialog({
  open,
  onClose,
  pages,
  zoom,
  setZoom,
  container,
  title,
  baseWidth,
}: {
  open: boolean;
  onClose: () => void;
  pages: number[];
  zoom: number;
  setZoom: (z: number) => void;
  container: React.RefObject<HTMLElement | null>;
  title: string;
  baseWidth: number;
}) {
  const { dpr, renderPage } = useContext(ViewerContext);
  const index = ZOOM_STEPS.indexOf(zoom);
  const width = Math.round((baseWidth / pages.length) * zoom);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} size="full" motionPreset="scale">
      <Portal container={container}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="night.950" color="white" rounded="none">
            <Dialog.Header borderBottomWidth="1px" borderColor="whiteAlpha.200" py="3">
              <Dialog.Title fontSize="sm" flex="1" truncate>
                {title} — page {pages.map((p) => p + 1).join("-")}
              </Dialog.Title>
              <HStack gap="1">
                <IconButton
                  aria-label="Dézoomer"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  disabled={index <= 0}
                  onClick={() => setZoom(ZOOM_STEPS[index - 1])}
                >
                  <LuZoomOut />
                </IconButton>
                <Text fontSize="sm" minW="12" textAlign="center">
                  {Math.round(zoom * 100)}%
                </Text>
                <IconButton
                  aria-label="Zoomer"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  disabled={index >= ZOOM_STEPS.length - 1}
                  onClick={() => setZoom(ZOOM_STEPS[index + 1])}
                >
                  <LuZoomIn />
                </IconButton>
                <Dialog.CloseTrigger asChild position="static">
                  <CloseButton size="sm" color="white" _hover={{ bg: "whiteAlpha.200" }} />
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>
            <Dialog.Body overflow="auto" p="6">
              <Flex justify="center" minW="fit-content" gap="0">
                {open &&
                  pages.map((p) => (
                    <Box key={p} bg="white" shadow="2xl">
                      {renderPage(p, width, dpr)}
                    </Box>
                  ))}
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

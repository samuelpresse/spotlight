"use client";

import { Center, Spinner } from "@chakra-ui/react";
import dynamic from "next/dynamic";

export const MagazineViewer = dynamic(() => import("./magazine-viewer"), {
  ssr: false,
  loading: () => (
    <Center h="60vh" bg="surface" rounded="3xl">
      <Spinner size="lg" color="brand.solid" />
    </Center>
  ),
});

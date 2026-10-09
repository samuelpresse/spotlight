"use client";

import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";

export function ColorModeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" rounded="full" />}>
      <IconButton
        aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
        variant="outline"
        rounded="full"
        size="sm"
        onClick={() => setTheme(dark ? "light" : "dark")}
      >
        {dark ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  );
}

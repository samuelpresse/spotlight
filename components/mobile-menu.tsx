"use client";

import { Button, ClientOnly, CloseButton, Drawer, IconButton, Portal, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";
import { SocialLinks } from "./social-links";

function MenuButton(props: React.ComponentProps<typeof IconButton>) {
  return (
    <IconButton aria-label="Ouvrir le menu" variant="ghost" rounded="full" size="sm" {...props}>
      <LuMenu />
    </IconButton>
  );
}

export function MobileMenu() {
  return (
    <ClientOnly fallback={<MenuButton />}>
      <MobileMenuDrawer />
    </ClientOnly>
  );
}

function MobileMenuDrawer() {
  const [open, setOpen] = useState(false);
  const [pathname, setPathname] = useState("");

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : href === "/admin" ? pathname.startsWith("/admin") : pathname === href;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) setPathname(window.location.pathname);
        setOpen(e.open);
      }}
      placement="end"
      size="xs"
      lazyMount
      unmountOnExit
    >
      <Drawer.Trigger asChild>
        <MenuButton />
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="surface">
            <Drawer.Header borderBottomWidth="1px" borderColor="surfaceBorder">
              <Drawer.Title asChild>
                <div onClick={() => setOpen(false)}>
                  <Logo />
                </div>
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body py="6">
              <Stack gap="1" as="nav">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Button
                      key={href}
                      asChild
                      variant={active ? "subtle" : "ghost"}
                      colorPalette={active ? "brand" : "gray"}
                      size="lg"
                      justifyContent="flex-start"
                      rounded="xl"
                      w="full"
                    >
                      <NextLink href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}>
                        <Icon /> {label}
                      </NextLink>
                    </Button>
                  );
                })}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer borderTopWidth="1px" borderColor="surfaceBorder" justifyContent="flex-start">
              <Stack gap="2">
                <Text fontSize="xs" color="fg.subtle">
                  Suis-nous sur les réseaux
                </Text>
                <SocialLinks />
              </Stack>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}


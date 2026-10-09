import { Box, Button, Container, Flex, HStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { navLinks } from "./nav-links";
import { ColorModeButton } from "./ui/color-mode-button";

export function Navbar() {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg={{ base: "white/75", _dark: "night.950/80" }}
      backdropFilter="blur(12px)"
      borderBottomWidth="1px"
      borderColor="surfaceBorder"
    >
      <Container maxW="7xl">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <Logo />
          <HStack gap="2" display={{ base: "none", md: "flex" }} as="nav">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" size="sm">
                <NextLink href={href}>
                  {href === "/admin" && <Icon />}
                  {label}
                </NextLink>
              </Button>
            ))}
            <ColorModeButton />
          </HStack>

          <HStack gap="1" display={{ base: "flex", md: "none" }}>
            <ColorModeButton />
            <MobileMenu />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

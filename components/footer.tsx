import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Link,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuMessageSquare } from "react-icons/lu";
import { site } from "@/lib/site";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";
import { SocialLinks } from "./social-links";

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      letterSpacing="widest"
      textTransform="uppercase"
      color="fg.subtle"
    >
      {children}
    </Text>
  );
}

export function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="surfaceBorder"
      mt="20"
      pt={{ base: "12", md: "16" }}
      pb="8"
      bg="surface"
    >
      <Container maxW="7xl">
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "1fr 1fr",
            lg: "1.4fr 1fr 1.3fr",
          }}
          gap={{ base: "10", lg: "16" }}
        >
          <Stack gap="4" gridColumn={{ sm: "1 / -1", lg: "auto" }}>
            <Logo />
            <Text fontSize="sm" color="fg.muted" maxW="xs">
              {site.tagline}.
            </Text>
            <Box ml="-2">
              <SocialLinks />
            </Box>
          </Stack>

          <Stack gap="4">
            <ColumnTitle>Navigation</ColumnTitle>
            <Stack as="nav" gap="2.5">
              {navLinks
                .filter((l) => l.href !== "/admin")
                .map(({ href, label }) => (
                  <Link
                    key={href}
                    asChild
                    fontSize="sm"
                    color="fg.muted"
                    _hover={{ color: "brand.fg" }}
                    w="fit-content"
                  >
                    <NextLink href={href}>{label}</NextLink>
                  </Link>
                ))}
            </Stack>
          </Stack>

          <Stack gap="4">
            <ColumnTitle>Participer</ColumnTitle>
            <Text fontSize="sm" color="fg.muted">
              Une nouvelle ou une primeur sur tes Vtubers francophones préférés
              ? Partage-la avec nos Lucioles.
            </Text>
            <Button
              asChild
              colorPalette="brand"
              variant="subtle"
              rounded="full"
              size="sm"
              w="fit-content"
            >
              <a
                href={site.newsFormUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuMessageSquare /> Dites-nous votre nouvelle
              </a>
            </Button>
          </Stack>
        </Grid>

        <Separator my="8" borderColor="surfaceBorder" />

        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          gap="3"
          fontSize="xs"
          color="fg.subtle"
        >
          <Text>© {site.name} — Tous droits réservés</Text>
          <Flex gap="4">
            <Link asChild color="fg.subtle" _hover={{ color: "brand.fg" }}>
              <NextLink href="/a-propos">À propos des auteur.ice.s</NextLink>
            </Link>
            <Link asChild color="fg.subtle" _hover={{ color: "brand.fg" }}>
              <NextLink href="/admin">Admin</NextLink>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

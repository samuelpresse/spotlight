import { Badge, Box, Button, LinkBox, LinkOverlay, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuBookOpen } from "react-icons/lu";
import { formatMonth } from "@/lib/format";
import type { Magazine } from "@/lib/types";
import { Cover } from "./cover";

export function MagazineCard({ magazine }: { magazine: Magazine }) {
  const href = `/magazines/${magazine.slug}`;
  return (
    <LinkBox
      as="article"
      bg="surface"
      borderWidth="1px"
      borderColor="surfaceBorder"
      rounded="3xl"
      p="4"
      display="flex"
      flexDirection="column"
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{ transform: "translateY(-6px)", shadow: "xl" }}
      css={{ "&:hover img": { transform: "scale(1.04)" } }}
    >
      <Box position="relative" rounded="2xl" overflow="hidden">
        <Cover magazine={magazine} css={{ "& img": { transition: "transform 0.4s ease" } }} />
        {magazine.issue && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            rounded="full"
            px="2.5"
            size="md"
            bg="night.950/70"
            color="silver.50"
            backdropFilter="blur(6px)"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            pointerEvents="none"
          >
            {magazine.issue}
          </Badge>
        )}
      </Box>

      <Stack gap="2" pt="4" px="1" flex="1">
        <LinkOverlay asChild>
          <NextLink href={href}>
            <Text as="h3" fontFamily="heading" fontWeight="bold" fontSize="lg" lineHeight="short">
              {magazine.title}
            </Text>
          </NextLink>
        </LinkOverlay>
        <Text fontSize="sm" color="brand.fg" fontWeight="medium" css={{ "&::first-letter": { textTransform: "uppercase" } }}>
          {formatMonth(magazine.publishedAt)}
          {magazine.pageCount > 0 && ` · ${magazine.pageCount} pages`}
        </Text>
        {magazine.description && (
          <Text fontSize="sm" color="fg.muted" lineClamp={3}>
            {magazine.description}
          </Text>
        )}
      </Stack>

      <Button mt="4" colorPalette="brand" variant="subtle" rounded="full" pointerEvents="none">
        <LuBookOpen /> Lire le magazine
      </Button>
    </LinkBox>
  );
}

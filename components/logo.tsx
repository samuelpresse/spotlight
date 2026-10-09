import { Box, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { site } from "@/lib/site";

export function Logo() {
  return (
    <Link
      asChild
      _hover={{ textDecoration: "none" }}
      fontFamily="heading"
      fontWeight="bold"
      fontSize="xl"
    >
      <NextLink href="/">
        <Box
          as="span"
          display="inline-grid"
          placeItems="center"
          boxSize="8"
          rounded="lg"
          bgGradient="to-br"
          gradientFrom="brand.800"
          gradientTo="brand.500"
          color="silver.100"
          fontSize="md"
        >
          ✦
        </Box>
        <Text
          as="span"
          bgGradient="to-r"
          gradientFrom="accentFrom"
          gradientTo="accentTo"
          bgClip="text"
        >
          {site.name}
        </Text>
      </NextLink>
    </Link>
  );
}

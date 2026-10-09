import { Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export default function NotFound() {
  return (
    <Container maxW="xl" py="32">
      <Stack align="center" textAlign="center" gap="4">
        <Text fontSize="7xl" fontFamily="heading" fontWeight="bold" color="brand.fg">
          404
        </Text>
        <Heading>Page introuvable</Heading>
        <Text color="fg.muted">Ce magazine n&apos;existe pas ou n&apos;est plus disponible.</Text>
        <Button asChild colorPalette="brand" rounded="full">
          <NextLink href="/">Retour à l&apos;accueil</NextLink>
        </Button>
      </Stack>
    </Container>
  );
}

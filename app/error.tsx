"use client";

import { Button, Code, Container, Heading, Stack, Text } from "@chakra-ui/react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container maxW="xl" py="32">
      <Stack align="center" textAlign="center" gap="4">
        <Heading>Oups, une erreur est survenue</Heading>
        <Text color="fg.muted">
          {process.env.NODE_ENV === "development" || error.message.includes("Vercel")
            ? error.message
            : "Réessaie dans quelques instants."}
        </Text>
        {error.digest && <Code>{error.digest}</Code>}
        <Button colorPalette="brand" rounded="full" onClick={reset}>
          Réessayer
        </Button>
      </Stack>
    </Container>
  );
}

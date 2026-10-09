import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { LuLock } from "react-icons/lu";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion admin" };

export default function LoginPage() {
  return (
    <Container maxW="sm" py={{ base: "16", md: "28" }}>
      <Stack gap="6" bg="surface" p="8" rounded="3xl" borderWidth="1px" borderColor="surfaceBorder" shadow="lg">
        <Stack align="center" textAlign="center" gap="3">
          <Box p="3" rounded="full" bg="brand.subtle" fontSize="xl" color="brand.fg">
            <LuLock />
          </Box>
          <Heading size="xl">Espace admin</Heading>
          <Text fontSize="sm" color="fg.muted">
            Connecte-toi pour gérer les magazines.
          </Text>
        </Stack>
        <LoginForm />
      </Stack>
    </Container>
  );
}

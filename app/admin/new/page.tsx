import { Container, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { storageMode } from "@/lib/storage";
import { BackLink } from "../back-link";
import { MagazineForm } from "../magazine-form";

export const metadata = { title: "Nouveau magazine" };

export default function NewMagazinePage() {
  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Stack gap="8">
        <Stack gap="3">
          <BackLink />
          <Heading size="3xl" letterSpacing="tight">
            Nouveau magazine
          </Heading>
        </Stack>
        <Suspense fallback={<Skeleton h="xl" rounded="3xl" />}>
          <ProtectedForm />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function ProtectedForm() {
  await requireAdmin();
  return <MagazineForm storageMode={storageMode} />;
}

import { Container, Skeleton, Stack } from "@chakra-ui/react";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { heroDefaults, readHeroSettings } from "@/lib/settings";
import { storageMode } from "@/lib/storage";
import { AdminHeader } from "../admin-header";
import { HeroForm } from "./hero-form";

export const metadata = { title: "Page d'accueil — Administration" };

export default function AdminHomeSettingsPage() {
  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Stack gap="8">
        <AdminHeader />
        <Suspense fallback={<Skeleton h="xl" rounded="3xl" />}>
          <ProtectedHeroForm />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function ProtectedHeroForm() {
  await requireAdmin();
  const hero = await readHeroSettings();
  return <HeroForm initial={hero} defaults={heroDefaults} storageMode={storageMode} />;
}

import { Container, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageMode } from "@/lib/storage";
import { BackLink } from "../back-link";
import { MagazineForm } from "../magazine-form";

export const metadata = { title: "Modifier le magazine" };

export default function EditMagazinePage({ params }: PageProps<"/admin/[id]">) {
  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Stack gap="8">
        <Stack gap="3">
          <BackLink />
          <Heading size="3xl" letterSpacing="tight">
            Modifier le magazine
          </Heading>
        </Stack>
        <Suspense fallback={<Skeleton h="xl" rounded="3xl" />}>
          <EditForm idPromise={params.then((p) => p.id)} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function EditForm({ idPromise }: { idPromise: Promise<string> }) {
  await requireAdmin();
  const id = Number(await idPromise);
  const magazine = Number.isInteger(id) ? await db().getById(id) : null;
  if (!magazine) notFound();
  return <MagazineForm magazine={magazine} storageMode={storageMode} />;
}

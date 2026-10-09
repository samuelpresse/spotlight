import { Badge, Box, Button, Container, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Suspense } from "react";
import { LuPlus } from "react-icons/lu";
import { requireAdmin } from "@/lib/auth";
import { db, dbMode } from "@/lib/db";
import { storageMode } from "@/lib/storage";
import { AdminHeader } from "./admin-header";
import { MagazineTable } from "./magazine-table";

export const metadata = { title: "Administration" };

export default function AdminPage() {
  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Stack gap="8">
        <AdminHeader />
        <Suspense fallback={<Skeleton h="96" rounded="3xl" />}>
          <AdminDashboard />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function AdminDashboard() {
  await requireAdmin();
  const magazines = await db().list({ includeDrafts: true });
  const published = magazines.filter((m) => m.isPublished).length;

  return (
    <Stack gap="6">
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="4">
        <Text color="fg.muted">
          {magazines.length} magazine{magazines.length > 1 ? "s" : ""} · {published} publié{published > 1 ? "s" : ""}
        </Text>
        <Button asChild colorPalette="brand" rounded="full">
          <NextLink href="/admin/new">
            <LuPlus /> Nouveau magazine
          </NextLink>
        </Button>
      </Flex>

      <MagazineTable magazines={magazines} />

      <Box fontSize="xs" color="fg.subtle">
        <HStack gap="2" flexWrap="wrap">
          <Text>Stockage :</Text>
          <Badge size="sm" variant="outline">
            Base {dbMode === "postgres" ? "Postgres (Neon)" : "locale (.data/db.json)"}
          </Badge>
          <Badge size="sm" variant="outline">
            Fichiers {storageMode === "blob" ? "Vercel Blob" : "locaux (.data/uploads)"}
          </Badge>
        </HStack>
      </Box>
    </Stack>
  );
}

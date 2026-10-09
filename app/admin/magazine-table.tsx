"use client";

import { Badge, Box, Button, CloseButton, Dialog, HStack, IconButton, Portal, Stack, Table, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LuEye, LuPencil, LuTrash2 } from "react-icons/lu";
import { Cover } from "@/components/cover";
import { EmptyCatalog } from "@/components/empty-catalog";
import { toaster } from "@/components/ui/toaster";
import { formatDate } from "@/lib/format";
import type { Magazine } from "@/lib/types";
import { deleteMagazine } from "./actions";

export function MagazineTable({ magazines }: { magazines: Magazine[] }) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState<Magazine | null>(null);
  const [pending, startTransition] = useTransition();

  if (magazines.length === 0) return <EmptyCatalog />;

  const confirmDelete = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await deleteMagazine(toDelete.id);
      if (result.ok) {
        toaster.create({ type: "success", title: `« ${toDelete.title} » a été supprimé.` });
        setToDelete(null);
        router.refresh();
      } else {
        toaster.create({ type: "error", title: result.error });
      }
    });
  };

  return (
    <>
      <Box bg="surface" rounded="3xl" borderWidth="1px" borderColor="surfaceBorder" overflow="hidden">
        <Table.ScrollArea>
          <Table.Root size="md" interactive>
            <Table.Header>
              <Table.Row bg="brand.subtle">
                <Table.ColumnHeader w="20">Couverture</Table.ColumnHeader>
                <Table.ColumnHeader>Titre</Table.ColumnHeader>
                <Table.ColumnHeader>Numéro</Table.ColumnHeader>
                <Table.ColumnHeader>Parution</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Pages</Table.ColumnHeader>
                <Table.ColumnHeader>Statut</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {magazines.map((m) => (
                <Table.Row key={m.id}>
                  <Table.Cell>
                    <Cover magazine={m} w="14" rounded="md" shadow="sm" />
                  </Table.Cell>
                  <Table.Cell>
                    <Stack gap="0.5">
                      <Text fontWeight="semibold">{m.title}</Text>
                      <Text fontSize="xs" color="fg.subtle">
                        /magazines/{m.slug}
                      </Text>
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>{m.issue || "—"}</Table.Cell>
                  <Table.Cell whiteSpace="nowrap">{formatDate(m.publishedAt)}</Table.Cell>
                  <Table.Cell textAlign="end">{m.pageCount || "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={m.isPublished ? "green" : "orange"} variant="subtle" rounded="full">
                      {m.isPublished ? "Publié" : "Brouillon"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" justify="flex-end">
                      <IconButton asChild aria-label="Voir" variant="ghost" size="sm">
                        <NextLink href={`/magazines/${m.slug}`}>
                          <LuEye />
                        </NextLink>
                      </IconButton>
                      <IconButton asChild aria-label="Modifier" variant="ghost" size="sm">
                        <NextLink href={`/admin/${m.id}`}>
                          <LuPencil />
                        </NextLink>
                      </IconButton>
                      <IconButton
                        aria-label="Supprimer"
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={() => setToDelete(m)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>

      <Dialog.Root
        open={!!toDelete}
        onOpenChange={(e) => !e.open && !pending && setToDelete(null)}
        role="alertdialog"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content rounded="2xl">
              <Dialog.Header>
                <Dialog.Title>Supprimer ce magazine ?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  <strong>{toDelete?.title}</strong> sera supprimé définitivement, ainsi que son PDF et sa couverture.
                  Cette action est irréversible.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" disabled={pending}>
                    Annuler
                  </Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" onClick={confirmDelete} loading={pending}>
                  <LuTrash2 /> Supprimer
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

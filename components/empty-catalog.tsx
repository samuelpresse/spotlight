import { Button, EmptyState, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuBookDashed, LuPlus } from "react-icons/lu";

export function EmptyCatalog() {
  return (
    <EmptyState.Root bg="surface" rounded="3xl" borderWidth="1px" borderColor="surfaceBorder" borderStyle="dashed">
      <EmptyState.Content>
        <EmptyState.Indicator color="brand.fg">
          <LuBookDashed />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>Aucun magazine pour le moment</EmptyState.Title>
          <EmptyState.Description>Le premier numéro arrive bientôt !</EmptyState.Description>
        </VStack>
        <Button asChild colorPalette="brand" rounded="full" variant="outline">
          <NextLink href="/admin/new">
            <LuPlus /> Publier un magazine
          </NextLink>
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

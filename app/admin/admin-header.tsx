import { Flex, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { Suspense } from "react";
import { AdminTabs } from "./admin-tabs";
import { LogoutButton } from "./logout-button";

export function AdminHeader() {
  return (
    <Stack gap="6">
      <Flex justify="space-between" align="center" gap="4">
        <Heading size="3xl" letterSpacing="tight">
          Administration
        </Heading>
        <LogoutButton />
      </Flex>
      <Suspense fallback={<Skeleton h="12" w="sm" />}>
        <AdminTabs />
      </Suspense>
    </Stack>
  );
}

"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LuLogOut } from "react-icons/lu";
import { logoutAction } from "./actions";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      rounded="full"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
          router.refresh();
          router.replace("/");
        })
      }
    >
      <LuLogOut /> Déconnexion
    </Button>
  );
}

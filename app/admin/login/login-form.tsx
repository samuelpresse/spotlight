"use client";

import { Alert, Button, Field, Input, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { ok: false, error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  const router = useRouter();

  useEffect(() => {
    if (!state.ok) return;
    router.refresh();
    router.replace("/admin");
  }, [state, router]);

  return (
    <form action={formAction}>
      <Stack gap="4">
        {state.error && (
          <Alert.Root status="error" rounded="xl">
            <Alert.Indicator />
            <Alert.Title>{state.error}</Alert.Title>
          </Alert.Root>
        )}
        <Field.Root required>
          <Field.Label>Mot de passe</Field.Label>
          <Input name="password" type="password" autoComplete="current-password" autoFocus size="lg" />
        </Field.Root>
        <Button type="submit" colorPalette="brand" size="lg" rounded="full" loading={pending || state.ok}>
          Se connecter
        </Button>
      </Stack>
    </form>
  );
}

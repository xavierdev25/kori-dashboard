"use client";

import { LogIn } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { hasAccessToken } from "@/shared/lib/token-storage";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ password, username });
    } catch {
      setError("Credenciales inválidas.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Kori admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Acceso privado para administrar notas publicadas por la landing.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="username"
          label="Usuario"
          name="username"
          onChange={(event) => setUsername(event.target.value)}
          required
          value={username}
        />
        <Input
          autoComplete="current-password"
          label="Contraseña"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          className="mt-2 w-full"
          isLoading={isSubmitting}
          leftIcon={<LogIn aria-hidden className="h-4 w-4" />}
          type="submit"
        >
          Entrar
        </Button>
      </form>
    </Card>
  );
}

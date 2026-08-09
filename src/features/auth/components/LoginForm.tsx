"use client";

import { LogIn } from "@/shared/components/icons";
import { FormEvent, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { CUE, cue, initSound } from "@/shared/lib/sound";
import { getErrorText } from "@/shared/lib/error-message";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ya no se comprueba la sesion aqui: el layout de /dashboard lo hace
  // preguntandole al backend, que es el unico que puede leer la cookie.

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      // El sistema de sonido se enciende aqui: el navegador no deja crear el
      // contexto de audio sin un gesto real, y este submit es el primero.
      initSound();
      cue(CUE.entrar);
    } catch (submitError) {
      setError(getErrorText(submitError, "Credenciales invalidas."));
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
          Iniciar sesion
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Acceso privado para administrar el muro y la tienda.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          label="Correo"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <Input
          autoComplete="current-password"
          label="Contrasena"
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

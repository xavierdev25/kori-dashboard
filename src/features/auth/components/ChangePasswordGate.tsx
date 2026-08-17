"use client";

import { FormEvent, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import { useSession } from "@/features/auth/context/AuthContext";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { getErrorText } from "@/shared/lib/error-message";

/** Lo mismo que exige el backend. Se repite aqui solo para avisar antes. */
const MINIMO = 12;

/**
 * Obliga a cambiar la contrasena de reparto antes de dejar entrar.
 *
 * Es una barrera y no un aviso que se pueda cerrar: mientras la cuenta siga
 * abriendose con la contrasena que le paso otra persona por un mensaje, no
 * esta realmente en manos de su dueno. No hay boton de "ahora no" a proposito
 * — un recordatorio que se puede posponer se pospone para siempre.
 *
 * Se pinta encima del panel, no en una ruta aparte, para que al terminar se
 * quede exactamente donde iba en vez de volver al principio.
 */
export function ChangePasswordGate({ children }: { children: React.ReactNode }) {
  const { refreshUser, user } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user?.mustChangePassword) {
    return children;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Se comprueba aqui para no gastar uno de los cinco intentos por cuarto de
    // hora en una errata que se ve sin preguntar al servidor.
    if (newPassword.length < MINIMO) {
      setError(`La contrasena nueva necesita al menos ${MINIMO} caracteres.`);
      return;
    }

    if (newPassword !== repeatPassword) {
      setError("Las dos contrasenas no coinciden.");
      return;
    }

    setIsSaving(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      // Se relee la sesion: el backend ya bajo la bandera, y al volver con
      // `mustChangePassword: false` esta barrera desaparece sola.
      await refreshUser();
    } catch (changeError) {
      setError(getErrorText(changeError, "No se pudo cambiar la contrasena."));
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-950">
          Elige tu contrasena
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Entraste con una contrasena que te paso otra persona. Cambiala por una
          tuya para que la cuenta sea solo tuya.
        </p>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="current-password"
            autoFocus
            label="La contrasena con la que entraste"
            name="currentPassword"
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />

          <Input
            autoComplete="new-password"
            hint={`Al menos ${MINIMO} caracteres. Una frase de cuatro palabras se recuerda mejor que algo corto y raro.`}
            label="Tu contrasena nueva"
            name="newPassword"
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />

          <Input
            autoComplete="new-password"
            label="Repitela"
            name="repeatPassword"
            onChange={(event) => setRepeatPassword(event.target.value)}
            required
            type="password"
            value={repeatPassword}
          />

          {error ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button className="mt-1" isLoading={isSaving} type="submit">
            Guardar y entrar
          </Button>
        </form>
      </div>
    </div>
  );
}

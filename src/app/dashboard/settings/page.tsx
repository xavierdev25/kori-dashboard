"use client";

import { RefreshCcw, Save } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { settingsService } from "@/features/settings/services/settings.service";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";
import { cn } from "@/shared/utils/cn";

/** ISO → valor de <input type="datetime-local"> (hora local, sin segundos). */
function isoToLocalInput(iso: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function SettingsPage() {
  const [countdownTarget, setCountdownTarget] = useState("");
  const [albumUrl, setAlbumUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const settings = await settingsService.getSettings();
      setCountdownTarget(isoToLocalInput(settings.countdownTarget));
      setAlbumUrl(settings.albumUrl ?? "");
    } catch {
      setError("No se pudieron cargar los ajustes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const settings = await settingsService.updateSettings({
        // datetime-local produce hora local; se envia como ISO con zona
        countdownTarget: countdownTarget
          ? new Date(countdownTarget).toISOString()
          : "",
        albumUrl: albumUrl.trim(),
      });
      setCountdownTarget(isoToLocalInput(settings.countdownTarget));
      setAlbumUrl(settings.albumUrl ?? "");
      setFeedback({
        message: "Ajustes guardados: la landing los toma en ~1 minuto.",
        tone: "success",
      });
    } catch {
      setFeedback({
        message:
          "No se pudieron guardar. Revisa que la URL sea valida (https://...).",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white">
        <Spinner label="Cargando ajustes" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <Button
            leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
            onClick={load}
            variant="secondary"
          >
            Reintentar
          </Button>
        }
        description={error}
        title="No se pudieron cargar los ajustes"
      />
    );
  }

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Ajustes
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Controlan el contador de la landing y el boton que aparece al llegar
          a cero.
        </p>
      </div>

      {feedback ? (
        <div
          className={cn(
            "rounded-md border px-4 py-3 text-sm font-medium",
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card className="max-w-xl p-6">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-neutral-800">
            <span>Fecha objetivo del contador</span>
            <input
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
              onChange={(event) => setCountdownTarget(event.target.value)}
              type="datetime-local"
              value={countdownTarget}
            />
            <span className="text-xs font-normal text-neutral-500">
              Vacio = la landing usa su fecha por defecto. Al llegar a cero, el
              contador se convierte en el boton &quot;escuchalo ya&quot;.
            </span>
          </label>

          <Input
            label="Link del album (boton al llegar a cero)"
            name="albumUrl"
            onChange={(event) => setAlbumUrl(event.target.value)}
            placeholder="https://open.spotify.com/album/..."
            type="url"
            value={albumUrl}
          />

          <div>
            <Button
              isLoading={isSaving}
              leftIcon={<Save aria-hidden className="h-4 w-4" />}
              type="submit"
            >
              Guardar ajustes
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}

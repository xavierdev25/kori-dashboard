"use client";

import { ChevronLeft, ChevronRight, Download, RefreshCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  subscribersService,
  subscribersToCsv,
} from "@/features/subscribers/services/subscribers.service";
import type {
  PaginatedSubscribersResponse,
  Subscriber,
} from "@/features/subscribers/types/subscriber.types";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Spinner } from "@/shared/components/Spinner";
import { getErrorText } from "@/shared/lib/error-message";
import { cn } from "@/shared/utils/cn";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function SubscribersPage() {
  const [page, setPage] = useState(1);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [meta, setMeta] = useState<PaginatedSubscribersResponse["meta"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscribersService.getSubscribers(page);
      setSubscribers(response.data);
      setMeta(response.meta);
    } catch (error) {
      setError(getErrorText(error, "No se pudo cargar la lista de correos."));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleDelete(subscriber: Subscriber) {
    setFeedback(null);

    try {
      await subscribersService.deleteSubscriber(subscriber.id);
      setFeedback({ message: "Correo eliminado.", tone: "success" });
      await load();
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo eliminar el correo."),
        tone: "error",
      });
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setFeedback(null);

    try {
      const all = await subscribersService.getAllSubscribers();
      const blob = new Blob([subscribersToCsv(all)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kori-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setFeedback({
        message: `CSV generado con ${all.length} correos.`,
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: getErrorText(error, "No se pudo exportar el CSV."),
        tone: "error",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const totalPages = meta?.totalPages || 1;

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Correos
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Suscriptores del &quot;Coming soon&quot; de la landing, listos para
            el anuncio del album.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={loading}
            leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
            onClick={load}
            variant="secondary"
          >
            Actualizar
          </Button>
          <Button
            disabled={loading || (meta?.total ?? 0) === 0}
            isLoading={isExporting}
            leftIcon={<Download aria-hidden className="h-4 w-4" />}
            onClick={handleExport}
          >
            Exportar CSV
          </Button>
        </div>
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

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white">
          <Spinner label="Cargando correos" />
        </div>
      ) : error ? (
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
          title="No se pudo cargar el listado"
        />
      ) : subscribers.length === 0 ? (
        <EmptyState
          description="Cuando alguien deje su correo en la landing aparecera aqui."
          title="Aun no hay correos"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <ul className="divide-y divide-neutral-100">
            {subscribers.map((subscriber) => (
              <li
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={subscriber.id}
              >
                <div>
                  <p className="break-all font-medium text-neutral-950">
                    {subscriber.email}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {dateFormatter.format(new Date(subscriber.createdAt))}
                  </p>
                </div>
                <Button
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  onClick={() => handleDelete(subscriber)}
                  size="sm"
                  variant="danger"
                >
                  Borrar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta && !loading && !error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Pagina {meta.page} de {totalPages} · {meta.total} correos
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              leftIcon={<ChevronLeft aria-hidden className="h-4 w-4" />}
              onClick={() => setPage((current) => current - 1)}
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              rightIcon={<ChevronRight aria-hidden className="h-4 w-4" />}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

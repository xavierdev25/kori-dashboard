"use client";

import { ChevronLeft, ChevronRight, Download, RefreshCcw, Trash2 } from "@/shared/components/icons";
import { Suspense, useCallback, useState } from "react";
import {
  subscribersService,
  subscribersToCsv,
} from "@/features/subscribers/services/subscribers.service";
import type {
  PaginatedSubscribersResponse,
  Subscriber,
} from "@/features/subscribers/types/subscriber.types";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState";
import { TableSkeleton } from "@/shared/components/Skeleton";
import { CUE, cue } from "@/shared/lib/sound";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useQueryParams } from "@/shared/hooks/useQueryParams";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const NO_SUBSCRIBERS: PaginatedSubscribersResponse = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

const SUBSCRIBERS_DEFAULTS = { page: "1" };

export default function SubscribersPage() {
  return (
    // Obligatorio: sin este limite el build de produccion falla al
    // prerenderizar una pagina estatica que lee la URL.
    <Suspense fallback={<TableSkeleton />}>
      <SubscribersView />
    </Suspense>
  );
}

function SubscribersView() {
  const [params, setParams] = useQueryParams(SUBSCRIBERS_DEFAULTS);
  const page = Number(params.page) || 1;
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadPage = useCallback(
    (signal: AbortSignal) => subscribersService.getSubscribers(page, 20, signal),
    [page],
  );

  const {
    data,
    error,
    loading,
    refresh: load,
  } = useAsyncData(loadPage, {
    fallbackMessage: "No se pudo cargar la lista de correos.",
    initialData: NO_SUBSCRIBERS,
  });

  const meta = data.meta;
  const subscribers = data.data;

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await subscribersService.deleteSubscriber(deleteTarget.id);
      toast.success(`${deleteTarget.email} eliminado de la lista.`);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo eliminar el correo."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    // Reunir todos los correos puede tardar: se avisa al empezar y el chime
    // marca el final, cuando el fichero ya esta en el disco.
    cue(CUE.ocupado);

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
      toast.success(`CSV generado con ${all.length} correos.`, CUE.exportado);
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo exportar el CSV."));
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
            {meta ? (
              <span className="ml-2 align-middle text-base font-normal text-neutral-500">
                {meta.total}
              </span>
            ) : null}
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

      {loading ? (
        <TableSkeleton columns={2} rows={6} />
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
                {/* En gris y no en rojo solido: repetido en cada fila, el rojo
                    deja de significar "cuidado" y solo hace ruido. El peso
                    visual va en el dialogo de confirmacion. */}
                <Button
                  aria-label={`Borrar ${subscriber.email}`}
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  onClick={() => setDeleteTarget(subscriber)}
                  size="sm"
                  variant="ghost"
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
              onClick={() => setParams({ page: String(page - 1) })}
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setParams({ page: String(page + 1) })}
              rightIcon={<ChevronRight aria-hidden className="h-4 w-4" />}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        description="Se borra de la lista de forma permanente. Si esa persona no vuelve a suscribirse, no habra manera de recuperar su correo para el anuncio del album."
        detail={deleteTarget?.email}
        isBusy={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        open={Boolean(deleteTarget)}
        title="Borrar correo"
      />
    </section>
  );
}

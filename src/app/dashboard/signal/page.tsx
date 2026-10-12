"use client";

import { ChevronLeft, ChevronRight, Download, RefreshCcw, Trash2 } from "@/shared/components/icons";
import { Suspense, useCallback, useState } from "react";
import { signalService } from "@/features/signal/services/signal.service";
import { signupsToCsv } from "@/features/signal/utils/signal-csv";
import type {
  PaginatedSignalSignupsResponse,
  SignalSignup,
} from "@/features/signal/types/signal.types";
import { Badge } from "@/shared/components/Badge";
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

const NO_SIGNUPS: PaginatedSignalSignupsResponse = {
  data: [],
  meta: { limit: 20, marketingOptIn: 0, page: 1, total: 0, totalPages: 0 },
};

const SIGNAL_DEFAULTS = { page: "1" };

/**
 * "La señal": quien dejo nombre y correo en la landing para los correos
 * personales de DICIEMBRE+ [fin de año].
 *
 * Es la misma pantalla que "Correos", con lo que esta lista tiene de mas: el
 * nombre (con el que se saluda), el idioma (en el que se escribe) y si acepto
 * novedades. Lo ultimo importa al cerrar la campana: quien no las acepto se
 * borra, segun el aviso de privacidad.
 */
export default function SignalPage() {
  return (
    // Obligatorio: sin este limite el build de produccion falla al
    // prerenderizar una pagina estatica que lee la URL.
    <Suspense fallback={<TableSkeleton />}>
      <SignalView />
    </Suspense>
  );
}

function SignalView() {
  const [params, setParams] = useQueryParams(SIGNAL_DEFAULTS);
  const page = Number(params.page) || 1;
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SignalSignup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadPage = useCallback(
    (signal: AbortSignal) => signalService.getSignups(page, 20, signal),
    [page],
  );

  const {
    data,
    error,
    loading,
    refresh: load,
  } = useAsyncData(loadPage, {
    fallbackMessage: "No se pudo cargar la lista de la señal.",
    initialData: NO_SIGNUPS,
  });

  const meta = data.meta;
  const signups = data.data;

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await signalService.deleteSignup(deleteTarget.id);
      toast.success(`${deleteTarget.email} eliminado de la señal.`);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo eliminar el registro."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    cue(CUE.ocupado);

    try {
      const all = await signalService.getAllSignups();
      const blob = new Blob([signupsToCsv(all)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kori-la-senal-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`CSV generado con ${all.length} personas.`, CUE.exportado);
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
            La señal
            {meta ? (
              <span className="ml-2 align-middle text-base font-normal text-neutral-500">
                {meta.total}
              </span>
            ) : null}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Quienes dejaron su nombre en la landing para los correos personales
            de DICIEMBRE+ [fin de año].
            {meta && meta.total > 0
              ? ` ${meta.marketingOptIn} aceptaron también recibir novedades.`
              : null}
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
        <TableSkeleton columns={3} rows={6} />
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
      ) : signups.length === 0 ? (
        <EmptyState
          description="Cuando alguien deje su nombre y su correo en la landing aparecera aqui."
          title="Aun nadie ha respondido a la señal"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <ul className="divide-y divide-neutral-100">
            {signups.map((signup) => (
              <li
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={signup.id}
              >
                <div className="min-w-0">
                  <p className="break-words font-medium text-neutral-950">
                    {signup.name}
                  </p>
                  <p className="mt-0.5 break-all text-sm text-neutral-700">
                    {signup.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <Badge>{signup.locale.toUpperCase()}</Badge>
                    {signup.marketingOptIn ? (
                      <Badge tone="green">Acepta novedades</Badge>
                    ) : null}
                    <span>{dateFormatter.format(new Date(signup.createdAt))}</span>
                  </div>
                </div>
                <Button
                  aria-label={`Borrar a ${signup.name} (${signup.email})`}
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  onClick={() => setDeleteTarget(signup)}
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
            Pagina {meta.page} de {totalPages} · {meta.total} personas
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
        description="Se borran su nombre y su correo de forma permanente. Es lo que hay que hacer cuando alguien pide la baja o que se eliminen sus datos."
        detail={deleteTarget ? `${deleteTarget.name} · ${deleteTarget.email}` : undefined}
        isBusy={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        open={Boolean(deleteTarget)}
        title="Borrar de la señal"
      />
    </section>
  );
}

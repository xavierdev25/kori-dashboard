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
  meta: {
    eventZone: 0,
    limit: 20,
    marketingOptIn: 0,
    page: 1,
    total: 0,
    totalPages: 0,
  },
};

const SIGNAL_DEFAULTS = { page: "1", zona: "" };

/** "Zapopan, Jalisco, MX", o nada si no dio ubicación (los de la señal). */
function ubicacion(signup: SignalSignup): string {
  return [signup.city, signup.region, signup.country].filter(Boolean).join(", ");
}

/** Con quién se identifica una fila: el nombre si lo dio, si no el correo. */
const quien = (signup: SignalSignup) => signup.name ?? signup.email;

/**
 * "La señal": quienes se registraron en la landing para los correos de
 * DICIEMBRE+ [fin de año]. Dos origenes en la misma lista:
 *   - "La señal" (el formulario anterior): nombre, correo y si acepto
 *     novedades. Quien no las acepto se borra al cerrar la campana.
 *   - La experiencia del caballo (la portada nueva): correo, pais, estado y
 *     ciudad, y la confirmacion de edad. El backend marca a quien esta en la
 *     zona del evento (Guadalajara), y aqui se puede filtrar y exportar solo a
 *     esa gente para escribirle cuando haya fecha y lugar.
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
  const soloZona = params.zona === "1";
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SignalSignup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadPage = useCallback(
    (signal: AbortSignal) =>
      signalService.getSignups(page, 20, signal, soloZona),
    [page, soloZona],
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
      toast.success(`${deleteTarget.email} eliminado de la lista.`);
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
      const all = await signalService.getAllSignups(undefined, soloZona);
      const blob = new Blob([signupsToCsv(all)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kori-${soloZona ? "zona-gdl" : "la-senal"}-${new Date().toISOString().slice(0, 10)}.csv`;
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
            Quienes se registraron en la landing (la experiencia del caballo o
            el formulario anterior) para los correos de DICIEMBRE+ [fin de
            año].
            {meta && meta.total > 0
              ? ` ${meta.marketingOptIn} aceptaron recibir novedades · ${meta.eventZone} en la zona del evento (Guadalajara).`
              : null}
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              checked={soloZona}
              className="h-4 w-4 accent-neutral-900"
              onChange={(e) =>
                setParams({ page: "1", zona: e.target.checked ? "1" : "" })
              }
              type="checkbox"
            />
            Solo la zona del evento (Guadalajara)
          </label>
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
          description={
            soloZona
              ? "Cuando alguien de Guadalajara y su zona se registre aparecera aqui."
              : "Cuando alguien se registre en la landing aparecera aqui."
          }
          title={
            soloZona
              ? "Aun nadie de la zona del evento"
              : "Aun nadie se ha registrado"
          }
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
                  {signup.name ? (
                    <p className="break-words font-medium text-neutral-950">
                      {signup.name}
                    </p>
                  ) : null}
                  <p
                    className={
                      signup.name
                        ? "mt-0.5 break-all text-sm text-neutral-700"
                        : "break-all font-medium text-neutral-950"
                    }
                  >
                    {signup.email}
                  </p>
                  {ubicacion(signup) ? (
                    <p className="mt-0.5 break-words text-sm text-neutral-600">
                      {ubicacion(signup)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <Badge>{signup.locale.toUpperCase()}</Badge>
                    <Badge tone={signup.source === "experiencia" ? "blue" : "neutral"}>
                      {signup.source === "experiencia" ? "Experiencia" : "La señal"}
                    </Badge>
                    {signup.eventZone ? (
                      <Badge tone="pink">Zona del evento</Badge>
                    ) : null}
                    {signup.marketingOptIn ? (
                      <Badge tone="green">Acepta novedades</Badge>
                    ) : null}
                    {signup.ageConfirmed ? <span>Edad confirmada</span> : null}
                    <span>{dateFormatter.format(new Date(signup.createdAt))}</span>
                  </div>
                </div>
                <Button
                  aria-label={`Borrar a ${quien(signup)} (${signup.email})`}
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
        description="Se borran sus datos (correo, nombre, ubicación) y su progreso del juego de forma permanente. Es lo que hay que hacer cuando alguien pide la baja o que se eliminen sus datos."
        detail={
          deleteTarget
            ? [deleteTarget.name, deleteTarget.email].filter(Boolean).join(" · ")
            : undefined
        }
        isBusy={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        open={Boolean(deleteTarget)}
        title="Borrar de la lista"
      />
    </section>
  );
}

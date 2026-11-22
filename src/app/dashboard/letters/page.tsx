"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  Undo2,
} from "@/shared/components/icons";
import { Suspense, useCallback, useState } from "react";
import { lettersService } from "@/features/letters/services/letters.service";
import type {
  Carta,
  EstadoCarta,
  PaginatedCartasResponse,
} from "@/features/letters/types/letters.types";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState";
import { TableSkeleton } from "@/shared/components/Skeleton";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useQueryParams } from "@/shared/hooks/useQueryParams";
import { cn } from "@/shared/utils/cn";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const NO_CARTAS: PaginatedCartasResponse = {
  data: [],
  meta: { limit: 20, page: 1, pending: 0, total: 0, totalPages: 0 },
};

const DEFAULTS = { estado: "pending", page: "1" };

const PESTANAS: { estado: EstadoCarta; label: string }[] = [
  { estado: "pending", label: "Por revisar" },
  { estado: "approved", label: "Publicadas" },
  { estado: "rejected", label: "Rechazadas" },
];

/** Lo que una persona puede leer en voz alta en la sala de moderación. */
const AYUDA =
  "Si una carta habla de hacerse daño, recházala: a quien la escribió la página ya le mostró la Línea de la Vida (800 911 2000).";

/**
 * "Cartas que no envié": las cartas públicas de la experiencia del caballo.
 *
 * Ninguna se ve en el archivo de la landing hasta que alguien del equipo la
 * aprueba aquí. Son anónimas: el backend no guarda quién las escribió. Al
 * rechazar una, su texto se borra (queda el registro, para que quien la
 * escribió vea "no se publicó").
 *
 * El texto se pinta como texto (JSX escapa todo): nunca se interpreta HTML de
 * lo que escribió la gente.
 */
export default function LettersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <LettersView />
    </Suspense>
  );
}

function LettersView() {
  const [params, setParams] = useQueryParams(DEFAULTS);
  const estado = (
    PESTANAS.some((p) => p.estado === params.estado) ? params.estado : "pending"
  ) as EstadoCarta;
  const page = Number(params.page) || 1;
  const [busy, setBusy] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Carta | null>(null);
  const toast = useToast();

  const loadPage = useCallback(
    (signal: AbortSignal) => lettersService.getLetters(estado, page, 20, signal),
    [estado, page],
  );

  const {
    data,
    error,
    loading,
    refresh: load,
  } = useAsyncData(loadPage, {
    fallbackMessage: "No se pudieron cargar las cartas.",
    initialData: NO_CARTAS,
  });

  const meta = data.meta;
  const cartas = data.data;
  const totalPages = meta?.totalPages || 1;

  async function revisar(carta: Carta, status: "approved" | "rejected") {
    setBusy(carta.id);
    try {
      await lettersService.reviewLetter(carta.id, status);
      toast.success(
        status === "approved"
          ? `La carta para ${carta.to} ya está en el archivo.`
          : `La carta para ${carta.to} no se publicará (se borró su texto).`,
      );
      await load();
    } catch (err) {
      toast.error(getErrorText(err, "No se pudo guardar la revisión."));
    } finally {
      setBusy(null);
    }
  }

  async function borrar() {
    if (!deleteTarget) return;
    setBusy(deleteTarget.id);
    try {
      await lettersService.deleteLetter(deleteTarget.id);
      toast.success("Carta eliminada.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(getErrorText(err, "No se pudo eliminar la carta."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Cartas
            {meta.pending > 0 ? (
              <span className="ml-2 align-middle text-base font-normal text-neutral-500">
                {meta.pending} por revisar
              </span>
            ) : null}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Las cartas públicas de la landing («Cartas que no envié»). Ninguna
            aparece en el archivo hasta que se aprueba aquí. Son anónimas. {AYUDA}
          </p>
        </div>
        <Button
          disabled={loading}
          leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
          onClick={load}
          variant="secondary"
        >
          Actualizar
        </Button>
      </div>

      <div
        aria-label="Estado de las cartas"
        className="flex flex-wrap gap-2"
        role="tablist"
      >
        {PESTANAS.map((p) => (
          <button
            aria-selected={p.estado === estado}
            className={cn(
              "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
              p.estado === estado
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500",
            )}
            key={p.estado}
            onClick={() => setParams({ estado: p.estado, page: "1" })}
            role="tab"
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton columns={2} rows={5} />
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
          title="No se pudieron cargar las cartas"
        />
      ) : cartas.length === 0 ? (
        <EmptyState
          description={
            estado === "pending"
              ? "Cuando alguien mande una carta pública aparecerá aquí para revisarla."
              : "Todavía no hay cartas en esta lista."
          }
          title={estado === "pending" ? "Nada por revisar" : "Sin cartas"}
        />
      ) : (
        <ul className="grid gap-4">
          {cartas.map((carta) => (
            <li
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              key={carta.id}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="text-sm font-medium text-neutral-950">
                  Para: {carta.to}
                </span>
                <Badge>{carta.locale.toUpperCase()}</Badge>
                {carta.status === "approved" ? (
                  <Badge tone="green">Publicada</Badge>
                ) : carta.status === "rejected" ? (
                  <Badge tone="pink">Rechazada</Badge>
                ) : null}
                <span>{dateFormatter.format(new Date(carta.createdAt))}</span>
              </div>
              {carta.text ? (
                // `whitespace-pre-wrap`: tal cual la escribieron, con sus saltos
                <p className="mt-3 border-t border-neutral-100 pt-3 text-sm leading-6 break-words whitespace-pre-wrap text-neutral-800">
                  {carta.text}
                </p>
              ) : (
                <p className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-500 italic">
                  Texto borrado al rechazarla.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {carta.status !== "approved" && carta.text ? (
                  <Button
                    isLoading={busy === carta.id}
                    leftIcon={<Check aria-hidden className="h-4 w-4" />}
                    onClick={() => void revisar(carta, "approved")}
                    size="sm"
                  >
                    Publicar
                  </Button>
                ) : null}
                {carta.status !== "rejected" ? (
                  <Button
                    disabled={busy === carta.id}
                    leftIcon={<Undo2 aria-hidden className="h-4 w-4" />}
                    onClick={() => void revisar(carta, "rejected")}
                    size="sm"
                    variant="secondary"
                  >
                    {carta.status === "approved" ? "Retirar" : "Rechazar"}
                  </Button>
                ) : null}
                <Button
                  aria-label={`Borrar la carta para ${carta.to}`}
                  disabled={busy === carta.id}
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  onClick={() => setDeleteTarget(carta)}
                  size="sm"
                  variant="ghost"
                >
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && meta.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Página {meta.page} de {totalPages} · {meta.total} cartas
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
        description="La carta se borra de forma permanente, también del archivo si estaba publicada."
        detail={deleteTarget ? `Para: ${deleteTarget.to}` : undefined}
        isBusy={Boolean(deleteTarget && busy === deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void borrar()}
        open={Boolean(deleteTarget)}
        title="Borrar carta"
      />
    </section>
  );
}

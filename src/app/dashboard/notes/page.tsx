"use client";

import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { DeleteNoteDialog } from "@/features/notes/components/DeleteNoteDialog";
import { NotesFilters } from "@/features/notes/components/NotesFilters";
import type { NotesFiltersValue } from "@/features/notes/components/NotesFilters";
import { NotesTable } from "@/features/notes/components/NotesTable";
import { StatsCards } from "@/features/notes/components/StatsCards";
import { useNotes, useNotesStats } from "@/features/notes/hooks/useNotes";
import { notesService } from "@/features/notes/services/notes.service";
import type { AdminNote, NotesFilterType } from "@/features/notes/types/note.types";
import { Button } from "@/shared/components/Button";
import { StatSkeleton } from "@/shared/components/Skeleton";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";

interface NotesPageFilters extends NotesFiltersValue {
  page: number;
}

export default function NotesPage() {
  const [filters, setFilters] = useState<NotesPageFilters>({
    limit: 20,
    page: 1,
    search: "",
    status: "ALL",
    type: "ALL",
  });
  const [deleteTarget, setDeleteTarget] = useState<AdminNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { loading: loadingStats, refresh: refreshStats, stats } = useNotesStats();

  const { error, loading, meta, notes, refresh } = useNotes({
    limit: filters.limit,
    page: filters.page,
    search: filters.search,
    status: filters.status === "ALL" ? undefined : filters.status,
    type: filters.type === "ALL" ? undefined : filters.type,
  });

  function updateFilters(nextValue: NotesFiltersValue) {
    setFilters((current) => ({
      ...current,
      ...nextValue,
      page: 1,
      type: nextValue.type as NotesFilterType,
    }));
  }

  function goToPage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  /** Toda accion mueve el contador de pendientes: las metricas se releen. */
  async function reload() {
    await Promise.all([refresh(), refreshStats()]);
  }

  async function handleApprove(note: AdminNote) {
    try {
      await notesService.approveNote(note.id);
      toast.success("Nota aprobada: ya es visible en el muro.");
      await reload();
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo aprobar la nota."));
    }
  }

  async function handleReject(note: AdminNote) {
    try {
      await notesService.rejectNote(note.id);
      toast.success("Nota quitada del muro: vuelve a quedar pendiente.");
      await reload();
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo quitar la nota del muro."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await notesService.deleteNote(deleteTarget.id);
      toast.success("Nota borrada correctamente.");
      setDeleteTarget(null);
      await reload();
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo borrar la nota."));
    } finally {
      setIsDeleting(false);
    }
  }

  const totalPages = meta?.totalPages || 1;
  const canGoPrevious = filters.page > 1;
  const canGoNext = filters.page < totalPages;

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Notas</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Revisa, filtra, descarga o elimina notas recibidas desde la landing.
          </p>
        </div>
        <Button
          disabled={loading}
          leftIcon={<RefreshCcw aria-hidden className="h-4 w-4" />}
          onClick={() => void reload()}
          variant="secondary"
        >
          Actualizar
        </Button>
      </div>

      {loadingStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
      ) : stats ? (
        <StatsCards stats={stats} />
      ) : null}

      <NotesFilters disabled={loading} onChange={updateFilters} value={filters} />

      <NotesTable
        error={error}
        loading={loading}
        notes={notes}
        onApprove={handleApprove}
        onDelete={setDeleteTarget}
        onFeedback={(message, tone) =>
          tone === "success" ? toast.success(message) : toast.error(message)
        }
        onRefresh={refresh}
        onReject={handleReject}
      />

      {meta && !loading && !error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Pagina {meta.page} de {totalPages} · {meta.total} notas
          </span>
          <div className="flex gap-2">
            <Button
              disabled={!canGoPrevious}
              leftIcon={<ChevronLeft aria-hidden className="h-4 w-4" />}
              onClick={() => goToPage(filters.page - 1)}
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={!canGoNext}
              onClick={() => goToPage(filters.page + 1)}
              rightIcon={<ChevronRight aria-hidden className="h-4 w-4" />}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <DeleteNoteDialog
        isDeleting={isDeleting}
        note={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
      />
    </section>
  );
}

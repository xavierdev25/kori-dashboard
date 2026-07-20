"use client";

import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { DeleteNoteDialog } from "@/features/notes/components/DeleteNoteDialog";
import { NotesFilters } from "@/features/notes/components/NotesFilters";
import type { NotesFiltersValue } from "@/features/notes/components/NotesFilters";
import { NotesTable } from "@/features/notes/components/NotesTable";
import { useNotes } from "@/features/notes/hooks/useNotes";
import { notesService } from "@/features/notes/services/notes.service";
import type { AdminNote, NotesFilterType } from "@/features/notes/types/note.types";
import { Button } from "@/shared/components/Button";
import { cn } from "@/shared/utils/cn";

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
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

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
    setFeedback(null);
  }

  function goToPage(page: number) {
    setFilters((current) => ({ ...current, page }));
    setFeedback(null);
  }

  async function handleApprove(note: AdminNote) {
    setFeedback(null);

    try {
      await notesService.approveNote(note.id);
      setFeedback({
        message: "Nota aprobada: ya es visible en el muro.",
        tone: "success",
      });
      await refresh();
    } catch {
      setFeedback({ message: "No se pudo aprobar la nota.", tone: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      await notesService.deleteNote(deleteTarget.id);
      setFeedback({ message: "Nota borrada correctamente.", tone: "success" });
      setDeleteTarget(null);
      await refresh();
    } catch {
      setFeedback({ message: "No se pudo borrar la nota.", tone: "error" });
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
          onClick={refresh}
          variant="secondary"
        >
          Actualizar
        </Button>
      </div>

      <NotesFilters disabled={loading} onChange={updateFilters} value={filters} />

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

      <NotesTable
        error={error}
        loading={loading}
        notes={notes}
        onApprove={handleApprove}
        onDelete={setDeleteTarget}
        onFeedback={(message, tone) => setFeedback({ message, tone })}
        onRefresh={refresh}
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

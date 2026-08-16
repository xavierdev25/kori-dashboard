"use client";

import { useCallback } from "react";
import { notesService } from "@/features/notes/services/notes.service";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type {
  AdminNote,
  NotesQuery,
  NotesStats,
  PaginatedNotesResponse,
} from "@/features/notes/types/note.types";

const NO_NOTES: PaginatedNotesResponse = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

export function useNotes(query: NotesQuery) {
  const { limit, page, search, status, type } = query;

  // El buscador es el caso claro de por que hay que cancelar: cada tecla
  // dispara una peticion y la del texto corto suele volver despues que la del
  // largo, dejando en pantalla los resultados de lo que ya no esta escrito.
  const load = useCallback(
    (signal: AbortSignal) =>
      notesService.getNotes({ limit, page, search, status, type }, signal),
    [limit, page, search, status, type],
  );

  const { data, error, loading, refresh } = useAsyncData(load, {
    fallbackMessage: "No se pudieron cargar las notas.",
    initialData: NO_NOTES,
  });

  return {
    error,
    loading,
    meta: data.meta,
    notes: data.data,
    refresh,
  };
}

export function useNote(id: string | null) {
  const load = useCallback(
    (signal: AbortSignal) =>
      id ? notesService.getNote(id, signal) : Promise.resolve(null),
    [id],
  );

  const { data, error, loading, refresh } = useAsyncData<AdminNote | null>(load, {
    enabled: Boolean(id),
    fallbackMessage: "No se pudo cargar la nota.",
    initialData: null,
  });

  return {
    error,
    loading,
    note: data,
    refresh,
  };
}

export function useNotesStats() {
  const load = useCallback(
    (signal: AbortSignal) => notesService.getStats(signal),
    [],
  );

  const { data, error, loading, refresh } = useAsyncData<NotesStats | null>(load, {
    fallbackMessage: "No se pudieron cargar las metricas.",
    initialData: null,
  });

  return {
    error,
    loading,
    refresh,
    stats: data,
  };
}

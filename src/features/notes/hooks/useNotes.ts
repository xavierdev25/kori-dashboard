"use client";

import { useCallback, useEffect, useState } from "react";
import { notesService } from "@/features/notes/services/notes.service";
import type {
  AdminNote,
  NotesQuery,
  NotesStats,
  PaginatedNotesResponse,
} from "@/features/notes/types/note.types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useNotes(query: NotesQuery) {
  const { limit, page, search, type } = query;
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [meta, setMeta] = useState<PaginatedNotesResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const response = await notesService.getNotes({ limit, page, search, type });
      setNotes(response.data);
      setMeta(response.meta);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "No se pudieron cargar las notas."));
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  return {
    error,
    loading,
    meta,
    notes,
    refresh: loadNotes,
  };
}

export function useNote(id: string | null) {
  const [note, setNote] = useState<AdminNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const loadNote = useCallback(async () => {
    if (!id) {
      return;
    }

    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setNote(await notesService.getNote(id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "No se pudo cargar la nota."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNote();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNote]);

  return {
    error,
    loading,
    note,
    refresh: loadNote,
  };
}

export function useNotesStats() {
  const [stats, setStats] = useState<NotesStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setStats(await notesService.getStats());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "No se pudieron cargar las metricas."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStats]);

  return {
    error,
    loading,
    refresh: loadStats,
    stats,
  };
}

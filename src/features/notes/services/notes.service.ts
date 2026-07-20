import { apiRequest } from "@/shared/lib/api-client";
import type {
  AdminNote,
  NotesQuery,
  NotesStats,
  PaginatedNotesResponse,
} from "@/features/notes/types/note.types";

function buildNotesQuery(query: NotesQuery) {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.type) {
    params.set("type", query.type);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export const notesService = {
  approveNote(id: string) {
    return apiRequest<AdminNote>(`/admin/notes/${id}/approve`, {
      method: "PATCH",
    });
  },

  deleteNote(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(`/admin/notes/${id}`, {
      method: "DELETE",
    });
  },

  getNote(id: string) {
    return apiRequest<AdminNote>(`/admin/notes/${id}`);
  },

  getNotes(query: NotesQuery = {}) {
    return apiRequest<PaginatedNotesResponse>(`/admin/notes${buildNotesQuery(query)}`);
  },

  getStats() {
    return apiRequest<NotesStats>("/admin/notes/stats");
  },
};

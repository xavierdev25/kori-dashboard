import { apiRequest } from "@/shared/lib/api-client";
import type {
  EstadoCarta,
  PaginatedCartasResponse,
} from "@/features/letters/types/letters.types";

export const lettersService = {
  getLetters(
    status: EstadoCarta,
    page = 1,
    limit = 20,
    signal?: AbortSignal,
  ) {
    return apiRequest<PaginatedCartasResponse>(
      `/admin/experience/letters?status=${status}&page=${page}&limit=${limit}`,
      { signal },
    );
  },

  /** Aprobar la publica en el archivo; rechazar borra su texto. */
  reviewLetter(id: string, status: "approved" | "rejected") {
    return apiRequest<{ id: string; status: EstadoCarta }>(
      `/admin/experience/letters/${id}`,
      { body: { status }, method: "PATCH" },
    );
  },

  deleteLetter(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(
      `/admin/experience/letters/${id}`,
      { method: "DELETE" },
    );
  },
};

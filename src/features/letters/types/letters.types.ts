export type EstadoCarta = "pending" | "approved" | "rejected";

/**
 * Una carta pública de "Cartas que no envié" (`GET /admin/experience/letters`).
 * Anónima a propósito: no trae nada de quien la escribió. Las rechazadas
 * vienen sin texto (se borra al rechazarlas).
 */
export interface Carta {
  createdAt: string;
  id: string;
  locale: "es" | "en";
  reviewedAt: string | null;
  status: EstadoCarta;
  text: string;
  to: string;
}

export interface PaginatedCartasResponse {
  data: Carta[];
  meta: {
    limit: number;
    page: number;
    /** Cuántas esperan revisión (de todas, no solo de esta página). */
    pending: number;
    total: number;
    totalPages: number;
  };
}

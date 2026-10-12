/** Una persona apuntada en "la señal" de la landing (`GET /admin/signal`). */
export interface SignalSignup {
  createdAt: string;
  email: string;
  id: string;
  locale: "es" | "en";
  /** Aceptó también recibir novedades después de la campaña. */
  marketingOptIn: boolean;
  name: string;
  /** Fecha (AAAA-MM-DD) del aviso de privacidad que aceptó. */
  privacyVersion: string;
}

export interface PaginatedSignalSignupsResponse {
  data: SignalSignup[];
  meta: {
    limit: number;
    /** Cuántos aceptaron novedades: los que se quedan cuando acabe la campaña. */
    marketingOptIn: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

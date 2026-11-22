/**
 * Una persona registrada (`GET /admin/signal`): de "la señal" (el formulario
 * anterior de la landing) o de la experiencia del caballo (la portada nueva).
 */
export interface SignalSignup {
  /** Confirmó tener 18 años o más, o el permiso de su mamá, papá o tutor. */
  ageConfirmed: boolean;
  city: string | null;
  /** País ISO de dos letras. */
  country: string | null;
  createdAt: string;
  email: string;
  /** En la zona metropolitana de Guadalajara (el evento). La calcula el backend. */
  eventZone: boolean;
  id: string;
  locale: "es" | "en";
  /** Aceptó también recibir novedades después de la campaña. */
  marketingOptIn: boolean;
  /** Vacío en los registros de la experiencia (no lo piden). */
  name: string | null;
  /** Fecha (AAAA-MM-DD) del aviso de privacidad que aceptó. */
  privacyVersion: string;
  region: string | null;
  /** De dónde llegó. */
  source: "senal" | "experiencia";
}

export interface PaginatedSignalSignupsResponse {
  data: SignalSignup[];
  meta: {
    /** Cuántos están en la zona del evento (de toda la lista). */
    eventZone: number;
    limit: number;
    /** Cuántos aceptaron novedades: los que se quedan cuando acabe la campaña. */
    marketingOptIn: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

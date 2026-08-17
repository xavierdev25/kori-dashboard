export interface ContactMessage {
  createdAt: string;
  email: string;
  id: string;
  /** En qué idioma escribió, para contestarle en el suyo. */
  locale: string;
  message: string;
  name: string;
}

export interface PaginatedContactResponse {
  data: ContactMessage[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

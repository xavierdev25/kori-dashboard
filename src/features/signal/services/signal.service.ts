import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaginatedSignalSignupsResponse,
  SignalSignup,
} from "@/features/signal/types/signal.types";

export const signalService = {
  deleteSignup(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(`/admin/signal/${id}`, {
      method: "DELETE",
    });
  },

  /** `soloZona`: solo quienes están en la zona del evento (Guadalajara). */
  getSignups(page = 1, limit = 20, signal?: AbortSignal, soloZona = false) {
    const zona = soloZona ? "&zona=true" : "";
    return apiRequest<PaginatedSignalSignupsResponse>(
      `/admin/signal?page=${page}&limit=${limit}${zona}`,
      { signal },
    );
  },

  /** Trae todas las páginas (para exportar CSV). */
  async getAllSignups(
    signal?: AbortSignal,
    soloZona = false,
  ): Promise<SignalSignup[]> {
    const all: SignalSignup[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.getSignups(page, 100, signal, soloZona);
      all.push(...response.data);
      totalPages = response.meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  },
};

import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaginatedSales,
  SaleDetail,
  SalesQuery,
  SalesStats,
  SalesTimeseries,
} from "@/features/sales/types/sale.types";

function buildQuery(query: SalesQuery) {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.from) {
    params.set("from", query.from);
  }

  if (query.to) {
    params.set("to", query.to);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

/**
 * Solo lectura, a proposito. Un pedido cambia de estado por un webhook del
 * cobro o del proveedor, nunca a mano desde el panel: el backend no expone
 * ningun endpoint de escritura sobre ventas.
 */
export const salesService = {
  getSale(id: string, signal?: AbortSignal) {
    return apiRequest<SaleDetail>(`/admin/orders/${id}`, { signal });
  },

  getSales(query: SalesQuery = {}, signal?: AbortSignal) {
    return apiRequest<PaginatedSales>(`/admin/orders${buildQuery(query)}`, {
      signal,
    });
  },

  getStats(query: SalesQuery = {}, signal?: AbortSignal) {
    return apiRequest<SalesStats>(`/admin/stats${buildQuery(query)}`, { signal });
  },

  /**
   * Serie diaria para la grafica. El agregado lo hace el backend: aqui solo
   * llegan veinte pedidos por pagina, asi que sumar en el navegador dibujaria
   * la curva de la pagina que toque mirar y no la de la tienda.
   */
  getTimeseries(query: SalesQuery = {}, signal?: AbortSignal) {
    return apiRequest<SalesTimeseries>(
      `/admin/stats/timeseries${buildQuery(query)}`,
      { signal },
    );
  },
};

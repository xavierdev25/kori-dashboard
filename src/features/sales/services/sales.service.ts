import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaginatedSales,
  SaleDetail,
  SalesQuery,
  SalesStats,
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
  getSale(id: string) {
    return apiRequest<SaleDetail>(`/admin/orders/${id}`);
  },

  getSales(query: SalesQuery = {}) {
    return apiRequest<PaginatedSales>(`/admin/orders${buildQuery(query)}`);
  },

  getStats(query: SalesQuery = {}) {
    return apiRequest<SalesStats>(`/admin/stats${buildQuery(query)}`);
  },
};

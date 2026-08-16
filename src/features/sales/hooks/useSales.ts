"use client";

import { useCallback } from "react";
import { salesService } from "@/features/sales/services/sales.service";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type {
  PaginatedSales,
  SaleDetail,
  SalesQuery,
  SalesStats,
  SalesTimeseries,
} from "@/features/sales/types/sale.types";

const NO_SALES: PaginatedSales = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

export function useSales(query: SalesQuery) {
  const { from, limit, page, status, to } = query;

  const load = useCallback(
    (signal: AbortSignal) =>
      salesService.getSales({ from, limit, page, status, to }, signal),
    [from, limit, page, status, to],
  );

  const { data, error, loading, refresh } = useAsyncData(load, {
    fallbackMessage: "No se pudieron cargar las ventas.",
    initialData: NO_SALES,
  });

  return { error, loading, meta: data.meta, refresh, sales: data.data };
}

export function useSalesStats(query: SalesQuery) {
  const { from, status, to } = query;

  const load = useCallback(
    (signal: AbortSignal) => salesService.getStats({ from, status, to }, signal),
    [from, status, to],
  );

  const { data, error, loading, refresh } = useAsyncData<SalesStats | null>(load, {
    fallbackMessage: "No se pudieron cargar las metricas.",
    initialData: null,
  });

  return { error, loading, refresh, stats: data };
}

/**
 * La serie diaria para la grafica.
 *
 * Hook aparte y no dentro de `useSalesStats` a proposito: son dos peticiones
 * distintas y si una falla la otra debe seguir pintandose. Ademas ignora el
 * filtro de estado — una grafica de ingresos filtrada por "cancelado" no
 * significa nada.
 */
export function useSalesTimeseries(query: SalesQuery) {
  const { from, to } = query;

  const load = useCallback(
    (signal: AbortSignal) => salesService.getTimeseries({ from, to }, signal),
    [from, to],
  );

  const { data, error, loading, refresh } = useAsyncData<SalesTimeseries | null>(
    load,
    {
      fallbackMessage: "No se pudo cargar la grafica.",
      initialData: null,
    },
  );

  return { error, loading, refresh, timeseries: data };
}

export function useSale(id: string | null) {
  const load = useCallback(
    (signal: AbortSignal) =>
      id ? salesService.getSale(id, signal) : Promise.resolve(null),
    [id],
  );

  const { data, error, loading, refresh } = useAsyncData<SaleDetail | null>(load, {
    enabled: Boolean(id),
    fallbackMessage: "No se pudo cargar la venta.",
    initialData: null,
  });

  return { error, loading, refresh, sale: data };
}

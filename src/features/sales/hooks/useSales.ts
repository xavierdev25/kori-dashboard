"use client";

import { useCallback, useEffect, useState } from "react";
import { salesService } from "@/features/sales/services/sales.service";
import { getErrorText } from "@/shared/lib/error-message";
import type {
  PaginatedSales,
  SaleDetail,
  SalesQuery,
  SalesStats,
  SalesTimeseries,
  SaleSummary,
} from "@/features/sales/types/sale.types";

export function useSales(query: SalesQuery) {
  const { from, limit, page, status, to } = query;
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [meta, setMeta] = useState<PaginatedSales["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const response = await salesService.getSales({
        from,
        limit,
        page,
        status,
        to,
      });
      setSales(response.data);
      setMeta(response.meta);
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudieron cargar las ventas."));
    } finally {
      setLoading(false);
    }
  }, [from, limit, page, status, to]);

  // Diferido un tick: React 19 prohibe setState sincrono dentro de un efecto.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSales();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSales]);

  return { error, loading, meta, refresh: loadSales, sales };
}

export function useSalesStats(query: SalesQuery) {
  const { from, status, to } = query;
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setStats(await salesService.getStats({ from, status, to }));
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudieron cargar las metricas."));
    } finally {
      setLoading(false);
    }
  }, [from, status, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStats]);

  return { error, loading, refresh: loadStats, stats };
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
  const [timeseries, setTimeseries] = useState<SalesTimeseries | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setTimeseries(await salesService.getTimeseries({ from, to }));
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudo cargar la grafica."));
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  return { error, loading, refresh: load, timeseries };
}

export function useSale(id: string | null) {
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const loadSale = useCallback(async () => {
    if (!id) {
      return;
    }

    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setSale(await salesService.getSale(id));
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudo cargar la venta."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSale();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSale]);

  return { error, loading, refresh: loadSale, sale };
}

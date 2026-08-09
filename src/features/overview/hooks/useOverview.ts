"use client";

import { useCallback, useEffect, useState } from "react";
import { notesService } from "@/features/notes/services/notes.service";
import { productsService } from "@/features/products/services/products.service";
import { salesService } from "@/features/sales/services/sales.service";
import { getReadiness } from "@/features/products/utils/readiness";
import { getErrorText } from "@/shared/lib/error-message";
import type { NotesStats } from "@/features/notes/types/note.types";
import type { ProductSummary } from "@/features/products/types/product.types";
import type {
  SalesStats,
  SalesTimeseries,
  SaleSummary,
} from "@/features/sales/types/sale.types";

export interface Overview {
  /** Productos publicados a los que les falta algo para poder producirse. */
  brokenPublished: ProductSummary[];
  draftCount: number;
  notes: NotesStats | null;
  publishedCount: number;
  recentSales: SaleSummary[];
  /** null si el usuario no es ADMIN: las ventas son solo suyas. */
  sales: SalesStats | null;
  /** Serie diaria para la grafica. null si no es ADMIN o si fallo. */
  timeseries: SalesTimeseries | null;
}

/**
 * Reune en una sola pantalla lo que antes obligaba a recorrer tres secciones.
 *
 * Las llamadas van en paralelo y las de ventas se tratan aparte: un ARTIST
 * recibe 403 en /admin/orders, y eso no debe vaciarle el resto del resumen.
 */
/** "2026-07-26" para "hace 14 dias", en la fecha local de quien mira. */
function ultimosDias(dias: number): string {
  const desde = new Date(Date.now() - (dias - 1) * 24 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(desde);
}

export function useOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const [products, notes, sales, recentSales, timeseries] =
        await Promise.all([
          productsService.getProducts({ limit: 100 }),
          notesService.getStats().catch(() => null),
          salesService.getStats().catch(() => null),
          salesService
            .getSales({ limit: 5 })
            .then((response) => response.data)
            .catch(() => []),
          // Ultimos 14 dias: en una tarjeta compacta, treinta barras se
          // convierten en un peine ilegible.
          salesService
            .getTimeseries({ from: ultimosDias(14) })
            .catch(() => null),
        ]);

      const published = products.data.filter((product) => product.isActive);

      setData({
        // Publicado pero ya no producible: alguien puede pagar algo que el
        // proveedor rechazara. Es lo primero que hay que ver al entrar.
        brokenPublished: published.filter(
          (product) => !getReadiness(product).canPublish,
        ),
        draftCount: products.data.length - published.length,
        notes,
        publishedCount: published.length,
        recentSales,
        sales,
        timeseries,
      });
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudo cargar el resumen."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Diferido un tick: React 19 prohibe setState sincrono dentro de un efecto.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  return { data, error, loading, refresh: load };
}

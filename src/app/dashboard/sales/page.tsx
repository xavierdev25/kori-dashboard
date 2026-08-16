"use client";

import { Suspense } from "react";
import { SalesTable } from "@/features/sales/components/SalesTable";
import { SalesChart } from "@/features/sales/components/SalesChartLazy";
import { StatsPanel } from "@/features/sales/components/StatsPanel";
import {
  useSales,
  useSalesStats,
  useSalesTimeseries,
} from "@/features/sales/hooks/useSales";
import {
  getStatusLabel,
  STATUS_ORDER,
} from "@/features/sales/utils/order-status";
import { RequireAdmin } from "@/features/auth/components/RequireAdmin";
import { buttonVariants } from "@/shared/components/Button";
import { Bones } from "@/shared/components/Bones";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { StatSkeleton, TableSkeleton } from "@/shared/components/Skeleton";
import { useQueryParams } from "@/shared/hooks/useQueryParams";
import type { OrderStatus } from "@/features/sales/types/sale.types";

const PAGE_SIZE = 20;

// Fuera del componente: `useQueryParams` lo usa como dependencia y un objeto
// nuevo en cada render lo recalcularia sin parar.
const SALES_DEFAULTS = { from: "", page: "1", status: "", to: "" };

/**
 * El guardia envuelve a `SalesView` en vez de ir dentro a proposito: los hooks
 * de carga viven ahi, y si estuvieran en este mismo componente se ejecutarian
 * antes de comprobar el rol — un ARTIST dispararia las cuatro peticiones de
 * ventas solo para que el backend le devolviera 403 en todas.
 */
export default function SalesPage() {
  return (
    <RequireAdmin>
      {/* Obligatorio, no decorativo: `useQueryParams` lee la URL y sin este
          limite el build de produccion falla al prerenderizar la pagina. */}
      <Suspense fallback={<TableSkeleton />}>
        <SalesView />
      </Suspense>
    </RequireAdmin>
  );
}

function SalesView() {
  const [params, setParams] = useQueryParams(SALES_DEFAULTS);
  const page = Number(params.page) || 1;
  const status = params.status as OrderStatus | "";

  const filters = {
    from: params.from || undefined,
    status: status || undefined,
    to: params.to || undefined,
  };

  const { error, loading, meta, sales } = useSales({
    ...filters,
    limit: PAGE_SIZE,
    page,
  });
  const { stats } = useSalesStats(filters);
  const { timeseries } = useSalesTimeseries(filters);

  function updateFilter(patch: Partial<typeof SALES_DEFAULTS>) {
    // Cambiar un filtro sin volver a la primera pagina deja al usuario mirando
    // una pagina 3 que quiza ya no existe.
    setParams({ ...patch, page: "1" });
  }

  return (
    <section className="grid gap-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
          Ventas
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Solo lectura. Los pedidos cambian de estado por el cobro y el
          proveedor, nunca a mano.
        </p>
      </header>

      {stats ? (
        <StatsPanel stats={stats} />
      ) : (
        <Bones
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StatSkeleton key={index} />
              ))}
            </div>
          }
          name="overview-stats"
        />
      )}

      {timeseries ? (
        <SalesChart
          currency={timeseries.currency}
          days={timeseries.days}
          timeZone={timeseries.timeZone}
        />
      ) : (
        <Bones fallback={<TableSkeleton columns={1} rows={4} />} name="sales-chart" />
      )}

      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-neutral-800">
          <span>Estado</span>
          <select
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            onChange={(event) => updateFilter({ status: event.target.value })}
            value={status}
          >
            <option value="">Todos</option>
            {STATUS_ORDER.map((option) => (
              <option key={option} value={option}>
                {getStatusLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Desde"
          name="from"
          onChange={(event) => updateFilter({ from: event.target.value })}
          type="date"
          value={params.from}
        />
        <Input
          label="Hasta"
          name="to"
          onChange={(event) => updateFilter({ to: event.target.value })}
          type="date"
          value={params.to}
        />
      </Card>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Bones
          fallback={<TableSkeleton columns={5} rows={5} />}
          name="sales-table"
        />
      ) : sales.length === 0 ? (
        <EmptyState
          description={
            status || params.from || params.to
              ? "Ninguna venta coincide con esos filtros."
              : "Todavia no hay ventas registradas."
          }
          title="Sin ventas"
        />
      ) : (
        <>
          <SalesTable sales={sales} />

          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>
                Pagina {meta.page} de {meta.totalPages} · {meta.total} ventas
              </span>
              <div className="flex gap-2">
                <button
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                  disabled={page <= 1}
                  onClick={() => setParams({ page: String(page - 1) })}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                  disabled={page >= meta.totalPages}
                  onClick={() => setParams({ page: String(page + 1) })}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

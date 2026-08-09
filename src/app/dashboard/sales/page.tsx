"use client";

import { useState } from "react";
import { SalesTable } from "@/features/sales/components/SalesTable";
import { StatsPanel } from "@/features/sales/components/StatsPanel";
import { useSales, useSalesStats } from "@/features/sales/hooks/useSales";
import {
  getStatusLabel,
  STATUS_ORDER,
} from "@/features/sales/utils/order-status";
import { buttonVariants } from "@/shared/components/Button";
import { Bones } from "@/shared/components/Bones";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { StatSkeleton, TableSkeleton } from "@/shared/components/Skeleton";
import type { OrderStatus } from "@/features/sales/types/sale.types";

const PAGE_SIZE = 20;

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters = {
    from: from || undefined,
    status: status || undefined,
    to: to || undefined,
  };

  const { error, loading, meta, sales } = useSales({
    ...filters,
    limit: PAGE_SIZE,
    page,
  });
  const { stats } = useSalesStats(filters);

  function updateFilter(apply: () => void) {
    apply();
    // Cambiar un filtro sin volver a la primera pagina deja al usuario mirando
    // una pagina 3 que quiza ya no existe.
    setPage(1);
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

      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-neutral-800">
          <span>Estado</span>
          <select
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            onChange={(event) =>
              updateFilter(() => setStatus(event.target.value as OrderStatus | ""))
            }
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
          onChange={(event) => updateFilter(() => setFrom(event.target.value))}
          type="date"
          value={from}
        />
        <Input
          label="Hasta"
          name="to"
          onChange={(event) => updateFilter(() => setTo(event.target.value))}
          type="date"
          value={to}
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
            status || from || to
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
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
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

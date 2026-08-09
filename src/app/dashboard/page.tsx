"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Package,
  Receipt,
  ShoppingBag,
  StickyNote,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { useOverview } from "@/features/overview/hooks/useOverview";
import { formatMoney } from "@/features/products/utils/format-money";
import { formatDate } from "@/features/notes/utils/format-date";
import {
  getStatusLabel,
  getStatusTone,
} from "@/features/sales/utils/order-status";
import { Badge } from "@/shared/components/Badge";
import { buttonVariants } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { StatSkeleton, TableSkeleton } from "@/shared/components/Skeleton";

function Stat({
  hint,
  href,
  icon,
  label,
  value,
}: {
  hint?: string;
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
      href={href}
    >
      <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-neutral-950">
              {value}
            </p>
            {hint ? (
              <p className="mt-1 text-xs text-neutral-500">{hint}</p>
            ) : null}
          </div>
          <span className="rounded-md bg-neutral-100 p-2 text-neutral-600 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
            {icon}
          </span>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Aviso de algo que hay que atender. Se pone arriba del todo y solo aparece
 * cuando hace falta: una alerta permanente deja de leerse a la semana.
 */
function Attention({
  action,
  children,
  href,
}: {
  action: string;
  children: ReactNode;
  href: string;
}) {
  return (
    <Card className="border-rose-200 bg-rose-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-rose-900">
          <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />
          {children}
        </p>
        <Link
          className={buttonVariants({ size: "sm", variant: "secondary" })}
          href={href}
        >
          {action}
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useOverview();

  if (loading) {
    return (
      <section className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Resumen
          </h2>
          <p className="mt-1 text-sm text-neutral-600">Cargando el estado…</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
        <TableSkeleton columns={4} rows={3} />
      </section>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
        {error ?? "No se pudo cargar el resumen."}
      </Card>
    );
  }

  const { brokenPublished, draftCount, notes, publishedCount, recentSales, sales } =
    data;
  const needsReview = sales?.countByStatus.NEEDS_REVIEW ?? 0;
  const pendingNotes = notes?.totalPending ?? 0;

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
          Resumen
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Cómo va la tienda y qué necesita tu atención.
        </p>
      </div>

      {needsReview > 0 ? (
        <Attention action="Ver pedidos" href="/dashboard/sales">
          {needsReview} pedido{needsReview === 1 ? "" : "s"} cobrado
          {needsReview === 1 ? "" : "s"} se atascó antes de producirse
        </Attention>
      ) : null}

      {brokenPublished.length > 0 ? (
        <Attention
          action="Revisar"
          href={`/dashboard/products/${brokenPublished[0].id}`}
        >
          {brokenPublished.length === 1
            ? `"${brokenPublished[0].name}" está publicado pero ya no se puede producir`
            : `${brokenPublished.length} productos publicados no se pueden producir`}
        </Attention>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sales ? (
          <>
            <Stat
              href="/dashboard/sales"
              icon={<Receipt aria-hidden className="h-4 w-4" />}
              label="Ventas"
              value={String(sales.salesCount)}
            />
            <Stat
              hint={`Neto estimado ${formatMoney(sales.estimatedNetRevenueCents, sales.currency)}`}
              href="/dashboard/sales"
              icon={<TrendingUp aria-hidden className="h-4 w-4" />}
              label="Ingreso bruto"
              value={formatMoney(sales.grossRevenueCents, sales.currency)}
            />
          </>
        ) : (
          // Un ARTIST no ve ventas: se dice, en vez de dejar huecos raros.
          <Card className="p-5 sm:col-span-2">
            <p className="text-sm font-medium text-neutral-500">Ventas</p>
            <p className="mt-2 text-sm text-neutral-600">
              Solo visible para cuentas con rol ADMIN.
            </p>
          </Card>
        )}

        <Stat
          hint={draftCount > 0 ? `${draftCount} en borrador` : "sin borradores"}
          href="/dashboard/products"
          icon={<ShoppingBag aria-hidden className="h-4 w-4" />}
          label="Productos publicados"
          value={String(publishedCount)}
        />

        <Stat
          hint={pendingNotes > 0 ? `${pendingNotes} sin revisar` : "todo al día"}
          href="/dashboard/notes"
          icon={<StickyNote aria-hidden className="h-4 w-4" />}
          label="Notitas del muro"
          value={String(notes?.total ?? 0)}
        />
      </div>

      {publishedCount === 0 ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Package aria-hidden className="h-4 w-4" />
                Todavía no hay nada a la venta
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                Un producto se publica cuando tiene precio, datos de impresión
                en cada talla y al menos una imagen.
              </p>
            </div>
            <Link className={buttonVariants()} href="/dashboard/products">
              Ir a productos
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      ) : null}

      {sales ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-950">
              Últimas ventas
            </h3>
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-950"
              href="/dashboard/sales"
            >
              Ver todas
              <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <p className="border-t border-neutral-100 px-4 py-8 text-center text-sm text-neutral-500">
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
              {recentSales.map((sale) => (
                <li key={sale.id}>
                  <Link
                    className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
                    href={`/dashboard/sales/${sale.id}`}
                  >
                    <span className="font-medium text-neutral-950">
                      #{sale.orderNumber}
                    </span>
                    <Badge tone={getStatusTone(sale.status)}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                      {sale.customerName ?? (sale.customerEmail || "sin nombre")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                      <Clock aria-hidden className="h-3 w-3" />
                      {formatDate(sale.createdAt)}
                    </span>
                    <span className="font-medium text-neutral-950">
                      {formatMoney(sale.totalCents, sale.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </section>
  );
}

"use client";

import { AlertTriangle, Receipt, TrendingUp, Undo2 } from "@/shared/components/icons";
import { formatMoney } from "@/features/products/utils/format-money";
import {
  getStatusLabel,
  getStatusTone,
} from "@/features/sales/utils/order-status";
import { Badge } from "@/shared/components/Badge";
import { AnimatedNumber } from "@/shared/components/AnimatedNumber";
import { Card } from "@/shared/components/Card";
import type {
  OrderStatus,
  SalesStats,
} from "@/features/sales/types/sale.types";

export function StatsPanel({ stats }: { stats: SalesStats }) {
  const feePercent = (stats.assumptions.stripePercentageFee * 100).toFixed(1);
  const needsReview = stats.countByStatus.NEEDS_REVIEW;

  return (
    <div className="grid gap-4">
      {needsReview > 0 ? (
        <Card className="border-rose-200 bg-rose-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-800">
            <AlertTriangle aria-hidden className="h-4 w-4" />
            {needsReview} pedido{needsReview === 1 ? "" : "s"} pagado
            {needsReview === 1 ? "" : "s"} necesita
            {needsReview === 1 ? "" : "n"} revision
          </p>
          <p className="mt-1 text-sm text-rose-700">
            Estan cobrados pero se atascaron antes de producirse. Filtra por
            &quot;Necesita revision&quot; para verlos.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">Ventas</p>
              <AnimatedNumber
                className="mt-3 block text-3xl font-semibold tracking-tight text-neutral-950"
                value={String(stats.salesCount)}
              />
            </div>
            <span className="rounded-md bg-neutral-100 p-2">
              <Receipt aria-hidden className="h-4 w-4 text-neutral-600" />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Ingreso bruto
              </p>
              <AnimatedNumber
                className="mt-3 block text-2xl font-semibold tracking-tight text-neutral-950"
                value={formatMoney(stats.grossRevenueCents, stats.currency)}
              />
            </div>
            <span className="rounded-md bg-neutral-100 p-2">
              <TrendingUp aria-hidden className="h-4 w-4 text-neutral-600" />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-neutral-500">Neto estimado</p>
          <AnimatedNumber
            className="mt-3 block text-2xl font-semibold tracking-tight text-neutral-950"
            value={formatMoney(stats.estimatedNetRevenueCents, stats.currency)}
          />
          {/* La cifra real llega en la liquidacion de Stripe: aqui se dice que
              es una estimacion en vez de presentarlo como contabilidad. */}
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Estimado: bruto menos {feePercent}% +{" "}
            {formatMoney(stats.assumptions.stripeFixedFeeCents, stats.currency)}{" "}
            por pedido.
            {stats.assumptions.excludesProductionCost
              ? " No incluye el coste de produccion."
              : null}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Reembolsado
              </p>
              <AnimatedNumber
                className="mt-3 block text-2xl font-semibold tracking-tight text-neutral-950"
                value={formatMoney(stats.refundedCents, stats.currency)}
              />
              <p className="mt-1 text-xs text-neutral-500">
                {stats.refundedCount} pedido
                {stats.refundedCount === 1 ? "" : "s"}
              </p>
            </div>
            <span className="rounded-md bg-neutral-100 p-2">
              <Undo2 aria-hidden className="h-4 w-4 text-neutral-600" />
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium text-neutral-500">Por estado</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(stats.countByStatus).map(([status, count]) => (
            <Badge
              // Los que estan a cero se atenuan, pero se muestran igual: un
              // panel que los esconde hace creer que ese estado no existe.
              className={count === 0 ? "opacity-45" : undefined}
              key={status}
              tone={getStatusTone(status as OrderStatus)}
            >
              {getStatusLabel(status as OrderStatus)}
              <span className="ml-1 font-bold">{count}</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

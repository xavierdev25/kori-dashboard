"use client";

import Link from "next/link";
import { formatMoney } from "@/features/products/utils/format-money";
import { formatDate } from "@/features/notes/utils/format-date";
import {
  getStatusLabel,
  getStatusTone,
} from "@/features/sales/utils/order-status";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import type { SaleSummary } from "@/features/sales/types/sale.types";

export function SalesTable({ sales }: { sales: SaleSummary[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Pedido</th>
              <th className="px-4 py-3 font-semibold">Comprador</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Origen</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sales.map((sale) => (
              <tr className="hover:bg-neutral-50" key={sale.id}>
                <td className="px-4 py-3">
                  <Link
                    className="block"
                    href={`/dashboard/sales/${sale.id}`}
                  >
                    <span className="block font-medium text-neutral-950">
                      #{sale.orderNumber}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {formatDate(sale.createdAt)}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="block text-neutral-800">
                    {sale.customerName ?? "Sin nombre"}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {sale.customerEmail || "sin correo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={getStatusTone(sale.status)}>
                    {getStatusLabel(sale.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={sale.source === "STRIPE" ? "blue" : "neutral"}>
                    {sale.source}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-neutral-950">
                    {formatMoney(sale.totalCents, sale.currency)}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {sale._count.items} articulo
                    {sale._count.items === 1 ? "" : "s"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { formatDate } from "@/features/notes/utils/format-date";
import { formatMoney } from "@/features/products/utils/format-money";
import { useSale } from "@/features/sales/hooks/useSales";
import {
  getStatusLabel,
  getStatusTone,
} from "@/features/sales/utils/order-status";
import { Badge } from "@/shared/components/Badge";
import { buttonVariants } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { Spinner } from "@/shared/components/Spinner";
import type { SaleDetail } from "@/features/sales/types/sale.types";

function getParamId(id: string | string[] | undefined) {
  return Array.isArray(id) ? id[0] : id || null;
}

function Address({ sale }: { sale: SaleDetail }) {
  const lines = [
    sale.shipName,
    sale.shipLine1,
    sale.shipLine2,
    [sale.shipCity, sale.shipState].filter(Boolean).join(", "),
    sale.shipPostalCode ? `CP ${sale.shipPostalCode}` : null,
    sale.shipCountry,
  ].filter(Boolean);

  if (lines.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Sin direccion: el pago todavia no se ha confirmado.
      </p>
    );
  }

  return (
    <address className="not-italic text-sm leading-6 text-neutral-700">
      {lines.map((line) => (
        <span className="block" key={line}>
          {line}
        </span>
      ))}
    </address>
  );
}

export default function SaleDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = getParamId(params.id);
  const { error, loading, sale } = useSale(id);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Cargando venta" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <EmptyState
        action={
          <Link className={buttonVariants()} href="/dashboard/sales">
            Volver a ventas
          </Link>
        }
        description={error ?? undefined}
        title="No se pudo cargar la venta"
      />
    );
  }

  return (
    <section className="grid gap-6">
      <div>
        <Link
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          href="/dashboard/sales"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          <span>Ventas</span>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Pedido #{sale.orderNumber}
          </h2>
          <Badge tone={getStatusTone(sale.status)}>
            {getStatusLabel(sale.status)}
          </Badge>
          <Badge tone={sale.source === "STRIPE" ? "blue" : "neutral"}>
            {sale.source}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {formatDate(sale.createdAt)}
        </p>
      </div>

      {sale.reviewReason || sale.fulfillmentError ? (
        <Card className="border-rose-200 bg-rose-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-800">
            <AlertTriangle aria-hidden className="h-4 w-4" />
            Este pedido necesita intervencion
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-rose-700">
            {sale.reviewReason ?? sale.fulfillmentError}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-950">
                Articulos
              </h3>
              {/* Copias congeladas al momento de la venta: si el precio del
                  producto cambia manana, esto no cambia. */}
              <p className="mt-1 text-xs text-neutral-500">
                Datos guardados al momento de la compra.
              </p>
            </div>

            <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
              {sale.items.map((item) => (
                <li className="px-4 py-3" key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-neutral-950">
                      {item.quantity} x {item.productName}
                    </span>
                    <span className="text-neutral-800">
                      {formatMoney(item.lineTotalCents, sale.currency)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {item.variantLabel} · {item.sku} ·{" "}
                    {formatMoney(item.unitPriceCents, sale.currency)} c/u
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Prenda: {item.providerProductUid ?? "(sin capturar)"}
                  </p>
                </li>
              ))}
            </ul>

            <div className="grid gap-1 border-t border-neutral-100 px-4 py-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatMoney(sale.subtotalCents, sale.currency)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Envio</span>
                <span>
                  {sale.shippingCents > 0
                    ? formatMoney(sale.shippingCents, sale.currency)
                    : "incluido"}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-950">
                <span>Total</span>
                <span>{formatMoney(sale.totalCents, sale.currency)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-neutral-950">
              Produccion y envio
            </h3>

            {sale.fulfillmentOrders.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">
                Todavia no se ha registrado ninguna orden con el proveedor.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {sale.fulfillmentOrders.map((fulfillment) => (
                  <li
                    className="rounded-md border border-neutral-200 p-3 text-sm"
                    key={fulfillment.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{fulfillment.provider}</Badge>
                      <span className="text-neutral-700">
                        {fulfillment.fulfillmentStatus}
                      </span>
                      {fulfillment.fulfillmentCountry ? (
                        <span className="text-xs text-neutral-500">
                          producido en {fulfillment.fulfillmentCountry}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      id {fulfillment.providerOrderId}
                    </p>
                    {fulfillment.trackingCode ? (
                      <p className="mt-2 text-neutral-700">
                        Guia: {fulfillment.trackingCode}
                        {fulfillment.shipmentMethodName
                          ? ` · ${fulfillment.shipmentMethodName}`
                          : null}
                      </p>
                    ) : null}
                    {fulfillment.trackingUrl ? (
                      <a
                        className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-sky-800 hover:underline"
                        href={fulfillment.trackingUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        Ver rastreo
                        <ExternalLink aria-hidden className="h-3 w-3" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-neutral-950">
              Comprador
            </h3>
            <p className="mt-2 text-sm text-neutral-800">
              {sale.customerName ?? "Sin nombre"}
            </p>
            <p className="text-sm text-neutral-600">
              {sale.customerEmail || "sin correo"}
            </p>

            <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Enviar a
            </h4>
            <div className="mt-1">
              <Address sale={sale} />
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-neutral-950">
              Linea de tiempo
            </h3>

            {sale.events.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">Sin eventos.</p>
            ) : (
              <ol className="mt-3 grid gap-3">
                {sale.events.map((event) => (
                  <li className="flex gap-3 text-sm" key={event.id}>
                    <span
                      aria-hidden
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-400"
                    />
                    <span>
                      <span className="block font-medium text-neutral-900">
                        {getStatusLabel(event.status)}
                      </span>
                      {event.note ? (
                        <span className="block text-neutral-600">
                          {event.note}
                        </span>
                      ) : null}
                      <span className="block text-xs text-neutral-500">
                        {formatDate(event.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {sale.jobs.length > 0 ? (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-neutral-950">
                Trabajos automaticos
              </h3>
              <ul className="mt-3 grid gap-2 text-sm">
                {sale.jobs.map((job) => (
                  <li key={job.type}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-700">{job.type}</span>
                      <Badge
                        tone={
                          job.status === "DONE"
                            ? "green"
                            : job.status === "FAILED"
                              ? "pink"
                              : "neutral"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    {job.lastError ? (
                      <p className="mt-1 text-xs text-rose-700">
                        {job.attempts} intento{job.attempts === 1 ? "" : "s"} ·{" "}
                        {job.lastError}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}

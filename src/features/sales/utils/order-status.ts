import type { OrderStatus } from "@/features/sales/types/sale.types";

type Tone = "neutral" | "blue" | "green" | "pink";

/**
 * Etiquetas en el idioma del panel. El enum viaja en ingles desde el backend,
 * pero nadie deberia leer "NEEDS_REVIEW" en una tabla de ventas.
 */
const STATUS_LABELS: Record<OrderStatus, string> = {
  CANCELLED: "Cancelado",
  DELIVERED: "Entregado",
  IN_PRODUCTION: "En produccion",
  NEEDS_REVIEW: "Necesita revision",
  PAID: "Pagado",
  PENDING_PAYMENT: "Sin pagar",
  REFUNDED: "Reembolsado",
  SHIPPED: "Enviado",
};

const STATUS_TONES: Record<OrderStatus, Tone> = {
  CANCELLED: "neutral",
  DELIVERED: "green",
  IN_PRODUCTION: "blue",
  // Rosa y no gris: un pedido pagado que se atasco tiene que saltar a la vista.
  NEEDS_REVIEW: "pink",
  PAID: "green",
  PENDING_PAYMENT: "neutral",
  REFUNDED: "pink",
  SHIPPED: "blue",
};

export function getStatusLabel(status: OrderStatus) {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusTone(status: OrderStatus): Tone {
  return STATUS_TONES[status] ?? "neutral";
}

/** Orden en que se ofrecen los filtros: el ciclo real de una venta. */
export const STATUS_ORDER: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "NEEDS_REVIEW",
  "CANCELLED",
  "REFUNDED",
];

/** Estados que exigen que alguien haga algo. */
export function needsAttention(status: OrderStatus) {
  return status === "NEEDS_REVIEW";
}

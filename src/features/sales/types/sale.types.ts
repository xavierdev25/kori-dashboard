export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "NEEDS_REVIEW";

export type SaleSource = "STRIPE" | "PAYHIP";

export interface SaleSummary {
  _count: { items: number };
  createdAt: string;
  currency: string;
  customerEmail: string;
  customerName: string | null;
  id: string;
  orderNumber: number;
  paidAt: string | null;
  source: SaleSource;
  status: OrderStatus;
  totalCents: number;
}

/**
 * Copia congelada de lo vendido. El historial se lee SIEMPRE de aqui: si el
 * precio del producto cambia manana, esta venta no cambia.
 */
export interface SaleItem {
  fulfillmentType: string;
  id: string;
  lineTotalCents: number;
  printFileUrl: string | null;
  productName: string;
  providerProductUid: string | null;
  quantity: number;
  sku: string;
  unitPriceCents: number;
  variantLabel: string;
}

export interface SaleEvent {
  createdAt: string;
  id: string;
  note: string | null;
  status: OrderStatus;
}

export interface FulfillmentOrder {
  createdAt: string;
  fulfillmentCountry: string | null;
  fulfillmentStatus: string;
  id: string;
  provider: string;
  providerOrderId: string;
  shipmentMethodName: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
}

export interface SaleJob {
  attempts: number;
  completedAt: string | null;
  lastError: string | null;
  nextAttemptAt: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  type: string;
}

export interface SaleDetail extends Omit<SaleSummary, "_count"> {
  events: SaleEvent[];
  fulfillmentError: string | null;
  fulfillmentOrders: FulfillmentOrder[];
  items: SaleItem[];
  jobs: SaleJob[];
  reviewReason: string | null;
  shipCity: string | null;
  shipCountry: string | null;
  shipLine1: string | null;
  shipLine2: string | null;
  shipName: string | null;
  shipPostalCode: string | null;
  shipState: string | null;
  shippingCents: number;
  subtotalCents: number;
}

export interface PaginatedSales {
  data: SaleSummary[];
  meta: { limit: number; page: number; total: number; totalPages: number };
}

export interface SalesQuery {
  from?: string;
  limit?: number;
  page?: number;
  status?: OrderStatus;
  to?: string;
}

export interface SalesStats {
  assumptions: {
    excludesProductionCost: boolean;
    stripeFixedFeeCents: number;
    stripePercentageFee: number;
  };
  countByStatus: Record<OrderStatus, number>;
  currency: string;
  estimatedFeesCents: number;
  estimatedNetRevenueCents: number;
  grossRevenueCents: number;
  productsRevenueCents: number;
  refundedCents: number;
  refundedCount: number;
  salesCount: number;
  shippingRevenueCents: number;
}

/** Un dia de la grafica. Los dias sin ventas vienen a cero, no ausentes. */
export interface SalesDay {
  date: string;
  grossRevenueCents: number;
  salesCount: number;
}

export interface SalesTimeseries {
  currency: string;
  days: SalesDay[];
  /** Zona con la que el backend corta los dias. El panel la muestra. */
  timeZone: string;
}

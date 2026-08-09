/**
 * Datos de mentira para la captura de esqueletos.
 *
 * `npx boneyard-js build` abre la app con un navegador y fotografia la forma
 * real de cada componente para generar los huesos. Como el panel esta detras
 * de un login y no hay datos garantizados, se le da este contenido: lo unico
 * que importa es que las filas y las tarjetas midan lo que miden de verdad.
 *
 * No entra en el bundle de produccion: solo lo importa la ruta /bones, que
 * responde 404 fuera de desarrollo.
 */

import type { ProductSummary } from "@/features/products/types/product.types";
import type {
  SalesStats,
  SaleSummary,
} from "@/features/sales/types/sale.types";
import type { AdminNote, NotesStats } from "@/features/notes/types/note.types";

const FECHA = "2026-08-08T20:06:00.000Z";

export const productosDeMuestra: ProductSummary[] = Array.from(
  { length: 5 },
  (_, i) => ({
    _count: { variants: 5 },
    createdAt: FECHA,
    description: "Algodon organico, serigrafia a una tinta.",
    fulfillmentType: "POD",
    id: `producto-${i}`,
    images: [
      {
        altText: "Playera Kori",
        createdAt: FECHA,
        id: `imagen-${i}`,
        isPrimary: true,
        sortOrder: 0,
        url: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      },
    ],
    isActive: i % 2 === 0,
    name: "Playera Kori edicion limitada",
    slug: "playera-kori-edicion-limitada",
    type: "POD_APPAREL",
    variants: [
      {
        id: `variante-${i}`,
        isActive: true,
        label: "M / Negro",
        priceCents: 59900,
        printFileUrl: "https://kori.mx/print.png",
        providerProductUid: "CTP-GILDAN-M",
      },
    ],
  }),
);

export const ventasDeMuestra: SaleSummary[] = Array.from(
  { length: 5 },
  (_, i) => ({
    _count: { items: 1 },
    createdAt: FECHA,
    currency: "MXN",
    customerEmail: "comprador@ejemplo.mx",
    customerName: "Nombre Apellido",
    id: `venta-${i}`,
    orderNumber: 100 + i,
    paidAt: FECHA,
    source: "STRIPE",
    status: "DELIVERED",
    totalCents: 59900,
  }),
);

export const notasDeMuestra: AdminNote[] = Array.from(
  { length: 6 },
  (_, i) => ({
    color: "yellow",
    createdAt: FECHA,
    id: `nota-${i}`,
    imageUrl: null,
    message: "Gracias por la musica, me acompano todo el verano.",
    recipientName: "Nombre del fan",
    rotation: 0,
    status: i % 3 === 0 ? "PENDING" : "APPROVED",
    storagePath: null,
    type: "TEXT",
    zIndex: 1,
  }),
);

export const metricasDeVentasDeMuestra: SalesStats = {
  assumptions: {
    excludesProductionCost: true,
    stripeFixedFeeCents: 300,
    stripePercentageFee: 0.036,
  },
  countByStatus: {
    CANCELLED: 0,
    DELIVERED: 1,
    IN_PRODUCTION: 0,
    NEEDS_REVIEW: 1,
    PAID: 1,
    PENDING_PAYMENT: 1,
    REFUNDED: 0,
    SHIPPED: 1,
  },
  currency: "MXN",
  estimatedFeesCents: 11982,
  estimatedNetRevenueCents: 287518,
  grossRevenueCents: 299500,
  productsRevenueCents: 299500,
  refundedCents: 0,
  refundedCount: 0,
  salesCount: 4,
  shippingRevenueCents: 0,
};

export const metricasDeNotasDeMuestra: NotesStats = {
  total: 17,
  totalDrawing: 0,
  totalPending: 5,
  totalText: 17,
};

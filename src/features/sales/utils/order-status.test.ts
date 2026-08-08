import { describe, expect, it } from "vitest";
import {
  getStatusLabel,
  getStatusTone,
  needsAttention,
  STATUS_ORDER,
} from "@/features/sales/utils/order-status";
import type { OrderStatus } from "@/features/sales/types/sale.types";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "NEEDS_REVIEW",
];

describe("etiquetas de estado", () => {
  it("traduce todos los estados: nadie deberia leer un enum en la tabla", () => {
    for (const status of ALL_STATUSES) {
      const label = getStatusLabel(status);

      expect(label).not.toBe(status);
      expect(label).not.toMatch(/_/);
    }
  });

  it("un estado desconocido no rompe la vista", () => {
    // Si el backend anade un estado nuevo, la tabla lo muestra crudo en vez
    // de renderizar "undefined".
    expect(getStatusLabel("ALGO_NUEVO" as OrderStatus)).toBe("ALGO_NUEVO");
    expect(getStatusTone("ALGO_NUEVO" as OrderStatus)).toBe("neutral");
  });

  it("NEEDS_REVIEW destaca en vez de pasar desapercibido", () => {
    // Es un pedido cobrado que se atasco: no puede verse igual que uno normal.
    expect(getStatusTone("NEEDS_REVIEW")).toBe("pink");
    expect(needsAttention("NEEDS_REVIEW")).toBe(true);
    expect(needsAttention("DELIVERED")).toBe(false);
  });

  it("los estados con dinero cobrado se ven en verde o azul", () => {
    for (const status of ["PAID", "DELIVERED"] as OrderStatus[]) {
      expect(getStatusTone(status)).toBe("green");
    }

    for (const status of ["IN_PRODUCTION", "SHIPPED"] as OrderStatus[]) {
      expect(getStatusTone(status)).toBe("blue");
    }
  });
});

describe("STATUS_ORDER", () => {
  it("ofrece todos los estados como filtro, sin faltar ninguno", () => {
    expect([...STATUS_ORDER].sort()).toEqual([...ALL_STATUSES].sort());
  });

  it("sigue el ciclo real de una venta", () => {
    const index = (status: OrderStatus) => STATUS_ORDER.indexOf(status);

    expect(index("PENDING_PAYMENT")).toBeLessThan(index("PAID"));
    expect(index("PAID")).toBeLessThan(index("IN_PRODUCTION"));
    expect(index("IN_PRODUCTION")).toBeLessThan(index("SHIPPED"));
    expect(index("SHIPPED")).toBeLessThan(index("DELIVERED"));
  });
});

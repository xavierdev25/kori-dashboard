import { describe, expect, it } from "vitest";
import {
  getPriceRange,
  getReadiness,
} from "@/features/products/utils/readiness";

const variant = (overrides: Record<string, unknown> = {}) => ({
  isActive: true,
  label: "M / Negro",
  priceCents: 59_900,
  printFileUrl: "https://kori.mx/print.png",
  providerProductUid: "CTP-M",
  ...overrides,
});

const product = (overrides: Record<string, unknown> = {}) => ({
  fulfillmentType: "POD" as const,
  images: [{ id: "i1" }],
  variants: [variant()],
  ...overrides,
});

describe("getReadiness", () => {
  it("un producto completo se puede publicar", () => {
    expect(getReadiness(product())).toEqual({ blockers: [], canPublish: true });
  });

  it("sin variantes activas no", () => {
    const result = getReadiness(
      product({ variants: [variant({ isActive: false })] }),
    );

    expect(result.canPublish).toBe(false);
    expect(result.blockers).toContain("No tiene variantes activas");
  });

  it("sin imagenes no", () => {
    expect(getReadiness(product({ images: [] })).blockers).toContain(
      "No tiene ninguna imagen",
    );
  });

  it("nombra las variantes a las que les falta el dato de impresion", () => {
    const result = getReadiness(
      product({
        variants: [
          variant(),
          variant({ label: "L / Negro", providerProductUid: null }),
          variant({ label: "XL / Negro", printFileUrl: null }),
        ],
      }),
    );

    expect(result.canPublish).toBe(false);
    expect(result.blockers.join(" ")).toContain("L / Negro");
    expect(result.blockers.join(" ")).toContain("XL / Negro");
    expect(result.blockers.join(" ")).not.toContain("M / Negro");
  });

  it("una variante inactiva incompleta no bloquea", () => {
    // Solo se produce lo que esta a la venta.
    const result = getReadiness(
      product({
        variants: [
          variant(),
          variant({ isActive: false, label: "S", providerProductUid: null }),
        ],
      }),
    );

    expect(result.canPublish).toBe(true);
  });

  it("un producto que no es POD no exige datos de impresion", () => {
    const result = getReadiness(
      product({
        fulfillmentType: "INVENTORY",
        variants: [variant({ printFileUrl: null, providerProductUid: null })],
      }),
    );

    expect(result.canPublish).toBe(true);
  });

  it("acumula varios motivos a la vez", () => {
    expect(
      getReadiness(product({ images: [], variants: [] })).blockers,
    ).toHaveLength(2);
  });
});

describe("getPriceRange", () => {
  it("devuelve el minimo y el maximo de las activas", () => {
    expect(
      getPriceRange([
        { isActive: true, priceCents: 59_900 },
        { isActive: true, priceCents: 79_900 },
      ]),
    ).toEqual({ max: 79_900, min: 59_900 });
  });

  it("ignora las inactivas", () => {
    expect(
      getPriceRange([
        { isActive: true, priceCents: 59_900 },
        { isActive: false, priceCents: 10 },
      ]),
    ).toEqual({ max: 59_900, min: 59_900 });
  });

  it("sin variantes activas devuelve null, no un rango de cero", () => {
    expect(getPriceRange([{ isActive: false, priceCents: 100 }])).toBeNull();
    expect(getPriceRange([])).toBeNull();
  });
});

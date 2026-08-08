import { describe, expect, it } from "vitest";
import {
  centsToInput,
  formatMoney,
  parseMoneyToCents,
} from "@/features/products/utils/format-money";

describe("formatMoney", () => {
  it("formatea centavos como pesos mexicanos", () => {
    expect(formatMoney(59_900)).toBe("$599.00 MXN");
    expect(formatMoney(119_800)).toBe("$1,198.00 MXN");
  });

  it("cero no se muestra vacio", () => {
    expect(formatMoney(0)).toBe("$0.00 MXN");
  });
});

describe("parseMoneyToCents", () => {
  it("acepta enteros y decimales", () => {
    expect(parseMoneyToCents("599")).toBe(59_900);
    expect(parseMoneyToCents("599.50")).toBe(59_950);
    expect(parseMoneyToCents("599.5")).toBe(59_950);
  });

  it("tolera separadores y espacios que la gente escribe", () => {
    expect(parseMoneyToCents("1,199")).toBe(119_900);
    expect(parseMoneyToCents(" $599 ")).toBe(59_900);
  });

  it("no pierde centavos por coma flotante", () => {
    // 599.99 * 100 da 59998.999... en JS; sin redondear se cobraria de menos.
    expect(parseMoneyToCents("599.99")).toBe(59_999);
    expect(parseMoneyToCents("0.07")).toBe(7);
  });

  it("rechaza lo que no es un importe", () => {
    for (const value of ["", "gratis", "-10", "1.234", "5,5,5", "1e3"]) {
      expect(parseMoneyToCents(value)).toBeNull();
    }
  });

  it("rechaza el cero: un precio de venta de 0 siempre es un error", () => {
    expect(parseMoneyToCents("0")).toBeNull();
    expect(parseMoneyToCents("0.00")).toBeNull();
  });
});

describe("centsToInput", () => {
  it("da un valor editable con dos decimales", () => {
    expect(centsToInput(59_900)).toBe("599.00");
    expect(centsToInput(7)).toBe("0.07");
  });

  it("ida y vuelta no pierde nada", () => {
    for (const cents of [1, 7, 59_900, 119_800, 999_999]) {
      expect(parseMoneyToCents(centsToInput(cents))).toBe(cents);
    }
  });
});

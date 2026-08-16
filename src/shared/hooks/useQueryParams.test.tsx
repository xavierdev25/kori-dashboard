import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryParams } from "@/shared/hooks/useQueryParams";

const replace = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/sales",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

const DEFAULTS = { from: "", page: "1", status: "", to: "" };

beforeEach(() => {
  replace.mockReset();
  currentSearch = "";
});

afterEach(cleanup);

describe("useQueryParams", () => {
  it("lee los filtros de la URL al entrar", () => {
    // Lo que arregla: antes el estado vivia solo en memoria, asi que recargar
    // o abrir un enlace compartido te devolvia a la primera pagina sin
    // filtros, mirando algo distinto de lo que te habian mandado.
    currentSearch = "status=PAID&page=3";

    const { result } = renderHook(() => useQueryParams(DEFAULTS));

    expect(result.current[0]).toEqual({
      from: "",
      page: "3",
      status: "PAID",
      to: "",
    });
  });

  it("no ensucia la URL con lo que ya es el valor por defecto", () => {
    const { result } = renderHook(() => useQueryParams(DEFAULTS));

    result.current[1]({ page: "1", status: "PAID" });

    // page=1 es el defecto, asi que sale de la direccion.
    expect(replace).toHaveBeenCalledWith("/dashboard/sales?status=PAID", {
      scroll: false,
    });
  });

  it("borra el parametro al vaciar un filtro", () => {
    currentSearch = "status=PAID&from=2026-01-01";

    const { result } = renderHook(() => useQueryParams(DEFAULTS));

    result.current[1]({ status: "" });

    expect(replace).toHaveBeenCalledWith("/dashboard/sales?from=2026-01-01", {
      scroll: false,
    });
  });

  it("vuelve a la ruta limpia cuando no queda ningun filtro", () => {
    currentSearch = "status=PAID";

    const { result } = renderHook(() => useQueryParams(DEFAULTS));

    result.current[1]({ status: "" });

    expect(replace).toHaveBeenCalledWith("/dashboard/sales", { scroll: false });
  });

  it("usa replace y no push", () => {
    // Con push, cada tecla del buscador dejaria una entrada en el historial y
    // el boton de atras obligaria a recorrer letra por letra lo escrito.
    const { result } = renderHook(() => useQueryParams(DEFAULTS));

    result.current[1]({ status: "PAID" });

    expect(replace).toHaveBeenCalledTimes(1);
  });
});

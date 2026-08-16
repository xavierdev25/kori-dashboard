import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { useCallback } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

afterEach(cleanup);

/** Una promesa que se resuelve cuando lo diga el test, no antes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, reject, resolve };
}

describe("useAsyncData", () => {
  it("descarta la respuesta vieja que llega despues de la nueva", async () => {
    // El fallo que esto cierra: escribes "ho" y luego "hola". Salen dos
    // peticiones. La de "ho" tarda mas —cosa normal, no hace falta que nada
    // falle— y vuelve la ultima. Sin cancelar, su respuesta pisa a la de
    // "hola" y la tabla acaba enseñando resultados que no corresponden a lo
    // que hay escrito en la caja, sin ningun error a la vista.
    const lenta = deferred<string>();
    const rapida = deferred<string>();
    const respuestas: Record<string, Promise<string>> = {
      ho: lenta.promise,
      hola: rapida.promise,
    };
    const pedidos: string[] = [];

    const { rerender, result } = renderHook(
      ({ term }: { term: string }) => {
        // Estable por termino: es la disciplina que exige el hook, y la que
        // decide cuando toca volver a pedir.
        const load = useCallback(() => {
          pedidos.push(term);
          return respuestas[term];
        }, [term]);

        return useAsyncData(load, {
          fallbackMessage: "fallo",
          initialData: "",
        });
      },
      { initialProps: { term: "ho" } },
    );

    await waitFor(() => expect(pedidos).toEqual(["ho"]));

    rerender({ term: "hola" });
    await waitFor(() => expect(pedidos).toEqual(["ho", "hola"]));

    // La nueva contesta primero.
    await act(async () => {
      rapida.resolve("resultados de hola");
    });
    expect(result.current.data).toBe("resultados de hola");

    // Y ahora llega la vieja, tarde. No debe pisar nada.
    await act(async () => {
      lenta.resolve("resultados de ho");
    });

    expect(result.current.data).toBe("resultados de hola");
  });

  it("no pinta error cuando la peticion se cancela al desmontar", async () => {
    // Cambiar de seccion cancela lo que quedaba en vuelo. Eso no es un fallo
    // y no debe dejar un mensaje rojo esperando a la vuelta.
    const abortado = deferred<string>();
    const load = vi.fn((signal: AbortSignal) => {
      signal.addEventListener("abort", () =>
        abortado.reject(new DOMException("cancelada", "AbortError")),
      );
      return abortado.promise;
    });

    const { result, unmount } = renderHook(() =>
      useAsyncData(load, { fallbackMessage: "fallo", initialData: "" }),
    );

    await waitFor(() => expect(load).toHaveBeenCalled());

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBeNull();
  });

  it("si falla de verdad, lo dice", async () => {
    const load = vi.fn(() => Promise.reject(new Error("500 del servidor")));

    const { result } = renderHook(() =>
      useAsyncData(load, { fallbackMessage: "fallo", initialData: "" }),
    );

    await waitFor(() => expect(result.current.error).toBe("500 del servidor"));
    expect(result.current.loading).toBe(false);
  });

  it("no pide nada mientras no haya a quien pedir", async () => {
    const load = vi.fn(() => Promise.resolve("x"));

    const { result } = renderHook(() =>
      useAsyncData(load, {
        enabled: false,
        fallbackMessage: "fallo",
        initialData: "",
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(load).not.toHaveBeenCalled();
  });
});

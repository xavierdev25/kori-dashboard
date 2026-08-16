import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, isAbortError } from "@/shared/lib/api-client";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

/**
 * Un `fetch` que no responde nunca y solo se rinde si lo abortan, que es como
 * se comporta el de verdad: rechaza con el motivo exacto que se le paso a
 * `abort()`.
 */
function neverResponds() {
  return (_url: string, init: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
    });
}

describe("apiRequest error messages", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces the message from the backend error envelope", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "albumUrl debe ser una URL válida",
            requestId: "req-1",
          },
        },
        400,
      ),
    );

    await expect(apiRequest("/admin/settings")).rejects.toThrow(
      "albumUrl debe ser una URL válida",
    );
  });

  it("surfaces a flat { message } payload", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Nota no encontrada" }, 404));

    await expect(apiRequest("/admin/notes/x")).rejects.toThrow(
      "Nota no encontrada",
    );
  });

  it("joins array messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { message: ["campo A", "campo B"] } }, 400),
    );

    await expect(apiRequest("/notes/text")).rejects.toThrow(
      "campo A. campo B",
    );
  });

  it("falls back to a generic message when there is nothing usable", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ unexpected: true }, 500));

    await expect(apiRequest("/admin/notes")).rejects.toThrow(
      "No se pudo completar la solicitud.",
    );
  });

  it("keeps the status on the thrown ApiError", async () => {
    // Response nuevo por llamada: su body solo se puede leer una vez
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          { error: { message: "Ese correo ya está en la lista" } },
          409,
        ),
      ),
    );

    await expect(
      apiRequest("/subscribers"),
    ).rejects.toBeInstanceOf(ApiError);

    await expect(
      apiRequest("/subscribers"),
    ).rejects.toMatchObject({
      message: "Ese correo ya está en la lista",
      status: 409,
    });
  });
});

describe("sesion en cookies", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia las cookies en cada peticion", async () => {
    // Sin credentials:'include' el navegador no manda la cookie de sesion:
    // el backend y el panel estan en dominios distintos.
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 200));

    await apiRequest("/admin/products");

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
    });
  });

  it("ante un 401 refresca una vez y reintenta", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: {} }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200)) // /auth/refresh
      .mockResolvedValueOnce(jsonResponse({ data: [] }, 200));

    await expect(apiRequest("/admin/products")).resolves.toEqual({ data: [] });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/refresh");
  });

  it("si el refresco falla, no reintenta en bucle", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: {} }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: {} }, 401)); // refresh falla

    await expect(apiRequest("/admin/products")).rejects.toMatchObject({
      status: 401,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("el login no intenta refrescar ante credenciales malas", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { message: "Credenciales invalidas" } }, 401),
    );

    await expect(
      apiRequest("/auth/login", { method: "POST", skipRefresh: true }),
    ).rejects.toThrow("Sesion expirada. Vuelve a iniciar sesion.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("varios 401 a la vez comparten un unico refresco", async () => {
    // El backend rota el refresh token en cada uso y trata la reutilizacion
    // como robo: tres refrescos en paralelo cerrarian todas las sesiones.
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        String(url).includes("/auth/refresh")
          ? jsonResponse({ ok: true }, 200)
          : jsonResponse({ data: [] }, 401),
      ),
    );

    await Promise.allSettled([
      apiRequest("/a"),
      apiRequest("/b"),
      apiRequest("/c"),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
  });
});

describe("peticiones que no vuelven", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("se rinde con un mensaje legible cuando el servidor no responde", async () => {
    // Sin esto la promesa nunca se resuelve: no hay error que capturar, el
    // spinner no se apaga y el panel se queda girando sin explicacion.
    fetchMock.mockImplementation(neverResponds());

    const pending = apiRequest("/admin/products");
    const assertion = expect(pending).rejects.toMatchObject({
      message: expect.stringContaining("tardo demasiado"),
      status: 408,
    });

    await vi.advanceTimersByTimeAsync(20_000);
    await assertion;
  });

  it("el tiempo agotado llega como ApiError, no como cancelacion", async () => {
    // `fetch` rechaza con el motivo exacto de `abort()`, asi que distinguir
    // por el nombre del error confundiria el tiempo agotado con una
    // cancelacion nuestra: el fallo se tragaria en silencio y la pantalla se
    // quedaria con los datos viejos como si nada hubiera pasado.
    fetchMock.mockImplementation(neverResponds());

    const pending = apiRequest("/admin/products").catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(20_000);
    const error = await pending;

    expect(error).toBeInstanceOf(ApiError);
    expect(isAbortError(error)).toBe(false);
  });

  it("no le pone limite a las subidas", async () => {
    // Un drumkit de cientos de MB por una subida lenta pasa de 20s sin que
    // nada vaya mal. Cortarlo perderia el trabajo a medio camino.
    fetchMock.mockImplementation(neverResponds());

    const body = new FormData();
    body.append("file", new Blob(["x"]), "kit.zip");

    let settled = false;
    void apiRequest("/admin/products/1/asset", { body, method: "POST" }).then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );

    await vi.advanceTimersByTimeAsync(120_000);

    expect(settled).toBe(false);
  });

  it("propaga la cancelacion de quien llama para poder ignorarla", async () => {
    // Cambiar de pagina cancela lo que quedaba en vuelo. Eso no es un fallo y
    // no debe pintar un error: quien la cancelo la reconoce y la descarta.
    fetchMock.mockImplementation(neverResponds());

    const controller = new AbortController();
    const pending = apiRequest("/admin/products", {
      signal: controller.signal,
    }).catch((error: unknown) => error);

    controller.abort();

    const error = await pending;

    expect(isAbortError(error)).toBe(true);
    expect(error).not.toBeInstanceOf(ApiError);
  });

  it("traduce el fallo de red a algo que se pueda leer", async () => {
    // `fetch` lanza un TypeError seco ("Failed to fetch") sin conexion, con
    // el DNS caido o si CORS rechaza: enseñar eso no le dice nada a nadie.
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest("/admin/products")).rejects.toMatchObject({
      message: expect.stringContaining("No se pudo conectar"),
      status: 0,
    });
  });
});

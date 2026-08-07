import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "@/shared/lib/api-client";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
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

    await expect(apiRequest("/admin/settings", { auth: false })).rejects.toThrow(
      "albumUrl debe ser una URL válida",
    );
  });

  it("surfaces a flat { message } payload", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Nota no encontrada" }, 404));

    await expect(apiRequest("/admin/notes/x", { auth: false })).rejects.toThrow(
      "Nota no encontrada",
    );
  });

  it("joins array messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { message: ["campo A", "campo B"] } }, 400),
    );

    await expect(apiRequest("/notes/text", { auth: false })).rejects.toThrow(
      "campo A. campo B",
    );
  });

  it("falls back to a generic message when there is nothing usable", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ unexpected: true }, 500));

    await expect(apiRequest("/admin/notes", { auth: false })).rejects.toThrow(
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
      apiRequest("/subscribers", { auth: false }),
    ).rejects.toBeInstanceOf(ApiError);

    await expect(
      apiRequest("/subscribers", { auth: false }),
    ).rejects.toMatchObject({
      message: "Ese correo ya está en la lista",
      status: 409,
    });
  });
});

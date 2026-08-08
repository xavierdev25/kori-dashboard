const DEFAULT_API_URL = "http://localhost:4000";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  /** Solo para /auth/refresh: evita reintentar el refresco del refresco. */
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return;
  }

  window.location.assign("/login");
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

async function readResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function toMessage(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value.filter((item) => typeof item === "string");

    return parts.length > 0 ? parts.join(". ") : null;
  }

  return null;
}

/**
 * El backend responde los errores con el envelope
 * `{ success: false, error: { code, message, requestId, ... } }`.
 * Se acepta tambien `{ message }` plano por si responde una capa intermedia
 * (proxy, Vercel) que no pasa por el filtro de excepciones de Nest.
 */
function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { error, message } = payload as { error?: unknown; message?: unknown };

  if (error && typeof error === "object") {
    const nested = toMessage((error as { message?: unknown }).message);

    if (nested) {
      return nested;
    }
  }

  return toMessage(error) ?? toMessage(message);
}

/**
 * Un unico refresco en vuelo: si tres peticiones reciben 401 a la vez, todas
 * esperan al mismo intento en lugar de disparar tres refrescos. Eso importa
 * porque el backend rota el refresh token en cada uso y detecta la reutilizacion
 * de uno ya revocado como robo, cerrando todas las sesiones.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession() {
  refreshInFlight ??= fetch(`${getApiBaseUrl()}/auth/refresh`, {
    cache: "no-store",
    credentials: "include",
    method: "POST",
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function sendRequest(
  path: string,
  { body, headers, ...init }: Omit<ApiRequestOptions, "skipRefresh">,
) {
  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined && body !== null;
  const bodyIsNative = isBodyInit(body);

  // FormData trae su propio Content-Type con el boundary: fijarlo a mano rompe
  // la subida de imagenes.
  if (hasBody && !bodyIsNative && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    // Sin esto el navegador ni envia ni acepta las cookies de sesion: el
    // backend y el panel estan en dominios distintos.
    credentials: "include",
    headers: requestHeaders,
    body: hasBody ? (bodyIsNative ? body : JSON.stringify(body)) : undefined,
  });
}

export async function apiRequest<T>(
  path: string,
  { skipRefresh, ...options }: ApiRequestOptions = {},
) {
  let response = await sendRequest(path, options);

  // El token de acceso dura 15 min. Ante un 401 se intenta refrescar una vez
  // y se repite la peticion, para que la sesion no se caiga cada cuarto de hora.
  if (response.status === 401 && !skipRefresh) {
    if (await refreshSession()) {
      response = await sendRequest(path, options);
    }
  }

  const payload = await readResponseBody(response);

  if (response.status === 401) {
    redirectToLogin();
    throw new ApiError("Sesion expirada. Vuelve a iniciar sesion.", 401);
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload) || "No se pudo completar la solicitud.",
      response.status,
    );
  }

  return payload as T;
}

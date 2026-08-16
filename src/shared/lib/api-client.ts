const DEFAULT_API_URL = "http://localhost:4000";

/**
 * Cuanto se espera antes de dar una peticion por perdida.
 *
 * Sin esto, `fetch` espera indefinidamente: si el servidor deja de responder a
 * media conexion —EC2 reiniciando, wifi que se cae al cambiar de red— la
 * promesa nunca se resuelve, el `finally` que apaga el spinner nunca corre y
 * el panel se queda girando para siempre. No hay error que mostrar porque no
 * hay error: simplemente no llega nada.
 *
 * 20s es holgado para esta API (la ruta mas lenta medida esta muy por debajo)
 * y corto comparado con la paciencia de quien mira una pantalla.
 */
const DEFAULT_TIMEOUT_MS = 20_000;

const TIMEOUT_MESSAGE =
  "El servidor tardo demasiado en responder. Revisa tu conexion y vuelve a intentarlo.";
const OFFLINE_MESSAGE =
  "No se pudo conectar con el servidor. Revisa tu conexion e intentalo de nuevo.";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  /** Solo para /auth/refresh: evita reintentar el refresco del refresco. */
  skipRefresh?: boolean;
  /**
   * Milisegundos antes de abandonar. `null` desactiva el limite, que es lo que
   * necesitan las subidas: un drumkit de 300 MB por una subida lenta pasa de
   * 20s sin que nada vaya mal. Las subidas ya lo desactivan solas al detectar
   * `FormData`.
   */
  timeoutMs?: number | null;
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
    // Tambien con limite: si el refresco se cuelga, se cuelgan con el todas
    // las peticiones que esperan a este mismo intento.
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Reenvia el aborto de quien llama a nuestro controlador interno.
 *
 * Se hace a mano en vez de con `AbortSignal.any` para no depender de su
 * soporte, y porque asi se puede soltar el listener al terminar: colgar uno
 * por peticion de una senal que vive lo que vive el componente los va
 * acumulando.
 */
function linkAbort(source: AbortSignal | null | undefined, target: AbortController) {
  if (!source) {
    return () => {};
  }

  if (source.aborted) {
    target.abort(source.reason);
    return () => {};
  }

  const forward = () => target.abort(source.reason);
  source.addEventListener("abort", forward, { once: true });

  return () => source.removeEventListener("abort", forward);
}

/** Motivo unico para el aborto por tiempo, comparable por identidad. */
const TIMEOUT_REASON = Symbol("kori:timeout");

/** Distingue "lo cancele yo" de un fallo de verdad. */
export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function sendRequest(
  path: string,
  { body, headers, timeoutMs, ...init }: Omit<ApiRequestOptions, "skipRefresh">,
) {
  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined && body !== null;
  const bodyIsNative = isBodyInit(body);
  const isUpload = body instanceof FormData;

  // FormData trae su propio Content-Type con el boundary: fijarlo a mano rompe
  // la subida de imagenes.
  if (hasBody && !bodyIsNative && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const limit =
    timeoutMs !== undefined ? timeoutMs : isUpload ? null : DEFAULT_TIMEOUT_MS;

  // Controlador propio en vez de `AbortSignal.timeout` para poder cancelar el
  // temporizador en cuanto responde: un temporizador de 20s por peticion que
  // sigue vivo mantiene despierto el bucle de eventos en los tests.
  const controller = new AbortController();
  const unlink = linkAbort(init.signal, controller);
  const timer =
    limit === null ? null : setTimeout(() => controller.abort(TIMEOUT_REASON), limit);

  try {
    return await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      // Sin esto el navegador ni envia ni acepta las cookies de sesion: el
      // backend y el panel estan en dominios distintos.
      credentials: "include",
      headers: requestHeaders,
      signal: controller.signal,
      body: hasBody ? (bodyIsNative ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    throw describeNetworkFailure(error, controller.signal);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
    unlink();
  }
}

/**
 * Traduce el fallo crudo de `fetch` a algo que se pueda enseñar.
 *
 * `fetch` lanza un `TypeError` seco —"Failed to fetch"— tanto si no hay red
 * como si el DNS falla, como si CORS rechaza la respuesta. Enseñar eso tal
 * cual no le dice nada a nadie.
 *
 * El aborto de quien llama se propaga como `AbortError` a proposito: no es un
 * fallo que enseñar, es una peticion que ya no interesa, y quien la cancelo la
 * ignora con `isAbortError`.
 */
function describeNetworkFailure(error: unknown, signal: AbortSignal) {
  if (signal.aborted) {
    // Identidad, no el nombre del error: `fetch` rechaza con el motivo exacto
    // que se le paso a `abort()`, asi que el aborto por tiempo NO llega como
    // `AbortError` y compararlo por nombre lo daria por cancelacion del que
    // llama — es decir, se tragaria el error en silencio y el panel se
    // quedaria con los datos viejos sin decir nada.
    if (signal.reason === TIMEOUT_REASON) {
      return new ApiError(TIMEOUT_MESSAGE, 408);
    }

    return isAbortError(signal.reason)
      ? signal.reason
      : new DOMException("Peticion cancelada", "AbortError");
  }

  if (error instanceof TypeError) {
    return new ApiError(OFFLINE_MESSAGE, 0);
  }

  return error;
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

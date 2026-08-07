import { clearAccessToken, getAccessToken } from "@/shared/lib/token-storage";

const DEFAULT_API_URL = "http://localhost:4000";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
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

export async function apiRequest<T>(
  path: string,
  { auth = true, body, headers, ...init }: ApiRequestOptions = {},
) {
  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined && body !== null;
  const bodyIsNative = isBodyInit(body);

  if (auth) {
    const token = getAccessToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  if (hasBody && !bodyIsNative && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    headers: requestHeaders,
    body: hasBody ? (bodyIsNative ? body : JSON.stringify(body)) : undefined,
  });

  const payload = await readResponseBody(response);

  if (response.status === 401) {
    clearAccessToken();
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

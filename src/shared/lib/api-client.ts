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

function getErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message: unknown }).message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      return message.filter((item) => typeof item === "string").join(". ");
    }
  }

  return null;
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

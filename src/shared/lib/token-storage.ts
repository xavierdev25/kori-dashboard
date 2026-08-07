const ACCESS_TOKEN_KEY = "kori_dashboard_access_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
}

export function clearAccessToken() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
}

/**
 * Lee el `exp` del JWT sin verificar la firma: el backend es quien valida de
 * verdad. Aqui solo sirve para no ensenar el panel con un token ya caducado
 * y ahorrarse el 401 con redireccion.
 */
export function getTokenExpiration(token: string): number | null {
  const payload = token.split(".")[1];

  if (!payload) {
    return null;
  }

  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: unknown };

    return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const expiresAt = getTokenExpiration(token);

  // Sin `exp` legible no se asume caducidad: que decida el backend.
  return expiresAt !== null && expiresAt <= Date.now();
}

/** Token presente y todavia vigente. Si caduco, se limpia de paso. */
export function hasAccessToken() {
  const token = getAccessToken();

  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    clearAccessToken();
    return false;
  }

  return true;
}

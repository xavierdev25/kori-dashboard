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

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

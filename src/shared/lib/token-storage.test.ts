import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  hasAccessToken,
  isTokenExpired,
  setAccessToken,
} from "@/shared/lib/token-storage";

/** JWT de mentira: solo el payload importa, la firma no se verifica aqui. */
function fakeJwt(payload: Record<string, unknown>) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${encode({ alg: "HS256" })}.${encode(payload)}.firma`;
}

describe("token-storage", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        removeItem: vi.fn((key: string) => storage.delete(key)),
        setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      },
    });
  });

  it("stores and reads the access token", () => {
    setAccessToken("token-value");

    expect(getAccessToken()).toBe("token-value");
    expect(hasAccessToken()).toBe(true);
  });

  it("clears the access token", () => {
    setAccessToken("token-value");
    clearAccessToken();

    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });

  it("treats an expired token as no session and clears it", () => {
    const expired = fakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    setAccessToken(expired);

    expect(isTokenExpired(expired)).toBe(true);
    expect(hasAccessToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it("keeps a token that has not expired yet", () => {
    const valid = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    setAccessToken(valid);

    expect(isTokenExpired(valid)).toBe(false);
    expect(hasAccessToken()).toBe(true);
  });

  it("does not assume expiry when exp is missing or unreadable", () => {
    expect(isTokenExpired(fakeJwt({ sub: "kori" }))).toBe(false);
    expect(isTokenExpired("no-es-un-jwt")).toBe(false);
  });
});

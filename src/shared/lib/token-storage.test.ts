import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  hasAccessToken,
  setAccessToken,
} from "@/shared/lib/token-storage";

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
});

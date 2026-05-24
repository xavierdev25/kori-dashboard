"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import type { LoginCredentials } from "@/features/auth/types/auth.types";
import {
  clearAccessToken,
  hasAccessToken,
  setAccessToken,
} from "@/shared/lib/token-storage";

type AuthStatus = "checking" | "authenticated" | "guest";

export function useAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus(hasAccessToken() ? "authenticated" : "guest");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      setAccessToken(response.accessToken);
      setStatus("authenticated");
      router.replace("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setStatus("guest");
    router.replace("/login");
  }, [router]);

  return {
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    login,
    logout,
    status,
  };
}

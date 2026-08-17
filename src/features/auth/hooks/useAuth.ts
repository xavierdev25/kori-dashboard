"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import type {
  AuthUser,
  LoginCredentials,
} from "@/features/auth/types/auth.types";

type AuthStatus = "checking" | "authenticated" | "guest";

export function useAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  // La cookie de sesion es httpOnly, asi que el panel no puede inspeccionarla:
  // la unica forma de saber si hay sesion es preguntarle al backend.
  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((current) => {
        if (!cancelled) {
          setUser(current);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setStatus("guest");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      setUser(response.user);
      setStatus("authenticated");
      router.replace("/dashboard");
    },
    [router],
  );

  /**
   * Vuelve a preguntar quien eres.
   *
   * Lo usa la barrera de contrasena al terminar: el backend ya bajo la
   * bandera, y releer la sesion es lo que hace que la barrera desaparezca sin
   * recargar la pagina ni sacar a nadie de donde estaba.
   */
  const refreshUser = useCallback(async () => {
    try {
      setUser(await authService.me());
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const logout = useCallback(async () => {
    // Aunque el backend falle, la sesion local se cierra igual: dejar al
    // usuario dentro tras pulsar "Salir" seria peor que un token sin revocar.
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus("guest");
      router.replace("/login");
    }
  }, [router]);

  return {
    isAdmin: user?.role === "ADMIN",
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    login,
    logout,
    refreshUser,
    status,
    user,
  };
}

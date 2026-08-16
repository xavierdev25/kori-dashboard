"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

type Session = ReturnType<typeof useAuth>;

const AuthContext = createContext<Session | null>(null);

/**
 * Una sola sesion para todo el panel.
 *
 * `useAuth` pregunta al backend en cada montaje —la cookie es httpOnly, no hay
 * otra forma de saber si hay sesion—, asi que llamarlo desde cada pantalla que
 * necesite saber el rol serian varias peticiones a /auth/me por navegacion,
 * cada una con su propio momento de "comprobando". Con el contexto se
 * pregunta una vez y todas leen lo mismo.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext value={useAuth()}>{children}</AuthContext>;
}

export function useSession() {
  const session = useContext(AuthContext);

  if (!session) {
    throw new Error("useSession solo funciona dentro de AuthProvider");
  }

  return session;
}

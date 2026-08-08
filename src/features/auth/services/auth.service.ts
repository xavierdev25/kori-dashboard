import { apiRequest } from "@/shared/lib/api-client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types/auth.types";

export const authService = {
  login(credentials: LoginCredentials) {
    return apiRequest<LoginResponse>("/auth/login", {
      body: credentials,
      method: "POST",
      // Un 401 aqui son credenciales malas, no una sesion caducada: no tiene
      // sentido intentar refrescar.
      skipRefresh: true,
    });
  },

  logout() {
    return apiRequest<void>("/auth/logout", { method: "POST" });
  },

  /**
   * Fuente de verdad de la sesion. Como la cookie es httpOnly, el panel no
   * puede leer el token: hay que preguntarle al backend quien eres.
   */
  me() {
    return apiRequest<AuthUser>("/auth/me");
  },
};

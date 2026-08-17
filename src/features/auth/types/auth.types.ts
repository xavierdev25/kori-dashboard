export type UserRole = "ARTIST" | "ADMIN";

export interface AuthUser {
  email: string;
  id: string;
  /**
   * Cuenta recien creada: la contrasena con la que entro es la de reparto,
   * la que le paso quien dio de alta la cuenta. Mientras esto siga en `true`
   * el panel no deja hacer nada mas que cambiarla.
   */
  mustChangePassword: boolean;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * La sesion viaja en cookies httpOnly que el navegador guarda solo; el panel
 * nunca ve el token. `accessToken` sigue llegando en el cuerpo por
 * compatibilidad con la version anterior, pero aqui ya no se usa.
 */
export interface LoginResponse {
  expiresIn: string;
  user: AuthUser;
}

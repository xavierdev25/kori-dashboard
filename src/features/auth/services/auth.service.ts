import { apiRequest } from "@/shared/lib/api-client";
import type { LoginCredentials, LoginResponse } from "@/features/auth/types/auth.types";

export const authService = {
  login(credentials: LoginCredentials) {
    return apiRequest<LoginResponse>("/auth/login", {
      auth: false,
      body: credentials,
      method: "POST",
    });
  },
};

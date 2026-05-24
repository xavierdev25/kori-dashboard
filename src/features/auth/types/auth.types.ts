export interface LoginCredentials {
  password: string;
  username: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
}

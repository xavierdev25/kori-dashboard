/**
 * Texto que se le ensena al usuario ante un error de red o de la API.
 * `ApiError` ya trae el mensaje del backend, asi que basta con leerlo;
 * el fallback cubre los casos en los que no hay Error (o viene sin mensaje).
 */
export function getErrorText(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

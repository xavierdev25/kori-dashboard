"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/shared/components/ErrorScreen";

/**
 * Errores dentro del panel.
 *
 * Va aqui y no solo en la raiz para que el menu lateral siga en pie: si
 * revienta la tabla de ventas, se puede saltar a productos sin recargar. Un
 * error a nivel de raiz se llevaria por delante toda la navegacion.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[panel]", error);
  }, [error]);

  return (
    <ErrorScreen
      description="No se pudo mostrar esta seccion. Vuelve a intentarlo; si sigue igual, revisa que el servidor este respondiendo."
      digest={error.digest}
      // `retry` y no `reset`: reset solo limpia el estado y vuelve a
      // pintar con los mismos datos, asi que ante un fallo de carga —que es
      // el caso normal aqui— enseñaria exactamente el mismo error otra vez.
      // Este vuelve a pedirlos.
      onRetry={retry}
      title="Algo se rompio en esta pantalla"
    />
  );
}

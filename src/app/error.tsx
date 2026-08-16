"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/shared/components/ErrorScreen";

/** Red de seguridad para lo que caiga fuera del panel: login y portada. */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[panel]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
      <ErrorScreen
        description="No se pudo cargar la pagina. Vuelve a intentarlo."
        digest={error.digest}
        onRetry={unstable_retry}
        title="Algo se rompio"
      />
    </main>
  );
}

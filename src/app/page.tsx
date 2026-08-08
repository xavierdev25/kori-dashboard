"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/shared/components/Spinner";

export default function HomePage() {
  const router = useRouter();
  const { status } = useAuth();

  // Con la sesion en una cookie httpOnly no se puede decidir el destino sin
  // preguntar antes al backend, asi que se espera a saber quien eres.
  useEffect(() => {
    if (status === "checking") {
      return;
    }

    router.replace(status === "authenticated" ? "/dashboard" : "/login");
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Spinner label="Cargando dashboard" />
    </main>
  );
}

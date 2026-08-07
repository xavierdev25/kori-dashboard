"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/shared/components/Spinner";
import { hasAccessToken } from "@/shared/lib/token-storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasAccessToken() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Spinner label="Cargando dashboard" />
    </main>
  );
}

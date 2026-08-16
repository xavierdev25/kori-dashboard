"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/features/auth/context/AuthContext";
import { buttonVariants } from "@/shared/components/Button";
import { PageLoader } from "@/shared/components/Spinner";

/**
 * Corta el paso a las pantallas que son solo de ADMIN.
 *
 * Quien manda sigue siendo el backend —`RolesGuard` responde 403 y sin eso
 * esto no valdria nada, porque cualquiera puede cambiar lo que decide el
 * navegador—. Esto es para que un ARTIST que escriba la URL a mano vea una
 * frase que explica lo que pasa, en vez de una pantalla que se pinta entera y
 * se va llenando de errores de permiso uno por uno segun van fallando las
 * peticiones.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isChecking } = useSession();

  if (isChecking) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <PageLoader label="Verificando permisos" state="connecting" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">
            Esta seccion es solo para administradores
          </h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-600">
            Tu cuenta no tiene permiso para ver las ventas. Si crees que deberia
            tenerlo, pideselo a quien administre la tienda.
          </p>
        </div>

        <Link className={buttonVariants({ variant: "secondary" })} href="/dashboard">
          Volver al resumen
        </Link>
      </div>
    );
  }

  return children;
}

import Link from "next/link";
import { buttonVariants } from "@/shared/components/Button";

/**
 * 404. Sin `"use client"`: no tiene estado ni eventos, asi que se sirve como
 * HTML y no arrastra JavaScript.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
        <div>
          <p className="text-xs font-medium tracking-widest text-neutral-400">
            404
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-950">
            Esta pagina no existe
          </h1>
          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-600">
            Puede que el enlace este mal escrito o que lo que buscabas ya no
            este ahi.
          </p>
        </div>

        <Link className={buttonVariants()} href="/dashboard">
          Ir al panel
        </Link>
      </div>
    </main>
  );
}

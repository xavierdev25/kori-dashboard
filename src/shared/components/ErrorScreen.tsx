"use client";

import { Button } from "@/shared/components/Button";

/**
 * La pantalla que se ve cuando algo revienta al pintar.
 *
 * Antes no habia ninguna: un error al renderizar tumbaba el arbol y dejaba el
 * panel en blanco, sin texto, sin boton y sin forma de salir que no fuera
 * recargar a mano. En blanco no se distingue "se rompio" de "esta cargando".
 *
 * El mensaje tecnico se guarda para la consola a proposito y aqui solo se
 * enseña el identificador: el texto de un error de servidor puede llevar
 * rutas, consultas o datos de un pedido, y esto se ve en una pantalla que
 * puede estar compartida.
 */
export function ErrorScreen({
  description,
  digest,
  onRetry,
  title,
}: {
  description: string;
  digest?: string;
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
      <div>
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-neutral-600">
          {description}
        </p>
      </div>

      <Button onClick={onRetry}>Volver a intentar</Button>

      {digest ? (
        <p className="text-xs text-neutral-400">
          Referencia: <code className="font-mono">{digest}</code>
        </p>
      ) : null}
    </div>
  );
}

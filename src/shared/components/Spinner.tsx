"use client";

import { ThinkingOrb } from "thinking-orbs";
import type { OrbState } from "thinking-orbs";

/**
 * El indicador de "estoy en ello", con los orbes de thinking-orbs.
 *
 * El orbe pinta sobre un `<canvas>` y no dice nada por si mismo, asi que la
 * etiqueta va al lado en un `role="status"`: quien no ve la pantalla se
 * entera igual de que hay algo cargando.
 *
 * `size` solo admite 20 o 64 — son dos disenos distintos con su propio
 * numero de puntos y su propia velocidad, no una misma figura escalada.
 */
export function Spinner({
  label = "Cargando",
  size = 20,
  state = "working",
}: {
  label?: string;
  size?: 20 | 64;
  state?: OrbState;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600"
      role="status"
    >
      <ThinkingOrb aria-hidden size={size} state={state} theme="light" />
      <span>{label}</span>
    </div>
  );
}

/**
 * Version grande y centrada para cuando lo que carga es la pantalla entera.
 * Ahi el orbe de 64 se ve como lo que es y no como un adorno perdido.
 */
export function PageLoader({
  label = "Cargando",
  state = "working",
}: {
  label?: string;
  state?: OrbState;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
    >
      <ThinkingOrb aria-hidden size={64} state={state} theme="light" />
      <span className="text-sm font-medium text-neutral-600">{label}</span>
    </div>
  );
}

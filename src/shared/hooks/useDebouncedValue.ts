"use client";

import { useEffect, useState } from "react";

/**
 * Retrasa un valor hasta que deja de cambiar durante `delay` ms.
 *
 * Sin esto, escribir "playera" en el buscador lanza siete peticiones y las
 * respuestas pueden llegar desordenadas: la de "play" despues de la de
 * "playera" deja en pantalla resultados que no corresponden a lo escrito.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);

    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

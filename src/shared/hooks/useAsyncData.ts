"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/shared/lib/api-client";
import { getErrorText } from "@/shared/lib/error-message";

type Options<T> = {
  /**
   * Cuando es `false` no se pide nada y se deja de cargar. Para las vistas de
   * detalle, que no tienen a quien pedir hasta que hay un id seleccionado.
   */
  enabled?: boolean;
  fallbackMessage: string;
  initialData: T;
};

/**
 * Una carga de datos que se cancela sola.
 *
 * El motivo de que exista: sin cancelar, dos peticiones en vuelo se resuelven
 * en el orden que quieran. Al teclear en un buscador o pasar paginas rapido se
 * lanzan varias, y si la primera tarda mas que la segunda —cosa normal, no
 * hace falta que nada falle— la respuesta vieja llega la ultima y pisa a la
 * nueva. La pantalla acaba enseñando los resultados de una busqueda que ya no
 * es la que hay escrita en la caja, sin ningun error a la vista. Eso es peor
 * que un fallo: parece que funciona.
 *
 * Al cambiar las dependencias o al desmontar se aborta lo que quedaba en
 * vuelo, y la cancelacion se descarta en silencio: no es un fallo que enseñar,
 * es una respuesta que ya no interesa.
 *
 * `load` tiene que venir envuelto en `useCallback`: sus dependencias son las
 * que deciden cuando toca volver a pedir.
 */
export function useAsyncData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  { enabled = true, fallbackMessage, initialData }: Options<T>,
) {
  const [data, setData] = useState<T>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const inFlight = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Refrescar a mano tambien descarta lo anterior: dos clics seguidos en
    // "actualizar" tienen la misma carrera que dos cambios de pagina.
    inFlight.current?.abort();

    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await load(controller.signal);

      // Segundo cierre, ademas del `catch`: un `load` que envuelva sus
      // llamadas en `.catch(() => null)` —como el resumen, que tolera que
      // fallen las de ventas— se traga tambien la cancelacion y devuelve un
      // resultado a medias en vez de lanzar. Sin esta comprobacion ese
      // resultado incompleto pisaria al de la peticion buena.
      if (controller.signal.aborted) {
        return;
      }

      setData(result);
    } catch (requestError) {
      if (isAbortError(requestError)) {
        return;
      }

      setError(getErrorText(requestError, fallbackMessage));
    } finally {
      // Si se aborto es porque ya arranco otra peticion, y esa es la que manda
      // ahora sobre el indicador de carga. Apagarlo aqui haria parpadear la
      // pantalla entre una busqueda y la siguiente.
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, fallbackMessage, load]);

  // Diferido un tick: React 19 prohibe setState sincrono dentro de un efecto.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void run();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      inFlight.current?.abort();
    };
  }, [run]);

  return { data, error, loading, refresh: run, setData };
}

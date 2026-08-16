"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Filtros y paginacion guardados en la URL en vez de en la memoria del
 * componente.
 *
 * Lo que arregla: hasta ahora el estado vivia solo en `useState`, asi que la
 * direccion era siempre la misma pusieras lo que pusieras. Recargar te
 * devolvia a la primera pagina sin filtros, el boton de atras del navegador te
 * sacaba de la seccion entera en vez de deshacer el ultimo filtro, y no habia
 * forma de mandarle a nadie "mira estos pedidos": el enlace no llevaba nada
 * dentro.
 *
 * Se usa `replace` y no `push` a proposito: cada tecla del buscador crearia
 * una entrada en el historial, y volver atras obligaria a pasar por cada letra
 * escrita. Los valores iguales al defecto se borran de la URL para que no se
 * llene de ruido.
 *
 * `defaults` tiene que definirse fuera del componente: se usa como dependencia
 * y un objeto nuevo en cada render volveria a calcularlo todo sin parar.
 *
 * OJO: quien use esto tiene que ir envuelto en <Suspense>. El build de
 * produccion falla —no avisa, falla— si una pagina estatica llama a
 * `useSearchParams` sin un limite de suspense por encima, y en desarrollo no
 * se nota porque ahi las rutas se pintan bajo demanda.
 */
export function useQueryParams<T extends Record<string, string>>(defaults: T) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const merged = { ...defaults };

    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const fromUrl = searchParams.get(String(key));

      if (fromUrl !== null) {
        merged[key] = fromUrl as T[keyof T];
      }
    }

    return merged;
  }, [defaults, searchParams]);

  const setValues = useCallback(
    (patch: Partial<Record<keyof T, string>>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === defaults[key]) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      const query = next.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [defaults, pathname, router, searchParams],
  );

  return [values, setValues] as const;
}

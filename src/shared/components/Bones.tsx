"use client";

import { Skeleton } from "boneyard-js/react";
import type { ReactNode } from "react";

/**
 * Pinta el esqueleto capturado de un componente por su nombre.
 *
 * Los huesos los genera `pnpm run bones` fotografiando la maqueta real, asi
 * que el hueco que dejan tiene la forma exacta de lo que va a aparecer y la
 * pagina no pega el salto de siempre al llegar los datos.
 *
 * `fallback` es el seguro: si alguien toca la maqueta y no regenera, o si el
 * registro no se importo, se pinta el esqueleto generico de toda la vida en
 * vez de dejar un hueco en blanco.
 *
 * `select="viewport"` y no el valor por defecto: el panel mete el contenido
 * en un contenedor mas estrecho que la ventana, y midiendo el contenedor se
 * elegiria el corte equivocado. Lo dice la propia documentacion del paquete.
 */
export function Bones({
  fallback,
  name,
}: {
  fallback: ReactNode;
  name: string;
}) {
  return (
    <Skeleton fallback={fallback} loading name={name} select="viewport">
      {null}
    </Skeleton>
  );
}

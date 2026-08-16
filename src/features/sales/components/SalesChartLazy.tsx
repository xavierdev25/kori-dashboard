"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/shared/components/Skeleton";

/**
 * La grafica, cargada aparte del resto de la pantalla.
 *
 * `@tanstack/charts` es con diferencia lo mas pesado del panel despues de
 * three, y se importaba de golpe en el resumen y en ventas — las dos pantallas
 * por las que se entra siempre. Eso retrasaba tambien las cifras y la tabla,
 * que es lo que de verdad se viene a mirar y ademas llega antes del servidor.
 *
 * Asi el resto se pinta en cuanto esta, y la grafica aparece un momento
 * despues en su hueco, sin mover nada de sitio.
 *
 * `ssr: false` porque la grafica mide el contenedor para dibujarse: en el
 * servidor no hay ancho que medir y el HTML que saldria no sirve de nada.
 */
export const SalesChart = dynamic(
  () =>
    import("@/features/sales/components/SalesChart").then((m) => m.SalesChart),
  {
    loading: () => <TableSkeleton columns={1} rows={4} />,
    ssr: false,
  },
);

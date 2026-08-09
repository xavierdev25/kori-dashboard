import { cn } from "@/shared/utils/cn";

/**
 * Bloque gris que ocupa el sitio del contenido mientras carga.
 *
 * Se hace con Tailwind en vez de una libreria: son quince lineas y evita
 * meter una dependencia mas en un panel que usan dos personas.
 *
 * El objetivo no es decorar: es que la pagina no salte cuando llegan los
 * datos. Por eso cada uso imita la forma real de lo que va a aparecer.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-neutral-200/70", className)}
    />
  );
}

/** Tarjeta de metrica: etiqueta corta arriba, numero grande debajo. */
export function StatSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
    </div>
  );
}

/** Filas de tabla. `columns` reparte anchos distintos para que no parezca un bloque. */
export function TableSkeleton({
  columns = 4,
  rows = 3,
}: {
  columns?: number;
  rows?: number;
}) {
  const widths = ["w-40", "w-24", "w-16", "w-28", "w-20"];

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div className="flex items-center gap-6 px-4 py-4" key={row}>
            {Array.from({ length: columns }).map((_, column) => (
              <Skeleton
                className={cn("h-4", widths[column % widths.length])}
                key={column}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

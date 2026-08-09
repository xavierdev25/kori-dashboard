"use client";

import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { Chart } from "@tanstack/react-charts";
import { useMemo } from "react";
import { formatMoney } from "@/features/products/utils/format-money";
import { Card } from "@/shared/components/Card";
import type { SalesDay } from "@/features/sales/types/sale.types";

/** "8 ago" — el eje se lee de un vistazo, sin el año repetido treinta veces. */
const diaCorto = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function etiquetaDeDia(fecha: string) {
  return diaCorto.format(new Date(`${fecha}T00:00:00Z`));
}

/**
 * Ingreso por día.
 *
 * Barras y no línea: son días sueltos con ceros de por medio, y una línea que
 * baja a cero y vuelve a subir sugiere una continuidad que no existe. Cada
 * barra es un día y punto.
 *
 * La escala x es de bandas sobre la fecha en texto, no una escala temporal.
 * El backend ya entrega un día por posición, con los huecos rellenos, así que
 * no hace falta que la gráfica sepa nada de calendarios — y ahorra traerse
 * `d3-scale` entero.
 */
export function SalesChart({
  currency,
  days,
  timeZone,
}: {
  currency: string;
  days: SalesDay[];
  timeZone: string;
}) {
  const definicion = useMemo(
    () =>
      defineChart({
        marks: [
          barY(days, {
            fill: "var(--color-neutral-900, #171717)",
            key: "date",
            x: (dia: SalesDay) => etiquetaDeDia(dia.date),
            y: (dia: SalesDay) => dia.grossRevenueCents / 100,
          }),
        ],
        x: {
          axis: {
            // Con treinta días las etiquetas se pisan. `thin` las va quitando
            // segun colisionan de verdad, que se adapta al ancho real mejor
            // que dejar una de cada cinco a ojo. Se conservan los extremos:
            // sin el primer y el ultimo dia no se sabe que periodo es.
            tickLabels: { thin: { minGap: 8, priority: "ends" } },
          },
          scale: scaleBand,
        },
        y: {
          axis: {
            label: `Ingreso (${currency})`,
            ticks: {
              format: (valor: number) =>
                valor >= 1000 ? `${Math.round(valor / 1000)}k` : String(valor),
            },
          },
          // Sin esto el dominio acaba justo en el maximo y la barra mas alta
          // toca el techo del area de dibujo: parece recortada.
          grid: true,
          nice: true,
          scale: scaleLinear,
        },
      }),
    [currency, days],
  );

  const total = days.reduce((suma, dia) => suma + dia.grossRevenueCents, 0);
  const conVentas = days.filter((dia) => dia.salesCount > 0).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950">
            Ingreso por día
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {days.length} días · {conVentas} con ventas · hora de{" "}
            {timeZone.split("/")[1]?.replace(/_/g, " ")}
          </p>
        </div>
        <p className="text-lg font-semibold tracking-tight text-neutral-950">
          {formatMoney(total, currency)}
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-neutral-300 px-3 py-8 text-center text-sm text-neutral-500">
          Todavía no hay ventas en este periodo.
        </p>
      ) : (
        <div className="mt-4">
          <Chart
            ariaDescription={`Ingreso bruto diario en ${currency} durante ${days.length} días.`}
            ariaLabel="Ingreso por día"
            definition={definicion}
            height={220}
          />
        </div>
      )}
    </Card>
  );
}

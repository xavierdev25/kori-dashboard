"use client";

import { Skeleton } from "boneyard-js/react";
import { notFound } from "next/navigation";
import { StatsCards } from "@/features/notes/components/StatsCards";
import { NotesTable } from "@/features/notes/components/NotesTable";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { SalesTable } from "@/features/sales/components/SalesTable";
import { StatsPanel } from "@/features/sales/components/StatsPanel";
import {
  metricasDeNotasDeMuestra,
  metricasDeVentasDeMuestra,
  notasDeMuestra,
  productosDeMuestra,
  ventasDeMuestra,
} from "@/features/bones/fixtures";

/**
 * El taller donde `npx boneyard-js build` fotografia los esqueletos.
 *
 * Existe porque el panel esta detras de un login: el navegador del CLI se
 * comeria una redireccion a /login y no veria ningun componente. Aqui estan
 * los mismos componentes, con datos de mentira y sin sesion de por medio.
 *
 * Los huesos se identifican por el `name`, asi que los que se capturan aqui
 * son los que luego usan las pantallas de verdad.
 *
 * Fuera de desarrollo responde 404: no es una pagina del producto.
 */
export default function BonesPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const nada = async () => {};

  return (
    <main className="mx-auto grid max-w-7xl gap-10 p-8">
      <p className="text-sm text-neutral-500">
        Pagina de captura para boneyard. No forma parte del panel.
      </p>

      <Skeleton loading name="overview-stats" select="viewport">
        <StatsPanel stats={metricasDeVentasDeMuestra} />
      </Skeleton>

      <Skeleton loading name="notes-stats" select="viewport">
        <StatsCards stats={metricasDeNotasDeMuestra} />
      </Skeleton>

      <Skeleton loading name="products-table" select="viewport">
        <ProductsTable products={productosDeMuestra} />
      </Skeleton>

      <Skeleton loading name="sales-table" select="viewport">
        <SalesTable sales={ventasDeMuestra} />
      </Skeleton>

      <Skeleton loading name="notes-table" select="viewport">
        <NotesTable
          error={null}
          loading={false}
          notes={notasDeMuestra}
          onApprove={nada}
          onDelete={nada}
          onRefresh={nada}
          onReject={nada}
        />
      </Skeleton>
    </main>
  );
}

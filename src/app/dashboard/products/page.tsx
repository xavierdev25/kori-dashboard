"use client";

import Link from "next/link";
import { Plus } from "@/shared/components/icons";
import { useState } from "react";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { useProducts } from "@/features/products/hooks/useProducts";
import { buttonVariants } from "@/shared/components/Button";
import { Bones } from "@/shared/components/Bones";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { TableSkeleton } from "@/shared/components/Skeleton";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const PAGE_SIZE = 20;

type Visibility = "" | "published" | "draft";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("");
  const debouncedSearch = useDebouncedValue(search);

  const { error, loading, meta, products } = useProducts({
    isActive: visibility === "" ? undefined : visibility === "published",
    limit: PAGE_SIZE,
    page,
    search: debouncedSearch,
  });

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Productos
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            El merch de la tienda. Un producto no se publica hasta que puede
            producirse.
          </p>
        </div>
        <Link className={buttonVariants()} href="/dashboard/products/new">
          <Plus aria-hidden className="h-4 w-4" />
          <span>Nuevo producto</span>
        </Link>
      </header>

      <Card className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
        <Input
          aria-label="Buscar productos"
          name="search"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o slug"
          value={search}
        />

        <label className="grid gap-2 text-sm font-medium text-neutral-800">
          <span>Visibilidad</span>
          <select
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            onChange={(event) => {
              setVisibility(event.target.value as Visibility);
              setPage(1);
            }}
            value={visibility}
          >
            <option value="">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </label>
      </Card>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Bones
          fallback={<TableSkeleton columns={4} rows={5} />}
          name="products-table"
        />
      ) : products.length === 0 ? (
        <EmptyState
          action={
            search || visibility ? undefined : (
              <Link className={buttonVariants()} href="/dashboard/products/new">
                Crear el primero
              </Link>
            )
          }
          description={
            search || visibility
              ? "Ningun producto coincide con esos filtros."
              : "Todavia no hay productos en la tienda."
          }
          title="Sin productos"
        />
      ) : (
        <>
          <ProductsTable products={products} />

          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>
                Pagina {meta.page} de {meta.totalPages} · {meta.total} productos
              </span>
              <div className="flex gap-2">
                <button
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

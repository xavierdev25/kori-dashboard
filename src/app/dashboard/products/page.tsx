"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { useProducts } from "@/features/products/hooks/useProducts";
import { buttonVariants } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { error, loading, meta, products } = useProducts({
    limit: PAGE_SIZE,
    page,
    search,
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

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Cargando productos" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          action={
            <Link className={buttonVariants()} href="/dashboard/products/new">
              Crear el primero
            </Link>
          }
          description={
            search
              ? "Ningun producto coincide con esa busqueda."
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

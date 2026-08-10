"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/shared/components/icons";
import { ProductForm } from "@/features/products/components/ProductForm";
import { productsService } from "@/features/products/services/products.service";
import { buttonVariants } from "@/shared/components/Button";
import type { ProductInput } from "@/features/products/types/product.types";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(input: ProductInput) {
    const product = await productsService.createProduct(input);

    // Se va al detalle, no al listado: recien creado no tiene ni variantes ni
    // imagenes, y eso es lo siguiente que hay que hacer.
    router.replace(`/dashboard/products/${product.id}`);
  }

  return (
    <section className="grid max-w-2xl gap-6">
      <div>
        <Link
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          href="/dashboard/products"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          <span>Productos</span>
        </Link>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
          Nuevo producto
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Se crea como borrador. El archivo y las fotos se anaden despues.
        </p>
      </div>

      <ProductForm onSubmit={handleCreate} showKind submitLabel="Crear producto" />
    </section>
  );
}

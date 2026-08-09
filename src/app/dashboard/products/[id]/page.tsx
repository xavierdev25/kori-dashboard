"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Eye, EyeOff } from "@/shared/components/icons";
import { useState } from "react";
import { ImagesEditor } from "@/features/products/components/ImagesEditor";
import { ProductForm } from "@/features/products/components/ProductForm";
import { VariantsEditor } from "@/features/products/components/VariantsEditor";
import { useProduct } from "@/features/products/hooks/useProducts";
import { productsService } from "@/features/products/services/products.service";
import { getReadiness } from "@/features/products/utils/readiness";
import { Badge } from "@/shared/components/Badge";
import { Button, buttonVariants } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageLoader } from "@/shared/components/Spinner";
import { CUE } from "@/shared/lib/sound";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import type { ProductInput } from "@/features/products/types/product.types";

function getParamId(id: string | string[] | undefined) {
  return Array.isArray(id) ? id[0] : id || null;
}

export default function ProductDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = getParamId(params.id);
  const { error, loading, product, refresh } = useProduct(id);
  const toast = useToast();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  if (loading) {
    return (
      <PageLoader label="Cargando producto" />
    );
  }

  if (error || !product || !id) {
    return (
      <EmptyState
        action={
          <Link className={buttonVariants()} href="/dashboard/products">
            Volver a productos
          </Link>
        }
        description={error ?? "Puede que se haya borrado."}
        title="No se pudo cargar el producto"
      />
    );
  }

  const readiness = getReadiness(product);

  async function handleUpdate(input: ProductInput) {
    await productsService.updateProduct(id!, input);
    await refresh();
    toast.success("Datos del producto guardados.");
  }

  async function togglePublished() {
    setPublishError(null);
    setIsPublishing(true);

    try {
      const wasActive = product!.isActive;
      await productsService.updateProduct(id!, { isActive: !wasActive });
      await refresh();
      toast.success(
        wasActive
          ? "Producto despublicado: ya no aparece en la tienda."
          : "Producto publicado: ya está a la venta.",
        // Publicar es el momento mas alegre del panel y se lleva el cue mas
        // vistoso. Retirarlo es solo cambiar un interruptor.
        wasActive ? CUE.alternar : CUE.publicado,
      );
    } catch (toggleError) {
      // El backend vuelve a validar y responde 409 nombrando lo que falta:
      // ese mensaje es mas util que cualquiera que inventemos aqui.
      const message = getErrorText(
        toggleError,
        "No se pudo cambiar la publicacion.",
      );
      setPublishError(message);
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <Link
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          href="/dashboard/products"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          <span>Productos</span>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            {product.name}
          </h2>
          {product.isActive ? (
            <Badge tone="green">Publicado</Badge>
          ) : (
            <Badge tone="neutral">Borrador</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-500">/{product.slug}</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-950">
              {product.isActive ? "En la tienda" : "Publicacion"}
            </h3>

            {readiness.canPublish ? (
              <p className="mt-1 text-sm text-emerald-700">
                {product.isActive
                  ? "Visible para los compradores."
                  : "Listo para publicarse."}
              </p>
            ) : (
              <ul className="mt-2 grid gap-1">
                {readiness.blockers.map((blocker) => (
                  <li
                    className="flex items-start gap-2 text-sm text-amber-800"
                    key={blocker}
                  >
                    <AlertTriangle
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            disabled={!product.isActive && !readiness.canPublish}
            isLoading={isPublishing}
            leftIcon={
              product.isActive ? (
                <EyeOff aria-hidden className="h-4 w-4" />
              ) : (
                <Eye aria-hidden className="h-4 w-4" />
              )
            }
            onClick={() => void togglePublished()}
            variant={product.isActive ? "secondary" : "primary"}
          >
            {product.isActive ? "Despublicar" : "Publicar"}
          </Button>
        </div>

        {publishError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {publishError}
          </p>
        ) : null}
      </Card>

      <VariantsEditor
        onChanged={refresh}
        productId={product.id}
        variants={product.variants}
      />

      <ImagesEditor
        images={product.images}
        onChanged={refresh}
        productId={product.id}
      />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-950">
          Datos generales
        </h3>
        <ProductForm
          initial={{
            description: product.description ?? "",
            name: product.name,
            slug: product.slug,
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </section>
  );
}

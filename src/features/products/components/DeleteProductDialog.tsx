"use client";

import type { ProductSummary } from "@/features/products/types/product.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

/**
 * No avisa de las ventas porque el listado no las trae: quien las tenga
 * recibe un 409 del backend nombrando cuantas hay y proponiendo despublicar,
 * y ese mensaje es mas concreto que cualquier suposicion de aqui.
 *
 * Si dice que se van tambien los checkouts sin pagar: el borrado los retira
 * para poder continuar, y eso hay que decirlo antes de pulsar, no despues.
 */
export function DeleteProductDialog({
  isDeleting,
  onClose,
  onConfirm,
  open,
  product,
}: {
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  product: Pick<ProductSummary, "isActive" | "name" | "slug"> | null;
}) {
  return (
    <ConfirmDialog
      description={
        product?.isActive
          ? "Esta publicado: desaparece de la tienda en cuanto lo borres. Se van con el sus variantes, sus imagenes y el archivo que se vende, ademas de los checkouts que quedaron sin pagar. No se puede deshacer."
          : "Se borran el producto, sus variantes, sus imagenes y el archivo que se vende, ademas de los checkouts que quedaron sin pagar. Las ventas cobradas lo impiden. No se puede deshacer."
      }
      detail={product ? `${product.name} · /${product.slug}` : undefined}
      isBusy={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      open={open && Boolean(product)}
      title="Borrar producto"
    />
  );
}

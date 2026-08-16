import type {
  ProductSummary,
  ProductVariant,
} from "@/features/products/types/product.types";

type MinimalVariant = Pick<
  ProductVariant,
  "digitalAssetPath" | "isActive" | "label" | "printFileUrl" | "providerProductUid"
>;

export interface Readiness {
  /** Motivos por los que el backend rechazaria publicar. Vacio = publicable. */
  blockers: string[];
  canPublish: boolean;
}

/**
 * Refleja la misma regla que aplica el backend al publicar. Se duplica aqui a
 * proposito: sirve para avisar antes de pulsar el boton, no para autorizar
 * nada. Quien decide sigue siendo el servidor, y si esto se desincroniza el
 * peor caso es un mensaje de error en vez de una publicacion indebida.
 */
export function getReadiness(product: {
  fulfillmentType: ProductSummary["fulfillmentType"];
  images: unknown[];
  variants: MinimalVariant[];
}): Readiness {
  const blockers: string[] = [];
  const activeVariants = product.variants.filter((variant) => variant.isActive);

  if (activeVariants.length === 0) {
    blockers.push("No tiene variantes activas");
  }

  if (product.images.length === 0) {
    blockers.push("No tiene ninguna imagen");
  }

  if (product.fulfillmentType === "POD") {
    const incomplete = activeVariants.filter(
      (variant) => !variant.providerProductUid || !variant.printFileUrl,
    );

    if (incomplete.length > 0) {
      blockers.push(
        `Sin datos de impresion: ${incomplete
          .map((variant) => variant.label)
          .join(", ")}`,
      );
    }
  }

  if (product.fulfillmentType === "DIGITAL") {
    // El equivalente digital de no tener archivo de impresion: publicarlo
    // seria poner a la venta algo que nadie podria descargar.
    //
    // Faltaba, y por eso el boton de publicar se veia activo en un producto
    // sin archivo: se pulsaba, el backend respondia 409 y el mensaje llegaba
    // despues de haberlo intentado en vez de antes.
    const sinArchivo = activeVariants.filter(
      (variant) => !variant.digitalAssetPath,
    );

    if (sinArchivo.length > 0) {
      blockers.push("Todavia no tiene el archivo subido");
    }
  }

  return { blockers, canPublish: blockers.length === 0 };
}

/** Rango de precios de las variantes activas, en centavos. */
export function getPriceRange(
  variants: Pick<ProductVariant, "isActive" | "priceCents">[],
) {
  const prices = variants
    .filter((variant) => variant.isActive)
    .map((variant) => variant.priceCents);

  if (prices.length === 0) {
    return null;
  }

  return { max: Math.max(...prices), min: Math.min(...prices) };
}

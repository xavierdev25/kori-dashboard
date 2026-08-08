"use client";

import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { productsService } from "@/features/products/services/products.service";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { getErrorText } from "@/shared/lib/error-message";
import type { ProductImage } from "@/features/products/types/product.types";

/** Mismos limites que aplica el backend, para avisar antes de subir en balde. */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export function ImagesEditor({
  images,
  onChanged,
  productId,
}: {
  images: ProductImage[];
  onChanged: () => Promise<void>;
  productId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, fallback: string) {
    setError(null);
    setBusy(true);

    try {
      await action();
      await onChanged();
    } catch (actionError) {
      setError(getErrorText(actionError, fallback));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // El input se limpia siempre: si no, subir el mismo archivo dos veces
    // seguidas no dispara el evento la segunda vez.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED.includes(file.type)) {
      setError("Formato no permitido. Usa PNG, JPG o WEBP.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("La imagen pesa mas de 5 MB.");
      return;
    }

    await run(
      () => productsService.uploadImage(productId, file),
      "No se pudo subir la imagen.",
    );
  }

  function move(index: number, direction: -1 | 1) {
    const reordered = [...images];
    const target = index + direction;
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];

    return run(
      () =>
        productsService.reorderImages(
          productId,
          reordered.map((image) => image.id),
        ),
      "No se pudo reordenar.",
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950">Imagenes</h3>
          <p className="mt-1 text-xs text-neutral-600">
            La principal es la que aparece en la tienda. Arrastrar no: usa las
            flechas.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100">
          <Upload aria-hidden className="h-4 w-4" />
          <span>Subir imagen</span>
          <input
            accept={ALLOWED.join(",")}
            className="hidden"
            disabled={busy}
            onChange={(event) => void handleUpload(event)}
            type="file"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {images.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-500">
          Sin imagenes. Hace falta al menos una para publicar.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li
              className="overflow-hidden rounded-md border border-neutral-200"
              key={image.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.altText ?? "Imagen del producto"}
                className="h-40 w-full bg-neutral-50 object-cover"
                src={image.url}
              />
              <div className="flex items-center gap-1 border-t border-neutral-100 p-2">
                {image.isPrimary ? (
                  <Badge tone="green">Principal</Badge>
                ) : (
                  <Button
                    disabled={busy}
                    leftIcon={<Star aria-hidden className="h-3 w-3" />}
                    onClick={() =>
                      void run(
                        () =>
                          productsService.setPrimaryImage(productId, image.id),
                        "No se pudo marcar como principal.",
                      )
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Principal
                  </Button>
                )}

                <span className="ml-auto flex gap-1">
                  <Button
                    aria-label="Mover a la izquierda"
                    disabled={busy || index === 0}
                    onClick={() => void move(index, -1)}
                    size="sm"
                    variant="ghost"
                  >
                    <ArrowLeft aria-hidden className="h-3 w-3" />
                  </Button>
                  <Button
                    aria-label="Mover a la derecha"
                    disabled={busy || index === images.length - 1}
                    onClick={() => void move(index, 1)}
                    size="sm"
                    variant="ghost"
                  >
                    <ArrowRight aria-hidden className="h-3 w-3" />
                  </Button>
                  <Button
                    aria-label="Borrar imagen"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => productsService.deleteImage(productId, image.id),
                        "No se pudo borrar la imagen.",
                      )
                    }
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden className="h-3 w-3" />
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

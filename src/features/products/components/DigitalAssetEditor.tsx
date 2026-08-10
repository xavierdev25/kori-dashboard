"use client";

import { Check, Download, Trash2, Upload } from "@/shared/components/icons";
import { ChangeEvent, useState } from "react";
import { productsService } from "@/features/products/services/products.service";
import { formatMoney } from "@/features/products/utils/format-money";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { CUE } from "@/shared/lib/sound";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import type { ProductVariant } from "@/features/products/types/product.types";

/** El mismo techo que aplica el backend, para avisar antes de subir en balde. */
const MAX_BYTES = 500 * 1024 * 1024;

/** "80.4 MB". Los kits se hablan en MB, no en bytes. */
function formatBytes(bytes: number) {
  const mb = bytes / 1024 / 1024;

  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * El archivo que se vende.
 *
 * Sustituye al editor de tallas cuando el producto es digital: un drumkit no
 * tiene tallas ni colores, tiene un precio y un archivo. La variante existe
 * por debajo pero no se enseña — el backend la crea sola al crear el producto.
 */
export function DigitalAssetEditor({
  onChanged,
  productId,
  variant,
}: {
  onChanged: () => Promise<void>;
  productId: string;
  variant: ProductVariant | undefined;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);
  const toast = useToast();

  if (!variant) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-neutral-950">Archivo</h3>
        <p className="mt-2 text-sm text-amber-800">
          Este producto digital no tiene su variante interna. Vuelve a crearlo
          desde cero: el sistema la genera solo al crear el producto.
        </p>
      </Card>
    );
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // El input se limpia siempre: si no, subir el mismo archivo dos veces
    // seguidas no dispara el evento la segunda vez.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error(`El archivo pesa ${formatBytes(file.size)}. El tope son 500 MB.`);
      return;
    }

    setIsBusy(true);
    // Un kit de 80 MB tarda; sin esto la pantalla parece colgada.
    setProgreso(`Subiendo ${formatBytes(file.size)}…`);

    try {
      await productsService.uploadDigitalAsset(productId, variant!.id, file);
      await onChanged();
      toast.success("Archivo subido.", CUE.listo);
    } catch (error) {
      toast.error(getErrorText(error, "No se pudo subir el archivo."));
    } finally {
      setIsBusy(false);
      setProgreso(null);
    }
  }

  async function handleRemove() {
    setIsBusy(true);

    try {
      await productsService.removeDigitalAsset(productId, variant!.id);
      await onChanged();
      toast.success("Archivo quitado.");
    } catch (error) {
      // El backend responde 409 si el producto sigue publicado: quitarle el
      // archivo lo dejaría cobrable pero no entregable.
      toast.error(getErrorText(error, "No se pudo quitar el archivo."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-950">
            Archivo de descarga
          </h3>
          <p className="mt-1 text-xs text-neutral-600">
            Lo que recibe quien compra. Se guarda en privado y solo se entrega
            por un enlace que caduca.
          </p>
        </div>
        <p className="text-sm font-medium text-neutral-950">
          {formatMoney(variant.priceCents, "USD")}
        </p>
      </div>

      {variant.digitalAssetPath ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3">
          <Badge tone="green">
            <Check aria-hidden className="h-3 w-3" />
            Listo
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
            <Download aria-hidden className="h-4 w-4" />
            {variant.digitalAssetBytes
              ? formatBytes(variant.digitalAssetBytes)
              : "archivo subido"}
          </span>

          <span className="ml-auto flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100">
              <Upload aria-hidden className="h-4 w-4" />
              <span>Reemplazar</span>
              <input
                accept=".zip,application/zip"
                className="hidden"
                disabled={isBusy}
                onChange={(event) => void handleUpload(event)}
                type="file"
              />
            </label>
            <Button
              disabled={isBusy}
              leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void handleRemove()}
              size="sm"
              variant="ghost"
            >
              Quitar
            </Button>
          </span>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 rounded-md border border-dashed border-neutral-300 px-3 py-6 text-center">
          <p className="text-sm text-neutral-600">
            Todavía no has subido el archivo. Sin él no se puede publicar.
          </p>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              <Upload aria-hidden className="h-4 w-4" />
              <span>Subir .zip</span>
              <input
                accept=".zip,application/zip"
                className="hidden"
                disabled={isBusy}
                onChange={(event) => void handleUpload(event)}
                type="file"
              />
            </label>
          </div>
        </div>
      )}

      {progreso ? (
        <p aria-live="polite" className="mt-3 text-sm text-neutral-600">
          {progreso}
        </p>
      ) : null}
    </Card>
  );
}

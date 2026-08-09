"use client";

import { Check, Plus, Trash2 } from "@/shared/components/icons";
import { FormEvent, useState } from "react";
import { productsService } from "@/features/products/services/products.service";
import {
  centsToInput,
  formatMoney,
  parseMoneyToCents,
} from "@/features/products/utils/format-money";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { CUE } from "@/shared/lib/sound";
import { useToast } from "@/shared/components/Toast";
import { getErrorText } from "@/shared/lib/error-message";
import type { ProductVariant } from "@/features/products/types/product.types";

function VariantRow({
  onChanged,
  productId,
  variant,
}: {
  onChanged: () => Promise<void>;
  productId: string;
  variant: ProductVariant;
}) {
  const [price, setPrice] = useState(centsToInput(variant.priceCents));
  const [uid, setUid] = useState(variant.providerProductUid ?? "");
  const [printFile, setPrintFile] = useState(variant.printFileUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const priceCents = parseMoneyToCents(price);
  const dirty =
    priceCents !== variant.priceCents ||
    uid !== (variant.providerProductUid ?? "") ||
    printFile !== (variant.printFileUrl ?? "");

  async function save() {
    if (priceCents === null) {
      setError("Precio no valido.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await productsService.updateVariant(productId, variant.id, {
        priceCents,
        printFileUrl: printFile.trim() || undefined,
        providerProductUid: uid.trim() || undefined,
      });
      await onChanged();
      toast.success(`${variant.label} guardada.`);
    } catch (saveError) {
      const message = getErrorText(saveError, "No se pudo guardar la variante.");
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive() {
    setError(null);
    setIsSaving(true);

    try {
      await productsService.updateVariant(productId, variant.id, {
        isActive: !variant.isActive,
      });
      await onChanged();
      toast.success(
        variant.isActive
          ? `${variant.label} retirada de la venta.`
          : `${variant.label} a la venta.`,
        CUE.alternar,
      );
    } catch (toggleError) {
      const message = getErrorText(toggleError, "No se pudo cambiar el estado.");
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    setError(null);
    setIsSaving(true);

    try {
      await productsService.deleteVariant(productId, variant.id);
      await onChanged();
    } catch (deleteError) {
      // El backend responde 409 con el conteo de ventas si ya se vendio.
      const message = getErrorText(deleteError, "No se pudo borrar la variante.");
      setError(message);
      toast.error(message);
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-3 border-t border-neutral-100 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-neutral-950">{variant.label}</span>
        <span className="text-xs text-neutral-500">{variant.sku}</span>
        {variant.isActive ? (
          <Badge tone="green">A la venta</Badge>
        ) : (
          <Badge tone="neutral">Inactiva</Badge>
        )}
        <span className="ml-auto text-sm text-neutral-600">
          {formatMoney(variant.priceCents)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          error={price && priceCents === null ? "Importe no valido" : undefined}
          inputMode="decimal"
          label="Precio (MXN)"
          name={`price-${variant.id}`}
          onChange={(event) => setPrice(event.target.value)}
          value={price}
        />
        <Input
          label="Prenda en proveedor"
          name={`uid-${variant.id}`}
          onChange={(event) => setUid(event.target.value)}
          placeholder="CTP-GILDAN-M"
          value={uid}
        />
        <Input
          label="Archivo de impresion (URL)"
          name={`print-${variant.id}`}
          onChange={(event) => setPrintFile(event.target.value)}
          placeholder="https://..."
          value={printFile}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!dirty}
          isLoading={isSaving}
          leftIcon={<Check aria-hidden className="h-4 w-4" />}
          onClick={() => void save()}
          size="sm"
        >
          Guardar
        </Button>
        <Button
          onClick={() => void toggleActive()}
          size="sm"
          variant="secondary"
        >
          {variant.isActive ? "Retirar de venta" : "Poner a la venta"}
        </Button>
        <Button
          leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
          onClick={() => void remove()}
          size="sm"
          variant="ghost"
        >
          Borrar
        </Button>
      </div>
    </div>
  );
}

function NewVariantForm({
  onCreated,
  productId,
}: {
  onCreated: () => Promise<void>;
  productId: string;
}) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const priceCents = parseMoneyToCents(price);

    if (priceCents === null) {
      setError("Escribe un precio valido, por ejemplo 599.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await productsService.createVariant(productId, {
        color: color.trim() || undefined,
        // La etiqueta es lo que se congela en la venta y ve el comprador.
        label: [size.trim(), color.trim()].filter(Boolean).join(" / "),
        priceCents,
        size: size.trim() || undefined,
        sku: sku.trim(),
      });
      setSize("");
      setColor("");
      setSku("");
      setPrice("");
      await onCreated();
      toast.success("Variante anadida.", CUE.anadido);
    } catch (createError) {
      const message = getErrorText(createError, "No se pudo crear la variante.");
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="grid gap-3 border-t border-neutral-100 bg-neutral-50 px-4 py-4"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-medium text-neutral-800">Anadir variante</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <Input
          label="Talla"
          name="size"
          onChange={(event) => setSize(event.target.value)}
          placeholder="M"
          required
          value={size}
        />
        <Input
          label="Color"
          name="color"
          onChange={(event) => setColor(event.target.value)}
          placeholder="Negro"
          value={color}
        />
        <Input
          label="SKU"
          name="sku"
          onChange={(event) => setSku(event.target.value)}
          placeholder="KORI-TEE-BLK-M"
          required
          value={sku}
        />
        <Input
          inputMode="decimal"
          label="Precio (MXN)"
          name="price"
          onChange={(event) => setPrice(event.target.value)}
          placeholder="599"
          required
          value={price}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-700">{error}</p>
      ) : null}

      <div>
        <Button
          isLoading={isSaving}
          leftIcon={<Plus aria-hidden className="h-4 w-4" />}
          size="sm"
          type="submit"
        >
          Anadir
        </Button>
      </div>
    </form>
  );
}

export function VariantsEditor({
  onChanged,
  productId,
  variants,
}: {
  onChanged: () => Promise<void>;
  productId: string;
  variants: ProductVariant[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-950">
          Tallas y precios
        </h3>
        <p className="mt-1 text-xs text-neutral-600">
          Cada talla necesita su identificador de prenda y su archivo de
          impresion antes de poder publicar.
        </p>
      </div>

      {variants.map((variant) => (
        <VariantRow
          key={variant.id}
          onChanged={onChanged}
          productId={productId}
          variant={variant}
        />
      ))}

      <NewVariantForm onCreated={onChanged} productId={productId} />
    </Card>
  );
}

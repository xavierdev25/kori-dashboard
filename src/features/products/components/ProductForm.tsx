"use client";

import { Save } from "@/shared/components/icons";
import { FormEvent, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { parseMoneyToCents } from "@/features/products/utils/format-money";
import type { ProductInput } from "@/features/products/types/product.types";

/** Mismo formato que exige el backend y el CHECK de la base de datos. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Playera Kori" → "playera-kori". Quita acentos para no romper el patron. */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    // Marcas diacriticas: "Camiseta Otoño" no puede dejar una "ñ" en la URL.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  initial,
  onSubmit,
  showKind = false,
  submitLabel = "Guardar",
}: {
  initial?: Partial<ProductInput>;
  onSubmit: (input: ProductInput) => Promise<void>;
  /**
   * Solo al crear. Que es el producto se decide una vez y no se cambia
   * despues: un drumkit no se convierte en playera, y cambiarlo dejaria
   * variantes y archivos sin sentido.
   */
  showKind?: boolean;
  submitLabel?: string;
}) {
  const [kind, setKind] = useState<"DIGITAL" | "POD">("DIGITAL");
  const [price, setPrice] = useState("");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugError =
    slug && !SLUG_PATTERN.test(slug)
      ? "Solo minusculas, numeros y guiones simples."
      : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (slugError) {
      return;
    }

    // El precio se manda en centavos: el resto del sistema no ve decimales.
    const priceCents = kind === "DIGITAL" ? parseMoneyToCents(price) : null;

    if (showKind && kind === "DIGITAL" && priceCents === null) {
      setError("Escribe un precio valido, por ejemplo 20.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        description: description.trim() || undefined,
        name: name.trim(),
        slug: slug.trim(),
        ...(showKind
          ? {
              fulfillmentType: kind,
              type: kind === "DIGITAL" ? "DIGITAL" : "POD_APPAREL",
              ...(priceCents !== null ? { priceCents } : {}),
            }
          : {}),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {showKind ? (
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-neutral-800">
              Que vas a vender
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  {
                    hint: "Un archivo que se descarga tras pagar",
                    label: "Drumkit o preset",
                    value: "DIGITAL" as const,
                  },
                  {
                    hint: "Se imprime y se envia por correo",
                    label: "Merch (playera, gorra)",
                    value: "POD" as const,
                  },
                ]
              ).map((option) => (
                <label
                  className={`cursor-pointer rounded-md border p-3 text-sm transition ${
                    kind === option.value
                      ? "border-neutral-950 bg-neutral-50"
                      : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={kind === option.value}
                    className="sr-only"
                    name="kind"
                    onChange={() => setKind(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span className="block font-medium text-neutral-950">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <Input
          label="Nombre"
          name="name"
          onChange={(event) => {
            setName(event.target.value);

            // El slug se sugiere solo hasta que alguien lo edita a mano: si no,
            // cambiar el nombre de un producto ya publicado le romperia la URL.
            if (!slugTouched) {
              setSlug(slugify(event.target.value));
            }
          }}
          placeholder="Playera Kori"
          required
          value={name}
        />

        <Input
          error={slugError}
          label="Slug (la URL en la tienda)"
          name="slug"
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="playera-kori"
          required
          value={slug}
        />

        {showKind && kind === "DIGITAL" ? (
          <Input
            error={price && parseMoneyToCents(price) === null ? "Importe no valido" : undefined}
            hint="Un drumkit no tiene tallas: lleva un solo precio."
            inputMode="decimal"
            label="Precio (USD)"
            name="price"
            onChange={(event) => setPrice(event.target.value)}
            placeholder="20"
            required
            value={price}
          />
        ) : null}

        <label className="grid gap-2 text-sm font-medium text-neutral-800">
          <span>Descripcion</span>
          <textarea
            className="min-h-24 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Playera de algodon con estampado DTG. Impresa y enviada bajo pedido."
            value={description}
          />
        </label>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <Button
            isLoading={isSubmitting}
            leftIcon={<Save aria-hidden className="h-4 w-4" />}
            type="submit"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

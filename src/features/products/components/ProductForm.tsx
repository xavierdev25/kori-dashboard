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

/**
 * El merch esta apagado a proposito.
 *
 * El backend sabe producirlo desde hace tiempo —tipo POD_APPAREL, variantes con
 * talla y color, envio del pedido al proveedor— pero nadie ha dado de alta un
 * proveedor todavia, y un producto fisico sin eso se puede crear, publicar y
 * cobrar sin que haya forma de mandarselo a nadie.
 *
 * Se apaga aqui, en la eleccion, y no mas adentro: es el unico punto donde
 * alguien puede empezar ese camino. Cuando entre el merch, esto vuelve a
 * `true` y no hay nada mas que tocar.
 */
const MERCH_DISPONIBLE = false;

/**
 * Los ejemplos siguen a lo que se esta creando.
 *
 * Estaban fijos en playeras, asi que al elegir "Drumkit o preset" el
 * formulario proponia llamarlo "Playera Kori" y describirlo como algodon con
 * estampado DTG. Un ejemplo que contradice lo que acabas de elegir se lee como
 * un fallo de la pagina.
 */
const EJEMPLOS = {
  DIGITAL: {
    descripcion:
      'Drumkit de 40 samples: kicks, snares, hats y 808. WAV a 24 bits, libre de regalias.',
    nombre: 'Drumkit Diciembre',
    slug: 'drumkit-diciembre',
  },
  POD: {
    descripcion:
      'Playera de algodon con estampado DTG. Impresa y enviada bajo pedido.',
    nombre: 'Playera Kori',
    slug: 'playera-kori',
  },
} as const;

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
                    disponible: true,
                    hint: "Un archivo que se descarga tras pagar",
                    label: "Drumkit o preset",
                    value: "DIGITAL" as const,
                  },
                  {
                    disponible: MERCH_DISPONIBLE,
                    hint: "Se imprime y se envia por correo",
                    label: "Merch (playera, gorra)",
                    value: "POD" as const,
                  },
                ] as const
              ).map((option) => {
                const apagada = !option.disponible;

                return (
                  <label
                    className={`rounded-md border p-3 text-sm transition ${
                      apagada
                        ? "cursor-not-allowed border-dashed border-neutral-300 bg-neutral-50/60"
                        : kind === option.value
                          ? "cursor-pointer border-neutral-950 bg-neutral-50"
                          : "cursor-pointer border-neutral-300 hover:bg-neutral-50"
                    }`}
                    key={option.value}
                  >
                    {/* `disabled` de verdad y no solo estilo: asi no se puede
                        elegir ni con el teclado, y el navegador lo salta al
                        tabular en vez de dejarte llegar a algo inerte. */}
                    <input
                      checked={kind === option.value}
                      className="sr-only"
                      disabled={apagada}
                      name="kind"
                      onChange={() => setKind(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`font-medium ${
                          apagada ? "text-neutral-500" : "text-neutral-950"
                        }`}
                      >
                        {option.label}
                      </span>
                      {apagada ? (
                        <span className="rounded-full border border-neutral-300 px-1.5 py-px text-[11px] font-medium text-neutral-500">
                          Todavia no
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        apagada ? "text-neutral-500" : "text-neutral-600"
                      }`}
                    >
                      {apagada
                        ? "Falta dar de alta el proveedor que lo imprime. Por ahora solo se venden archivos."
                        : option.hint}
                    </span>
                  </label>
                );
              })}
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
          placeholder={EJEMPLOS[kind].nombre}
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
          placeholder={EJEMPLOS[kind].slug}
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
            placeholder={EJEMPLOS[kind].descripcion}
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

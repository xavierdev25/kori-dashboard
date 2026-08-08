"use client";

import Link from "next/link";
import { AlertTriangle, ImageOff } from "lucide-react";
import { formatMoney } from "@/features/products/utils/format-money";
import { getPriceRange, getReadiness } from "@/features/products/utils/readiness";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import type { ProductSummary } from "@/features/products/types/product.types";

function PrimaryThumb({ product }: { product: ProductSummary }) {
  const primary =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  if (!primary) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50">
        <ImageOff aria-hidden className="h-4 w-4 text-neutral-400" />
      </div>
    );
  }

  return (
    // <img> y no next/image: las fotos viven en Supabase Storage y configurar
    // remotePatterns por un thumbnail del panel no compensa.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={primary.altText ?? product.name}
      className="h-12 w-12 shrink-0 rounded-md border border-neutral-200 object-cover"
      src={primary.url}
    />
  );
}

function Price({ product }: { product: ProductSummary }) {
  const range = getPriceRange(product.variants);

  if (!range) {
    return <span className="text-neutral-400">sin variantes activas</span>;
  }

  return (
    <span className="text-neutral-700">
      {range.min === range.max
        ? formatMoney(range.min)
        : `${formatMoney(range.min)} – ${formatMoney(range.max)}`}
    </span>
  );
}

function Status({ product }: { product: ProductSummary }) {
  if (product.isActive) {
    return <Badge tone="green">Publicado</Badge>;
  }

  const { blockers } = getReadiness(product);

  return (
    <span className="flex flex-col gap-1">
      <Badge tone="neutral">Borrador</Badge>
      {blockers.length > 0 ? (
        <span
          className="inline-flex items-center gap-1 text-xs text-amber-700"
          title={blockers.join(" · ")}
        >
          <AlertTriangle aria-hidden className="h-3 w-3" />
          Falta {blockers.length === 1 ? "1 cosa" : `${blockers.length} cosas`}
        </span>
      ) : (
        <span className="text-xs text-emerald-700">Listo para publicar</span>
      )}
    </span>
  );
}

export function ProductsTable({ products }: { products: ProductSummary[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Variantes</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr className="hover:bg-neutral-50" key={product.id}>
                <td className="px-4 py-3">
                  <Link
                    className="flex items-center gap-3"
                    href={`/dashboard/products/${product.id}`}
                  >
                    <PrimaryThumb product={product} />
                    <span>
                      <span className="block font-medium text-neutral-950">
                        {product.name}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        /{product.slug}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Status product={product} />
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {product.variants.filter((variant) => variant.isActive).length}
                  <span className="text-neutral-400">
                    {" "}
                    / {product._count.variants}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Price product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

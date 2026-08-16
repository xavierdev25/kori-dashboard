export type ProductType = "POD_APPAREL" | "PHYSICAL_INVENTORY" | "DIGITAL";

export type FulfillmentType = "POD" | "INVENTORY" | "DIGITAL";

export interface ProductImage {
  altText: string | null;
  createdAt: string;
  id: string;
  isPrimary: boolean;
  sortOrder: number;
  url: string;
}

export interface ProductVariant {
  color: string | null;
  id: string;
  isActive: boolean;
  label: string;
  /** En centavos. Nunca dividir antes de mostrar sin pasar por formatMoney. */
  priceCents: number;
  printFileUrl: string | null;
  /** Peso del archivo de venta, para poder mostrarlo sin ir al almacen. */
  digitalAssetBytes: number | null;
  /** Ruta interna en el bucket privado. Nunca es una URL descargable. */
  digitalAssetPath: string | null;
  /** Identificador de la prenda en el proveedor de impresion. */
  providerProductUid: string | null;
  size: string | null;
  sku: string;
  sortOrder: number;
}

/** Variante tal como viaja en el listado: solo lo necesario para la tabla. */
export type VariantPreview = Pick<
  ProductVariant,
  | "digitalAssetPath"
  | "id"
  | "isActive"
  | "label"
  | "priceCents"
  | "printFileUrl"
  | "providerProductUid"
>;

export interface ProductSummary {
  _count: { variants: number };
  createdAt: string;
  description: string | null;
  fulfillmentType: FulfillmentType;
  id: string;
  images: ProductImage[];
  isActive: boolean;
  name: string;
  slug: string;
  type: ProductType;
  variants: VariantPreview[];
}

export interface ProductDetail
  extends Omit<ProductSummary, "_count" | "variants"> {
  variants: ProductVariant[];
}

export interface PaginatedProducts {
  data: ProductSummary[];
  meta: { limit: number; page: number; total: number; totalPages: number };
}

export interface ProductsQuery {
  isActive?: boolean;
  limit?: number;
  page?: number;
  search?: string;
}

export interface ProductInput {
  description?: string;
  fulfillmentType?: FulfillmentType;
  name: string;
  /**
   * Solo para productos digitales, y solo al crearlos: el backend genera con
   * el la variante unica. Un drumkit no tiene tallas que llevar precio.
   */
  priceCents?: number;
  slug: string;
  type?: ProductType;
}

export interface VariantInput {
  color?: string;
  isActive?: boolean;
  label: string;
  priceCents: number;
  printFileUrl?: string;
  providerProductUid?: string;
  size?: string;
  sku: string;
  sortOrder?: number;
}

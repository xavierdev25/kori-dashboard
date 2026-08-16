import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaginatedProducts,
  ProductDetail,
  ProductImage,
  ProductInput,
  ProductVariant,
  ProductsQuery,
  VariantInput,
} from "@/features/products/types/product.types";

function buildQuery(query: ProductsQuery) {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export const productsService = {
  createProduct(input: ProductInput) {
    return apiRequest<ProductDetail>("/admin/products", {
      body: input,
      method: "POST",
    });
  },

  createVariant(productId: string, input: VariantInput) {
    return apiRequest<ProductVariant>(`/admin/products/${productId}/variants`, {
      body: input,
      method: "POST",
    });
  },

  deleteImage(productId: string, imageId: string) {
    return apiRequest<{ deleted: boolean }>(
      `/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" },
    );
  },

  deleteVariant(productId: string, variantId: string) {
    return apiRequest<{ deleted: boolean }>(
      `/admin/products/${productId}/variants/${variantId}`,
      { method: "DELETE" },
    );
  },

  getProduct(id: string, signal?: AbortSignal) {
    return apiRequest<ProductDetail>(`/admin/products/${id}`, { signal });
  },

  getProducts(query: ProductsQuery = {}, signal?: AbortSignal) {
    return apiRequest<PaginatedProducts>(`/admin/products${buildQuery(query)}`, {
      signal,
    });
  },

  /** Lista completa de ids en el orden final tras arrastrar. */
  reorderImages(productId: string, imageIds: string[]) {
    return apiRequest<ProductImage[]>(
      `/admin/products/${productId}/images/order`,
      { body: { imageIds }, method: "PATCH" },
    );
  },

  setPrimaryImage(productId: string, imageId: string) {
    return apiRequest<ProductImage>(
      `/admin/products/${productId}/images/${imageId}`,
      { body: { isPrimary: true }, method: "PATCH" },
    );
  },

  updateProduct(id: string, input: Partial<ProductInput> & { isActive?: boolean }) {
    return apiRequest<ProductDetail>(`/admin/products/${id}`, {
      body: input,
      method: "PATCH",
    });
  },

  updateVariant(
    productId: string,
    variantId: string,
    input: Partial<VariantInput>,
  ) {
    return apiRequest<ProductVariant>(
      `/admin/products/${productId}/variants/${variantId}`,
      { body: input, method: "PATCH" },
    );
  },

  /**
   * La imagen viaja como multipart. No se le pone Content-Type a mano: el
   * navegador tiene que anadir el boundary o el backend no sabe parsearlo.
   */
  /**
   * Sube el archivo que se vende (drumkit, preset).
   *
   * Va al bucket privado, no al de imagenes: nunca debe quedar accesible por
   * URL publica. El backend responde con la variante ya actualizada.
   */
  uploadDigitalAsset(productId: string, variantId: string, file: File) {
    const form = new FormData();
    form.append("file", file);

    return apiRequest<ProductVariant>(
      `/admin/products/${productId}/variants/${variantId}/asset`,
      { body: form, method: "POST" },
    );
  },

  removeDigitalAsset(productId: string, variantId: string) {
    return apiRequest<ProductVariant>(
      `/admin/products/${productId}/variants/${variantId}/asset`,
      { method: "DELETE" },
    );
  },

  uploadImage(productId: string, file: File, altText?: string) {
    const form = new FormData();
    form.append("file", file);

    if (altText?.trim()) {
      form.append("altText", altText.trim());
    }

    return apiRequest<ProductImage>(`/admin/products/${productId}/images`, {
      body: form,
      method: "POST",
    });
  },
};

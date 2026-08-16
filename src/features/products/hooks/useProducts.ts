"use client";

import { useCallback } from "react";
import { productsService } from "@/features/products/services/products.service";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type {
  PaginatedProducts,
  ProductDetail,
  ProductsQuery,
} from "@/features/products/types/product.types";

const NO_PRODUCTS: PaginatedProducts = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

export function useProducts(query: ProductsQuery) {
  const { isActive, limit, page, search } = query;

  const load = useCallback(
    (signal: AbortSignal) =>
      productsService.getProducts({ isActive, limit, page, search }, signal),
    [isActive, limit, page, search],
  );

  const { data, error, loading, refresh } = useAsyncData(load, {
    fallbackMessage: "No se pudieron cargar los productos.",
    initialData: NO_PRODUCTS,
  });

  return { error, loading, meta: data.meta, products: data.data, refresh };
}

export function useProduct(id: string | null) {
  const load = useCallback(
    (signal: AbortSignal) =>
      id ? productsService.getProduct(id, signal) : Promise.resolve(null),
    [id],
  );

  const {
    data,
    error,
    loading,
    refresh,
    setData,
  } = useAsyncData<ProductDetail | null>(load, {
    enabled: Boolean(id),
    fallbackMessage: "No se pudo cargar el producto.",
    initialData: null,
  });

  return { error, loading, product: data, refresh, setProduct: setData };
}

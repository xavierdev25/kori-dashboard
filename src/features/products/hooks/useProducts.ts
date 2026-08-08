"use client";

import { useCallback, useEffect, useState } from "react";
import { productsService } from "@/features/products/services/products.service";
import { getErrorText } from "@/shared/lib/error-message";
import type {
  PaginatedProducts,
  ProductDetail,
  ProductsQuery,
  ProductSummary,
} from "@/features/products/types/product.types";

export function useProducts(query: ProductsQuery) {
  const { isActive, limit, page, search } = query;
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [meta, setMeta] = useState<PaginatedProducts["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const response = await productsService.getProducts({
        isActive,
        limit,
        page,
        search,
      });
      setProducts(response.data);
      setMeta(response.meta);
    } catch (requestError) {
      setError(
        getErrorText(requestError, "No se pudieron cargar los productos."),
      );
    } finally {
      setLoading(false);
    }
  }, [isActive, limit, page, search]);

  // Mismo patron que useNotes: el compilador de React 19 prohibe llamar a
  // setState de forma sincrona dentro de un efecto, y diferirlo un tick lo
  // saca del cuerpo del efecto.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  return { error, loading, meta, products, refresh: loadProducts };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const loadProduct = useCallback(async () => {
    if (!id) {
      return;
    }

    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setProduct(await productsService.getProduct(id));
    } catch (requestError) {
      setError(getErrorText(requestError, "No se pudo cargar el producto."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProduct();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProduct]);

  return { error, loading, product, refresh: loadProduct };
}

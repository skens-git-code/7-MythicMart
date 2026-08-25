/* Catalog hook backed by the API; empty/error states remain explicit. */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { normalizeProduct } from '../utils/assets';

const CACHE_TTL_MS = 60_000;
const productCache = new Map();

export const useProducts = (category = 'all', sort = 'newest', search = '', page = 1, limit = 12) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page, limit, total: 0, pages: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchProducts = useCallback(async () => {
    const cacheKey = JSON.stringify({ category, sort, search: debouncedSearch, page, limit });
    const cached = productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setProducts(cached.products);
      setPagination(cached.pagination);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);
      if (debouncedSearch) params.append('search', debouncedSearch);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await api.get(`/products?${params.toString()}`);
      const remoteProducts = Array.isArray(response?.data) ? response.data : [];
      if (!Array.isArray(response?.data)) {
        throw new Error('Catalog response was invalid');
      }

      const formatted = remoteProducts.map(normalizeProduct);
      const nextPagination = response.pagination || { page, limit, total: formatted.length, pages: formatted.length ? 1 : 0 };
      productCache.set(cacheKey, { products: formatted, pagination: nextPagination, timestamp: Date.now() });
      setProducts(formatted);
      setPagination(nextPagination);
    } catch (requestError) {
      setProducts([]);
      setPagination({ page, limit, total: 0, pages: 0 });
      setError(requestError?.error || requestError?.message || 'The product catalog is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [category, sort, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, pagination, refetch: fetchProducts };
};

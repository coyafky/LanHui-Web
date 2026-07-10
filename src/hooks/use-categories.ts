"use client";

import { useState, useEffect } from "react";
import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
import type { CategoryOption } from "@/components/admin/shared/types";

export const CATEGORIES_FALLBACK: CategoryOption[] = [
  { value: "产品资讯", label: "产品资讯" },
  { value: "施工案例", label: "施工案例" },
  { value: "公司动态", label: "公司动态" },
  { value: "行业新闻", label: "行业新闻" },
];

interface UseCategoriesResult {
  categories: CategoryOption[];
  loading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await adminCsrfFetch("/api/articles/categories");
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data?.categories)) {
          setCategories(json.data.categories);
          setError(null);
        } else {
          setCategories(CATEGORIES_FALLBACK);
          setError(json.error ?? "获取分类失败");
        }
      } catch (err) {
        if (cancelled) return;
        setCategories(CATEGORIES_FALLBACK);
        setError(err instanceof Error ? err.message : "获取分类失败");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}

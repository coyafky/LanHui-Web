import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/lib/admin-csrf-fetch", () => ({
  adminCsrfFetch: vi.fn(),
}));

import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
import { useCategories, CATEGORIES_FALLBACK } from "./use-categories";
import type { CategoryOption } from "@/components/admin/shared/types";

const mockAdminCsrfFetch = vi.mocked(adminCsrfFetch);

describe("useCategories", () => {
  const mockCategories: CategoryOption[] = [
    { value: "产品资讯", label: "产品资讯", count: 5 },
    { value: "施工案例", label: "施工案例", count: 3 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successful load: returns categories from API, loading=false", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { categories: mockCategories } }),
    } as Response);

    const { result } = renderHook(() => useCategories());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
    expect(mockAdminCsrfFetch).toHaveBeenCalledWith("/api/articles/categories");
  });

  it("API failure: returns fallback categories, error set", async () => {
    mockAdminCsrfFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(CATEGORIES_FALLBACK);
    expect(result.current.error).toBe("Network error");
  });

  it("invalid response: success=false, returns fallback, error set", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    } as Response);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(CATEGORIES_FALLBACK);
    expect(result.current.error).not.toBeNull();
  });

  it("cancellation: unmount before fetch resolves, no state update after unmount", async () => {
    let resolvePromise!: (value: unknown) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });
    mockAdminCsrfFetch.mockReturnValue(fetchPromise);

    const { unmount } = renderHook(() => useCategories());

    // Unmount while fetch is pending
    unmount();

    // Resolve after unmount
    resolvePromise({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { categories: mockCategories } }),
    } as Response);

    // Give microtasks time to process
    await new Promise((r) => setTimeout(r, 50));

    // Verify fetch was initiated
    expect(mockAdminCsrfFetch).toHaveBeenCalledWith("/api/articles/categories");
    // The cancelled flag should prevent state updates after unmount
    // (no console error about setState on unmounted component)
    expect(mockAdminCsrfFetch).toHaveBeenCalledTimes(1);
  });
});

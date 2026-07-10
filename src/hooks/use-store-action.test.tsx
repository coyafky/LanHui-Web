import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/admin-csrf-fetch", () => ({
  adminCsrfFetch: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
import { toast } from "sonner";
import { useStoreAction } from "./use-store-action";

const mockAdminCsrfFetch = vi.mocked(adminCsrfFetch);

describe("useStoreAction", () => {
  const storeId = "store-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("openAction", () => {
    it("sets actionOpen to the given action type", () => {
      const { result } = renderHook(() => useStoreAction(storeId));

      expect(result.current.actionOpen).toBeNull();

      act(() => {
        result.current.openAction("suspend");
      });

      expect(result.current.actionOpen).toBe("suspend");
    });

    it("clears previous actionError when opening a new action", () => {
      const { result } = renderHook(() => useStoreAction(storeId));

      act(() => {
        result.current.openAction("resume");
      });

      expect(result.current.actionOpen).toBe("resume");
      expect(result.current.actionError).toBeNull();
    });

    it("setActionError updates actionError state", () => {
      const { result } = renderHook(() => useStoreAction(storeId));

      act(() => {
        result.current.setActionError("请填写原因");
      });

      expect(result.current.actionError).toBe("请填写原因");
    });
  });

  describe("closeAction", () => {
    it("resets actionOpen to null, clears reason and error", () => {
      const { result } = renderHook(() => useStoreAction(storeId));

      act(() => {
        result.current.openAction("terminate");
        result.current.setStatusReason("test reason");
      });

      expect(result.current.actionOpen).toBe("terminate");
      expect(result.current.statusReason).toBe("test reason");

      act(() => {
        result.current.closeAction();
      });

      expect(result.current.actionOpen).toBeNull();
      expect(result.current.statusReason).toBe("");
      expect(result.current.actionError).toBeNull();
    });
  });

  describe("performAction", () => {
    it("successful POST: calls toast.success, onSuccess, and resets state", async () => {
      const onSuccess = vi.fn();
      mockAdminCsrfFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result } = renderHook(() =>
        useStoreAction(storeId, { onSuccess }),
      );

      await act(async () => {
        await result.current.performAction("publish");
      });

      expect(mockAdminCsrfFetch).toHaveBeenCalledWith(
        `/api/stores/${storeId}/publish`,
        expect.objectContaining({ method: "POST" }),
      );
      expect(toast.success).toHaveBeenCalledWith("操作成功");
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ action: "publish" }),
      );
      expect(result.current.actionOpen).toBeNull();
      expect(result.current.acting).toBe(false);
    });

    it("API failure: returns error, calls toast.error, sets actionError", async () => {
      mockAdminCsrfFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({ success: false, error: "Store not found" }),
      } as Response);

      const { result } = renderHook(() => useStoreAction(storeId));

      await act(async () => {
        await result.current.performAction("resume");
      });

      expect(toast.error).toHaveBeenCalledWith("Store not found");
      expect(result.current.actionError).toBe("Store not found");
      expect(result.current.acting).toBe(false);
    });

    it("network failure: fetch throws, calls toast.error, sets actionError", async () => {
      mockAdminCsrfFetch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useStoreAction(storeId));

      await act(async () => {
        await result.current.performAction("suspend");
      });

      expect(toast.error).toHaveBeenCalledWith("Network error");
      expect(result.current.actionError).toBe("Network error");
      expect(result.current.acting).toBe(false);
    });

    it("sends statusReason in request body when reason is provided", async () => {
      mockAdminCsrfFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result } = renderHook(() => useStoreAction(storeId));

      const reason = "违规经营";

      await act(async () => {
        await result.current.performAction("suspend", reason);
      });

      expect(mockAdminCsrfFetch).toHaveBeenCalledWith(
        `/api/stores/${storeId}/suspend`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ statusReason: reason }),
        }),
      );
    });

    it("onSuccess callback receives the correct result shape", async () => {
      const onSuccess = vi.fn();
      mockAdminCsrfFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { status: "suspended" },
          }),
      } as Response);

      const { result } = renderHook(() =>
        useStoreAction(storeId, { onSuccess }),
      );

      await act(async () => {
        await result.current.performAction("suspend");
      });

      expect(onSuccess).toHaveBeenCalledWith({
        action: "suspend",
        newStatus: "suspended",
      });
    });
  });
});

"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";

export type StoreAction = "open" | "close" | "suspend" | "terminate";

interface UseStoreActionOptions {
  onSuccess?: (result: { action: StoreAction; newStatus?: string }) => void;
}

interface UseStoreActionReturn {
  actionOpen: StoreAction | null;
  statusReason: string;
  acting: boolean;
  actionError: string | null;
  openAction: (action: StoreAction) => void;
  closeAction: () => void;
  setStatusReason: (v: string) => void;
  performAction: (action: StoreAction, reason?: string) => Promise<void>;
}

export function useStoreAction(
  storeId: string,
  options?: UseStoreActionOptions,
): UseStoreActionReturn {
  const [actionOpen, setActionOpen] = useState<StoreAction | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openAction = useCallback((action: StoreAction) => {
    setActionOpen(action);
    setActionError(null);
  }, []);

  const closeAction = useCallback(() => {
    setActionOpen(null);
    setStatusReason("");
    setActionError(null);
  }, []);

  const performAction = useCallback(
    async (action: StoreAction, reason?: string) => {
      setActing(true);
      setActionError(null);

      try {
        const body: Record<string, string> = {};
        if (reason !== undefined) {
          body.statusReason = reason;
        }

        const res = await adminCsrfFetch(
          `/api/stores/${storeId}/${action}`,
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        );

        const json = await res.json();

        if (res.ok && json.success) {
          toast.success("操作成功");
          options?.onSuccess?.({
            action,
            newStatus: json.data?.status as string | undefined,
          });
          closeAction();
        } else {
          const errorMsg = json.error ?? "操作失败";
          toast.error(errorMsg);
          setActionError(errorMsg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "操作失败";
        toast.error(errorMsg);
        setActionError(errorMsg);
      } finally {
        setActing(false);
      }
    },
    [storeId, options, closeAction],
  );

  return {
    actionOpen,
    statusReason,
    acting,
    actionError,
    openAction,
    closeAction,
    setStatusReason,
    performAction,
  };
}

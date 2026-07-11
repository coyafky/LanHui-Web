"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const CONFIRM_DIALOG_PROPS = {
  title: "有未保存的修改",
  description: "离开后当前编辑内容将丢失，确定离开吗？",
  confirmLabel: "离开页面",
  cancelLabel: "继续编辑",
  variant: "danger" as const,
};

export interface UnsavedGuardResult {
  confirmLeave: (next: () => void) => void;
  confirmDialogProps: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: "danger";
    onConfirm: () => Promise<void>;
    onCancel: () => void;
  };
}

export function useUnsavedChangesGuard(
  dirty: boolean,
  saving: boolean,
  navigate?: (href: string) => void,
): UnsavedGuardResult {
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingCallbackRef = useRef<(() => void) | null>(null);

  /* ---------- Layer 1: beforeunload ---------- */
  useEffect(() => {
    if (dirty && !saving) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [dirty, saving]);

  /* ---------- Layer 2: document click interception (capture phase) ---------- */
  useEffect(() => {
    if (!dirty || saving) return;

    const handleClick = (e: MouseEvent) => {
      /* Modifier keys: let through (new tab / new window) */
      if (e.metaKey || e.ctrlKey) return;

      const anchor = (e.target as Element).closest<HTMLAnchorElement>("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      /* Same-origin check */
      try {
        const linkUrl = new URL(href, window.location.origin);
        if (linkUrl.origin !== window.location.origin) return;
      } catch {
        return;
      }

      /* Intercept: prevent navigation and show dialog */
      e.preventDefault();
      pendingCallbackRef.current = () => {
        if (navigate) {
          navigate(href);
        } else {
          window.location.href = href;
        }
      };
      setDialogOpen(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dirty, saving]);

  /* ---------- Public API ---------- */
  const confirmLeave = useCallback((next: () => void) => {
    pendingCallbackRef.current = next;
    setDialogOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    setDialogOpen(false);
    cb?.();
  }, []);

  const handleCancel = useCallback(() => {
    pendingCallbackRef.current = null;
    setDialogOpen(false);
  }, []);

  return {
    confirmLeave,
    confirmDialogProps: {
      open: dialogOpen,
      ...CONFIRM_DIALOG_PROPS,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}

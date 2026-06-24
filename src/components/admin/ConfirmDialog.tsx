"use client";

import { useEffect, useRef, useState, useCallback, useId, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 默认（橙色）= 普通确认；danger = 红色 destructive 操作。 */
  variant?: "default" | "danger";
  /**
   * 可选的子内容（例如 statusReason 输入框）。子组件内仍可管理自己的 state，
   * ConfirmDialog 不会重置 children。
   */
  children?: ReactNode;
  /**
   * 若提供，则 ConfirmDialog 会在确认时调用之。
   * 异步函数：按钮显示 Loader2 并禁用，直到 promise resolve/reject。
   */
  onConfirm: () => Promise<void> | void;
  /** 取消回调（点遮罩 / Esc / 取消按钮都会触发）。 */
  onCancel: () => void;
  /** 点遮罩是否关闭。默认 true。 */
  dismissible?: boolean;
}

/**
 * 通用确认对话框。
 *
 * - aria-modal=true, role="alertdialog", aria-labelledby, aria-describedby
 * - Esc 关闭；点遮罩关闭（可关）
 * - 打开时聚焦到确认按钮；关闭后还原焦点
 * - onConfirm 异步时按钮显示 Loader2 + disabled
 * - variant="danger" 按钮红；默认橙色
 *
 * 不依赖 Base UI Dialog / Radix，纯 div + fixed inset-0 实现，
 * 与项目内现有 DeleteDialog 风格保持一致。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  variant = "default",
  children,
  onConfirm,
  onCancel,
  dismissible = true,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const descId = useId();

  /* ---------- Esc 关闭 ---------- */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissible && !submitting) {
        e.stopPropagation();
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, dismissible, submitting, onCancel]);

  /* ---------- focus 还原 + 初始聚焦到确认按钮 ---------- */
  useEffect(() => {
    if (open) {
      previousActiveElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // 下一帧再 focus，避免与 children 初始化抢焦点
      const t = setTimeout(() => confirmButtonRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      previousActiveElementRef.current?.focus?.();
    }
  }, [open]);

  /* ---------- 重置 submitting（关闭时） ---------- */
  useEffect(() => {
    if (!open) setSubmitting(false);
  }, [open]);

  /* ---------- 简单 focus trap（Tab/Shift+Tab 困在 dialog 内） ---------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    []
  );

  if (!open) return null;

  async function handleConfirm() {
    if (submitting) return;
    try {
      setSubmitting(true);
      await onConfirm();
    } catch {
      // 调用方负责错误展示
    } finally {
      setSubmitting(false);
    }
  }

  const confirmClasses =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 focus-visible:outline-red-500"
      : "bg-orange-500 hover:bg-orange-600 focus-visible:outline-orange-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={() => {
        if (dismissible && !submitting) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="mx-4 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <h3
          id={titleId}
          className="text-lg font-semibold text-zinc-100"
        >
          {title}
        </h3>
        {description && (
          <div
            id={descId}
            className="mt-2 text-sm text-zinc-400"
          >
            {description}
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
              confirmClasses
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

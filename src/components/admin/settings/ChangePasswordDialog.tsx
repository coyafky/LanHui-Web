"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Lock, Eye, EyeOff } from "lucide-react";
import {
  ChangePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/settings";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

export function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  /* ---------- Reset form when dialog opens/closes ---------- */
  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
      setToast(null);
    }
  }, [open, reset]);

  /* ---------- Submit ---------- */
  async function onSubmit(data: ChangePasswordInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setServerError(json.error ?? "修改失败");
        return;
      }
      setToast("密码已更新，请下次登录使用新密码");
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (e) {
      console.error("[ChangePasswordDialog] submit", e);
      setServerError("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cp-title"
    >
      <div className="mx-4 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <h3 id="cp-title" className="text-lg font-semibold text-zinc-100">
            修改密码
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {toast ? (
          <div
            role="status"
            className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
          >
            {toast}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {serverError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <Lock className="h-4 w-4 text-zinc-500" />
                当前密码 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("currentPassword")}
                  type={showCurrent ? "text" : "password"}
                  placeholder="请输入当前密码"
                  className={cn(inputClasses, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  aria-label={showCurrent ? "隐藏密码" : "显示密码"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <Lock className="h-4 w-4 text-zinc-500" />
                新密码 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="至少 8 个字符"
                  className={cn(inputClasses, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  aria-label={showNew ? "隐藏密码" : "显示密码"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <Lock className="h-4 w-4 text-zinc-500" />
                确认新密码 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="再次输入新密码"
                  className={cn(inputClasses, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "隐藏密码" : "显示密码"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                确认修改
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

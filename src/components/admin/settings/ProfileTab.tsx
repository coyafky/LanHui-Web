"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Save, KeyRound, Mail, ShieldCheck, User, UserCog, Clock } from "lucide-react";
import {
  ProfileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/settings";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { cn } from "@/lib/utils";

interface ProfileData {
  id: string;
  username: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const inputClasses =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

export function ProfileTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: { name: "", username: "" },
  });

  /* ---------- Load profile ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings/profile");
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          const p = json.data as ProfileData;
          setProfile(p);
          reset({ name: p.name ?? "", username: p.username });
        } else {
          setFormError(json.error ?? "加载失败");
        }
      } catch (e) {
        if (!cancelled) setFormError("网络错误");
        console.error("[ProfileTab] load", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  /* ---------- Submit ---------- */
  async function onSubmit(data: ProfileUpdateInput) {
    setSubmitting(true);
    setFormError(null);
    setToast(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.details) {
          for (const [key, msgs] of Object.entries(json.details)) {
            const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
            setError(key as keyof ProfileUpdateInput, { message });
          }
        } else {
          setFormError(json.error ?? "保存失败");
        }
        return;
      }
      const p = json.data as ProfileData;
      setProfile(p);
      reset({ name: p.name ?? "", username: p.username });
      setToast({ kind: "ok", msg: "已保存" });
      router.refresh();
    } catch (e) {
      console.error("[ProfileTab] submit", e);
      setFormError("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
        <div className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          className={cn(
            "rounded-lg border px-4 py-2.5 text-sm",
            toast.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          )}
        >
          {toast.msg}
        </div>
      )}

      {formError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Editable fields ── */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">可修改信息</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <User className="h-4 w-4 text-zinc-500" />
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="请输入姓名"
                className={inputClasses}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <UserCog className="h-4 w-4 text-zinc-500" />
                用户名 <span className="text-red-400">*</span>
              </label>
              <input
                {...register("username")}
                placeholder="字母、数字、下划线、连字符"
                className={inputClasses}
              />
              {errors.username && (
                <p className="text-sm text-red-400">{errors.username.message}</p>
              )}
              <p className="text-xs text-zinc-500">修改后下次登录生效</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting || !isDirty}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存修改
            </button>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <KeyRound className="h-4 w-4" />
              修改密码
            </button>
          </div>
        </section>

        {/* ── Read-only info ── */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">只读信息</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">邮箱</dt>
                <dd className="mt-0.5 text-sm text-zinc-200">{profile?.email ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">角色</dt>
                <dd className="mt-0.5 text-sm text-zinc-200">{profile?.role ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">状态</dt>
                <dd className="mt-0.5 text-sm text-zinc-200">{profile?.status ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">注册时间</dt>
                <dd className="mt-0.5 text-sm text-zinc-200">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleString("zh-CN")
                    : "—"}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      </form>

      <ChangePasswordDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

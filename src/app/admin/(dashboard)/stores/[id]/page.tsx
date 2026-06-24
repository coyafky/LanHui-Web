"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { StoreForm, type StoreFormValues } from "@/components/admin/StoreForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  Pencil,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronLeft,
  Check,
  XCircle,
  Pause,
  Play,
  Ban,
} from "lucide-react";
import {
  STORE_LEVELS,
  STORE_LEVEL_LABELS,
  STORE_LEVEL_SORT_WEIGHTS,
  STORE_STATUS_LABELS,
  type StoreLevel,
  type StoreStatus,
} from "@/lib/validations/store";
import {
  ACTION_TARGET,
  availableActionsFor,
  type StoreAction,
} from "@/lib/validations/store-transitions";
import { cn } from "@/lib/utils";

interface PublishCheck {
  key: string;
  label: string;
  ok: boolean;
  hint?: string;
}

const LEVEL_BADGE_CLASS: Record<StoreLevel, string> = {
  flagship: "border-amber-600/60 bg-amber-500/10 text-amber-400",
  premium: "border-blue-600/60 bg-blue-500/10 text-blue-400",
  specialty: "border-cyan-600/60 bg-cyan-500/10 text-cyan-400",
  member: "border-zinc-600 bg-zinc-700/40 text-zinc-300",
};

const STATUS_BADGE_CLASS: Record<StoreStatus, string> = {
  pending: "border border-amber-600/60 bg-amber-500/10 text-amber-400",
  active: "border border-emerald-600/60 bg-emerald-500/10 text-emerald-400",
  suspended: "border border-blue-600/60 bg-blue-500/10 text-blue-400",
  terminated: "border border-zinc-600 bg-zinc-700/40 text-zinc-500",
};

const ACTION_ICON: Record<StoreAction, React.ComponentType<{ className?: string }>> = {
  publish: Check,
  suspend: Pause,
  resume: Play,
  terminate: Ban,
};

export default function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [storeData, setStoreData] = useState<StoreFormValues | null>(null);
  const [storeLevel, setStoreLevel] = useState<StoreLevel | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 状态机动作 dialog
  const [actionOpen, setActionOpen] = useState<StoreAction | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function performStatusAction(action: StoreAction, reason?: string) {
    setActing(true);
    setActionError(null);
    try {
      const needReason = action === "suspend" || action === "terminate";
      const res = await fetch(`/api/stores/${id}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          needReason && reason ? { statusReason: reason.trim() } : {}
        ),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { status: StoreStatus };
        error?: string;
        details?: Record<string, string[]>;
      };
      if (!json.success) {
        const detailsMsg = json.details
          ? Object.values(json.details).flat().join("；")
          : "";
        setActionError(json.error || detailsMsg || "操作失败");
        return;
      }
      if (json.data?.status) {
        setStoreStatus(json.data.status);
        if (storeData) {
          setStoreData({
            ...storeData,
            status: json.data.status,
            isActive: json.data.status === "active",
          });
        }
      }
      setActionOpen(null);
      setStatusReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setActing(false);
    }
  }

  useEffect(() => {
    fetch(`/api/stores/${id}?all=true`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const d = json.data;
          // Map API response to form values
          setStoreData({
            slug: d.slug ?? "",
            name: d.name ?? "",
            provinceSlug: d.provinceSlug ?? "",
            provinceLabel: d.provinceLabel ?? "",
            citySlug: d.citySlug ?? "",
            cityLabel: d.cityLabel ?? "",
            district: d.district ?? "",
            address: d.address ?? "",
            phone: d.phone ?? "",
            phoneTel: d.phoneTel ?? "",
            businessHours: d.businessHours ?? "",
            description: d.description ?? "",
            isActive: d.isActive ?? true,
            level: d.level ?? undefined,
          });
          setStoreLevel((d.level ?? null) as StoreLevel | null);
          setStoreSlug(d.slug ?? null);
          setStoreStatus((d.status ?? null) as StoreStatus | null);
        } else {
          setError(json.error ?? "门店不存在");
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: StoreFormValues) {
    const res = await fetch(`/api/stores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      const msg = json.details
        ? Object.values(json.details as Record<string, string[]>)
            .flat()
            .join("；")
        : json.error;
      throw new Error(msg ?? "保存失败");
    }
    // 同步本地最新 level/slug 给右侧栏显示
    if (data.level) setStoreLevel(data.level);
    if (data.slug) setStoreSlug(data.slug);
  }

  /* ---------- Publish readiness checklist ---------- */
  const publishChecks = useMemo<PublishCheck[]>(() => {
    if (!storeData) return [];
    return [
      {
        key: "name",
        label: "门店名称",
        ok: !!storeData.name && storeData.name.trim().length > 0,
      },
      {
        key: "region",
        label: "省份与城市",
        ok: !!storeData.provinceSlug && !!storeData.citySlug,
      },
      {
        key: "address",
        label: "详细地址",
        ok: !!storeData.address && storeData.address.trim().length > 0,
      },
      {
        key: "phone",
        label: "联系电话",
        ok: !!storeData.phone && storeData.phone.trim().length > 0,
      },
      {
        key: "level",
        label: "门店等级",
        ok: !!storeLevel,
        hint: !storeLevel
          ? "发布前必填；在「等级与状态」一栏选择"
          : undefined,
      },
      {
        key: "image",
        label: "门店图片",
        ok: !!storeData.imagePath,
        hint: !storeData.imagePath
          ? "建议上传；缺失时仍可发布"
          : undefined,
      },
    ];
  }, [storeData, storeLevel]);

  const canPublish = publishChecks
    .filter((c) => c.key !== "image")
    .every((c) => c.ok);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/stores"
              aria-label="返回门店列表"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              返回
            </Link>
            <Pencil className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-zinc-100">编辑门店</h1>
            {storeStatus && (
              <span
                aria-label={`当前状态：${STORE_STATUS_LABELS[storeStatus]}`}
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  STATUS_BADGE_CLASS[storeStatus]
                )}
              >
                {STORE_STATUS_LABELS[storeStatus]}
              </span>
            )}
          </div>

          {/* 状态机动作按钮组 */}
          {storeStatus && storeStatus !== "terminated" && (
            <div className="flex flex-wrap items-center gap-2">
              {availableActionsFor(storeStatus).map((action) => {
                const target = ACTION_TARGET[action];
                const Icon = ACTION_ICON[action];
                const isDanger = target.destructive;
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setStatusReason("");
                      setActionOpen(action);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      isDanger
                        ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "border border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {target.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {storeStatus === "terminated" && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400"
          >
            <XCircle className="mr-1 inline h-4 w-4 text-zinc-500" />
            该门店已终止合作，仅供查看，不可编辑。
          </div>
        )}

        {storeData && (
          <StoreForm
            defaultValues={storeData}
            onSubmit={handleSubmit}
            submitLabel="保存修改"
            readOnly={storeStatus === "terminated"}
          />
        )}

        {/* 状态机动作 ConfirmDialog */}
        {actionOpen && (
          <ConfirmDialog
            open={!!actionOpen}
            title={ACTION_TARGET[actionOpen].label}
            description={
              actionOpen === "publish"
                ? "确认将该门店发布为营业中？发布后将出现在前台列表与可预约门店列表。"
                : actionOpen === "suspend"
                  ? "确认暂停该门店的合作？前台将不再展示该门店。门店资料会保留，可在恢复后再次上架。"
                  : actionOpen === "resume"
                    ? "确认将该门店恢复为营业中？"
                    : "确认终止该门店的合作？终止后该门店进入只读状态，不可再恢复。"
            }
            confirmLabel={ACTION_TARGET[actionOpen].label}
            variant={
              ACTION_TARGET[actionOpen].destructive ? "danger" : "default"
            }
            onConfirm={async () => {
              const needReason =
                actionOpen === "suspend" || actionOpen === "terminate";
              if (needReason && !statusReason.trim()) {
                setActionError("请填写原因");
                return;
              }
              await performStatusAction(actionOpen, statusReason);
            }}
            onCancel={() => {
              if (acting) return;
              setActionOpen(null);
              setStatusReason("");
              setActionError(null);
            }}
          >
            {(actionOpen === "suspend" || actionOpen === "terminate") && (
              <div>
                <label
                  htmlFor="statusReason"
                  className="block text-sm font-medium text-zinc-300"
                >
                  原因 <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="statusReason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                  placeholder="请填写..."
                  className="mt-1 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}
            {actionError && (
              <p
                role="alert"
                className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400"
              >
                {actionError}
              </p>
            )}
          </ConfirmDialog>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        {/* Current level card */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Award className="h-4 w-4 text-orange-500" />
            门店等级
          </h2>
          {storeLevel ? (
            <div className="flex items-center gap-2">
              <span
                aria-label={`当前等级 ${STORE_LEVEL_LABELS[storeLevel]}`}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                  LEVEL_BADGE_CLASS[storeLevel]
                )}
              >
                {STORE_LEVEL_LABELS[storeLevel]}
              </span>
              <span className="text-xs text-zinc-500">
                权重 {STORE_LEVEL_SORT_WEIGHTS[storeLevel]}
              </span>
            </div>
          ) : (
            <p className="text-sm text-amber-400">尚未设置等级</p>
          )}
        </section>

        {/* Slug card (system-managed, read-only) */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-100">URL 标识</h2>
          <code className="block break-all rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300">
            {storeSlug || "(系统将自动生成)"}
          </code>
          <p className="mt-2 text-xs text-zinc-500">
            系统在门店创建或重命名时自动生成 slug。
          </p>
        </section>

        {/* Publish readiness checklist */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-zinc-100">
            <span>发布检查</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                canPublish
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              )}
            >
              {canPublish ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  已就绪
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  待补全
                </>
              )}
            </span>
          </h2>
          <ul className="space-y-2">
            {publishChecks.map((c) => (
              <li key={c.key} className="flex items-start gap-2 text-xs">
                {c.ok ? (
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                    aria-hidden
                  />
                ) : (
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      c.key === "level"
                        ? "text-red-400"
                        : "text-amber-400"
                    )}
                    aria-hidden
                  />
                )}
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium",
                      c.ok ? "text-zinc-300" : "text-zinc-100"
                    )}
                  >
                    {c.label}
                  </p>
                  {c.hint && (
                    <p className="mt-0.5 text-zinc-500">{c.hint}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Status card (4 态 + 审计) */}
        {storeStatus && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">
              当前状态
            </h2>
            <div className="flex items-center gap-2">
              <span
                aria-label={`状态：${STORE_STATUS_LABELS[storeStatus]}`}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                  STATUS_BADGE_CLASS[storeStatus]
                )}
              >
                {STORE_STATUS_LABELS[storeStatus]}
              </span>
            </div>
            {storeData && (
              <p className="mt-3 text-xs text-zinc-500">
                兼容字段 <code className="rounded bg-zinc-800 px-1 text-zinc-300">isActive</code>：
                <span className="ml-1 font-mono text-zinc-200">
                  {String(storeData.isActive)}
                </span>
              </p>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}

// 导出等级权重常量供潜在 UI 排序复用
export { STORE_LEVELS };

"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Save,
  Loader2,
  MapPin,
  Phone,
  Clock,
  Image as ImageIcon,
  FileText,
  Eye,
  Award,
} from "lucide-react";
import { z } from "zod";
import { StoreCreateSchema } from "@/lib/validations/store";
import {
  STORE_LEVELS,
  STORE_LEVEL_LABELS,
  type StoreLevel,
} from "@/lib/validations/store";
import { cn } from "@/lib/utils";
import {
  RegionSelector,
  type RegionValue,
  type RegionLoadState,
} from "@/components/admin/RegionSelector";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StoreFormValues = z.infer<typeof StoreCreateSchema>;

interface StoreFormProps {
  defaultValues?: Partial<StoreFormValues>;
  /**
   * 提交回调。StoreForm 在成功后统一跳转到列表页 /admin/stores。
   * 抛错时 StoreForm 捕获并在顶部 alert 展示错误信息。
   */
  onSubmit: (data: StoreFormValues) => Promise<void>;
  submitLabel?: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Level badge color mapping                                          */
/* ------------------------------------------------------------------ */

const LEVEL_BADGE_CLASS: Record<StoreLevel, string> = {
  flagship:
    "border-amber-600/60 bg-amber-500/10 text-amber-400",
  premium:
    "border-blue-600/60 bg-blue-500/10 text-blue-400",
  specialty:
    "border-cyan-600/60 bg-cyan-500/10 text-cyan-400",
  member:
    "border-zinc-600 bg-zinc-700/40 text-zinc-300",
};

/* ------------------------------------------------------------------ */
/*  Form Field Wrapper                                                 */
/* ------------------------------------------------------------------ */

function FieldWrapper({
  label,
  icon: Icon,
  error,
  children,
  required,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
        <Icon className="h-4 w-4 text-zinc-500" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StoreForm                                                          */
/* ------------------------------------------------------------------ */

export function StoreForm({
  defaultValues,
  onSubmit,
  submitLabel = "保存",
  showDelete = false,
  onDelete,
}: StoreFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [regionLoadState, setRegionLoadState] = useState<RegionLoadState>({
    loading: true,
    error: null,
  });

  // Region state (province/city managed by RegionSelector)
  const [regionValue, setRegionValue] = useState<RegionValue>({
    provinceSlug: defaultValues?.provinceSlug ?? "",
    provinceLabel: defaultValues?.provinceLabel ?? "",
    citySlug: defaultValues?.citySlug ?? "",
    cityLabel: defaultValues?.cityLabel ?? "",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoreFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(StoreCreateSchema) as any,
    defaultValues: {
      slug: "",
      name: "",
      provinceSlug: "",
      provinceLabel: "",
      citySlug: "",
      cityLabel: "",
      district: "",
      address: "",
      phone: "",
      phoneTel: "",
      businessHours: "",
      description: "",
      isActive: true,
      level: undefined,
      ...defaultValues,
    },
  });

  const watchedPhone = watch("phone");
  const watchedLevel = watch("level");
  const watchedIsActive = watch("isActive");

  /* ---------- Auto-generate phoneTel from phone ---------- */
  useEffect(() => {
    if (watchedPhone) {
      const digits = watchedPhone.replace(/\D/g, "");
      setValue("phoneTel", `tel:${digits}`);
    }
  }, [watchedPhone, setValue]);

  /* ---------- Region change handler ---------- */
  function handleRegionChange(rv: RegionValue) {
    setRegionValue(rv);
    setValue("provinceSlug", rv.provinceSlug);
    setValue("provinceLabel", rv.provinceLabel);
    setValue("citySlug", rv.citySlug);
    setValue("cityLabel", rv.cityLabel);
  }

  /* ---------- Region load state handler ---------- */
  const handleRegionLoadStateChange = useCallback((state: RegionLoadState) => {
    setRegionLoadState(state);
  }, []);

  /* ---------- Submit handler ---------- */
  async function handleFormSubmit(data: StoreFormValues) {
    setSubmitError(null);
    setSubmitSuccess(null);

    // 发布前置校验（PRD §16 D1）：从 pending → active 必须设置 level
    const wantsPublish = data.isActive === true && !data.status;
    if (wantsPublish && !data.level) {
      setSubmitError(
        "发布前请先选择门店等级(星辉旗舰店 / 星耀尊享店 / 星辰专营店 / 星光会员店)"
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(data);
      setSubmitSuccess("门店创建成功");
      setTimeout(() => {
        router.push("/admin/stores");
      }, 600);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "创建失败，请稍后重试或联系管理员";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Delete handler ---------- */
  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      router.push("/admin/stores");
    } catch {
      // Error handled by caller
    } finally {
      setDeleting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

  // Submit button disabled when region load fails or while submitting
  const submitDisabled =
    submitting || regionLoadState.error !== null;

  const submitTitle = regionLoadState.error
    ? "省份/城市加载失败，请刷新或重试"
    : undefined;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* ── Top-level alerts ── */}
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div
          role="status"
          className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          {submitSuccess}
        </div>
      )}

      {/* ── Basic Info ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">基本信息</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <FieldWrapper
            label="门店名称"
            icon={MapPin}
            required
            error={errors.name?.message}
          >
            <input
              {...register("name")}
              placeholder="例：蓝辉轻改顺德大良店"
              className={inputClasses}
            />
          </FieldWrapper>

          {/* Slug: 系统自动生成，不再展示在表单中 */}
          <input type="hidden" {...register("slug")} />

          {/* Province / City via RegionSelector */}
          <RegionSelector
            value={regionValue}
            onChange={handleRegionChange}
            error={errors.provinceSlug?.message || errors.citySlug?.message}
            onLoadStateChange={handleRegionLoadStateChange}
          />

          {/* District */}
          <FieldWrapper label="区域" icon={MapPin} error={errors.district?.message}>
            <input
              {...register("district")}
              placeholder="例：顺德大良"
              className={inputClasses}
            />
          </FieldWrapper>

          {/* Address */}
          <FieldWrapper
            label="详细地址"
            icon={MapPin}
            required
            error={errors.address?.message}
          >
            <input
              {...register("address")}
              placeholder="例：广东省佛山市顺德区大良街道..."
              className={inputClasses}
            />
          </FieldWrapper>
        </div>
      </section>

      {/* ── Level & Status ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          等级与状态
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Level Select */}
          <FieldWrapper
            label="门店等级"
            icon={Award}
            error={errors.level?.message}
          >
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : (e.target.value as StoreLevel)
                    )
                  }
                  onBlur={field.onBlur}
                  ref={field.ref}
                  aria-label="选择门店等级"
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">暂不设置（待发布）</option>
                  {STORE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {STORE_LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              )}
            />
            <p className="mt-1 text-xs text-zinc-500">
              发布（设为营业中）前必须选择门店等级。
            </p>
            {watchedLevel && (
              <span
                aria-live="polite"
                className={cn(
                  "mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  LEVEL_BADGE_CLASS[watchedLevel]
                )}
              >
                {STORE_LEVEL_LABELS[watchedLevel]}
              </span>
            )}
          </FieldWrapper>

          {/* isActive Select */}
          <FieldWrapper
            label="营业状态"
            icon={Eye}
            error={errors.isActive?.message}
          >
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <select
                  value={String(field.value ?? true)}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                >
                  <option value="true">营业中</option>
                  <option value="false">下架</option>
                </select>
              )}
            />
            <p className="mt-1 text-xs text-zinc-500">
              选择「下架」后，前台 <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">/api/stores</code> 将不再返回该门店，但后台列表仍可见。
            </p>
            {watchedIsActive && !watchedLevel && (
              <p
                role="alert"
                className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-400"
              >
                提示：未选择门店等级，发布动作将被阻断。
              </p>
            )}
          </FieldWrapper>
        </div>
      </section>

      {/* ── Contact & Hours ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">联系方式</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Phone */}
          <FieldWrapper
            label="联系电话"
            icon={Phone}
            required
            error={errors.phone?.message}
          >
            <input
              {...register("phone")}
              type="tel"
              placeholder="例：0757-2288 1001"
              className={inputClasses}
            />
          </FieldWrapper>

          {/* Business Hours */}
          <FieldWrapper
            label="营业时间"
            icon={Clock}
            error={errors.businessHours?.message}
          >
            <input
              {...register("businessHours")}
              placeholder="例：09:00-18:00"
              className={inputClasses}
            />
          </FieldWrapper>
        </div>
        {/* phoneTel auto-generated, hidden */}
        <input type="hidden" {...register("phoneTel")} />
      </section>

      {/* ── Description & Image ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">描述与图片</h2>
        <div className="space-y-5">
          {/* Description */}
          <FieldWrapper
            label="门店描述"
            icon={FileText}
            error={errors.description?.message}
          >
            <textarea
              {...register("description")}
              rows={3}
              placeholder="门店描述..."
              className={cn(inputClasses, "resize-none")}
            />
          </FieldWrapper>

          {/* imagePath 只读展示，由图片管理页面上传/修改 */}
          {defaultValues?.imagePath ? (
            <FieldWrapper
              label="已上传门店图片"
              icon={ImageIcon}
            >
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300">
                <code className="text-xs text-zinc-400">{defaultValues.imagePath}</code>
                <p className="mt-1 text-xs text-zinc-500">
                  可在「门店图片管理」页面替换或删除
                </p>
              </div>
            </FieldWrapper>
          ) : (
            <FieldWrapper
              label="门店图片"
              icon={ImageIcon}
            >
              <p className="text-xs text-zinc-500">
                请在「门店图片管理」页面上传真实门店图。
              </p>
            </FieldWrapper>
          )}
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Link
            href="/admin/stores"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={submitDisabled}
            title={submitTitle}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            )}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitLabel}
          </button>
        </div>

        {showDelete && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            停用门店
          </button>
        )}
      </div>
    </form>
  );
}

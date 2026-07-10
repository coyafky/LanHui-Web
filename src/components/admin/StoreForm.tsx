"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { X, Save, Loader2 } from "lucide-react";
import { z } from "zod";
import { StoreCreateSchema } from "@/lib/validations/store";
import type { StoreLevel, StoreStatus } from "@/lib/validations/store";
import { cn } from "@/lib/utils";
import type { RegionValue, RegionLoadState } from "@/components/admin/RegionSelector";
import { BasicInfoFields } from "@/components/admin/stores/BasicInfoFields";
import { LevelStatusFields } from "@/components/admin/stores/LevelStatusFields";
import { ContactFields } from "@/components/admin/stores/ContactFields";
import { DescriptionImageFields } from "@/components/admin/stores/DescriptionImageFields";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StoreFormValues = z.infer<typeof StoreCreateSchema>;

interface StoreFormProps {
  defaultValues?: Partial<StoreFormValues>;
  formId?: string;
  onSubmit: (data: StoreFormValues) => Promise<void>;
  submitLabel?: string;
  submitSuccessLabel?: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
  readOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  StoreForm                                                          */
/* ------------------------------------------------------------------ */

export function StoreForm({
  defaultValues,
  formId,
  onSubmit,
  submitLabel = "保存",
  submitSuccessLabel = "保存成功",
  showDelete = false,
  onDelete,
  readOnly = false,
}: StoreFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
  const watchedStatus = watch("status");

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

    const wantsPublish = data.status === "active" && !data.level;
    if (wantsPublish) {
      setSubmitError(
        "发布前请先选择门店等级(星辉旗舰店 / 星耀尊享店 / 星辰专营店 / 星光会员店)"
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(submitSuccessLabel);
      setTimeout(() => {
        router.push("/admin/stores");
      }, 600);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "创建失败，请稍后重试或联系管理员";
      setSubmitError(msg);
      toast.error(msg);
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

  const submitDisabled =
    submitting || regionLoadState.error !== null || readOnly;

  const submitTitle = regionLoadState.error
    ? "省份/城市加载失败，请刷新或重试"
    : undefined;

  return (
    <fieldset disabled={readOnly} className="space-y-8">
      <form
        id={formId}
        onSubmit={(e) => {
          if (readOnly) {
            e.preventDefault();
            return;
          }
          void handleSubmit(handleFormSubmit)(e);
        }}
        className="space-y-8"
      >
      {/* ── Top-level alerts ── */}
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {submitError}
        </div>
      )}

      <BasicInfoFields
        register={register}
        errors={errors}
        regionValue={regionValue}
        onRegionChange={handleRegionChange}
        onRegionLoadStateChange={handleRegionLoadStateChange}
        inputClasses={inputClasses}
      />

      <LevelStatusFields
        control={control}
        register={register}
        setValue={setValue}
        errors={errors}
        watchedLevel={watchedLevel as StoreLevel | undefined}
        watchedStatus={watchedStatus as StoreStatus | undefined}
      />

      <ContactFields
        register={register}
        errors={errors}
        inputClasses={inputClasses}
      />

      <DescriptionImageFields
        register={register}
        errors={errors}
        imagePath={defaultValues?.imagePath ?? undefined}
        inputClasses={inputClasses}
      />

      {/* ── Actions ── */}
      {!readOnly && (
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
      )}
      </form>
    </fieldset>
  );
}

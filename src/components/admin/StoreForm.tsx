"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
} from "lucide-react";
import { z } from "zod";
import { StoreCreateSchema } from "@/lib/validations/store";
import { cn } from "@/lib/utils";
import { RegionSelector } from "@/components/admin/RegionSelector";
import type { RegionValue } from "@/components/admin/RegionSelector";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StoreFormValues = z.infer<typeof StoreCreateSchema>;

interface StoreFormProps {
  defaultValues?: Partial<StoreFormValues>;
  onSubmit: (data: StoreFormValues) => Promise<void>;
  submitLabel?: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
}

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
      imageUrl: "",
      ...defaultValues,
    },
  });

  const watchedPhone = watch("phone");

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

  /* ---------- Submit handler ---------- */
  async function handleFormSubmit(data: StoreFormValues) {
    setSubmitting(true);
    try {
      await onSubmit(data);
      router.push("/admin/stores");
    } catch {
      // Error handled by caller
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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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

          {/* Slug */}
          <FieldWrapper
            label="URL标识 (slug)"
            icon={FileText}
            required
            error={errors.slug?.message}
          >
            <input
              {...register("slug")}
              placeholder="例：shunde-daliang"
              className={inputClasses}
            />
          </FieldWrapper>

          {/* Province / City via RegionSelector */}
          <RegionSelector
            value={regionValue}
            onChange={handleRegionChange}
            error={errors.provinceSlug?.message || errors.citySlug?.message}
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

          {/* Image URL */}
          <FieldWrapper
            label="门店图片 URL"
            icon={ImageIcon}
            error={errors.imageUrl?.message}
          >
            <input
              {...register("imageUrl")}
              type="url"
              placeholder="https://example.com/store.jpg"
              className={inputClasses}
            />
          </FieldWrapper>
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
            disabled={submitting}
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
            删除门店
          </button>
        )}
      </div>
    </form>
  );
}

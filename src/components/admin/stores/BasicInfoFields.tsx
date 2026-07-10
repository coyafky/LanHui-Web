"use client";

import { MapPin } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { StoreCreateSchema } from "@/lib/validations/store";
import type { z } from "zod";
import { FieldWrapper } from "@/components/admin/shared/FieldWrapper";
import {
  RegionSelector,
  type RegionValue,
  type RegionLoadState,
} from "@/components/admin/RegionSelector";

type FormValues = z.infer<typeof StoreCreateSchema>;

interface BasicInfoFieldsProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  regionValue: RegionValue;
  onRegionChange: (rv: RegionValue) => void;
  onRegionLoadStateChange: (state: RegionLoadState) => void;
  inputClasses: string;
}

export function BasicInfoFields({
  register,
  errors,
  regionValue,
  onRegionChange,
  onRegionLoadStateChange,
  inputClasses,
}: BasicInfoFieldsProps) {
  return (
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

        {/* Slug: system-generated, hidden */}
        <input type="hidden" {...register("slug")} />

        {/* Province / City via RegionSelector */}
        <RegionSelector
          value={regionValue}
          onChange={onRegionChange}
          error={errors.provinceSlug?.message || errors.citySlug?.message}
          onLoadStateChange={onRegionLoadStateChange}
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
  );
}

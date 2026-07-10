"use client";

import { FileText, Image as ImageIcon } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { StoreCreateSchema } from "@/lib/validations/store";
import type { z } from "zod";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "@/components/admin/shared/FieldWrapper";

type FormValues = z.infer<typeof StoreCreateSchema>;

interface DescriptionImageFieldsProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  imagePath?: string;
  inputClasses: string;
}

export function DescriptionImageFields({
  register,
  errors,
  imagePath,
  inputClasses,
}: DescriptionImageFieldsProps) {
  return (
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

        {/* imagePath display (read-only) */}
        {imagePath ? (
          <FieldWrapper label="已上传门店图片" icon={ImageIcon}>
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300">
              <code className="text-xs text-zinc-400">{imagePath}</code>
              <p className="mt-1 text-xs text-zinc-500">
                可在「门店图片管理」页面替换或删除
              </p>
            </div>
          </FieldWrapper>
        ) : (
          <FieldWrapper label="门店图片" icon={ImageIcon}>
            <p className="text-xs text-zinc-500">
              请在「门店图片管理」页面上传真实门店图。
            </p>
          </FieldWrapper>
        )}
      </div>
    </section>
  );
}

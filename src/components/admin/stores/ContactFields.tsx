"use client";

import { Phone, Clock } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { StoreCreateSchema } from "@/lib/validations/store";
import type { z } from "zod";
import { FieldWrapper } from "@/components/admin/shared/FieldWrapper";

type FormValues = z.infer<typeof StoreCreateSchema>;

interface ContactFieldsProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  inputClasses: string;
}

export function ContactFields({
  register,
  errors,
  inputClasses,
}: ContactFieldsProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">联系方式</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Phone */}
        <FieldWrapper
          label="门店联系手机号"
          icon={Phone}
          required
          error={errors.phone?.message}
        >
          <input
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="请输入 11 位手机号，例如 13800138000"
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
  );
}

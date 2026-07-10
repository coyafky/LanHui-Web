"use client";

import { Award, Eye } from "lucide-react";
import { Controller, type Control, type UseFormSetValue, type UseFormRegister } from "react-hook-form";
import { StoreCreateSchema, STORE_LEVELS, STORE_LEVEL_LABELS, STORE_STATUSES, STORE_STATUS_LABELS, type StoreLevel, type StoreStatus } from "@/lib/validations/store";
import type { z } from "zod";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "@/components/admin/shared/FieldWrapper";

type FormValues = z.infer<typeof StoreCreateSchema>;

const LEVEL_BADGE_CLASS: Record<StoreLevel, string> = {
  flagship: "border-amber-600/60 bg-amber-500/10 text-amber-400",
  premium: "border-blue-600/60 bg-blue-500/10 text-blue-400",
  specialty: "border-cyan-600/60 bg-cyan-500/10 text-cyan-400",
  member: "border-zinc-600 bg-zinc-700/40 text-zinc-300",
};

interface LevelStatusFieldsProps {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  errors: Record<string, { message?: string } | undefined>;
  watchedLevel?: StoreLevel;
  watchedStatus?: StoreStatus;
}

export function LevelStatusFields({
  control,
  register,
  setValue,
  errors,
  watchedLevel,
  watchedStatus,
}: LevelStatusFieldsProps) {
  return (
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
            星辉旗舰店：每个城市最多 1 家。发布（设为营业中）前必须选择门店等级。
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

        {/* Status Select */}
        <FieldWrapper
          label="门店状态"
          icon={Eye}
          error={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select
                value={field.value ?? "pending"}
                onChange={(e) => {
                  const next = e.target.value as StoreStatus;
                  field.onChange(next);
                  setValue("isActive", next === "active", {
                    shouldDirty: true,
                  });
                }}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-label="选择门店状态"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              >
                {STORE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STORE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            )}
          />
          <input type="hidden" {...register("isActive")} />
          <p className="mt-1 text-xs text-zinc-500">
            状态切换会写入审计日志。暂停/终止合作需填写原因并在编辑页顶部确认。
          </p>
          {watchedStatus === "active" && !watchedLevel && (
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
  );
}

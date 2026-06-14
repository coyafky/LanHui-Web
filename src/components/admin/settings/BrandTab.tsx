"use client";

import { brand } from "@/lib/brand";
import { AlertTriangle } from "lucide-react";

const PLACEHOLDER_KEYWORDS = [
  "待补充",
  "待备案",
  "待确认",
  "example",
  "example.com",
  "详情待补充",
];

function isPlaceholder(value: string | number | undefined): boolean {
  if (value === undefined || value === null) return false;
  const s = String(value);
  if (s.trim() === "") return false;
  return PLACEHOLDER_KEYWORDS.some((k) => s.includes(k));
}

interface Field {
  key: string;
  label: string;
  value: string | number | undefined;
  full?: boolean;
}

const FIELDS: Field[] = [
  { key: "zh", label: "中文名", value: brand.zh },
  { key: "en", label: "英文名", value: brand.en },
  { key: "slogan", label: "Slogan", value: brand.slogan, full: true },
  {
    key: "shortDescription",
    label: "简介",
    value: brand.shortDescription,
    full: true,
  },
  { key: "foundedYear", label: "成立年份", value: brand.foundedYear },
  { key: "phone", label: "联系电话", value: brand.phone },
  { key: "phoneTel", label: "拨号链接", value: brand.phoneTel },
  { key: "email", label: "邮箱", value: brand.email },
  { key: "address", label: "地址", value: brand.address, full: true },
  { key: "businessHours", label: "营业时间", value: brand.businessHours },
  { key: "icp", label: "ICP 备案号", value: brand.icp },
  { key: "police", label: "公安备案号", value: brand.police },
];

export function BrandTab() {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">品牌信息</h2>
        <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
          Demo 阶段只读
        </span>
      </div>

      <p className="mb-6 text-sm text-zinc-400">
        以下品牌信息由 <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">src/lib/brand.ts</code> 统一管理。Demo 阶段为只读，由架构师在确认后调整。
      </p>

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const empty = f.value === undefined || f.value === null || String(f.value).trim() === "";
          const placeholder = !empty && isPlaceholder(f.value);
          return (
            <div
              key={f.key}
              className={f.full ? "sm:col-span-2" : undefined}
            >
              <div className="text-xs text-zinc-500">{f.label}</div>
              <div
                className={
                  empty
                    ? "mt-0.5 text-sm text-zinc-600"
                    : "mt-0.5 text-sm text-zinc-200"
                }
              >
                {empty ? "—" : String(f.value)}
              </div>
              {placeholder && (
                <p className="mt-1 text-xs text-amber-400 inline-flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  该字段需运营人员填写
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

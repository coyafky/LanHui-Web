"use client";

import { StoreForm, type StoreFormValues } from "@/components/admin/StoreForm";
import { Plus } from "lucide-react";

export default function NewStorePage() {
  async function handleSubmit(data: StoreFormValues) {
    const res = await fetch("/api/stores", {
      method: "POST",
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
      throw new Error(msg ?? "创建失败");
    }
    // 返回新门店 ID，StoreForm 会跳转到图片上传页
    return (json.data as { id: string } | undefined)?.id;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Plus className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">新建门店</h1>
      </div>
      <StoreForm onSubmit={handleSubmit} submitLabel="创建门店" />
    </div>
  );
}

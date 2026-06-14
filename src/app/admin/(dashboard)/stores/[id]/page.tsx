"use client";

import { useState, useEffect, use } from "react";
import { StoreForm, type StoreFormValues } from "@/components/admin/StoreForm";
import { Pencil, Loader2 } from "lucide-react";

export default function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [storeData, setStoreData] = useState<StoreFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stores/${id}`)
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
          });
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
  }

  async function handleDelete() {
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error ?? "删除失败");
    }
  }

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
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Pencil className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">编辑门店</h1>
      </div>
      {storeData && (
        <StoreForm
          defaultValues={storeData}
          onSubmit={handleSubmit}
          submitLabel="保存修改"
          showDelete
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreEditClient } from "./_store-edit-client";
import type { StoreFormValues } from "@/components/admin/StoreForm";
import { resolveStoreStatus, type StoreLevel, type StoreStatus } from "@/lib/validations/store";

export const dynamic = "force-dynamic";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: { province: true, city: true },
  });

  if (!store) notFound();

  const initialStore: StoreFormValues = {
    slug: store.slug ?? "",
    name: store.name,
    provinceSlug: store.provinceSlug,
    provinceLabel: store.provinceLabel,
    citySlug: store.citySlug,
    cityLabel: store.cityLabel,
    district: store.district ?? "",
    address: store.address,
    phone: store.phone,
    phoneTel: store.phoneTel,
    businessHours: store.businessHours ?? "",
    description: store.description ?? "",
    imagePath: store.imagePath ?? null,
    isActive: store.isActive,
    level: store.level as StoreLevel | undefined,
    status: resolveStoreStatus({
      status: store.status as StoreStatus,
      isActive: store.isActive,
    }),
  };

  return <StoreEditClient id={id} initialStore={initialStore} />;
}

export { STORE_LEVELS } from "@/lib/validations/store";

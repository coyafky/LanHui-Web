import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StoresPageInner, TableSkeleton, type StoreRow } from "./_stores-client";

/* ------------------------------------------------------------------ */
/*  RSC Wrapper — fetches initial store data server-side               */
/* ------------------------------------------------------------------ */

export default async function StoresPage() {
  let initialStores: StoreRow[] = [];
  let initialCount = 0;

  try {
    const rawStores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    initialCount = await prisma.store.count();
    initialStores = rawStores.map((s) => ({
      id: s.id,
      name: s.name,
      provinceLabel: s.provinceLabel,
      cityLabel: s.cityLabel,
      phone: s.phone,
      isActive: s.isActive,
      level: s.level as StoreRow["level"],
      status: s.status as StoreRow["status"],
    }));
  } catch {
    // Build-time fallback: prisma unavailable during SSG/CI build
  }

  const fallback = (
    <div>
      <nav
        aria-label="面包屑"
        className="mb-2 hidden text-xs text-zinc-500 sm:block"
      >
        <span className="hover:text-zinc-300">
          Admin
        </span>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-400">运营</span>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-300">门店管理</span>
      </nav>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-6 rounded bg-zinc-800" />
        <h1 className="text-2xl font-bold text-zinc-100">门店管理</h1>
      </div>
      <TableSkeleton />
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <StoresPageInner
        initialStores={initialStores}
        initialCount={initialCount}
      />
    </Suspense>
  );
}

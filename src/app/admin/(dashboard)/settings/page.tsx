import { User, Building2, Info } from "lucide-react";
import type { TabItem } from "@/components/admin/settings/Tabs";
import { ProfileTab } from "@/components/admin/settings/ProfileTab";
import { BrandTab } from "@/components/admin/settings/BrandTab";
import { SystemTab } from "@/components/admin/settings/SystemTab";
import { SettingsTabsClient } from "./SettingsTabsClient";

const TABS: TabItem[] = [
  { id: "profile", label: "个人资料", icon: User },
  { id: "brand", label: "品牌信息", icon: Building2 },
  { id: "system", label: "系统信息", icon: Info },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">系统设置</h1>
      {/* Server Component: SystemTab contains `node:fs/promises` + prisma
          which would fail in a Client Component bundle. Pass it as a
          children/slot prop so it stays a Server Component. */}
      <SettingsTabsClient
        tabs={TABS}
        profileSlot={<ProfileTab />}
        brandSlot={<BrandTab />}
        systemSlot={<SystemTab />}
      />
    </div>
  );
}

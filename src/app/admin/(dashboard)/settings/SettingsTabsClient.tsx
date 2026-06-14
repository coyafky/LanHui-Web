"use client";

import { useState } from "react";
import { Tabs, type TabItem } from "@/components/admin/settings/Tabs";

type TabId = "profile" | "brand" | "system";

export function SettingsTabsClient({
  tabs,
  profileSlot,
  brandSlot,
  systemSlot,
}: {
  tabs: TabItem[];
  profileSlot: React.ReactNode;
  brandSlot: React.ReactNode;
  systemSlot: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <>
      <Tabs
        tabs={tabs}
        active={active}
        onChange={(id) => setActive(id as TabId)}
      />
      {active === "profile" && profileSlot}
      {active === "brand" && brandSlot}
      {active === "system" && systemSlot}
    </>
  );
}

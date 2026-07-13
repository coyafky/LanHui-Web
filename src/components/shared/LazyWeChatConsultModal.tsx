"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import {
  getWeChatModalState,
  subscribeWeChatModal,
} from "@/lib/wechat-modal";

const DynamicWeChatConsultModal = dynamic(
  () =>
    import("./WeChatConsultModal").then(
      (module) => module.WeChatConsultModal,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
        aria-live="polite"
      >
        <div
          role="status"
          aria-label="正在打开咨询方式"
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-300 shadow-2xl shadow-black/60"
        >
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500"
            aria-hidden="true"
          />
          <span>正在打开咨询方式...</span>
        </div>
      </div>
    ),
  },
);

function getServerSnapshot(): boolean {
  return false;
}

export function LazyWeChatConsultModal() {
  const open = useSyncExternalStore(
    subscribeWeChatModal,
    getWeChatModalState,
    getServerSnapshot,
  );

  if (!open) return null;

  return <DynamicWeChatConsultModal />;
}

"use client";

import { MessageCircle } from "lucide-react";
import { openWeChatModal } from "@/lib/wechat-modal";

export function WeChatConsultButton() {
  return (
    <button
      type="button"
      onClick={() => openWeChatModal()}
      className="inline-flex w-full min-w-0 items-center justify-center rounded-lg px-5 py-3.5 text-center text-sm font-medium leading-snug sm:w-auto sm:px-8 sm:py-4 sm:text-base text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/30 transition-colors"
    >
      <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
      <span className="sm:hidden">企业微信咨询</span>
      <span className="hidden sm:inline">添加企业微信咨询车型方案</span>
    </button>
  );
}

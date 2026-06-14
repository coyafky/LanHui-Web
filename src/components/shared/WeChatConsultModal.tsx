'use client';
'use memo';

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { subscribeWeChatModal, closeWeChatModal } from "@/lib/wechat-modal";

export function WeChatConsultModal() {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    return subscribeWeChatModal(setOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWeChatModal();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wechat-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWeChatModal();
      }}
    >
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 p-6 transform transition-transform duration-300 scale-100">
        <button
          type="button"
          onClick={closeWeChatModal}
          aria-label="关闭"
          className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="wechat-modal-title"
          className="text-xl font-bold text-white mb-2 pr-8"
        >
          添加企业微信,1 对 1 咨询车型方案
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          扫码后由车型顾问为新能源车主匹配产品与到店方案。
        </p>

        <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 aspect-square">
          <Image
            src="/images/brand/wechat-qr.png"
            alt="蓝辉轻改企业微信二维码"
            width={220}
            height={220}
            className="w-full h-auto max-w-[220px]"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-zinc-300">蓝辉轻改 · 车型顾问</p>
          <p className="text-xs text-amber-400/90">微信号:fkycoya(待补充)</p>
          <p className="text-xs text-zinc-500 pt-2">打开微信扫一扫 ↑</p>
        </div>
      </div>
    </div>
  );
}

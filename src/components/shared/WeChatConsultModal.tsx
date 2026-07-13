'use client';
'use memo';

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  closeWeChatModal,
  getWeChatModalState,
  subscribeWeChatModal,
} from "@/lib/wechat-modal";
import { wechatOfficialAccount } from "@/lib/contact-channels";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function WeChatConsultModal() {
  const open = useSyncExternalStore(
    subscribeWeChatModal,
    getWeChatModalState,
    () => false,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    active: open,
    containerRef,
    initialFocusRef: closeBtnRef,
    onEscape: closeWeChatModal,
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const { qrPath, qrAlt, title, description, scanHint } = wechatOfficialAccount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wechat-modal-title"
      aria-describedby="wechat-modal-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWeChatModal();
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 p-6 transform transition-transform duration-300 scale-100"
      >
        <button
          ref={closeBtnRef}
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
          {title}
        </h2>
        <p id="wechat-modal-description" className="text-sm text-zinc-400 mb-5">
          {description}
        </p>

        <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 aspect-square">
          <Image
            src={qrPath}
            alt={qrAlt}
            width={220}
            height={220}
            className="w-full h-auto max-w-[220px]"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-zinc-300">蓝辉轻改</p>
          <p className="text-xs text-zinc-500 pt-2">{scanHint}</p>
        </div>
      </div>
    </div>
  );
}

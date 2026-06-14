'use client';

type Listener = (open: boolean) => void;

let isOpen = false;
const listeners = new Set<Listener>();

export function subscribeWeChatModal(listener: Listener): () => void {
  listeners.add(listener);
  // 订阅时立即同步一次当前状态
  listener(isOpen);
  return () => {
    listeners.delete(listener);
  };
}

export function openWeChatModal(): void {
  if (isOpen) return;
  isOpen = true;
  listeners.forEach((l) => l(true));
}

export function closeWeChatModal(): void {
  if (!isOpen) return;
  isOpen = false;
  listeners.forEach((l) => l(false));
}

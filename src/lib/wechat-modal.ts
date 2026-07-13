'use client';

type Listener = (open: boolean) => void;

let isOpen = false;
const listeners = new Set<Listener>();

export function subscribeWeChatModal(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWeChatModalState(): boolean {
  return isOpen;
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

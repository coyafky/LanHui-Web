"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border-zinc-800 bg-zinc-900 text-zinc-100",
          description: "text-zinc-400",
          actionButton: "bg-orange-500 text-white",
          cancelButton: "bg-zinc-800 text-zinc-300",
        },
      }}
    />
  );
}

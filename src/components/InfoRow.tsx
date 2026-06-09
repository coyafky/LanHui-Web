import { type ReactNode } from "react";

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

export function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-zinc-500">
          {label}
        </dt>
        <dd className="text-zinc-200 leading-relaxed mt-1">{children}</dd>
      </div>
    </div>
  );
}

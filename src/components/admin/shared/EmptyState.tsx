import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
}: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={8} className="px-4 py-16 text-center">
        <Icon className="mx-auto h-10 w-10 text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-zinc-400">{title}</p>
        <p className="mt-1 text-xs text-zinc-600">{description}</p>
      </td>
    </tr>
  );
}

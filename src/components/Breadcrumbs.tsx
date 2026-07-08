import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string; // 无 href = 当前页（末项）
};

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
  className?: string;
  align?: "left" | "center"; // 默认 "left"
};

/**
 * 通用面包屑导航组件（Server Component）。
 * 自动处理末项高亮、分隔符、aria 属性。
 */
export function Breadcrumbs({
  items,
  className = "",
  align = "left",
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="面包屑" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-1 text-sm ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-4 w-4 text-zinc-600"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span className="text-zinc-300" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-300">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

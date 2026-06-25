import Link from "next/link";
import { AlertCircle, ChevronRight, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodoItemV2, TodoSummaryV2 } from "@/lib/admin-dashboard";

interface Props {
  todos: TodoSummaryV2 | null;
}

const SEVERITY_STYLES: Record<TodoItemV2["severity"], string> = {
  P0: "bg-red-500/10 text-red-400 border-red-500/20",
  P1: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const MAX_VISIBLE = 5;

function sortItems(items: TodoItemV2[]): TodoItemV2[] {
  return [...items].sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "P0" ? -1 : 1;
  });
}

export function DashboardTodoList({ todos }: Props) {
  if (!todos) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">今日待办</h2>
        </div>
        <p className="text-sm text-zinc-500">待办加载失败，请刷新</p>
      </div>
    );
  }
  if (todos.items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-zinc-100">今日待办</h2>
        </div>
        <p className="text-sm text-zinc-500">当前没有必须处理的事项。</p>
      </div>
    );
  }

  const sorted = sortItems(todos.items);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const overflow = sorted.length - visible.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">今日待办</h2>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
            {todos.totalCount}
          </span>
        </div>
      </div>
      <ul className="space-y-2">
        {visible.map((item) => {
          const badge = (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold",
                SEVERITY_STYLES[item.severity],
              )}
            >
              {item.severity}
            </span>
          );
          const right = (
            <span className="inline-flex items-center gap-1 text-xs text-orange-400">
              {item.hrefLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          );
          return (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              {badge}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-zinc-100">
                    {item.title}
                  </span>
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
                      {item.count}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {item.description}
                </p>
                {item.disabled && item.disabledHint && (
                  <p className="mt-1 text-xs text-zinc-600">{item.disabledHint}</p>
                )}
              </div>
              {item.disabled || !item.href ? (
                <span className="cursor-not-allowed opacity-50">{right}</span>
              ) : (
                <Link href={item.href} className="transition-opacity hover:opacity-80">
                  {right}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {overflow > 0 && (
        <Link
          href="/admin"
          className="mt-3 flex items-center justify-center gap-1 rounded-md border border-dashed border-zinc-700 py-2 text-xs text-zinc-500 transition-colors hover:border-orange-500/40 hover:text-orange-400"
        >
          查看全部 {todos.totalCount} 项待办 →
        </Link>
      )}
    </div>
  );
}

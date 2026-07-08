"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  EyeOff,
  Cpu,
  Server,
  Radio,
  Database,
  FileText,
  Terminal,
  Clock,
} from "lucide-react";

type ObservabilityStatus = {
  structuredLogging: boolean;
  logLevel: string;
  apmConfigured: boolean;
  requestId: boolean;
  sanitization: boolean;
};

const STATUS_ITEMS = [
  {
    key: "structuredLogging" as const,
    label: "结构化日志",
    desc: "使用 pino 输出 JSON 结构化日志",
    icon: Activity,
  },
  {
    key: "logLevel" as const,
    label: "日志级别",
    desc: "当前日志输出级别",
    icon: Server,
    isValue: true,
  },
  {
    key: "apmConfigured" as const,
    label: "APM / 错误追踪",
    desc: "Sentry 集成状态",
    icon: Radio,
  },
  {
    key: "requestId" as const,
    label: "Request ID 追踪",
    desc: "每个请求带有唯一 requestId（x-request-id → x-vercel-id → UUID）",
    icon: Cpu,
  },
  {
    key: "sanitization" as const,
    label: "敏感字段脱敏",
    desc: "自动过滤日志中的 password、token、cookie、authorization 等字段",
    icon: EyeOff,
  },
] as const;

function StatusBadge({
  enabled,
  value,
}: {
  enabled: boolean;
  value?: string;
}) {
  if (value !== undefined) {
    return (
      <span className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1 font-mono text-sm text-zinc-200">
        {value}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ${
        enabled
          ? "bg-green-500/10 text-green-400"
          : "bg-zinc-800 text-zinc-500"
      }`}
    >
      {enabled ? "已启用" : "未配置"}
    </span>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ObservabilityStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/admin/settings/observability");
        if (res.ok) {
          const json = (await res.json()) as {
            success: boolean;
            data?: ObservabilityStatus;
          };
          if (json.success && json.data) {
            setStatus(json.data);
            return;
          }
        }
        setError("获取状态失败");
      } catch {
        setError("网络请求失败");
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">设置</h1>
        <p className="mt-1 text-sm text-zinc-400">系统配置与可观测性状态</p>
      </div>

      {/* 可观测性状态 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">可观测性</h2>
        </div>

        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : !status ? (
          <p className="text-sm text-zinc-500">加载中...</p>
        ) : (
          <div className="space-y-4">
            {STATUS_ITEMS.map((item) => {
              const value = status[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-zinc-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {item.label}
                      </p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <StatusBadge
                    enabled={
                      item.key === "logLevel"
                        ? true
                        : (value as boolean)
                    }
                    value={
                      item.key === "logLevel"
                        ? (value as string)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 数据库备份策略 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">数据库备份策略</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-zinc-200">备份 Runbook</p>
                <p className="text-xs text-zinc-500">docs/DATABASE_BACKUP_RUNBOOK.md</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
              已配置
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-zinc-200">自动备份策略</p>
                <p className="text-xs text-zinc-500">每日凌晨 3 点 · 保留 30 天 · gzip 压缩</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
              已配置
            </span>
          </div>

          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <Terminal className="h-4 w-4 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-200">推荐命令</p>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="rounded bg-zinc-950 px-3 py-2 text-zinc-300">
                <span className="text-zinc-600"># 手动备份</span>
                <br />
                npm run db:backup
              </div>
              <div className="rounded bg-zinc-950 px-3 py-2 text-zinc-300">
                <span className="text-zinc-600"># 预览备份命令（不执行）</span>
                <br />
                npm run db:backup:dry-run
              </div>
              <div className="rounded bg-zinc-950 px-3 py-2 text-amber-300">
                <span className="text-zinc-600"># 恢复数据库（需确认）</span>
                <br />
                npm run db:restore -- ./backups/备份文件名.sql.gz --yes
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-600">
            备份不会在 Web 后台执行。请通过终端运行命令。详细说明见 Runbook。
          </p>
        </div>
      </div>
    </div>
  );
}

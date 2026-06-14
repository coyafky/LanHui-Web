"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyPoint {
  date: string;
  count: number;
}

interface StatsResponse {
  success: boolean;
  data?: { dailyTrend: DailyPoint[] };
  error?: string;
}

export function DashboardTrendChart() {
  const [data, setData] = useState<DailyPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const end = new Date();
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        groupBy: "day",
      });
      const res = await fetch(`/api/analytics/stats?${params}`);
      const json: StatsResponse = await res.json();
      if (!json.success) throw new Error(json.error ?? "加载失败");
      setData(json.data?.dailyTrend ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">最近 30 天访问趋势</h2>
        {error && (
          <button
            type="button"
            onClick={load}
            className="text-xs text-orange-400 hover:text-orange-300"
          >
            重试
          </button>
        )}
      </div>
      {loading ? (
        <div className="h-72 w-full animate-pulse rounded bg-zinc-800" />
      ) : error ? (
        <div className="flex h-72 w-full flex-col items-center justify-center gap-2">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            重新加载
          </button>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <LineChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                color: "#f4f4f5",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="PV"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#f97316" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Eye, MousePointerClick, Store, Calendar } from 'lucide-react';

/** ---- 类型 ---- */

interface StatsData {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  topPages: { pathname: string; count: number }[];
  topStores: { storeId: string; storeName: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

type RangeOption = '7d' | '30d' | '90d';

/** ---- 常量 ---- */

const CHART_COLORS = ['#f97316', '#fb923c', '#a1a1aa', '#60a5fa', '#a78bfa'];

const RANGE_MAP: Record<RangeOption, { label: string; days: number }> = {
  '7d': { label: '最近 7 天', days: 7 },
  '30d': { label: '最近 30 天', days: 30 },
  '90d': { label: '最近 90 天', days: 90 },
};

const TYPE_LABELS: Record<string, string> = {
  pageview: '页面浏览',
  click: '点击',
  form_submit: '表单提交',
  reservation: '预约',
  store_view: '门店访问',
};

/** ---- 骨架屏 ---- */

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800 ${className ?? ''}`} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <Skeleton className="mb-6 h-5 w-28" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/** ---- 页面组件 ---- */

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeOption>('30d');
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const days = RANGE_MAP[range].days;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day',
      });

      const res = await fetch(`/api/analytics/stats?${params}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || '请求失败');
      }

      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 计算指标
  const pageViews = data?.eventsByType.find((e) => e.type === 'pageview')?.count ?? 0;
  const storeViews = data?.eventsByType.find((e) => e.type === 'store_view')?.count ?? 0;
  const reservations = data?.eventsByType.find((e) => e.type === 'reservation')?.count ?? 0;
  const totalEvents = data?.totalEvents ?? 0;

  const kpis = [
    { label: '总 PV', value: pageViews, icon: Eye, color: 'text-orange-400' },
    { label: '总事件', value: totalEvents, icon: MousePointerClick, color: 'text-orange-500' },
    { label: '门店访问', value: storeViews, icon: Store, color: 'text-blue-400' },
    { label: '预约次数', value: reservations, icon: Calendar, color: 'text-zinc-400' },
  ] as const;

  return (
    <div>
      {/* 标题 + 时间范围选择器 */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">数据分析</h1>

        <div className="flex gap-2">
          {(Object.keys(RANGE_MAP) as RangeOption[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {RANGE_MAP[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/50 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI 卡片 */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{kpi.label}</span>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <p className="mt-3 text-3xl font-bold text-zinc-100">
                  {kpi.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 图表区域 */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* 图表1：每日 PV 趋势 */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              每日 PV 趋势
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.dailyTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    color: '#f4f4f5',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="浏览量"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 图表2：事件类型分布 */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              事件类型分布
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.eventsByType ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="type"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  tickFormatter={(v: string) => TYPE_LABELS[v] ?? v}
                />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    color: '#f4f4f5',
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), '次数']}
                  labelFormatter={(label) => TYPE_LABELS[String(label)] ?? String(label)}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.eventsByType ?? []).map((_, index) => (
                    <Cell
                      key={`cell-type-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 图表3：热门页面 Top 10 */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              热门页面 Top 10
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data?.topPages ?? []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="pathname"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    color: '#f4f4f5',
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), '浏览量']}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 图表4：热门门店 Top 10 */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              热门门店 Top 10
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data?.topStores ?? []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="storeName"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    color: '#f4f4f5',
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), '访问量']}
                />
                <Legend />
                <Bar dataKey="count" name="访问量" fill="#60a5fa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3, Eye, Phone, AlertCircle } from "lucide-react";
import type { InterestSummaryV2 } from "@/lib/admin-dashboard";

interface Props {
  data: InterestSummaryV2 | null;
}

const ZERO_REASON_LABELS: Record<NonNullable<InterestSummaryV2["zeroReason"]>, string> = {
  real: "近 7 天暂无行为数据（真实无访问）",
  "tracking-missing": "部分事件类型未接入，建议检查埋点",
  "event-incompatible": "事件命名不兼容当前统计口径",
  "query-failed": "数据查询失败，请稍后重试",
};

interface MiniTrendProps {
  title: string;
  data: { date: string; count: number }[];
  dataKey: "count";
  color: string;
}

function MiniTrend({ title, data, dataKey, color }: MiniTrendProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-500">{title}</p>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
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
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface RankListProps {
  title: string;
  empty: string;
  items: { label: string; sub?: string; count: number }[];
}

function RankList({ title, empty, items }: RankListProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-500">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={`${it.label}-${i}`} className="flex items-center gap-3 text-sm">
              <span className="w-4 shrink-0 text-right font-mono text-xs text-zinc-600">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-zinc-300">{it.label}</span>
              {it.sub && <span className="shrink-0 text-xs text-zinc-600">{it.sub}</span>}
              <span className="w-10 shrink-0 text-right font-mono text-zinc-400">{it.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DashboardInterestPanel({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">用户兴趣与咨询趋势</h2>
        </div>
        <p className="text-sm text-zinc-500">兴趣数据加载失败</p>
      </div>
    );
  }

  const {
    dailyTrend30d,
    contactTrend30d,
    topProductInterest,
    topTopicInterest,
    topStoreViews,
    zeroReason,
  } = data;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">用户兴趣与咨询趋势</h2>
        </div>
        {zeroReason && (
          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {ZERO_REASON_LABELS[zeroReason]}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PV 趋势 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Eye className="h-3 w-3" />
            30 天 PV 趋势
          </p>
          {dailyTrend30d.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无访问数据</p>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyTrend30d}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
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
                    dataKey="pv"
                    name="PV"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: "#f97316" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 咨询点击趋势 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Phone className="h-3 w-3" />
            30 天咨询点击趋势
          </p>
          {contactTrend30d.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无咨询数据</p>
          ) : (
            <MiniTrend
              title=""
              data={contactTrend30d}
              dataKey="count"
              color="#3b82f6"
            />
          )}
        </div>

        {/* 产品兴趣 Top 5 */}
        <RankList
          title="产品兴趣 Top 5"
          empty="暂无产品访问"
          items={topProductInterest.map((p) => ({
            label: p.productName,
            sub: p.productKey !== p.productName ? p.productKey : undefined,
            count: p.count,
          }))}
        />

        {/* 车型专题 Top 5 */}
        <RankList
          title="车型专题 Top 5"
          empty="暂无专题访问"
          items={topTopicInterest.map((t) => ({
            label: t.topicName,
            sub: t.topicKey !== t.topicName ? t.topicKey : undefined,
            count: t.count,
          }))}
        />

        {/* 门店查看 Top 5 */}
        <div className="md:col-span-2">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <TrendingUp className="h-3 w-3" />
            门店查看 Top 5
          </p>
          {topStoreViews.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无门店查看</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {topStoreViews.map((s, i) => (
                <li
                  key={s.storeId}
                  className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
                >
                  <span className="w-4 shrink-0 text-right font-mono text-xs text-zinc-600">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
                    {s.storeName}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

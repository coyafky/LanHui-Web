import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Building2,
} from "lucide-react";
import type { Store } from "@/lib/store";
import { StoreLevelBadge } from "./StoreLevelBadge";

/**
 * 公开站门店卡片 —— /agent、/agent/[slug]、/agent/[slug]/[city] 共用。
 *
 * 视觉规则：
 *   - LANHUI 角标：图区左上（保留原位置）
 *   - 等级 Badge：图区右上（新增）
 *   - 卡片主体（信息、地址、营业时间、CTA）布局完全不变
 *
 * 链接：/agent/store/<id>（Next.js Link prefetch 默认开启）
 */
export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/agent/store/${store.id}`}
      className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      aria-label={`${store.name} 门店详情`}
    >
      {/* 占位图区域 */}
      <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
        <Building2 className="w-16 h-16 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
        {/* 左上角 LANHUI badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-zinc-800/90 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
            LANHUI
          </span>
        </div>
        {/* 右上角 等级 Badge —— 新增视觉元素 */}
        <div className="absolute top-3 right-3">
          <StoreLevelBadge level={store.level} variant="card" />
        </div>
      </div>
      {/* 信息区域 */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-white">{store.name}</h3>
        </div>
        {/* 名称下方的 inline 等级（窄屏冗余展示；保留 a11y 文本可被屏幕阅读器读到） */}
        <div className="mb-3 md:hidden">
          <StoreLevelBadge level={store.level} variant="inline" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-zinc-400">
            <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{store.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span>{store.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span>{store.businessHours}</span>
          </div>
        </div>
        <span className="text-orange-400 text-sm font-medium inline-flex items-center">
          查看详情
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
# ANALYTICS_TRACKING_PRD_2026-06-20 — 客户端埋点系统 v1

> 横切功能子 PRD — 客户端事件收集 + 后台看板数据源

---

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 父 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4 |
| 审计依据 | [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12.2 P1-12/P1-13](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) |
| 数据表 | [../../database/SCHEMA.md §6](../../database/SCHEMA.md) |
| 维护者 | 冯科雅 (Coya) |
| 类型 | 横切功能 (Provider + 客户端 SDK + 后台看板) |
| 状态 | 🟡 v1 (含 P1-12/P1-13 修复方案) |
| 优先级 | P0 |

---

## 1. 概述

### 1.1 目标

提供**轻量、可靠、可降级的客户端埋点 SDK**,自动追踪全站页面浏览与关键交互,为 `/admin/analytics` 看板输送数据。当前实现仅 pageview 自动埋点(累计 ~695 条),click / store_view / reservation 三类事件近乎为零(P1-12/P1-13),本期目标是**将核心交互覆盖率从 < 1% 提升到 ≥ 60%**。

### 1.2 适用页面

| 路由 / 区域 | 埋点方式 | 事件类型 |
|---|---|---|
| 公开站全部路由(`/`) | `AnalyticsProvider` 自动 pageview | `pageview` |
| `/admin/*`(全部后台) | **不追踪**(`AnalyticsProvider:17` 跳过) | — |
| `/agent/store/[id]` | 进入时手动 `trackStoreView(id)` | `store_view`(P1-13 修复) |
| 全站 `<Button>` / `<Link>` | 包装器自动 click | `click`(P1-12 修复) |
| 预约表单 / 联系表单提交 | 手动 `trackFormSubmit()` | `form_submit` |
| 微信咨询浮窗打开 | 手动 `trackClick('wechat_modal')` | `click` |
| 门店列表页 `/agent` | 列表卡片 click 包装 | `click` |

### 1.3 范围与非目标

**本期(v1)范围**:
- ✅ 客户端 SDK:5 事件类型 + buffer + flush + sendBeacon
- ✅ 自动 pageview(`usePathname` 监听 + 跳过 `/admin`)
- ✅ 服务端:白名单 + 限流(60/min/IP)+ 多 IP header 兜底
- ✅ P1-12 修复:`<TrackedButton>` / `<TrackedLink>` 包装组件
- ✅ P1-13 修复:`/agent/store/[id]` 加 `trackStoreView()`
- ✅ 后台看板查询 API

**本期不在范围**:
- ❌ 服务端 session-level UV(需 cookie 关联,v2)
- ❌ 漏斗分析 / 归因模型(v3 商业化)
- ❌ 第三方 GA / 神策 SDK(v2 评估)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 站长 | 看日活 | `/admin/analytics` 看到 PV / UV / 趋势 | P0 |
| 站长 | 看转化漏斗 | 看到点击 → 预约 → 到店 各阶段转化率 | P1 |
| 运营 | 哪个门店最火 | Top 门店排行(目前为 0,P1-13) | P1 |
| 运营 | 哪个 CTA 没人点 | 关键 CTA click 数(P1-12) | P1 |
| 访客 | 浏览页 | 浏览器不卡(network 空闲才上报) | P0 |
| 访客 | 关闭页 | 事件不丢(`beforeunload` flush) | P0 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 说明 |
|---|---|---|---|---|
| F1 | 自动 pageview | P0 | ✅ | `AnalyticsProvider.tsx:13-19` |
| F2 | 手动 `trackClick(target, metadata)` | P0 | ✅ | `analytics.ts:96-98` |
| F3 | 手动 `trackStoreView(storeId)` | P0 | ✅ | `analytics.ts:106-108` |
| F4 | 手动 `trackFormSubmit(formName, metadata)` | P0 | ✅ | `analytics.ts:101-103` |
| F5 | 手动 `trackReservation(storeId, metadata)` | P0 | ✅ | `analytics.ts:111-113` |
| F6 | 客户端 buffer(5 条 / 10s flush) | P0 | ✅ | `analytics.ts:22-23` |
| F7 | `sendBeacon` 优先 + `fetch keepalive` fallback | P0 | ✅ | `analytics.ts:38-49` |
| F8 | 并发锁(`isFlushing` 防止重复发送) | P0 | ✅ | `analytics.ts:20, 27-67` |
| F9 | 失败回退(pending 事件 unshift 回主 buffer) | P0 | ✅ | `analytics.ts:54-64` |
| F10 | `beforeunload` + `visibilitychange=hidden` 强制 flush | P0 | ✅ | `analytics.ts:116-121` |
| F11 | 服务端限流 60/min/IP | P0 | ✅ | `route.ts:12-27, 70-75` |
| F12 | 服务端 type 白名单(5 类) | P0 | ✅ | `route.ts:95-106` |
| F13 | 多 IP header 兜底(x-forwarded-for / x-real-ip / x-vercel / cf-connecting-ip) | P0 | ✅ | `route.ts:53-67` |
| F14 | 单请求最多 50 条事件 | P0 | ✅ | `route.ts:9, 87-92` |
| F15 | invalid 事件拆分 + warn | P0 | ✅ | `route.ts:97-113` |
| F16 | 后台看板数据查询(总事件 / 类型 / Top 页 / Top 门店 / 日趋势) | P0 | ✅ | `stats/route.ts` |
| F17 | **P1-12 修复**:`<TrackedButton>` / `<TrackedLink>` 自动 click 包装 | P0 | 🟡 | 本期新加 |
| F18 | **P1-13 修复**:`/agent/store/[id]` 调用 `trackStoreView` | P0 | 🟡 | 本期新加 |
| F19 | `<ReservationForm>` 提交后调 `trackReservation` | P1 | 🟡 | 本期新加 |
| F20 | 服务端 UV 去重(IP + UA + day bucket) | P1 | ⚪ | v2 |
| F21 | 实时大盘 SSE 推送 | P2 | ⚪ | v3 |

---

## 4. UI / 交互

### 4.1 客户端 SDK API

```ts
// src/lib/analytics.ts (当前实现)
export function trackPageView(pathname?: string): void
export function trackClick(target: string, metadata?: Record<string, unknown>): void
export function trackFormSubmit(formName: string, metadata?: Record<string, unknown>): void
export function trackStoreView(storeId: string): void
export function trackReservation(storeId: string, metadata?: Record<string, unknown>): void
```

### 4.2 P1-12 修复:`<TrackedButton>` 包装器

> 目标:把"开发易忘调用 trackClick"转化为"包装器自带埋点",覆盖率从 < 1% 提升到 ~100%。

```tsx
// src/components/shared/TrackedButton.tsx (本期新增)
'use client';
import { Button } from '@/components/ui/button';
import { trackClick } from '@/lib/analytics';
import { forwardRef, type ComponentProps } from 'react';

type TrackName = string;

export interface TrackedButtonProps extends ComponentProps<typeof Button> {
  trackName: TrackName;                    // 例: 'cta_hero_primary'
  trackMetadata?: Record<string, unknown>; // 例: { variant: 'primary' }
}

export const TrackedButton = forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ trackName, trackMetadata, onClick, children, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          trackClick(trackName, trackMetadata);
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);
TrackedButton.displayName = 'TrackedButton';
```

### 4.3 P1-12 修复:`<TrackedLink>` 包装器

```tsx
// src/components/shared/TrackedLink.tsx (本期新增)
'use client';
import Link from 'next/link';
import { trackClick } from '@/lib/analytics';
import type { ComponentProps } from 'react';

export interface TrackedLinkProps extends ComponentProps<typeof Link> {
  trackName: string;
  trackMetadata?: Record<string, unknown>;
}

export function TrackedLink({ trackName, trackMetadata, onClick, ...rest }: TrackedLinkProps) {
  return (
    <Link
      onClick={(e) => {
        trackClick(trackName, trackMetadata);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
```

### 4.4 埋点命名规范

`<区域>_<元素>_<动作>` 蛇形:

| trackName 举例 | 触发位置 |
|---|---|
| `header_wechat_cta_click` | Header 微信咨询按钮 |
| `hero_primary_cta_click` | Hero 主 CTA |
| `store_card_click` | 门店列表卡片 |
| `store_view` | `trackStoreView()` 专用 |
| `form_submit` | `trackFormSubmit()` 专用 |
| `reservation_submit` | `trackReservation()` 专用 |
| `wechat_modal_open` | 微信浮窗打开 |

### 4.5 看板组件(/admin/analytics)

- 总事件数 KPI
- 事件类型分布柱状图(Recharts)
- Top 10 页面表
- Top 10 门店表(目前空,P1-13 修复后填)
- 日趋势折线图

---

## 5. 数据模型

### 5.1 涉及表

```
DB: AnalyticsEvent          # 详见 ../../database/SCHEMA.md §6
```

### 5.2 事件类型白名单

| `type` | 来源 | 说明 |
|---|---|---|
| `pageview` | `AnalyticsProvider` | 进入路由 |
| `click` | `TrackedButton` / `TrackedLink` / 手动 | 关键交互 |
| `form_submit` | 手动 | 表单提交 |
| `reservation` | 手动 | 预约提交 |
| `store_view` | `/agent/store/[id]` RSC | 门店详情页访问 |

**服务端**:白名单(`stats/route.ts` 读 + `track/route.ts` 写共享同一 Set),不在白名单的事件被丢弃 + `console.warn`。

### 5.3 写入路径

```
[client SDK]  ──buffer 5/10s──>  POST /api/analytics/track
                                        │
                                        ├── 限流 60/min/IP  (route.ts:12-27)
                                        ├── type 白名单      (route.ts:95)
                                        ├── metadata JSON     (route.ts:124-131)
                                        └── createMany        (route.ts:133-135)
                                                       │
                                                       ▼
                                              AnalyticsEvent (Prisma)
                                                       │
                                                       ▼
                                              /admin/analytics (Prisma groupBy + queryRaw)
```

### 5.4 已知数据现状

| 指标 | 当前 | 目标(v1 修复后) |
|---|---|---|
| pageview | ~695 | ≥ 5000(自然增长) |
| click | ~5(< 1%) | ≥ 200(每页 5-10 个可埋点元素) |
| store_view | 0 | ≥ 50 |
| reservation | 0 | ≥ 10 |

---

## 6. API 接口

### 6.1 `POST /api/analytics/track`

| 项 | 值 |
|---|---|
| Method | `POST` |
| 权限 | 公开(限流 60/min/IP) |
| Content-Type | `application/json` |
| Body | `{ events: Array<{ type, pathname, storeId?, metadata? }> }`(≤ 50 条) |
| 响应 200 | `{ success: true, count, invalidCount }` |
| 响应 400 | body 不合法 / 超 50 条 |
| 响应 429 | 限流触发 |

完整实现:`src/app/api/analytics/track/route.ts:48-149`

### 6.2 `GET /api/analytics/stats`

| 项 | 值 |
|---|---|
| Method | `GET` |
| 权限 | `admin` |
| Query | `startDate?`, `endDate?`, `groupBy?` (`day`/`week`/`month`) |
| 响应 200 | `{ totalEvents, eventsByType, topPages, topStores, dailyTrend }` |
| 响应 400 | 日期格式错 / groupBy 非法 |

完整实现:`src/app/api/analytics/stats/route.ts:22-187`

### 6.3 修复任务代码层 plan

#### P1-12:TrackedButton 接入清单

| 文件 | 替换 |
|---|---|
| `src/components/Header.tsx` | 微信 CTA Button → `<TrackedButton trackName="header_wechat_cta_click">` |
| `src/components/Hero.tsx` | 主 CTA → `<TrackedButton trackName="hero_primary_cta_click">` |
| `src/components/StoresList.tsx` | 卡片 `<Link>` → `<TrackedLink trackName="store_card_click">` |
| `src/components/ProductCard.tsx` | 详情页入口 Link → `<TrackedLink trackName="product_card_click">` |
| 微信浮窗 | 打开时 `trackClick('wechat_modal_open')` |
| 6 个产品线入口 | `<TrackedLink trackName="product_index_click" trackMetadata={{ category }}>` |

**预期覆盖率**:全站可埋点元素 ~80 个,接入后 click 事件月度 ≥ 1500。

#### P1-13:`/agent/store/[id]` 接入

```tsx
// src/app/agent/store/[id]/page.tsx (改造点)
import { TrackStoreView } from '@/components/analytics/TrackStoreView';

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <>
      {/* 客户端组件,挂载时调用 trackStoreView */}
      <TrackStoreView storeId={id} />
      <StoreDetail storeId={id} />
    </>
  );
}

// src/components/analytics/TrackStoreView.tsx (本期新增)
'use client';
import { useEffect } from 'react';
import { trackStoreView } from '@/lib/analytics';

export function TrackStoreView({ storeId }: { storeId: string }) {
  useEffect(() => { trackStoreView(storeId); }, [storeId]);
  return null;
}
```

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [x] 自动 pageview(公开站)
- [x] 5 类事件 SDK
- [x] buffer + flush + sendBeacon
- [x] 失败回退
- [x] 服务端白名单 + 限流
- [ ] F17 `<TrackedButton>` + `<TrackedLink>` 上线
- [ ] F18 `/agent/store/[id]` store_view 接入
- [ ] F19 reservation 表单埋点接入

### 7.2 性能

- [ ] pageview 触发 → flush ≤ 10s(buffer 满则立即)
- [ ] 60 req/min/IP 触发 429(验证 BUG-5 修复)
- [ ] 看板 stats 查询 < 500ms(单日范围)

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [x] `src/lib/analytics.test.ts` 已存在(注意:ES2017 target 下 BigInt literal 报错为 pre-existing)
- [ ] 新增 `TrackedButton.test.tsx` + `TrackedLink.test.tsx`(click 调用断言)
- [ ] 新增 e2e:访问门店详情页 → 验证 30s 内 AnalyticsEvent 新增 `store_view` 条目

### 7.4 数据验证(P1-12/P1-13 修复后 7 日观察)

- [ ] click 事件累计 ≥ 200/日(基线 < 1/日)
- [ ] store_view 事件累计 ≥ 30/日(基线 0)
- [ ] reservation 事件累计 ≥ 3/日
- [ ] pageview 数量无明显下降(SDK 错误不能阻塞 PV)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 初版横切 PRD;纳入 P1-12 `<TrackedButton>` + P1-13 `<TrackStoreView>` 修复;补全 8 节 | Coya |
| 2026-06-15 | v0 | BUG-2 / BUG-4 / BUG-5 修复(并发锁 + invalid 拆分 + 多 IP header)已在 main | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md §5.4](../00_MASTER_PRD.md) — 横切功能索引
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 审计源 P1-12/P1-13
- [../../database/SCHEMA.md §6](../../database/SCHEMA.md) — `AnalyticsEvent` 表
- [../../src/lib/analytics.ts](../../src/lib/analytics.ts) — 当前客户端 SDK
- [../../src/components/AnalyticsProvider.tsx](../../src/components/AnalyticsProvider.tsx) — 自动 pageview
- [../../src/app/api/analytics/track/route.ts](../../src/app/api/analytics/track/route.ts) — 服务端写入
- [../../src/app/api/analytics/stats/route.ts](../../src/app/api/analytics/stats/route.ts) — 看板查询

## 附录 B: 看板性能优化路线(v2+)

| 阶段 | 优化 | 预期收益 |
|---|---|---|
| Phase 1 | 物化视图(`analytics_daily_summary`)每日 00:05 聚合 | stats 查询 -70% |
| Phase 2 | ClickHouse 列存(写入事件) | 高频写入 -50% 存储 |
| Phase 3 | 漏斗 + 留存模型 | 转化分析能力 |
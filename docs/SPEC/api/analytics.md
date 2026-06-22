# SPEC: API 埋点分析 Analytics

> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

客户端埋点数据采集和统计查询。

## 2. 路由

| 路径 | 方法 | 权限 | 说明 | 状态 |
|------|------|------|------|------|
| `/api/analytics/track` | POST | 公开 | 批量接收埋点事件 | ✅ |
| `/api/analytics/stats` | GET | admin | 统计数据查询 | ✅ |

## 3. Track API

- **限流**: 60 请求/min/IP
- **type 白名单**: pageview, click, form_submit, store_view, reservation
- **写入**: DB PageView/ClickEvent 表
- **批量**: 客户端缓冲 5 条或 10s 定时 flush

## 4. Stats API

- **权限**: admin 必需
- **参数**: 日期范围 + 分组（day/week/month）
- **返回**: KPI 指标 + 图表数据

## 5. 客户端 SDK (`src/lib/analytics.ts`)

```typescript
trackPageView()      // AnalyticsProvider 自动调用
trackClick(label)    // 需手动埋点
trackFormSubmit(name)
trackStoreView(storeId)
trackReservation(storeId)
```

优先 `sendBeacon` → fallback fetch + keepalive。

## 6. 已知问题

- [P1-12] 埋点严重失衡：695 PV vs ~5 click，全站 Button/Link 无自动 click 埋点

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-20 | Claude Code | 埋点 API + AnalyticsProvider + SDK 实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

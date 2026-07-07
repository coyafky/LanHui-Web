# Brainstorm Summary

- Change: public-store-discovery
- Date: 2026-07-07

## 确认的技术方案

方案 A：URL 参数驱动搜索（`?q=`），StoreSearch Client Component + /agent RSC searchParams + getStores 扩展

### 数据流
用户输入 → StoreSearch (CC) → router.push('/agent?q=xxx') → /agent RSC searchParams → getStores({ search }) → /api/stores?search= → Prisma OR contains → fallback 静态过滤 → sortStoresByLevel → 渲染

### 关键决策
1. StoreSearch 为 "use client" 组件（需 useState + useRouter）
2. getStores 新增 search 和 level 参数，API-first + static fallback 模式
3. API 搜索 OR 扩展 provinceLabel/cityLabel/district
4. public_featured 排序改为旗舰优先
5. FeaturedStores 改用 level === "flagship" 过滤

## 关键取舍与风险

- 搜索为全量服务端搜索（非前端过滤），适合未来大量门店
- URL 参数驱动：可分享、可书签、SSR 友好
- 静态 fallback 搜索仅匹配内存数据，性能在大数据集下可接受（静态数据量小）

## 测试策略

- StoreSearch.test.tsx：渲染、Enter 跳转、清空按钮
- FeaturedStores.test.tsx：更新 mock 参数验证旗舰过滤
- data.test.ts：search/level 参数传递
- API 测试：验证搜索字段扩展

## Spec Patch

无（无需新增 delta spec，本 change 修改现有页面和组件）

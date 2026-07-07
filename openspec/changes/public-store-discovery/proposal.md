# Proposal: 公开站门店搜索 + 推荐门店旗舰化

## Why

1. 当前 `/agent` 门店页缺少搜索能力，用户只能浏览全部门店列表，未来门店数量增长后体验会恶化
2. 首页「推荐门店」无明确数据来源：`getStores({ limit: 4, sort: "public_featured" })` 仅按图片有无排序，未体现"推荐"的业务语义
3. 后台已有门店等级字段（flagship/premium/specialty/member），但前台未利用等级做推荐

## What Changes

1. 新增 `src/components/agent/StoreSearch.tsx` — URL 参数驱动的搜索组件（Client Component）
2. 修改 `src/lib/data.ts` — 扩展 `getStores` 参数支持 `search` 和 `level`
3. 修改 `src/app/agent/page.tsx` — 接收 `searchParams`，集成搜索组件，展示搜索结果
4. 修改 `src/components/FeaturedStores.tsx` — 只展示 `level === "flagship"` 的已开放门店
5. 修改 `src/app/api/stores/route.ts` — 扩展搜索字段 + 调整 `public_featured` 排序为旗舰优先

## Scope

- 公开站 `/agent` 页面
- 公开站首页「推荐门店」section
- 数据获取层 `getStores`
- API 层搜索和排序

## Non-Scope

- 不新增 `isRecommended` / `featured` 数据库字段
- 不修改后台管理页面
- 不修改省份/城市子页面 `/agent/[slug]` 和 `/agent/[slug]/[city]`
- 不修改门店详情页
- 不引入新依赖

---
change: public-store-discovery
design-doc: docs/superpowers/specs/2026-07-07-public-store-discovery-design.md
base-ref: 3f5ce59ef05926d8d6ad81fc0a70ad29ac9dce11
archived-with: 2026-07-07-public-store-discovery
---

# Implementation Plan: 公开站门店搜索 + 推荐门店旗舰化

## 任务依赖

```
Task 1 (getStores扩展) ──┬── Task 3 (StoreSearch CC) ── Task 4 (/agent集成)
                         │
Task 2 (API调整) ────────┤
                         │
                         └── Task 5 (FeaturedStores) ─── Task 6 (测试+build)
```

## Task 1: 扩展 getStores 参数

**文件**: `src/lib/data.ts`

- 类型参数新增 `search?: string` 和 `level?: StoreLevel | StoreLevel[]`
- API 路径：search → `searchParams.set("search", params.search)`，level → 逐个 `searchParams.append("level", l)`
- Static fallback：search 匹配 `name/cityLabel/provinceLabel/district/address/phone`，level 过滤 `(s.level ?? "flagship")`

**验证**: `npx vitest run src/lib/data.test.ts`

## Task 2: 调整 API 搜索字段 + 排序

**文件**: `src/app/api/stores/route.ts`

- search OR 条件增加 `provinceLabel`、`cityLabel`、`district`
- `public_featured` 排序改为旗舰优先：
  ```ts
  public_featured: [
    { level: "asc" },
    { imagePath: { sort: "asc", nulls: "last" } },
    { createdAt: "desc" },
  ]
  ```

**验证**: `npx vitest run src/app/api/stores/route.test.ts`

## Task 3: 新增 StoreSearch Client Component

**文件**: `src/components/agent/StoreSearch.tsx` (新建)

- `"use client"`，`initialKeyword?: string` prop
- `useState` + `useRouter`
- Enter/搜索按钮 → `router.push('/agent?q=' + encodeURIComponent(value))`
- 清空按钮（keyword 非空时显示）→ `router.push('/agent')`
- 视觉：`h-14 md:h-16`，`rounded-2xl`，`bg-zinc-900/80`，`border-zinc-700`，`focus:border-orange-500`

**验证**: 手动检查渲染 + 交互

## Task 4: 更新 /agent 页面

**文件**: `src/app/agent/page.tsx`

- 接收 `searchParams: Promise<{ q?: string }>`
- Hero 区 `<StoreSearch initialKeyword={keyword} />`
- `getStores({ search: keyword })` 传入搜索
- 搜索结果为空 → 空状态 UI（图标 + 文案 + 清除搜索链接）
- 已开放门店标题旁显示结果数量

**验证**: 手动检查 390px/768px/1440px

## Task 5: 更新 FeaturedStores 旗舰化

**文件**: `src/components/FeaturedStores.tsx`

- `getStores({ level: "flagship", limit: 4 })`
- 过滤 `isActive !== false`
- 无旗舰店 → `return null`
- 副标题：`"精选星辉旗舰店，优先展示已开放的旗舰服务中心。"`

**验证**: `npx vitest run src/components/FeaturedStores.test.tsx`

## Task 6: 测试 + Build 验证

- 更新 `FeaturedStores.test.tsx`：验证旗舰过滤逻辑
- 更新 `data.test.ts`：验证 search/level 参数
- `npm run build` 通过
- `npm test` 通过（排除 pre-existing failures）

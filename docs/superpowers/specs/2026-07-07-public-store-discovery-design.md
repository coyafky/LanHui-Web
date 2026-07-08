---
comet_change: public-store-discovery
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-07-public-store-discovery
status: final
---

# Design: 公开站门店搜索 + 推荐门店旗舰化

## 数据流

```
用户输入 → StoreSearch (CC)
  → router.push('/agent?q=xxx')
    → /agent page (RSC) 读取 searchParams.q
      → getStores({ search: keyword })
        → fetch /api/stores?search=xxx
          → Prisma OR contains (name/address/phone/slug + provinceLabel/cityLabel/district)
        → fallback: 静态 stores.filter(...)
      → sortStoresByLevel(result)
    → 渲染结果 + 空状态
```

## 1. StoreSearch 组件

位置：`src/components/agent/StoreSearch.tsx`（新 Client Component）

```
┌─────────────────────────────────────────────┐
│  🔍  输入省份、城市、区县或门店名称搜索...  ✕ │
└─────────────────────────────────────────────┘
```

- `"use client"`，接收 `initialKeyword?: string`
- `useState` 管理输入值，`useRouter` 做跳转
- Enter 或搜索图标点击 → `router.push('/agent?q=' + encodeURIComponent(value))`
- 清空按钮（有关键词时显示）→ `router.push('/agent')`
- 视觉：`h-14 md:h-16`，`rounded-2xl`，`bg-zinc-900/80`，`border-zinc-700`，`focus:border-orange-500`
- 移动端 `w-full`，桌面端 `max-w-3xl`

## 2. getStores 扩展

```ts
export async function getStores(params?: {
  province?: string;
  city?: string;
  limit?: number;
  sort?: "public_featured";
  search?: string;          // 新增
  level?: StoreLevel | StoreLevel[];  // 新增
}): Promise<Store[]>
```

- API 路径：search → `?search=xxx`，level → `?level=xxx&level=yyy`
- Fallback 静态数据同步支持 search（匹配 name/cityLabel/provinceLabel/district/address/phone）和 level 过滤

## 3. API 层调整

### 搜索字段扩展
在 `GET /api/stores` 的 search OR 条件中增加：
- `provinceLabel: { contains: search, mode: "insensitive" }`
- `cityLabel: { contains: search, mode: "insensitive" }`
- `district: { contains: search, mode: "insensitive" }`

### public_featured 排序改为旗舰优先
```ts
public_featured: [
  { level: "asc" },       // flagship 排最前（字母序 f < m < p < s）
  { imagePath: { sort: "asc", nulls: "last" } },
  { createdAt: "desc" },
]
```
注意：Prisma enum 按字母序排序（flagship < member < premium < specialty），正好旗舰排最前。

## 4. /agent 页面改造

- 接收 `searchParams: Promise<{ q?: string }>`
- Hero 内统计下方插入 `<StoreSearch initialKeyword={keyword} />`
- `getStores({ search: keyword })` 传入搜索关键词
- 已开放门店标题区域根据关键词展示不同文案和数量
- 搜索结果为空时渲染空状态 UI

## 5. FeaturedStores 改造

- `getStores({ level: "flagship", limit: 4 })` 只获取旗舰店
- 过滤 `isActive !== false`
- 无旗舰店 → `return null`（不渲染整个 section）
- 标题下新增副标题："精选星辉旗舰店，优先展示已开放的旗舰服务中心。"

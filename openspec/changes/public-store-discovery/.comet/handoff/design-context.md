# Comet Design Handoff

- Change: public-store-discovery
- Phase: design
- Mode: compact
- Context hash: 5ecd07f645859db2a3ec1b96b234d33fc7cec27f976fe2333e80ba54434247cb

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/public-store-discovery/proposal.md

- Source: openspec/changes/public-store-discovery/proposal.md
- Lines: 1-30
- SHA256: 85e53c8e501299b51955c7dc6ced4943df05b09164ba7c49ea3f3bf6a74527c1

```md
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
```

## openspec/changes/public-store-discovery/design.md

- Source: openspec/changes/public-store-discovery/design.md
- Lines: 1-66
- SHA256: 22edf88e8bd1f8f1734dd12cb6a8cfd2b46d4978ce7dbb7d85753e5fbf53fe7f

```md
# Design: 公开站门店搜索 + 推荐门店旗舰化

## 架构分层

```
┌─ UI 层 ──────────────────────────────────────┐
│  StoreSearch (CC)  │  /agent page (RSC)       │
│  URL param ?q=     │  searchParams + getStores│
│                    │  FeaturedStores (RSC)     │
├─ 数据层 ──────────────────────────────────────┤
│  getStores({ search?, level? })               │
│  API-first → static fallback (同步 search)    │
├─ API 层 ──────────────────────────────────────┤
│  GET /api/stores?search=&level=&sort=         │
│  扩展 OR 字段 + 旗舰优先排序                  │
└──────────────────────────────────────────────┘
```

## 1. StoreSearch 组件

位置：`src/components/agent/StoreSearch.tsx`（新 Client Component）

```
┌──────────────────────────────────────────┐
│  🔍  输入省份、城市、区县或门店名称搜索...  │  ← h-16, rounded-2xl
│                                        ✕  │  ← 清空按钮（有关键词时）
└──────────────────────────────────────────┘
```

- 读取 `initialKeyword` prop（来自服务端 searchParams）
- 用户 Enter 或点击搜索 → `router.push('/agent?q=...')`
- 有关键词时显示清空按钮 → `router.push('/agent')`
- 视觉：bg-zinc-900/80 + border-zinc-700 + focus:border-orange-500 + rounded-2xl

## 2. getStores 扩展

```ts
export async function getStores(params?: {
  province?: string;
  city?: string;
  limit?: number;
  sort?: "public_featured";
  search?: string;   // 新增
  level?: StoreLevel | StoreLevel[];  // 新增
}): Promise<Store[]>
```

- API 路径：search → `?search=xxx`，level → `?level=xxx&level=yyy`
- Fallback 静态数据同步支持搜索（匹配 name/cityLabel/provinceLabel/district/address/phone）

## 3. API 层调整

### 搜索字段扩展
在现有 `OR` 条件中增加 `provinceLabel`、`cityLabel`、`district` 三个字段。

### public_featured 排序改为旗舰优先
```
旗舰优先 → 有门店图片优先 → 创建时间稳定兜底
```

## 4. FeaturedStores 改为旗舰店

- `getStores({ level: "flagship" })` 或过滤 `level === "flagship"`
- 仍然过滤 `isActive !== false`
- 无旗舰店时整个 section 不渲染（返回 null）
- 标题下增加副标题："精选星辉旗舰店，优先展示已开放的旗舰服务中心。"
```

## openspec/changes/public-store-discovery/tasks.md

- Source: openspec/changes/public-store-discovery/tasks.md
- Lines: 1-6
- SHA256: 5190f2a491340e869da1afe530e469a131ae740c3a397f7fa2c895e2cc963828

```md
- [ ] Task 1: 扩展 `getStores` 参数 — 新增 `search` 和 `level`，同步更新 API 调用和静态 fallback
- [ ] Task 2: 调整 API 搜索字段 + `public_featured` 排序为旗舰优先
- [ ] Task 3: 新增 `StoreSearch` Client Component（搜索框 UI + URL 跳转逻辑）
- [ ] Task 4: 更新 `/agent` 页面 — 集成搜索组件、接收 searchParams、展示搜索结果和空状态
- [ ] Task 5: 更新 `FeaturedStores` — 只展示星辉旗舰店（level === "flagship"）
- [ ] Task 6: 更新/补充测试 + `npm run build` 验证
```


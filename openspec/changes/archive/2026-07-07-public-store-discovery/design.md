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

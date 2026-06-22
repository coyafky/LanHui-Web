# SPEC: 门店网络 Agent/Store

> 对应 PRD：`docs/PRD/public-site/AGENT_PUBLIC_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

全国门店网络浏览、省份/城市/等级筛选、门店详情展示。DB 驱动，ISR。

## 2. 路由

| 路径 | 类型 | 说明 | F# | 面包屑 | 状态 |
|------|------|------|----|--------|------|
| `/agent` | page (revalidate=3600) | 全国门店总页 | F1 | 首页 › 门店网络 | ✅ |
| `/agent/[slug]` | page (generateStaticParams, revalidate=3600) | 省份门店页 | F2 | 首页 › 门店网络 › 省份名 | ✅ |
| `/agent/[slug]/[city]` | page (generateStaticParams, revalidate=3600) | 城市门店列表 | F3 | 首页 › 门店网络 › 省份名 › 城市名 | ✅ |
| `/agent/store/[id]` | page (generateStaticParams, revalidate=86400) | 门店详情+JSON-LD | F4 | 首页 › 门店网络 › 省份名 › 城市名 › 门店名 | ✅ |

### 待补功能

| F# | 功能 | 路由 | 优先级 | 状态 |
|----|------|------|--------|------|
| F9 | 省份/城市/等级三级筛选 | `/agent` | P1 | ⚪ 待补 |
| F11 | 移动端底部 Sheet 筛选器 | `/agent` | P1 | ⚪ 待补 |
| F12 | 单店大卡片布局（当前单店阶段专用） | `/agent` | P1 | ⚪ 待补 |
| F13 | 已选条件标签/清除 | `/agent` | P1 | ⚪ 待补 |
| F14 | 无结果状态展示 | `/agent` | P1 | ⚪ 待补 |
| F15 | 其他省份入口（省内无门店时） | `/agent/[province]` | P1 | ⚪ 待补 |

## 3. 数据模型

### 3.1 门店 Store (`src/lib/validations/store.ts`)

```typescript
type StoreStatus = "active" | "suspended" | "pending_review" | "draft" | "archived";
type StoreLevel = "flagship" | "premium" | "specialty" | "member";
```

核心字段：name, slug, address, phone, province, city, district, lat, lng, status, level, businessHours, imagePath, images.

### 3.2 门店等级

| 编码 | 名称 | 排序 | 颜色编码 | 说明 |
|------|------|------|---------|------|
| `flagship` | 星辉旗舰店 | 1（最高） | `bg-orange-500/10 text-orange-400 border-orange-500/20` | 完整形象、产品展示与施工服务 |
| `premium` | 星耀尊享店 | 2 | `bg-zinc-700 text-zinc-200 border-zinc-600` | 较完整的产品与服务能力 |
| `specialty` | 星辰专营店 | 3 | `bg-zinc-700 text-zinc-200 border-zinc-600` | 聚焦蓝辉指定产品与施工 |
| `member` | 星光会员店 | 4（最低） | `bg-zinc-700 text-zinc-200 border-zinc-600` | 蓝辉合作服务门店 |

等级不能显示为星级评分（1-5 星），避免与消费者评分混淆。

### 3.3 地理层级

```
省份 Province (slug, name, code)
  └── 城市 City (slug, name, code, provinceSlug)
       └── 门店 Store (具体地址, 联系方式)
```

## 4. 页面结构

### 4.1 `/agent`（全国门店首页）

1. **Hero**：门店网络标题 + 简介
2. **筛选条**：省份 + 城市 + 等级三级筛选（桌面），底部 Sheet（移动端）
3. **已开通省份快捷入口**：省份卡片网格
4. **门店结果列表**：卡片网格，支持等级徽标
5. **无结果/建设说明**：当前无门店时的友好提示
6. **总部咨询**：统一咨询入口

### 4.2 `/agent/[province]`（省份页）

1. **面包屑**：首页 › 门店网络 › 省份名
2. **省份标题 + 门店数量**
3. **城市入口**：城市卡片网格
4. **等级筛选**：按门店等级过滤
5. **省内门店结果**：卡片网格
6. **其他省份入口**：省内无门店时的导航

### 4.3 `/agent/[province]/[city]`（城市页）

1. **面包屑**：首页 › 门店网络 › 省份名 › 城市名
2. **城市标题 + 门店数量**
3. **等级筛选**：按门店等级过滤
4. **城市门店结果**：卡片网格
5. **省内其他城市**：导航入口

### 4.4 `/agent/store/[id]`（门店详情）

1. **面包屑**：首页 › 门店网络 › 省份名 › 城市名 › 门店名
2. **门店名称 + 等级徽标**
3. **封面图 + 联系信息**（地址、电话、营业时间）
4. **门店介绍**
5. **服务/营业说明**
6. **电话/微信 CTA**：点击拨号、微信咨询
7. **同城/省内其他门店**：相关推荐

## 5. 筛选规范

### 5.1 三级筛选条（桌面端）

| 层级 | 组件 | 数据源 | 说明 |
|------|------|--------|------|
| 省份 | `<select>` 下拉或按钮组 | `/api/provinces` | 选择后联动加载城市 |
| 城市 | `<select>` 下拉或按钮组 | `/api/cities?province={slug}` | 依赖省份选择 |
| 等级 | `<select>` 下拉或标签组 | 枚举 `StoreLevel` | 独立筛选，不依赖省市 |

筛选状态同步到 URL searchParams（如 `?province=guangdong&level=flagship`），支持分享和浏览器回退。

### 5.2 移动端 Sheet 筛选器

- **触发方式**：页面顶部"筛选"按钮，触控目标 >= 44px
- **面板样式**：从底部滑入，背景半透明遮罩
- **布局**：
  - 省份：滚动列表，选中高亮
  - 城市：滚动列表，选中高亮
  - 等级：标签组，支持单选
- **操作**：
  - "确定"按钮应用筛选并关闭 Sheet
  - "重置"按钮清除所有筛选条件
  - 点击遮罩或下滑手势关闭
- **响应式**：仅在 `max-width < 768px` 显示 Sheet，桌面端显示行内筛选条
- **数据联动**：省份选择后自动加载对应城市列表

### 5.3 已选条件标签

- 筛选生效后，在筛选条下方显示条件标签（如"广东 ×"、"旗舰店 ×"）
- 每个标签右侧有 × 按钮可单独清除
- 标签右侧有"清除全部"链接

## 6. 无结果状态

### 6.1 全国无门店

展示"建设中"提示 + 统一咨询入口（微信/电话），保留筛选结构为未来准备。

### 6.2 筛选无结果

用户选择省份/城市/等级后无匹配门店时：
- 展示空状态图标
- 提示文案："当前筛选条件下暂无门店"
- 建议操作："清除筛选条件"按钮
- 提供总部咨询入口

### 6.3 省内无门店

当省份下没有任何门店时（`/agent/[slug]`）：
- 明确告知该省暂无门店
- 提供"查看其他省份"入口 → 跳转 `/agent`

## 7. 其他省份入口

在 `/agent/[province]` 页面底部展示：

- **触发条件**：当前省份门店数量 < 1
- **展示内容**：其他已开通省份的快捷入口网格
- **交互**：点击省份卡片跳转到 `/agent/[slug]`
- **数据源**：`/api/provinces`（排除当前省份）

## 8. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| StoreCard | `src/components/agent/StoreCard.tsx` | 否 | 门店信息卡片（地址/电话/等级徽章） |
| StoreLevelBadge | `src/components/agent/StoreLevelBadge.tsx` | 否 | 等级颜色徽章 |
| sortStoresByLevel | `src/components/agent/sort-stores.ts` | 否 | 等级升序+id 稳定排序 |
| getStoreImage | `src/lib/image.ts` | 否 | 图片路径解析（优先级） |

### 待补组件

| 组件 | 职责 | 关联 F# |
|------|------|---------|
| FilterBar | 三级筛选条（桌面端 select 联动） | F9 |
| MobileFilterSheet | 移动端底部 Sheet 筛选器 | F11 |
| FilterTags | 已选条件标签/清除 | F13 |
| EmptyState | 无结果状态展示 | F14 |
| ProvinceNav | 其他省份入口导航 | F15 |

## 9. 数据流程

```
API /api/stores → data.ts (API-first, 静态 fallback)
     → getStores(params) / getStoreById(id)
     → 页面组件渲染
```

筛选数据流：

```
URL searchParams → 组件初始化（读取筛选状态）
         ↓
    用户操作筛选组件
         ↓
    更新 searchParams（同步 URL）
         ↓
    API 请求（传筛选参数）
         ↓
    渲染筛选结果
```

## 10. 已知问题

- [P0-6] 22 条测试门店数据污染，API 不过滤 → 公开站展示含草稿门店
- [P1-3] perf 64/75，27+ 卡片渲染慢
- [P1-13] store_view 埋点缺失 → 热门门店 Top 10 空

## 11. 验收条件

- [ ] 4 个路由 200 可达
- [ ] 省/市/门店三级导航正常
- [ ] 门店详情信息完整展示
- [ ] 电话派生 `tel:` 格式正确
- [ ] 等级徽标正确显示
- [ ] 等级筛选功能正常
- [ ] 面包屑导航正确（4 路由各自路径）
- [ ] JSON-LD LocalBusiness 输出正确
- [ ] 三视口布局正确（1440 / 768 / 390）
- [ ] 移动端筛选 Sheet 可用
- [ ] 无结果状态友好提示（全国 / 筛选 / 省内三种场景）
- [ ] 其他省份入口正常跳转
- [ ] 已选条件标签可单独清除和全部清除
- [ ] 筛选状态同步 URL searchParams
- [ ] Lighthouse mobile perf >= 80

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | 门店网络路由+数据模型+StoreCard 组件实现 | 完成 | — |
| 2026-06-21 | Claude Code | 等级筛选+分组+Badge 排序实现 | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 | 完成 | — |

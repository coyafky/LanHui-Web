# 蓝辉门店网络 PRD（公开站）

> **路由**：`/agent`、`/agent/[province]`、`/agent/[province]/[city]`、`/agent/store/[id]`
> **版本**：v1（合并 2026-06-20 实现版 + 2026-06-21 规划版）
> **最后更新**：2026-06-22
>
> **来源**：从 `AGENT_PUBLIC_PRD_2026-06-20.md`（v1 实现版）与 `STORE_NETWORK_PRD_2026-06-21.md`（v0.2 规划版）合并
> **当前实现状态**：见 `docs/SPEC/public-site/agent-store.md`

---

## 1. 系统目标

让车主能够通过官网找到蓝辉的合作门店，了解门店信息和联系方式，并最终完成咨询或到店。公开站门店数据与后台 CMS 共享同一数据源（Store 表 + Province/City 地区表），只展示 `status='active'` 的门店。

系统必须保证：
- 只有营业中的门店出现在公开站
- 门店暂停或终止合作后，公开站立即隐藏
- 门店信息与后台 CMS 实时同步

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 | 查找附近门店 | 按省/市浏览门店列表 | P0 |
| 车主 | 了解门店详情 | 看到地址、电话、营业时间、介绍 | P0 |
| 车主 | 联系门店 | 点击电话直接拨打、微信咨询 | P0 |
| 车主 | 导航到店 | 点击导航获取路线 | P1 |
| 车主 | 按等级筛选门店 | 按旗舰店/尊享店/专营店/会员店筛选 | P1 |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 全国门店首页（省份网格入口） | `/agent` | P0 | ✅ |
| F2 | 省份门店列表（含城市入口） | `/agent/[province]` | P0 | ✅ |
| F3 | 城市门店列表（门店卡片网格） | `/agent/[province]/[city]` | P0 | ✅ |
| F4 | 门店详情页（信息 + 联系 CTA） | `/agent/store/[id]` | P0 | ✅ |
| F5 | 面包屑导航 | 全部 | P0 | ✅ |
| F6 | JSON-LD LocalBusiness | 门店详情 | P0 | ✅ |
| F7 | 国际电话格式自动派生 `tel:` | 门店详情 | P0 | ✅ |
| F8 | 门店等级徽标（旗舰店/尊享店/专营店/会员店） | 全部 | P1 | ✅ |
| F9 | 省份/城市/等级三级筛选 | `/agent` | P1 | ⚪ 待补 |
| F10 | 门店排序（等级→slug 升序） | 全部 | P1 | ✅ |
| F11 | 移动端底部 Sheet 筛选器 | `/agent` | P1 | ⚪ 待补 |
| F12 | 单店大卡片布局（当前单店阶段专用） | `/agent` | P1 | ⚪ 待补 |
| F13 | 已选条件标签/清除 | `/agent` | P1 | ⚪ 待补 |
| F14 | 无结果状态展示 | `/agent` | P1 | ⚪ 待补 |
| F15 | 其他省份入口（省内无门店时） | `/agent/[province]` | P1 | ⚪ 待补 |

---

## 4. 页面结构

### 4.1 `/agent`（全国门店首页）

1. **Hero**：门店网络标题 + 简介
2. **筛选条**：省份 + 城市 + 等级三级筛选（桌面），底部 Sheet（移动端）
3. **已开通省份快捷入口**：省份卡片网格
4. **门店结果列表**：卡片网格，支持等级徽标
5. **无结果/建设说明**：当前无门店时的友好提示
6. **总部咨询**：统一咨询入口

### 4.2 `/agent/[province]`（省份页）

1. **面包屑**：首页 › 门店网络 › 广东
2. **省份标题 + 门店数量**
3. **城市入口**：城市卡片网格
4. **等级筛选**：按门店等级过滤
5. **省内门店结果**：卡片网格
6. **其他省份入口**：省内无门店时的导航

### 4.3 `/agent/[province]/[city]`（城市页）

1. **面包屑**：首页 › 门店网络 › 广东 › 佛山
2. **城市标题 + 门店数量**
3. **等级筛选**：按门店等级过滤
4. **城市门店结果**：卡片网格
5. **省内其他城市**：导航入口

### 4.4 `/agent/store/[id]`（门店详情）

1. **面包屑**：首页 › 门店网络 › 广东 › 佛山 › 门店名
2. **门店名称 + 等级徽标**
3. **封面图 + 联系信息**（地址、电话、营业时间）
4. **门店介绍**
5. **服务/营业说明**
6. **电话/微信 CTA**：点击拨号、微信咨询
7. **同城/省内其他门店**：相关推荐

---

## 5. 门店等级

| 编码 | 名称 | 排序 | 说明 |
|---|---|---|---|
| `flagship` | 星辉旗舰店 | 1 | 完整形象、产品展示与施工服务 |
| `premium` | 星耀尊享店 | 2 | 较完整的产品与服务能力 |
| `specialty` | 星辰专营店 | 3 | 聚焦蓝辉指定产品与施工 |
| `member` | 星光会员店 | 4 | 蓝辉合作服务门店 |

等级不能显示为星级评分（1-5 星），避免与消费者评分混淆。

---

## 6. UI / 交互规范

### 6.1 视觉规范

- **背景**：`bg-zinc-950`
- **卡片**：`bg-zinc-900`，`rounded-2xl`，`hover:bg-zinc-800`
- **等级徽标**：`bg-orange-500/10 text-orange-400 border border-orange-500/20`
- **省份入口**：大号卡片网格
- **筛选条**：搜索 input + `<select>` 联动
- **移动端筛选**：底部 Sheet，触控目标 ≥ 44px

### 6.2 响应式

| 视口 | 列表布局 | 筛选 |
|---|---|---|
| Desktop 1440 | 3 列卡片网格 | 行内筛选条 |
| Tablet 768 | 2-3 列 | 行内筛选条 |
| Mobile 390 | 单列 | 底部 Sheet |

### 6.3 少量门店策略

- 全国无门店 → 展示"建设中" + 统一咨询
- 某省无门店 → 明确告知 + 查看其他省份
- 单店阶段 → 突出"顺德大良店"，保留筛选结构为未来准备
- 卡片布局自适应：1 店用大卡片，2 店双列，3+ 三列

---

## 7. 数据模型

### 7.1 公开站 Store 最低契约字段

| 字段 | 类型 | 来源 | 说明 |
|---|---|---|---|
| id | String | DB Store | 唯一标识 |
| slug | String | DB Store | URL 友好标识 |
| name | String | DB Store | 门店名称 |
| status | StoreStatus | DB Store | 只返回 active |
| level | StoreLevel | DB Store | 门店等级 |
| provinceSlug | String | DB Store | 省份编码 |
| provinceLabel | String | DB Store | 省份中文名 |
| citySlug | String | DB Store | 城市编码 |
| cityLabel | String | DB Store | 城市中文名 |
| address | String | DB Store | 详细地址 |
| phone | String | DB Store | 11 位电话 |
| businessHours | String? | DB Store | 营业时间 |
| description | String? | DB Store | 门店介绍 |
| imagePath | String? | DB Store | 封面图路径 |

### 7.2 数据流

```
API GET /api/stores → 只返回 status='active' 的门店
               ↓
        失败 fallback 静态数据 (src/lib/store.ts)
               ↓
        generateStaticParams 枚举省/市/门店
               ↓
        ISR revalidate=3600s (列表) / 86400s (详情)
```

### 7.3 地区数据

省份和城市来自 DB Province/City 表，运行时唯一真相源：

```
GET /api/provinces → Province 表（含门店计数）
GET /api/cities?province={slug} → City 表（含门店计数）
```

---

## 8. 与后台 CMS 的契约

- Province/City 是独立主数据，不是随门店任意填写的普通文本
- Store 只关联系统中已启用的省份和城市
- 门店等级共享枚举：`flagship | premium | specialty | member`
- 公开站只读 `status='active'` 的门店
- 后台状态变更（suspend/terminate）后，公开站 ISR 过期后更新

---

## 9. 当前实现差距

- 当前只有 `isActive` 布尔，没有四状态（pending/active/suspended/terminated）
- 静态数据 `src/lib/store.ts` 含演示门店，需清理
- 电话含固话格式不一致
- 门店卡片实现分散，无统一筛选组件
- 缺少等级徽标后端字段（前端已实现等级徽标 UI）
- 缺少移动端底部 Sheet 筛选器
- 无 URL 筛选参数同步

---

## 10. P0-1 Bug：Agent 路由 audit 404

**根因**：`scripts/audit/lib/collect-routes.mjs` 的 `extractAgentRegion()` 函数从 `china-regions.ts` 取首个 value 为 `"beijing"`，但实际门店 province 是 `"guangdong"`，导致 audit 脚本所有 agent 路由 404。

**修复方案 A（必修）**：改 collect-routes.mjs 从 `store.ts` 正则提取真实拼音省 slug。

**同源 bug**：`extractWindowFilmSlugs` 误从 `products.ts` 而非 `window-film-details.ts` 取 slug。

---

## 11. 验收标准

- [ ] 4 个路由 200 可达
- [ ] 省/市/门店三级导航正常
- [ ] 门店详情信息完整展示
- [ ] 电话派生 `tel:` 格式正确
- [ ] 等级徽标正确显示
- [ ] 等级筛选功能正常
- [ ] 面包屑导航正确
- [ ] JSON-LD LocalBusiness 输出正确
- [ ] 三视口布局正确
- [ ] 移动端筛选 Sheet 可用
- [ ] 无结果状态友好提示
- [ ] Lighthouse mobile perf ≥ 80

---

## 12. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 完整 4 路由规格，含 P0-1 修复 + DoD | Coya |
| 2026-06-21 | v0.2 | 门店网络重新设计，含等级/筛选/排序体系 | Coya / Codex |
| 2026-06-22 | v1 | 合并实现版与规划版为 canonical PRD | Coya |

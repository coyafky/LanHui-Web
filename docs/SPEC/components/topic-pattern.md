# SPEC: 产品页面组件模式 Product Topic Pattern

> 实现状态：✅ **v1 模式完成，v2 品牌/车型/服务页模式待扩展**

---

## 1. 模式总结

产品页面组件模式从原来的“专题 5 组件”升级为四类页面共用的产品展示体系：

1. `/product` 产品中心入口页；
2. `/product/{serviceSlug}` 服务项目页；
3. `/product/{brandSlug}` 品牌专题页；
4. `/product/{brandSlug}/{modelSlug}` 单车型专题页。

组件设计必须支持内容展示、路由分流、项目解释和 SEO 内链，不承担每个产品页的私有承接逻辑。

## 2. 全局设计规则

| 维度 | 规范 |
|---|---|
| 视觉方向 | 新能源科技、精密工业、克制豪华；避免通用模板感 |
| 图像比例 | 产品/项目卡统一 `aspect-[4/3] + object-contain + Next/Image sizes` |
| 图像状态 | `matched` / `pending-review` / `missing` 三态必须可见 |
| 响应式 | 375 / 768 / 1024 / 1440 断点；移动端无横向滚动 |
| 触控 | 可点击卡片、锚点、筛选项触控区域不小于 44px |
| 可访问性 | focus 可见；图像有 alt；当前锚点/筛选状态不能只靠颜色 |
| 动效 | 150–300ms，用于状态反馈和层级切换；支持 reduced-motion |
| 性能 | Hero 图按需 priority；下方图片 lazy load；预留尺寸防 CLS |

## 3. 标准组件清单

### 3.1 入口页组件

| 组件 | 建议文件名 | Client? | 职责 |
|---|---|---:|---|
| ProductIndexHero | `ProductIndexHero.tsx` | 否 | `/product` 首屏说明 |
| ProductEntrySwitch | `ProductEntrySwitch.tsx` | 是 | 按车型/按项目锚点跳转 |
| BrandModelMatrix | `BrandModelMatrix.tsx` | 否 | 品牌与车型矩阵 |
| ServiceProjectGrid | `ServiceProjectGrid.tsx` | 否 | P0/P1 项目卡片 |
| UpgradeComboGuide | `UpgradeComboGuide.tsx` | 否 | 热门升级组合 |

### 3.2 品牌/车型专题组件

| 组件 | 文件名模式 | Client? | 职责 |
|---|---|---:|---|
| BrandTopicHero | `{Brand}TopicHero.tsx` | 否 | 品牌页首屏 |
| ModelSwitcher | `{Brand}ModelSwitcher.tsx` | 是 | 品牌下车型切换 |
| VehicleTopicHero | `{Model}TopicHero.tsx` | 否 | 单车型页首屏 |
| AnchorNav | `{Topic}AnchorNav.tsx` | 是 | 页面内项目分组跳转 |
| ProductCard | `{Topic}ProductCard.tsx` | 是 | 项目卡片，含图片三态和内链 |
| ProductGrid | `{Topic}ProductGrid.tsx` | 否 | 项目网格 |
| ProductTable | `{Topic}ProductTable.tsx` | 否 | 参数/适配/验收表格 |
| TopicBanner | `{Topic}TopicBanner.tsx` | 否 | 产品中心入口横幅 |

### 3.3 服务项目组件

| 组件 | 建议文件名 | Client? | 职责 |
|---|---|---:|---|
| ServiceProjectHero | `ServiceProjectHero.tsx` | 否 | 服务项目页首屏 |
| ProjectValueGrid | `ProjectValueGrid.tsx` | 否 | 痛点与价值 |
| SuitableModelList | `SuitableModelList.tsx` | 否 | 适合车型 |
| FitSpecTable | `FitSpecTable.tsx` | 否 | 适配/参数表 |
| ServiceProcessSection | `ServiceProcessSection.tsx` | 否 | 施工流程 |
| AcceptanceChecklist | `AcceptanceChecklist.tsx` | 否 | 验收标准 |
| RelatedVehicleLinks | `RelatedVehicleLinks.tsx` | 否 | 车型页内链 |

## 4. 图片三态模型

```ts
type ImageStatus = "matched" | "pending-review" | "missing";
```

| 状态 | 显示 | 含义 | UI 要求 |
|---|---|---|---|
| matched | 真实产品图 | 图片已就位 | 正常展示 |
| pending-review | 占位 + 待审核标记 | 已有素材但未确认 | 不影响布局，显示审核状态 |
| missing | 占位图形 + 文案 | 未上传图片 | 有稳定占位和文字说明 |

## 5. 图片容器规格

### 5.1 基础规格

`aspect-[4/3] + object-contain + Next/Image sizes` — 产品卡片、项目卡片、品牌/车型卡片默认统一。

### 5.2 图片 `sizes` 策略

| 使用场景 | sizes 值 | 说明 |
|---|---|---|
| 产品/项目卡片 | `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw` | 大屏 4 列，中屏 3 列，小屏 2 列 |
| 专题横幅 | `(min-width: 768px) 40vw, 100vw` | 中屏以上占 40%，移动端全宽 |
| Hero / 大图 | `(min-width: 1024px) 50vw, 100vw` | 半宽或全宽 |
| 海报长图展示 | 固定容器宽度 + `object-contain` | 不作为默认项目卡比例 |

### 5.3 字面量类型保证

图片规格使用字面量类型防规格漂移：

```ts
type Width = 1448;
type Height = 1086;
type Ratio = "4/3";
```

海报长图需要单独声明尺寸和用途，不能混入 4:3 产品卡数据。

## 6. 组件交互契约

### 6.1 ProductCard

ProductCard 必须支持：

- 项目名称；
- 项目分组；
- 图片三态；
- 适配说明；
- 可选服务页内链；
- 可选车型页内链；
- planned / live 状态展示。

ProductCard 不负责页面私有承接逻辑。

### 6.2 AnchorNav

AnchorNav 必须支持：

- 当前 section 高亮；
- 键盘 Tab 可访问；
- sticky 时不遮挡标题；
- 移动端可横向滚动，但不能让页面整体横向滚动；
- active 状态同时使用文字/下划线/形状，不只靠颜色。

### 6.3 ProductTable / FitSpecTable

表格必须支持：

- 明确表头；
- 移动端可读；
- 数据为空时有 empty state；
- 适配/验收类信息不能只放在图片里。

## 7. 各专题实现完整性

| 专题 | 组件目录 | 主题色 | 5 组件完备 | 3 态图片 | 字面量类型 | CI 验证脚本 | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| 问界 Wenjie | `src/components/wenjie/` | cyan | ✅ | ✅ | ✅ | ❌ | 44 款图全 pending，待素材确认 |
| 小米 Xiaomi | `src/components/xiaomi/` | orange | ✅ | ✅ | ✅ | ❌ | 需拆分 SU7/YU7 二级车型页 |
| 极氪 Zeekr | `src/components/zeekr/` | orange | ✅ | ✅ | ✅ | ✅ | canonical 示例 |
| 地板 Flooring | `src/components/product/` | amber | ❌ | ❌ | ❌ | ❌ | 应升级为服务项目页模式 |

## 8. 验收条件

- [ ] 新增产品页面优先复用本组件模式，不新增孤立风格。
- [ ] 所有项目卡支持图片三态，缺图不影响布局。
- [ ] 车型页与服务页通过内链互相连接。
- [ ] 390px、768px、1024px、1440px 下布局均可读。
- [ ] 可点击元素触控区域不小于 44px，并有可见 focus。
- [ ] 动效尊重 reduced-motion，且不触发布局抖动。
- [ ] 新增主题若使用图片资产，必须提供规格校验或明确人工验收项。

---

> 最后更新: 2026-06-25

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-13 | Claude Code | 专题组件模式初始定义（问界/小米） | 完成 | — |
| 2026-06-16 | Claude Code | ZEEKR 专题模式定型 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-25 | Codex | 升级为产品入口、服务项目、品牌专题、车型专题四类页面组件契约 | 文档完成 | 待实现 |

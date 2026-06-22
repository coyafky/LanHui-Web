# 蓝辉品牌中心 PRD

> **路由**：`/brand`、`/brand/certifications`、`/brand/history`
> **版本**：v1（合并 2026-06-20 实现版 + 2026-06-22 规划版）
> **最后更新**：2026-06-22
>
> **来源**：从 `BRAND_PRD_2026-06-20.md`（v1 实现版）与 `BRAND_CENTER_PRD_2026-06-22.md`（v0.1 规划版）合并
> **当前实现状态**：见 `docs/SPEC/public-site/brand.md`

---

## 1. 系统目标

品牌中心需要回答"为什么是蓝辉"，把蓝辉的战略聚焦、产品能力、供应链、门店交付和售后支持组织成可以验证的品牌证据。让潜客在 3 分钟内建立"蓝辉轻改是正规、源头、专业、有沉淀"的品牌信任。

- 用资质证书和发展历程两个子页分别承载"合规凭证"和"时间轴叙事"两个信任维度
- 统一品牌子站视觉语言（深色 + 蓝橙 + rounded-2xl 卡片）
- 沉淀 Logo 资产规范，作为后续物料 / 后台 / 多平台的源头

### 1.1 核心品牌主张

> 蓝辉轻改聚焦新能源车型，以车型适配为起点，连接产品供应、轻改方案、门店施工与售后支持。

"轻量、实用、有审美"作为产品与设计原则保留，但不替代企业能力说明。

### 1.2 范围

- ✅ 包含：3 个公开路由 + 共享 Header / Footer + Logo 组件视觉规范
- ✅ 包含：资质证书数据结构、发展历程时间轴
- ✅ 包含：品牌定位、六项能力、产品与项目展示、服务落地说明
- ❌ 不包含：完整 VI 手册 / 招商物料 / 品牌动态视频
- ❌ 不包含：营业执照原件 PDF 在线展示（法律风险）
- ❌ 不包含：虚构企业规模和发展里程碑

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 潜客 | 想确认这家店正规 | 看到资质证书分类 + 占位图 + 到店出示说明 | P0 |
| 潜客 | 想知道品牌靠不靠谱 | 看到品牌介绍 + 战略聚焦 + 能力闭环 | P0 |
| 潜客 | 想了解品牌沉淀 | 看到发展时间线，关键节点高亮 | P1 |
| 车主 | 想直接到店 | 看到"顺德大良店"明确锚点 | P0 |
| 设计/运营 | 后续需要 Logo 资产 | 看到 Logo 资产目录规范 | P1 |
| 搜索引擎 | 抓取品牌页 | 独立 title / description / BreadcrumbList JSON-LD | P0 |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 品牌介绍 Hero（品牌名 + ABOUT 标签 + 简介） | `/brand` | P0 | ✅ |
| F2 | 品牌定位与战略聚焦说明 | `/brand` | P0 | ✅ |
| F3 | 六项核心能力展示（每项链接可验证页面） | `/brand` | P1 | ⚪ 待补 |
| F4 | 产品与车型项目展示 | `/brand` | P1 | ⚪ 待补 |
| F5 | 服务如何落地说明（流程 + 门店） | `/brand` | P1 | ⚪ 待补 |
| F6 | 品牌理念 3 列（轻量升级/实用优先/审美表达） | `/brand` | P0 | ✅ |
| F7 | 发展起点 2 卡（品牌成立 + 顺德大良店启航） | `/brand` | P0 | ✅ |
| F8 | 品牌动态与文章展示 | `/brand` | P1 | ⚪ 待补 |
| F9 | 资质证书 Hero + 面包屑 | `/brand/certifications` | P0 | ✅ |
| F10 | 4 大资质分类入口（营业执照/行业认证/门店资质/品牌合作） | `/brand/certifications` | P0 | ✅ |
| F11 | 证书网格（CertCard × N） | `/brand/certifications` | P1 | ✅（占位） |
| F12 | "关于证书核验"提示段 | `/brand/certifications` | P0 | ✅ |
| F13 | 品牌历程 Hero + 面包屑 | `/brand/history` | P0 | ✅ |
| F14 | 时间轴（桌面左右交替/移动端左侧单列） | `/brand/history` | P0 | ✅ |
| F15 | "里程碑"徽标（highlight 节点） | `/brand/history` | P1 | ✅ |
| F16 | "未完待续"引导区 → 跳转 /news | `/brand/history` | P1 | ✅ |
| F17 | Header/Footer Logo 使用 `lanhui-logo-light` 透明底 | 全部 | P0 | ✅ |
| F18 | Schema.org organization logo 路径修正 | 全部 | P0 | ✅ |
| F19 | favicon / apple-touch-icon 资产 | 全部 | P1 | ⚪ 待补 |
| F20 | 品牌子站 OG 图 | 全部 | P1 | ⚪ 待补 |

---

## 4. 页面结构

### 4.1 `/brand` 区块

1. **品牌定位 Hero**：渐变背景 + 品牌主张 + 副标题
2. **我们解决什么问题**：通用配件信息多、车型适配难判断、参数难以理解价值、产品/施工/售后割裂
3. **六项能力**：新能源聚焦、车型方案、供应链、一站式组合、门店施工、售后支持
4. **产品与项目**：产品线代表内容 + 问界/小米/极氪车型项目
5. **服务如何落地**：使用流程和真实门店说明从需求到交付的过程
6. **品牌内容**：品牌动态和重要文章入口
7. **CTA**：查看产品、查找门店
8. **品牌理念 3 列**：轻量升级 / 实用优先 / 审美表达
9. **发展起点 2 卡**：品牌成立 + 顺德大良店启航

### 4.2 `/brand/certifications` 区块

1. **Hero**：渐变背景 + 面包屑（品牌介绍 › 资质证书）+ CERTIFICATIONS 标签 + H1
2. **4 大资质分类入口**（2/4 列响应式）
3. **证书网格**（CertCard × N，1/2/3 列响应式）
4. **"关于证书核验"提示段**（以顺德大良店现场出示为准）

**资质原则**：
- 只展示能提供真实证书名称、颁发主体、有效信息和图片的资质
- 证书图片可点击放大
- 无法核实的证书不上线
- 无资质内容时不使用"六大认证"等固定数量
- 产品检测报告与企业资质分区展示

### 4.3 `/brand/history` 区块

1. **Hero**：渐变背景 + 面包屑（品牌介绍 › 品牌历程）+ MILESTONES 标签 + H1
2. **时间轴** `<ol>`：桌面左右交替 / 移动单列，中心 spine 渐变线
3. **"未完待续"引导区**（跳 /news）

**历程原则**：
- 只记录实际发生且能确认日期的事件
- 支持年份、事件标题、说明、图片
- 当前历程较短时采用简洁时间线
- "未来规划"必须明确标记为规划

---

## 5. UI / 交互规范

### 5.1 视觉规范

- **背景**：`bg-zinc-950` / `bg-black` / `bg-zinc-900`（卡片）
- **文字**：`text-white` / `text-zinc-300` / `text-zinc-400` / `text-zinc-500`
- **品牌色**：`orange-400/500` 强调 + `blue-400/500/700` 科技
- **里程碑徽标**：`bg-orange-500/10 border border-orange-700/50 text-orange-300`
- **资质分类图标**：`Award` icon `text-orange-400`
- **字体**：Geist Sans + 系统中文
- **圆角**：卡片 `rounded-2xl`，徽标 `rounded-md / rounded-xl`

### 5.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `Header` | `src/components/Header.tsx` | CC | 共享 |
| `Footer` | `src/components/Footer.tsx` | RSC | 共享 |
| `Logo` | `src/components/Logo.tsx` | RSC | 透明底/滚动缩放 |
| `CertCard` | `src/components/CertCard.tsx` | RSC | 单个证书卡片 |
| `TimelineDot` | 内联于 `history/page.tsx` | RSC | 时间轴圆点 |
| `MilestoneCard` | 内联于 `history/page.tsx` | RSC | 单个时间节点卡片 |

---

## 6. 数据模型

### 6.1 静态数据

| 文件 | 内容 | 引用方 |
|---|---|---|
| `src/lib/brand.ts` | 品牌名 / slogan / 成立年 / 城市 / 占位 | 3 路由 |
| `src/lib/certifications.ts` | `certifications[]` + `certCategories[]` | `/brand/certifications` |
| `src/lib/history.ts` | `milestones[]` | `/brand/history` |
| `src/lib/schema.ts` | `organization.logo` URL 指向 `lanhui-logo-light.png` | 全站 JSON-LD |

### 6.2 Logo 资产规范

```text
public/images/logo/
  lanhui-logo-light.svg        # 深色背景横版（Header/Footer）
  lanhui-logo-light.png        # 透明底 1600x400 兜底
  lanhui-logo-dark.svg         # 浅色背景横版
  lanhui-logo-dark.png
  lanhui-logo-color.svg        # 彩色标准版（品牌页）
  lanhui-logo-color.png
  lanhui-symbol.svg            # 仅图形 favicon/头像
  lanhui-symbol.png            # 512x512
  favicon.svg
  apple-touch-icon.png         # 180x180
```

### 6.3 SSR / ISR 配置

- 3 路由默认 SSG（`force-static`）
- 不设 `revalidate`（内容相对稳定）
- 部署时重建（Build time SSG）

---

## 7. 当前实现差距（来自 06-22 规划）

- 当前品牌页主要是品牌自述和三张理念卡，无法充分证明供应链、车型和交付能力
- `brand.ts` 中地址、电话、邮箱和备案仍包含占位信息
- "2026 年成立"等信息需要确认对外口径
- 部分页面存在"源头工厂、厂区面积、持证技师、官方质保"等表达，需要逐项建立证据或调整措辞

---

## 8. 验收标准（DoD）

### 8.1 功能

- [ ] 3 路由 200 可达，无 console error
- [ ] Header 高亮"品牌介绍"导航项
- [ ] 3 路由之间面包屑/链接互通
- [ ] 品牌页清楚说明战略聚焦、用户价值与能力闭环
- [ ] 每项核心能力都有产品、项目、门店、文章或资质证据
- [ ] 资质和历程全部可核实
- [ ] 时间轴里程碑高亮节点显示"里程碑"徽标
- [ ] 证书网格 hover 状态

### 8.2 性能

- [ ] `/brand` Lighthouse mobile perf ≥ 90（当前 96 ✅）
- [ ] `/brand/certifications` Lighthouse mobile perf ≥ 80（当前 63 ✗）
- [ ] LCP < 2.5s（desktop）/ < 4s（mobile）
- [ ] CLS = 0

### 8.3 Logo 视觉

- [ ] Header Logo 无灰色矩形底
- [ ] 滚动后 Logo 尺寸缩放自然
- [ ] Footer Logo 不突兀
- [ ] `/images/logo/*` 资源加载无 404

### 8.4 SEO

- [ ] 3 路由独立 `<title>` 和 `<meta description>`
- [ ] 3 路由均输出 BreadcrumbList JSON-LD
- [ ] canonical URL 正确
- [ ] `Organization.logo` Schema.org 指向 light 版本

---

## 9. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-14 | v0 | 初稿：Logo 与品牌视觉对齐 PRD | Coya |
| 2026-06-20 | v1 | 完整 8 节品牌子站规格，合并 Logo 规范 | Coya |
| 2026-06-22 | v0.1 | 品牌中心重新设计规划（战略聚焦+能力证据） | Coya / Codex |
| 2026-06-22 | v1 | 合并实现版与规划版为 canonical PRD | Coya |

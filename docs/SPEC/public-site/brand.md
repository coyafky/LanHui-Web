# SPEC: 品牌中心 Brand Center

> 对应 PRD：`docs/PRD/public-site/BRAND_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

品牌介绍、资质证书展示、品牌发展历程。

六大核心能力说明（从 PRD §1.1 提取）：
1. **新能源聚焦** — 以新能源车型为业务主轴，方案针对性适配
2. **车型方案** — 按车型输出匹配的轻改方案（踏板 / 轮毂 / 底盘 / 膜类）
3. **供应链** — 与上游原料供应商的合作框架
4. **一站式组合** — 轻改装备 + 膜系服务 + 施工交付闭环
5. **门店施工** — 到店沟通 → 车型确认 → 方案推荐 → 规范施工 → 交付验收
6. **售后支持** — 施工后的使用跟进与问题响应

---

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/brand` | page (RSC) | 品牌总页 | ✅ |
| `/brand/certifications` | page (RSC) | 资质证书墙 | ✅ |
| `/brand/history` | page (RSC) | 品牌历程时间线 | ✅ |

### 2.1 `/brand` 区块结构

1. **品牌定位 Hero** — 渐变背景 + ABOUT 标签 + H1 + 副标题（品牌名 + 成立年）
2. **关于蓝辉轻改** — 品牌成立、定位、门店说明三段
3. **品牌理念 3 列** — 轻量升级 / 实用优先 / 审美表达（卡片含图标）
4. **发展起点 2 卡** — 品牌成立 + 顺德大良店启航
5. **（待补）六项核心能力展示**
6. **（待补）产品与车型项目展示**
7. **（待补）服务落地流程说明**
8. **（待补）品牌动态与文章**

### 2.2 `/brand/certifications` 区块结构

1. **Hero** — 渐变背景 + 面包屑 + CERTIFICATIONS 标签 + H1 + 副标题
2. **4 大资质分类入口** — 2/4 列响应式网格
3. **证书网格** — CertCard × N，1/2/3 列响应式
4. **"关于证书核验"提示段** — 以顺德大良店现场出示为准

### 2.3 `/brand/history` 区块结构

1. **Hero** — 渐变背景 + 面包屑 + MILESTONES 标签 + H1 + 副标题
2. **时间轴** `<ol>` — 桌面左右交替 / 移动左列单栏，中心 spine 渐变线
3. **"未完待续"引导区** — 跳转 `/news`

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 品牌介绍 Hero（品牌名 + ABOUT 标签 + 简介） | `/brand` | P0 | ✅ |
| F2 | 品牌定位与战略聚焦说明 | `/brand` | P0 | ✅ |
| F3 | 六项核心能力展示（每项链接可验证页面） | `/brand` | P1 | ⚪ 待补 |
| F4 | 产品与车型项目展示 | `/brand` | P1 | ⚪ 待补 |
| F5 | 服务如何落地说明（流程 + 门店） | `/brand` | P1 | ⚪ 待补 |
| F6 | 品牌理念 3 列（轻量升级 / 实用优先 / 审美表达） | `/brand` | P0 | ✅ |
| F7 | 发展起点 2 卡（品牌成立 + 顺德大良店启航） | `/brand` | P0 | ✅ |
| F8 | 品牌动态与文章展示 | `/brand` | P1 | ⚪ 待补 |
| F9 | 资质证书 Hero + 面包屑 | `/brand/certifications` | P0 | ✅ |
| F10 | 4 大资质分类入口（营业执照 / 行业认证 / 门店资质 / 品牌合作） | `/brand/certifications` | P0 | ✅ |
| F11 | 证书网格（CertCard × N） | `/brand/certifications` | P1 | ✅（占位） |
| F12 | "关于证书核验"提示段 | `/brand/certifications` | P0 | ✅ |
| F13 | 品牌历程 Hero + 面包屑 | `/brand/history` | P0 | ✅ |
| F14 | 时间轴（桌面左右交替 / 移动端左侧单列） | `/brand/history` | P0 | ✅ |
| F15 | "里程碑"徽标（highlight 节点） | `/brand/history` | P1 | ✅ |
| F16 | "未完待续"引导区 → 跳转 /news | `/brand/history` | P1 | ✅ |
| F17 | Header/Footer Logo 使用 `lanhui-logo` 透明底 | 全部 | P0 | ✅ |
| F18 | Schema.org organization logo 路径修正 | 全部 | P0 | ✅ |
| F19 | favicon / apple-touch-icon 资产 | 全部 | P1 | ⚪ 待补 |
| F20 | 品牌子站 OG 图 | 全部 | P1 | ⚪ 待补 |

---

## 4. 数据模型

### 4.1 品牌信息 (`src/lib/brand.ts`)

```typescript
interface Brand {
  zh: string;              // "蓝辉轻改"
  en: string;              // "LANHUI"
  slogan: string;
  foundedYear: number;
  currentStore: string;    // "顺德大良店"
  city: string;
  phone: string;           // 含占位
  phoneTel: string;
  icp: string;             // 含占位
  police: string;          // 公安备案号（含占位）
  address: string;         // 含占位
  businessHours: string;   // 含占位
  email: string;
  shortDescription: string;
}
```

实际字段中 `phone` / `icp` / `police` / `address` / `businessHours` / `email` 含占位文本，需待真实信息确认后替换。

### 4.2 资质证书 (`src/lib/certifications.ts`)

```typescript
interface Certification {
  id: string;
  title: string;
  category: "营业执照" | "行业认证" | "门店资质" | "品牌合作";  // 4 种
  issuer: string;        // 颁发方占位
  issuedAt: string;      // 颁发日期占位（年/月）
  validUntil: string;    // 有效期占位
  description: string;
  badge: string;         // 占位徽章 emoji / 文本
}
```

6 条证书，4 分类。所有数据为占位，待真实证书补全后替换 `name` / `issuer` / `issuedAt` / `validUntil` / `badge`。

`certCategories` 导出分类元数据数组供分类入口渲染。

### 4.3 品牌历程 (`src/lib/history.ts`)

```typescript
interface Milestone {
  year: string;
  month?: string;
  title: string;
  description: string;
  highlight?: boolean;   // 标记关键里程碑
}
```

5 个里程碑（2026 Q1 ~ 未来），其中 2 个高亮（品牌成立、官网与产品矩阵发布）。

---

## 5. 关键组件

### 5.1 组件清单

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| Header | `src/components/Header.tsx` | CC | 共享导航 |
| Footer | `src/components/Footer.tsx` | RSC | 共享页脚 |
| Logo | `src/components/Logo.tsx` | RSC | 透明底，`lanhui-logo.png` 源 |
| CertCard | `src/components/CertCard.tsx` | RSC | 证书卡片（分类徽章 + 描述 + 有效期） |
| TimelineDot | 内联于 `history/page.tsx` | RSC | 时间轴圆点（蓝橙渐变 + 外环线） |
| MilestoneCard | 内联于 `history/page.tsx` | RSC | 单个时间节点卡片（高亮徽标 + 年份 + 标题 + 描述） |

### 5.2 视觉规范

| Token | 值 | 用途 |
|-------|-----|------|
| 背景 | `bg-zinc-950` / `bg-black` / `bg-zinc-900`（卡片） | 页面 / 卡片 |
| 文字主色 | `text-white` / `text-zinc-300` | 标题 / 正文 |
| 辅助文字 | `text-zinc-400` / `text-zinc-500` | 副标题 / 元信息 |
| 强调色 | `orange-400/500` | CTA / 高亮 |
| 科技色 | `blue-400/500/700` | 技术标签 / 链接 |
| 里程碑徽标 | `bg-orange-500/10 border border-orange-700/50 text-orange-300` | 高亮节点 |
| 资质分类图标 | `Award` icon `text-orange-400` | 证书分类入口 |
| 字体 | Geist Sans + 系统中文 | 全站 |
| 圆角 | 卡片 `rounded-2xl`，徽标 `rounded-md / rounded-xl` | 组件 |
| Hero 渐变 | `from-blue-950/30 via-zinc-950 to-zinc-950` | 3 路由 Hero |
| Hero 光晕 | `blue-700/20` + `orange-500/15` blur-3xl | Hero 装饰光晕 |

---

## 6. 数据流与渲染策略

### 6.1 静态数据

| 文件 | 内容 | 引用方 |
|------|------|--------|
| `src/lib/brand.ts` | 品牌名 / slogan / 成立年 / 门店 / 城市 / 占位信息 | 3 路由 |
| `src/lib/certifications.ts` | `certifications[]` + `certCategories[]` | `/brand/certifications` |
| `src/lib/history.ts` | `milestones[]` | `/brand/history` |
| `src/lib/schema.ts` | `organization.logo` URL 指向 `lanhui-logo.png` | 全站 JSON-LD |

### 6.2 Logo 资产规范（PRD §6.2）

```text
public/images/logo/
  lanhui-logo.png          # 标准版 2172x724（已实现）
  # 以下待补充：
  lanhui-logo-light.svg    # 深色背景横版（Header/Footer）
  lanhui-logo-light.png    # 透明底 1600x400 兜底
  lanhui-logo-dark.svg     # 浅色背景横版
  lanhui-logo-dark.png
  lanhui-logo-color.svg    # 彩色标准版（品牌页）
  lanhui-logo-color.png
  lanhui-symbol.svg        # 仅图形 favicon/头像
  lanhui-symbol.png        # 512x512
  favicon.svg
  apple-touch-icon.png     # 180x180
```

当前仅 `lanhui-logo.png`（2172x724）存在，其余 9 个文件待补充。

### 6.3 SSR / ISR 配置

- 3 路由均为 SSR（`force-static`）— 不设 `revalidate`
- 内容相对稳定，部署时通过 Build time SSG 重建
- 不依赖外部数据源，运行时无需数据库连接

### 6.4 JSON-LD 要求

- 3 路由均需输出 **BreadcrumbList** JSON-LD
- `/brand` 提供 `Organization` Schema（由 `src/lib/schema.ts` 的 `organizationSchema()` 生成）
- `Organization.logo` 指向 `lanhui-logo.png`
- canonical URL 正确指向各路由

---

## 7. 性能基线

| 路由 | 当前 Lighthouse mobile perf | 目标 | 审计编号 |
|------|----------------------------|------|---------|
| `/brand` | 96 ✅ | ≥ 90 | — |
| `/brand/certifications` | 63 ❌ | ≥ 80 | P1-2 |
| `/brand/history` | — | ≥ 80 | — |

**P1-2 性能瓶颈**（`/brand/certifications`）：
- LCP 6.0s（desktop）/ 估计 6-8s mobile
- 证书图未 lazy load
- 修复方向：CertCard 占位图使用低分辨率兜底 + `loading="lazy"` + 图片容器预留宽高防 CLS

**全品牌站 CLS = 0** ✅（无布局偏移）

---

## 8. 验收标准（DoD）

### 8.1 功能

- [ ] 3 路由 200 可达，无 console error
- [ ] Header 高亮"品牌介绍"导航项
- [ ] 3 路由之间面包屑 / 链接互通
- [ ] 品牌页清楚说明战略聚焦、用户价值与能力闭环
- [ ] 每项核心能力都有产品、项目、门店、文章或资质证据
- [ ] 资质和历程全部可核实
- [ ] 时间轴里程碑高亮节点显示"里程碑"徽标
- [ ] 证书网格 hover 状态

### 8.2 性能

- [ ] `/brand` Lighthouse mobile perf ≥ 90（当前 96 ✅）
- [ ] `/brand/certifications` Lighthouse mobile perf ≥ 80（当前 63 ❌）
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
- [ ] `Organization.logo` Schema.org 指向当前 logo 版本

---

## 9. 已知问题

- [P1-2] `/brand/certifications` 证书图未 lazy load，LCP 6.0s，mobile perf 63
- [P2] 品牌故事页 `/brand` 内容较单薄（缺 F3 六项能力 / F4 产品展示 / F5 服务落地 / F8 品牌动态）
- [P2] Logo 资产目录仅 1 个文件存在，缺 SVG / favicon / apple-touch-icon 等 9 个资产
- [P2] `brand.ts` 中地址、电话、邮箱和备案仍包含占位信息
- [P2] "2026 年成立"等信息需要确认对外口径

---

## 10. 当前实现差距（来自 PRD §7）

- 当前品牌页主要是品牌自述和三张理念卡，无法充分证明供应链、车型和交付能力
- `brand.ts` 中占位信息尚未替换
- 部分页面存在"源头工厂、厂区面积、持证技师、官方质保"等表达，需要逐项建立证据或调整措辞

---

> 最后更新: 2026-06-22

## 11. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | BRAND_PRD 初始实现 | 完成 | — |
| 2026-06-20 | Claude Code | 品牌页 CertCard 等组件实现 | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 + PRD 引用更新 | 完成 | — |

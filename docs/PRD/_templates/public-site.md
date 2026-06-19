# [PAGE]_PRD_<YYYY-MM-DD>.md — 公开站模板

> 用于公开站 (C 端) 页面的子 PRD 模板。
>
> **8 节标准结构**: 概述 / 用户故事 / 功能清单 / UI / 数据 / API / 验收 / 变更

---

## 1. 概述

**页面**: `<ROUTE>` (例: `/brand`)
**类型**: 公开站 (SSG)
**优先级**: P0 / P1 / P2
**Owner**: 冯科雅
**版本**: v0 / v1
**最后更新**: YYYY-MM-DD

### 1.1 目标

1-2 句话说明此页面解决什么问题。

### 1.2 范围

- ✅ 包含: ...
- ❌ 不包含: ...

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 | 想知道品牌是否靠谱 | 看到资质证书 / 合作授权 | P0 |
| 潜客 | 想知道门店在哪 | 看到地图 / 地址 / 电话 | P0 |
| 轻改爱好者 | 想知道参数细节 | 看到技术参数表 | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | Hero 区(品牌一句话 + CTA) | P0 | ✅ |
| F2 | 资质展示(图片 + 名称) | P1 | ⚪ |
| F3 | 联系方式卡片 | P0 | ⚪ |
| F4 | 服务流程时间线 | P2 | ⚪ |
| ... | ... | ... | ... |

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: orange-500
- **背景**: zinc-950 (dark theme)
- **字体**: Geist Sans / Geist Mono
- **圆角**: rounded-xl (卡片) / rounded-md (按钮)

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `Hero` | `src/components/Hero.tsx` | CC | 首屏 (Client Component) |
| `BrandStory` | `src/components/BrandStory.tsx` | RSC | 品牌故事区块 |
| `ContactCard` | `src/components/ContactCard.tsx` | RSC | 联系方式 |

### 4.3 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 双列网格,Hero 全宽 |
| Tablet 768 | 单列堆叠,Header 折叠 |
| Mobile 390 | 全屏堆叠,Header 变汉堡菜单 |

### 4.4 可访问性

- 语义化 HTML (`<header>`/`<main>`/`<section>`/`<article>`)
- 颜色对比度 ≥ 4.5:1
- 所有图片有 `alt`
- 键盘 Tab 顺序合理
- 焦点环 visible

---

## 5. 数据模型

### 5.1 静态数据

如页面主要展示静态内容,数据源在:

```
src/lib/<page>.ts          # 主数据
src/lib/<page>-products.ts # 列表(如有)
```

例: `src/lib/brand.ts` 含 slogan / 联系方式 / 资质列表

### 5.2 动态数据

如页面有动态内容,数据源在:

```
DB: <Table>             # 例: Article / Store
API: GET /api/<route>   # 例: /api/articles?category=xxx
```

### 5.3 SSR / ISR 配置

- **SSG** (default): `export const dynamic = 'force-static'`
- **ISR**: `export const revalidate = 3600` (1 小时)
- **SSR** (按需): `export const dynamic = 'force-dynamic'`

---

## 6. API 接口

(如使用 API)

| Method | 路径 | 请求 | 响应 | 权限 |
|---|---|---|---|---|
| GET | `/api/<resource>` | — | `{ success, data: [...] }` | 公开 |
| GET | `/api/<resource>/[id]` | — | `{ success, data: {...} }` | 公开 |

完整请求/响应 schema 见 [API 模板](#) 或 route handler 源码。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] Hero 区正确渲染
- [ ] 列表分页正确
- [ ] CTA 跳转目标正确
- [ ] 移动端无横向滚动

### 7.2 性能

- [ ] LCP < 2.5s (desktop) / < 4s (mobile)
- [ ] CLS < 0.1
- [ ] TBT < 200ms

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] Playwright e2e 通过
- [ ] 桌面 1440 / 平板 768 / 手机 390 三视口截图 OK

### 7.4 SEO

- [ ] 独立 `<title>` (60 字符内)
- [ ] `<meta description>` (160 字符内)
- [ ] OG 图 (1200×630)
- [ ] JSON-LD (按需)
- [ ] canonical URL

### 7.5 可访问性

- [ ] 语义化 HTML
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 键盘导航可用
- [ ] 屏幕阅读器测试通过

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| YYYY-MM-DD | v0 | 初稿 | Coya |
| YYYY-MM-DD | v1 | 完整规格 + DoD 验收 | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md)
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../database/SCHEMA.md](../../database/SCHEMA.md)
- [../../CLAUDE.md](../../CLAUDE.md) — AI 工作流

## 附录 B: 截图占位

实施完成后,在 `docs/audits/screenshots/<viewport>/<page>.png` 存放三视口截图。

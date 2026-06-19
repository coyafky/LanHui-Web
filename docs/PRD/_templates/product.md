# [PRODUCT]_PRD_<YYYY-MM-DD>.md — 产品/主题模板

> 用于产品详情页或主题专项 (wenjie / xiaomi / zeekr / flooring 等) 的子 PRD 模板。
>
> **8 节标准结构** + **主题专项 5 段专属**(字面量类型 / 5 组件 / 锚点导航 / 3 态 UI / CI 脚本)

---

## 1. 概述

**页面**: `/product/<slug>` (例: `/product/electric-steps` 或 `/product/zeekr`)
**类型**: 产品详情 / 主题专项
**优先级**: P0
**Owner**: 冯科雅
**版本**: v0 / v1
**最后更新**: YYYY-MM-DD

### 1.1 目标

1-2 句话说明此产品/主题页面的目标。

### 1.2 主题色

(如为主题专项) `orange` / `cyan` / `amber` / `blue` 等

### 1.3 范围

- ✅ 包含: ...
- ❌ 不包含: ...

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 | 想升级轮毂 | 看到轮毂型号 / 适配车型 / 报价 | P0 |
| 轻改爱好者 | 想做问界主题改装 | 看到各车型方案对比 | P0 |
| 潜客 | 想了解工艺 | 看到施工流程 + 案例 | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | Hero + 一句话卖点 | P0 | ✅ |
| F2 | 锚点导航 (主题专项) | P0 | ⚪ |
| F3 | 产品列表 (6 大产品线) | P0 | ⚪ |
| F4 | 适配车型表 | P1 | ⚪ |
| F5 | 服务流程 | P1 | ⚪ |
| F6 | CTA (联系我们 / 附近门店) | P0 | ⚪ |
| F7 | JSON-LD (ItemList / Product) | P2 | ⚪ |

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: (主题专项填具体色,如 zeekr=orange)
- **背景**: zinc-950
- **图片容器**: `aspect-[4/3] + object-contain`
- **字体**: Geist Sans

### 4.2 组件清单 (主题专项 5 组件)

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `<Xxx>AnchorNav` | `src/components/<topic>/AnchorNav.tsx` | CC | 锚点导航(顶部 sticky) |
| `<Xxx>ProductCard` | `src/components/<topic>/ProductCard.tsx` | RSC | 车型卡片(3 态 UI) |
| `<Xxx>ProductGrid` | `src/components/<topic>/ProductGrid.tsx` | RSC | 车型网格 |
| `<Xxx>ProductTable` | `src/components/<topic>/ProductTable.tsx` | RSC | 车型表(参数对比) |
| `<Xxx>TopicBanner` | `src/components/<topic>/TopicBanner.tsx` | RSC | 主题入口 banner(用在 `/product`) |

### 4.3 3 态 imageStatus UI

| 状态 | 显示 |
|---|---|
| `matched` | 正常图片 + 模型名 + 价格 |
| `pending-review` | 占位 + "图片审核中" 标签 |
| `missing` | 占位 + "图片即将上线" 标签 |

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 网格 3 列,锚点导航 sticky |
| Tablet 768 | 网格 2 列,锚点导航折叠为下拉 |
| Mobile 390 | 网格 1 列,锚点变汉堡 |

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/<topic>-products.ts
```

**字面量类型** (防图片规格漂移,参照 ZEEKR v1):

```ts
type Width = 1448;       // 字面量类型
type Height = 1086;
type AspectRatio = "4/3";
type MaxProducts = 23;
type MinProducts = 3;
```

### 5.2 数据结构

```ts
type Product = {
  id: string;
  name: string;
  model: string;
  imageUrl: string;
  imagePath: string;         // 本地相对路径
  imageStatus: "matched" | "pending-review" | "missing";
  specs: Record<string, string>;
  price: number;
  // ...
};
```

### 5.3 CI 验证脚本

(如适用) `scripts/verify-<topic>-images.mjs` 链入 `npm run check`:

```js
// scripts/verify-zeekr-images.mjs
import { readdir } from "node:fs/promises";
// 检查所有 imageStatus === 'matched' 的图片实际存在
// 字面量类型 = 1448 / 1086 强制约束
```

---

## 6. API 接口

(如使用 API)

| Method | 路径 | 用途 |
|---|---|---|
| — | — | 此页面为纯静态,**不调用 API** |

(如需调用,加 `/api/<resource>?topic=<topic>`)

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] Hero 正确渲染
- [ ] 锚点导航点击跳转正确
- [ ] 车型卡片 3 态 UI 都正确显示
- [ ] 移动端无横向滚动

### 7.2 性能

- [ ] LCP < 3s (desktop) / < 4s (mobile)
- [ ] CLS = 0
- [ ] 图片 aspect-ratio 统一,无拉伸

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run check` 通过(含 verify-<topic>-images)
- [ ] Playwright e2e 通过
- [ ] 三视口截图 OK

### 7.4 内容规范

- [ ] 所有产品名 / 价格 / 参数真实
- [ ] 无 `imageStatus: 'missing'` 残留
- [ ] 字面量类型未漂移(1448×1086 4:3)
- [ ] `src/lib/<topic>-products.ts` 数组长度符合 MaxProducts/MinProducts 约束

### 7.5 SEO

- [ ] 独立 `<title>` + `<meta description>`
- [ ] JSON-LD `ItemList` 含所有车型
- [ ] 主题 banner 在 `/product` 入口可点击

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| YYYY-MM-DD | v0 | 初稿 | Coya |
| YYYY-MM-DD | v1 | 完整规格 + 字面量类型 + 3 态 UI | Coya |

---

## 附录 A: 主题专项参考实现 (ZEEKR v1)

完整参照: [../product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](../product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)

构建报告: `docs/test-reports/ZEEKR_BUILD_REPORT_2026-06-16.md`

**关键模式**:
1. 字面量类型防规格漂移
2. 3 态 `imageStatus` UI
3. CI 脚本 `verify-<topic>-images.mjs` 链入 `npm run check`
4. 6 子任务,每个独立 commit (RED→GREEN→回归→build)
5. ASCII slug 目录 (避免 macOS APFS 大小写陷阱)

---

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 主题专项结构约定

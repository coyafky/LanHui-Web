# CONTACT_PRD_2026-06-20.md — 联系我们 `/contact` 完整规格

> 蓝辉轻改 LANHUI 公开站"联系我们"页 v1 规格文档。覆盖 `/contact` 单路由,聚合电话、地址、营业时间、服务项目、门店详情、服务流程、品牌承诺等转化要素,统一品牌总机 / 门店电话降级策略。

---

## 1. 概述

**页面**: `/contact`
**类型**: 公开站(SSG, RSC)
**优先级**: P0
**Owner**: 冯科雅(Coya)
**版本**: v1
**最后更新**: 2026-06-20

### 1.1 目标

1. 在 1 个页面聚合所有"如何联系蓝辉轻改"的转化要素(电话 / 地址 / 时间 / 服务项目 / 流程 / 承诺)。
2. 当前阶段(单店运营)主推顺德大良店到店咨询 + 微信咨询 + 门店电话。
3. 数据源全部从 `src/lib/brand.ts` + `src/lib/store.ts` 读取,组件内零硬编码,缺失字段走"待补充"降级。
4. 为后续多店运营预留扩展点(切换到 `stores[0]` 之外的店)。

### 1.2 范围

- ✅ 包含: 5 大区块(Hero / 核心联系信息 / 门店详情 / 服务流程 / 品牌承诺)
- ✅ 包含: 电话降级策略(品牌总机 vs 门店电话 vs 400 热线 三级 fallback)
- ✅ 包含: 完整 SEO / a11y / 性能 / 埋点
- ❌ 不包含: 在线客服 / 表单留资 / 地图嵌入(本版本)
- ❌ 不包含: 多店切换(顺德大良单店阶段用 `stores[0]`)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 / 潜客 | 想打电话问价 | 看到大字号可点击电话号码 | P0 |
| 车主 / 潜客 | 想看门店在哪 | 看到详细地址 + 导航链接 | P0 |
| 车主 / 潜客 | 想了解服务流程 | 看到 4 步流程图 | P0 |
| 车主 / 潜客 | 想加微信 | 看到"联系我们"触发 WeChat modal | P0 |
| 车主 | 想看营业时间 | 看到营业时间 | P0 |
| 潜客 | 想看品牌承诺 | 看到 3 条品牌承诺 | P1 |
| 搜索引擎 | 抓取联系页 | 看到 LocalBusiness JSON-LD | P0 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | Hero 区(CONTACT 标签 + H1 + 副标) | P0 | ✅ |
| F2 | 咨询热线大卡片(Phone icon + 号码 + 服务时间) | P0 | ✅ |
| F3 | 3 列信息卡(地址 / 营业时间 / 服务项目) | P0 | ✅ |
| F4 | 门店详情大卡(店名 + InfoRow × 3 + 双 CTA) | P0 | ✅ |
| F5 | 4 步服务流程 | P0 | ✅ |
| F6 | 品牌承诺 3 列(正品 / 持证 / 质保) | P1 | ✅ |
| F7 | 电话降级 fallback(brand → store → 400) | P0 | ✅(见 §5.4) |
| F8 | 跳转 `/agent` 查找其他门店 | P0 | ✅ |
| F9 | 跳转门店详情 `/agent/store/[id]` | P0 | ✅ |
| F10 | WeChat modal(通过 Header "联系我们" 触发) | P0 | ✅ |
| F11 | 埋点: `contact_phone_click` / `contact_wechat_click` | P1 | ⚪ 待补 |
| F12 | LocalBusiness JSON-LD(指向 stores[0]) | P0 | ⚪ 待补(目前无) |

---

## 4. UI / 交互

### 4.1 视觉规范(沿用公开站)

- **背景**: `bg-zinc-950` 主背景,卡片 `bg-zinc-900` + `border-zinc-800`
- **品牌色**: `orange-400/500` 强调(热线、CTA、承诺)
- **图标**: `Phone` / `MapPin` / `Clock` / `MessageCircle` / `CheckCircle2` / `ShieldCheck` / `Navigation`
- **字号**: 热线号码 `text-3xl md:text-4xl font-bold`
- **圆角**: 卡片 `rounded-2xl`,徽标 `rounded-lg / rounded-xl`

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `Header` | `src/components/Header.tsx` | CC | 共享 |
| `Footer` | `src/components/Footer.tsx` | RSC | 共享 |
| `InfoRow` | `src/components/InfoRow.tsx` | RSC | 单行"图标 + 标签 + 内容" |

### 4.3 区块级结构

**模块 1: Hero**(同其他公开页渐变背景)

**模块 2: 核心联系信息区**
- 大卡片: 热线号码 + 服务时间
  - `href`:`store.phoneTel`(若有效 `tel:`) → 否则 `contactData.hotline.number` 400 → 否则 `#contact`
  - 显示:`store.phone` 若非占位 → 否则 `contactData.hotline.displayNumber`
- 3 列信息卡: 门店地址 / 营业时间 / 服务项目(6 项)

**模块 3: 门店详情卡片**
- 店名 + 描述 + 3 个 InfoRow(地址 / 电话 / 营业时间)
- 双 CTA: 导航到店(→ `/agent/store/<id>`)/ 浏览产品(→ `/product`)

**模块 4: 服务流程**(4 步)
1. 电话/到店咨询
2. 方案推荐
3. 预约施工
4. 交付验收

**模块 5: 品牌承诺**(3 列)
- 正品保证,假一赔十
- 专业技师,持证上岗
- 质保服务,售后无忧

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 3 列信息卡,门店详情双列,流程 4 列,承诺 3 列 |
| Tablet 768 | 2 列流程 / 2-3 列承诺 |
| Mobile 390 | 全单列,热线卡片堆叠 |

### 4.5 关键交互

- **热线号码点击**:
  - 三级 fallback 决策(见 §5.4)
  - 若 `tel:` 有效,新开系统拨号器
  - 若降级为 `#contact`,点击仅滚动到门店地址(可优化为弹 modal)
- **"联系我们" 触发 WeChat modal**(Header)
- **"查找门店"** → `/agent`
- **"导航到店"** → `/agent/store/<stores[0].id>`(默认 `shunde-daliang`)
- **"浏览产品"** → `/product`

### 4.6 可访问性

- 热线号码 `<a href="tel:...">` 必须有 `aria-label="致电蓝辉轻改 顺德大良店"`
- 营业时间 `<time>` 包裹(语义化)
- 服务项目 `<ul>` + 列表项
- 颜色对比度 ≥ 4.5:1
- 键盘焦点环 visible

---

## 5. 数据模型

### 5.1 静态数据

| 来源 | 字段 | 用途 |
|---|---|---|
| `src/lib/brand.ts` | `brand.phone` / `brand.phoneTel` | 品牌总机号(展示 / 拨号) |
| `src/lib/store.ts` `stores[0]` | `id` / `name` / `phone` / `phoneTel` / `address` / `businessHours` / `description` | 顺德大良店数据 |
| `src/app/contact/page.tsx` `contactData.hotline` | `number` / `displayNumber` / `serviceHours` | 400 热线占位(待品牌方提供) |
| `src/app/contact/page.tsx` `contactData.wechat` | `id` / `qrCode` | 微信号(占位) |
| `src/app/contact/page.tsx` `contactData.serviceProcess` | 4 步流程 | 静态 |
| `src/app/contact/page.tsx` `contactData.brandPromises` | 3 条 | 静态 |

### 5.2 动态数据(本页面无 API)

- 当前全部走 `stores[0]`,不调 `/api/stores`
- 后续若多店运营,可迭代为按 URL 参数 `?store=<id>` 切换
- 若引入 CMS,`contactData.*` 移至 `src/lib/contact-content.ts`

### 5.3 SSR / ISR 配置

- `src/app/contact/page.tsx` 默认 SSG
- 不设 `revalidate`(联系页内容相对稳定;门店数据变更走部署重建)

### 5.4 电话降级 fallback(关键决策树)

```
[点击热线 / tel: 链接]
  ├─ 1. store.phoneTel 有效? (非 "#contact" 且以 "tel:" 开头)
  │     └─ 是 → href = store.phoneTel
  │     └─ 否 ↓
  ├─ 2. contactData.hotline.number 以 "400" 开头?
  │     └─ 是 → href = `tel:${contactData.hotline.number}`
  │     └─ 否 ↓
  └─ 3. href = "#contact" (无动作 / 滚动到地址)

[号码显示]
  ├─ store.phone !== "联系方式待补充" → store.phone
  └─ 否则 → contactData.hotline.displayNumber
```

> v1 实现已符合此决策树(`src/app/contact/page.tsx:99-112`)。

### 5.5 服务项目清单(当前硬编码 6 项)

```ts
["电动踏板升级", "轮毂升级", "底盘升级", "汽车窗膜", "改色膜", "隐形车衣"]
```

> v1 后续应改为从 `src/lib/products.ts` 的 6 大产品名动态生成,避免硬编码漂移。

---

## 6. API 接口

本页面无 API 调用。下游分析埋点(待补):

| 事件 | 触发 | 元数据 |
|---|---|---|
| `contact_phone_click` | 热线号码点击 | `phoneType: 'store' \| 'hotline' \| 'fallback'` / `storeId` |
| `contact_wechat_click` | WeChat modal 触发 | `pathname` |
| `contact_navigate_click` | "导航到店" CTA | `target: 'store_detail'` / `storeId` |

### 6.1 下游共享数据(后续 CMS 化时)

- `GET /api/stores?status=published` — 门店列表(过滤草稿)
- `GET /api/stores/[id]` — 门店详情
- `GET /api/contact-content` — 400 热线 / 流程 / 承诺(后续)

---

## 7. 验收标准(DoD)

### 7.1 功能

- [ ] Hero / 5 大模块正确渲染
- [ ] 热线号码根据 store.phoneTel 有效性走 3 级 fallback
- [ ] "联系我们" 触发 WeChat modal 正常
- [ ] "查找门店" 跳转 `/agent`
- [ ] "导航到店" 跳转 `/agent/store/<id>`
- [ ] "浏览产品" 跳转 `/product`
- [ ] 服务项目列表显示 6 项,与产品中心 6 大产品对应
- [ ] 品牌承诺 3 条完整

### 7.2 性能

- [ ] Lighthouse desktop perf ≥ 90(当前 97 ✓)
- [ ] Lighthouse mobile perf ≥ 80(当前 75 ⚠,P2 优化)
- [ ] LCP < 2.5s(desktop)/ < 4s(mobile)
- [ ] CLS = 0
- [ ] TBT < 200ms

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] Playwright e2e:`/contact` 3 视口截图 + h1 + title 校验
- [ ] 关键路径 e2e:点热线 → tel: 协议触发(或 fallback 到 #contact)

### 7.4 SEO

- [ ] `<title>` = "联系我们 | 蓝辉轻改 LANHUI"
- [ ] `<meta description>` 含"顺德大良店 + 联系方式 + 一站式"
- [ ] canonical URL = `https://lanhui.com/contact`
- [ ] LocalBusiness JSON-LD 指向 `stores[0]`(P1 待补)
- [ ] OG 图(待补)
- [ ] Schema.org Organization 链接回品牌页

### 7.5 可访问性

- [ ] 语义化 HTML(联系信息用 `<address>` 或 `<dl>` + InfoRow 组件)
- [ ] 颜色对比度 ≥ 4.5:1(Lighthouse a11y ≥ 95,当前 89 ⚠,P2 优化)
- [ ] 键盘 Tab 顺序合理
- [ ] 屏幕阅读器朗读完整地址 + 电话 + 营业时间
- [ ] 热线 `<a>` 有 `aria-label`
- [ ] 列表项用 `<ul>` 语义化

### 7.6 回归

- [ ] Header / Footer 正常
- [ ] 跳转到其他路由不丢状态
- [ ] WeChat modal 全站唯一
- [ ] 移动端汉堡菜单正常

---

## 8. 变更记录(CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 初版:聚合 5 区块 + 3 级电话降级 + DoD | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md) — `src/lib/store.ts` 单例
- [../../database/SCHEMA.md](../../database/SCHEMA.md) §4 Store 表
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §P2 contact a11y
- [HOMEPAGE_PRD_2026-06-20.md](./HOMEPAGE_PRD_2026-06-20.md) — 共用 brand 总机降级
- [AGENT_PUBLIC_PRD_2026-06-20.md](./AGENT_PUBLIC_PRD_2026-06-20.md) — 跳转 `/agent`

## 附录 B: 截图占位

`docs/audits/screenshots/{desktop,tablet,mobile}/contact.png`

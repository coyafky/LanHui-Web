# SPEC: 首页（Homepage）

> 功能规格说明书 — `/` 首页的组件树、数据来源、响应式行为和验收标准。
> 对应 PRD：`docs/PRD/public-site/HOMEPAGE_PRD.md`
> 实现状态：`🔧 部分完成`

---

## 1. 职责范围

首屏传达品牌身份、核心服务、产品入口、咨询路径。负责"用户 5 秒内理解蓝辉是谁、能做什么、下一步去哪"。不负责产品详情、门店详情或资讯内容（由对应子页面负责）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC、metadata、JSON-LD |
| `react-best-practices` | 是 | RSC/CC 边界、性能优化 |
| `web-design-engineer` | 是 | 首页原型、视觉方向、首屏 CTA |
| `prisma-data-ops` | 否 | 首页全部为静态数据 |
| faker/MSW | 否 | — |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/` | page (RSC) | 首页，5 组件组合 | 🔧 |
| SSR fallback | — | 无需 `getStaticParams`，路径无动态段 | ✅ |

## 3. 数据模型

### 3.1 静态数据源

首页全部数据来自静态模块，无 API 调用：

| 数据模块 | 文件 | 提供内容 |
|---------|------|---------|
| `brand` | `src/lib/brand.ts` | 品牌名称、slogan、门店位置、联系方式 |
| `products` | `src/lib/products.ts` | 服务类别（6 大类：轻改 + 膜） |
| `productRoutes` | `src/lib/product-routes.ts` | 产品路由入口（按品牌/按项目） |

### 3.2 品牌数据（关键字段）

```typescript
export const brand = {
  zh: "蓝辉轻改",
  en: "LANHUI",
  slogan: "让爱车更有型，也更好用",
  foundedYear: 2026,
  currentStore: "顺德大良店",
  city: "广东佛山 · 顺德大良",
  phone: "联系方式待补充",            // ⚠️ 占位文案
  phoneTel: "#contact",
  icp: "ICP备案号待备案",            // ⚠️ 占位文案
  address: "广东省佛山市顺德区大良（详细地址待补充）",  // ⚠️ 占位文案
  businessHours: "营业时间待确认",    // ⚠️ 占位文案
  email: "lanhui@example.com",       // ⚠️ 占位邮箱
} as const;
```

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `Header` | `src/components/Header.tsx` | 是 (CC) | 全局导航、品牌 logo、CTA 按钮 |
| `Hero` | `src/components/Hero.tsx` | 是 (CC) | 首屏品牌陈述、主 CTA（微信弹窗）、副 CTA |
| `WhyChooseUs` | `src/components/WhyChooseUs.tsx` | 是 (CC) | 信任建立区：精选案例/资质/优势 |
| `CoreServices` | `src/components/CoreServices.tsx` | 是 (CC) | 6 大服务类别卡片 |
| `ProductsQuickEntry` | `src/components/ProductsQuickEntry.tsx` | 是 (CC) | 品牌车系快速入口 |
| `Footer` | `src/components/Footer.tsx` | 是 (CC) | 品牌信息、备案号、联系、导航 |
| `WeChatConsultModal` | `src/components/shared/WeChatConsultModal.tsx` | 是 (CC) | 全局微信咨询弹窗（`src/lib/wechat-modal.ts` emitter 驱动） |

### 4.1 页面组合

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyChooseUs />
        <CoreServices />
        <ProductsQuickEntry />
      </main>
      <Footer />
    </>
  );
}
```

注意：`WeChatConsultModal` 挂载在 `src/app/layout.tsx` 中，非首页独有。

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 首屏 H1 必须是品牌名或核心服务 | 页面渲染 | Hero 组件渲染品牌 slogan 和主服务描述 |
| BR2 | 主 CTA 打开微信咨询弹窗 | 点击 "在线咨询" 按钮 | 触发 `wechat-modal` emitter → WeChatConsultModal 显示 |
| BR3 | 副 CTA 导航到产品页 | 点击 "查看方案" 按钮 | 导航到 `/product` |
| BR4 | 品牌联系人信息集中管理 | Footer 渲染 | 从 `brand` 对象读取 phone/address/email |
| BR5 | 服务类别入口可点击 | 点击 CoreServices 卡片 | 导航到对应 `/product/<service>` 页面 |
| BR6 | 品牌车系入口可点击 | 点击 ProductsQuickEntry 卡片 | 导航到对应 `/product/<brand>` 页面 |
| BR7 | 移动端菜单 | Header hamburger 点击 | 展开全屏菜单，Escape 关闭，聚焦管理 |

## 6. UI 状态

| 状态 | 触发条件 | UI 表现 |
|------|---------|---------|
| loading | 页面首次渲染 | Next.js SSR → 直接交付完整 HTML，无客户端 loading |
| error | 渲染异常 | `error.tsx` 边界捕获，显示错误 + 重试 |
| 微信弹窗 | 点击 CTA / Header 微信按钮 | 弹窗显示，包含微信二维码和微信号 |
| 移动菜单 | hamburger 点击 | 全屏 overlay 菜单 |

## 7. 图片规格

| 位置 | 图片类型 | 推荐规格 | 优先级 |
|------|---------|---------|--------|
| Hero 背景 | 品牌形象图/施工场景 | 1440×800, WebP | 高（`priority` loading） |
| CoreServices 图标 | 服务类别图标 | 80×80, SVG/WebP | 中 |
| ProductsQuickEntry 品牌 logo | 品牌标识 | 120×60, WebP | 中 |

## 8. 响应式

| 视口 | 要求 |
|------|------|
| 390px | Hero 文字不溢出；CTA 按钮 100% 宽度；CoreServices 单列卡片；ProductsQuickEntry 2 列网格 |
| 768px | Hero 文字+CTA 左对齐；CoreServices 2 列；ProductsQuickEntry 3 列 |
| 1440px | 全宽展示；内容最大宽度约束（max-w-7xl）；首屏信息层级清晰 |

## 9. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| HOME-AC-01 | 首页 SSR 渲染 | GET / | 200，HTML 含品牌名和 Hero 文案 | happy |
| HOME-AC-02 | Hero CTA 点击 | 点击 "在线咨询" | 微信弹窗打开 | happy |
| HOME-AC-03 | Hero 副 CTA 点击 | 点击 "查看方案" | 导航到 /product | happy |
| HOME-AC-04 | CoreServices 卡片导航 | 点击任一服务卡片 | 导航到正确 /product/<service> | happy |
| HOME-AC-05 | 390px 无横向滚动 | 浏览器 390px 宽度 | 无 overflow-x，CTA 全宽可触 | edge |
| HOME-AC-06 | 768px 双列布局 | 浏览器 768px 宽度 | CoreServices 2 列，无重叠 | edge |
| HOME-AC-07 | 1440px 内容不失控 | 浏览器 1440px | 内容在 max-w-7xl 内居中 | edge |
| HOME-AC-08 | 移动端菜单开关 | 390px 点击 hamburger | 菜单展开；Escape 关闭 | edge |
| HOME-AC-09 | Footer 占位信息不暴露 | 检查 Footer 内容 | phone/email/icp 非生产占位时不展示或标注"即将上线" | edge |
| HOME-AC-10 | JSON-LD 结构化数据 | 查看页面 `<head>` | 含 WebSite/Organization schema | happy |
| HOME-AC-11 | build 不依赖 DB | `npm run build` | 成功，首页 SSG 预渲染 | happy |

## 10. 已知问题

- [ ] **联系信息占位**：`brand.ts` 中 phone/address/email 全为占位文案，生产环境 Footer 会暴露假信息
- [ ] **Header CTA 链接不存在**：`/agent/store/shunde-daliang` 可能 404
- [ ] **无 favicon/icon/apple-touch-icon**：SEO 和品牌识别受损
- [ ] **无 OGP 图片**：社交媒体分享无预览图
- [ ] **无 json+ld**：缺少 WebSite/Organization 结构化数据
- [ ] **微信弹窗暴露测试微信号**：`WeChatConsultModal` 中显示 `微信号:fkycoya(待补充)`
- [ ] **移动菜单无 focus trap**：键盘导航可逃出菜单到页面背景
- [ ] **无 skip-to-content 链接**：无障碍缺陷

## 11. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 首页初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | Hero 重写 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 重写 | 完成 | 已知问题中 8 项待修 |

---

> 最后更新: 2026-07-07
> 旧版 SPEC 归档为 `public-site/home-v1-post-hoc.md`

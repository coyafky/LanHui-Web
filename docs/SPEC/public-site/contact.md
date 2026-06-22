# SPEC: 联系页面 Contact

> 对应 PRD：`docs/PRD/public-site/CONTACT_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

联系聚合页（`/contact`）：向车主集中展示蓝辉轻改的联系方式、门店信息、服务流程与品牌承诺，作为全站咨询入口的主要落地页。

**不负责**：
- 门店导航的完整地图嵌入（仅提供 Link 跳转到门店详情页）
- 咨询表单提交（当前未实现，后续通过咨询弹窗替代）
- 咨询渠道的后台管理配置（F11，待补）

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/contact` | page (RSC) | 联系聚合页 | ✅ |
| Header "联系我们" | Link | 导航入口 | ✅ |
| Footer 咨询入口 | Link / 微信弹窗 | 底部入口 | ✅ |

## 3. 功能清单

| # | 功能 | 位置 | 优先级 | 状态 |
|---|------|------|--------|------|
| F1 | `/contact` 联系聚合页（5 区块） | `/contact` | P0 | ✅ |
| F2 | Hero + 核心联系信息 | `/contact` | P0 | ✅ |
| F3 | 门店详情 + 地址展示 | `/contact` | P0 | ✅ |
| F4 | 服务流程说明（4 步） | `/contact` | P0 | ✅ |
| F5 | 品牌承诺展示（3 列） | `/contact` | P0 | ✅ |
| F6 | 电话降级策略（门店→品牌→400→联系页） | 全站 | P0 | ✅ |
| F7 | 微信咨询弹窗 | 全站 | P0 | ✅ |
| F8 | Header "联系我们" 入口 | Header | P0 | ✅ |
| F9 | Footer 咨询入口 | Footer | P0 | ✅ |
| F10 | 统一咨询弹窗（企微/个微，场景化标题） | 全站 | P1 | ⚪ 待补 |
| F11 | 后台咨询渠道管理配置 | `/admin` | P1 | ⚪ 待补 |
| F12 | 产品页咨询入口 | 产品详情 | P1 | ⚪ 待补 |
| F13 | 文章页咨询入口 | 文章详情 | P1 | ⚪ 待补 |
| F14 | 门店导航 CTA | 门店详情 | P1 | ⚪ 待补 |

## 4. 页面结构

`/contact` 由 5 个上下排列的区块组成（无 JS 交互，纯 RSC）：

```
Hero
├── CONTACT 标签 + H1 "联系我们"
└── 副标题（到店咨询引导）

核心联系信息区
├── 咨询热线卡片（电话号 + 服务时间 + "查找门店" CTA）
└── 三列网格：门店地址 / 营业时间 / 服务项目

门店信息卡片
├── 门店名 + 描述
├── 地址 / 电话 / 营业时间（InfoRow 组件）
└── 操作区："导航到店" + "浏览产品" 按钮

服务流程（4 步）
├── PROCESS 标签
├── 步骤 1 电话/到店咨询
├── 步骤 2 方案推荐
├── 步骤 3 预约施工
└── 步骤 4 交付验收

品牌承诺
├── "品牌承诺" 标题
└── 3 列网格：正品保证 / 专业技师 / 售后无忧
```

## 5. 数据模型

### 5.1 页面内联数据

```typescript
// 定义于 src/app/contact/page.tsx（硬编码，非 DB/unstable_data）
interface ContactData {
  hotline: {
    number: string;          // 原始号，如 "400-XXX-XXXX"
    displayNumber: string;   // 展示号，与 number 相同
    serviceHours: string;    // "周一至周日 9:00-18:00"
  };
  wechat: {
    id: string;              // 微信号，如 "lanhui_qinggai"
    qrCode: string | null;   // 二维码路径，当前为 null
  };
  serviceProcess: Array<{
    step: number;            // 1-4
    title: string;
    description: string;
  }>;
  brandPromises: string[];   // 3 条品牌承诺文案
}
```

### 5.2 外部数据源

| 数据源 | 类型 | 文件 | 使用方式 |
|--------|------|------|----------|
| `stores[0]` | `Store` | `src/lib/store.ts` | 取第一条门店展示（phone, address, businessHours, name 等） |
| `brand` | `Brand` | `src/lib/brand.ts` | Fallback：门店数据不可用时使用（phone, address, businessHours） |

### 5.3 目标数据模型（DB 配置态）

参见 PRD §7.2 `ConsultationChannel` model，咨询渠道未来由后台 CMS 管理。

## 6. 电话降级策略

当页面需要展示电话时，按以下优先级降级：

```
stores[0]?.phone !== "联系方式待补充"  → 显示门店电话（含 tel: 链接）
    ↓ 否
contactData.hotline.number 以 "400" 开头 → 显示 400 号码（`tel:400-XXX-XXXX`）
    ↓ 否 (或 400 为假号)
brand.phone !== "联系方式待补充"       → 显示品牌总机
    ↓ 否
显示 "#contact" 占位符                  → 链接到联系页自身
```

**当前实现问题**：`contactData.hotline.number` 为假 400 号 `"400-XXX-XXXX"`，门店 `phone` 为真实号 `"0757-22222222"` 但 `phoneTel` 需确认。上线前必须替换为真实电话。

## 7. 依赖关系

### 7.1 模块依赖

| 依赖 | 路径 | 用途 |
|------|------|------|
| `stores` | `src/lib/store.ts` | 门店数据（取 `stores[0]` 展示详情） |
| `brand` | `src/lib/brand.ts` | 品牌信息 fallback（电话/地址/营业时间） |
| `Header` | `src/components/Header.tsx` | 顶部导航（含 "联系我们" 入口） |
| `Footer` | `src/components/Footer.tsx` | 底部导航（含咨询入口） |
| `InfoRow` | `src/components/InfoRow.tsx` | 信息行展示组件（图标 + 标签 + 内容） |
| `wechat-modal` | `src/lib/wechat-modal.ts` | 微信弹窗 emitter（全站共享） |

### 7.2 被依赖

| 依赖方 | 说明 |
|--------|------|
| 全站 Header/Footer | 通过 Link 指向 `/contact` |

## 8. 验收条件

- [ ] AC1: `/contact` 页 5 区块完整渲染，无 JS 运行时错误
- [ ] AC2: 电话号可点击，调用 `tel:` 协议
- [ ] AC3: "导航到店" 链接指向正确的门店详情页 `/agent/store/{id}`
- [ ] AC4: "查找门店" 链接指向 `/agent`
- [ ] AC5: "浏览产品" 链接指向 `/product`
- [ ] AC6: 三视口（mobile 375px / tablet 768px / desktop 1440px）布局正确，无溢出
- [ ] AC7: 键盘导航完整：所有 Link 可 Tab 聚焦，有 focus 样式
- [ ] AC8: 屏幕阅读器可朗读页面结构和内容（heading hierarchy 合理，Link 文本有意义）
- [ ] AC9: SEO 元数据正确（title: "联系我们 | 蓝辉轻改 LANHUI"，description 有实际内容）
- [ ] AC10: Lighthouse mobile perf ≥ 85，accessibility ≥ 90

## 9. 已知问题

- [ ] **假 400 号**：`contactData.hotline.number` = `"400-XXX-XXXX"`，上线前必须替换为真实号码
- [ ] **微信二维码为 null**：`contactData.wechat.qrCode` = `null`，页面无二维码展示，需后台配置后补充
- [ ] **门店数据硬编码**：取 `stores[0]` 第一条，非 API 动态获取；门店电话降级路由中的 `store?.phoneTel` 可能为 `"#contact"` 占位
- [ ] **缺后台配置**：咨询渠道无 DB 表，无法通过 CMS 管理（见 PRD F11）
- [ ] **缺统一咨询弹窗**：当前微信弹窗不支持场景化标题（见 PRD F10）
- [ ] **缺事件埋点**：电话点击、微信入口点击、导航点击均未上报事件（见 PRD §10）

---

> 最后更新: 2026-06-22

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-20 | Claude Code | 联系页初始实现（Hero + 核心信息 + 门店 + 流程 + 承诺） | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并（含全站咨询系统规格）+ SPEC 文档创建 | 完成 | — |

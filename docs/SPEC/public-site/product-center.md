# SPEC: 产品中心 Product Center

> 对应 PRD：`docs/PRD/public-site/PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

全产品线的聚合入口页。展示所有产品分类入口（4 专题横幅 + 6 分类卡片）。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product` | page (RSC) | 产品总入口 | ✅ |

## 3. 数据来源

- 产品分类：`src/lib/products.ts`（6 categories + `PRODUCT_ICON_MAP`）
- 专题横幅数据：各 `*-products.ts` 的 `topicMeta`

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| ProductsQuickEntry | `src/components/ProductsQuickEntry.tsx` | 否 | 6 分类网格入口 |
| WenjieTopicBanner | `src/components/wenjie/WenjieTopicBanner.tsx` | 否 | 问界专题横幅（cyan） |
| XiaomiTopicBanner | `src/components/xiaomi/XiaomiTopicBanner.tsx` | 否 | 小米专题横幅（orange） |
| ZeekrTopicBanner | `src/components/zeekr/ZeekrTopicBanner.tsx` | 否 | 极氪专题横幅（orange） |
| FlooringTopicBanner | `src/components/product/FlooringTopicBanner.tsx` | 否 | 地板专题横幅（amber） |

## 5. SSR/ISR 配置

SSG（静态生成），`revalidate=3600`。

## 6. 验收条件

- [ ] 六分类卡片网格正确展示
- [ ] 四专题横幅正确展示（配色：cyan/orange/amber）
- [ ] 4 主题大图设置 `priority`，LCP < 3s

## 7. 已知问题

- [P1-5] LCP 6.5s，4 主题大图未设 priority
- [P2] 地板 TopicBanner 图片含中文路径

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-20 | Claude Code | 产品中心入口页实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

# SPEC: 产品专题 Product Topics

> 对应 PRD：`docs/PRD/product/{WENJIE,XIAOMI,ZEEKR,FLOORING}_*_PRD_*.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

品牌专题产品页（问界/小米/极氪/地板）。每专题 = 锚点导航 + 产品卡片网格 + 参数表格 + 服务流程 + CTA。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/wenjie` | page (RSC) | 问界专题 44 款 | ✅（图 pending） |
| `/product/xiaomi` | page (RSC) | 小米专题 18 款 | ✅ |
| `/product/zeekr` | page (RSC) | 极氪专题 23 款 | ✅ |
| `/product/flooring` | page (RSC) | 地板专题 4 品牌 | ✅（性能差） |

## 3. 标准组件模式（5 组件）

| 组件 | 职责 | Client? |
|------|------|---------|
| `AnchorNav` | 产品类别/车型快速跳转 | 是 |
| `ProductCard` | 产品卡片，3 态图片（matched/pending-review/missing） | 是 |
| `ProductGrid` | 产品网格布局 | 否 |
| `ProductTable` | 参数规格表格 | 否 |
| `TopicBanner` | 专题入口横幅 | 否 |

## 4. 图片三态模型

```typescript
type ImageStatus = "matched" | "pending-review" | "missing";
```

- **matched**: 真实产品图已就位
- **pending-review**: 待审核/待确认
- **missing**: 未上传占位图标

## 5. 各专题数据

| 专题 | 数据文件 | 款式数 | 图片状态 | 主题色 |
|------|----------|--------|----------|--------|
| 问界 | `src/lib/wenjie-products.ts` | 44 | 全部 pending | cyan |
| 小米 | `src/lib/xiaomi-products.ts` | 18 | 全部 matched | orange |
| 极氪 | `src/lib/zeekr-products.ts` | 23 | 21+1+2 | orange |
| 地板 | `src/lib/flooring-products.ts` | 4 品牌 | 含中文路径 | amber |

## 6. 图片容器规格

`aspect-[4/3] + object-contain + Next/Image sizes` 统一。

## 7. 已知问题

- [P1-1] 地板 perf 59/61，LCP 6.6s（最差页面）
- [P1-4] 问界 44 款图全 pending，业务未补图

## 8. 验收条件

- [ ] 每个专题正确渲染锚点导航和产品网格
- [ ] 图片三态（matched/pending-review/missing）正确展示
- [ ] 地板专题 LCP < 4s

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-13 | Claude Code | 问界/小米专题页初始实现 | 完成 | — |
| 2026-06-16 | Claude Code | ZEEKR 专题页（字面量类型 + 图片三态 + CI 脚本） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

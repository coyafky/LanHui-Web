# SPEC: 配件类产品 Product Accessories

> 对应 PRD：`docs/PRD/public-site/VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md`
> 实现状态：✅ **完成**

---

## 1. 职责范围

轮毂升级、底盘升级、电动踏板三类配件产品页面，复用 `ProductDetail` 组件。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/wheels` | page (RSC) | 轮毂升级 | ✅ |
| `/product/chassis` | page (RSC) | 底盘升级 | ✅ |
| `/product/electric-steps` | page (RSC) | 电动踏板 | ✅ |

## 3. 实现方式

三个页面均使用 `ProductDetail` 组件，通过 `product.slug` 条件分支渲染不同内容：

```
ProductDetail({ product: { slug: "wheels" } })
  → 渲染轮毂内容分支
ProductDetail({ product: { slug: "chassis" } })
  → 渲染底盘内容分支
ProductDetail({ product: { slug: "electric-steps" } })
  → 渲染电动踏板内容分支
```

## 4. 数据来源

`src/lib/products.ts` 中 `products` 数组的对应项，包含描述、特性、规格参数。

## 5. SSR/ISR 配置

SSG（静态生成），各页面独立生成。

## 6. 性能基线

| 页面 | 目标 LCP | 说明 |
|------|----------|------|
| `/product/wheels` | < 2s | 内容轻量 |
| `/product/chassis` | < 2s | 内容轻量 |
| `/product/electric-steps` | < 2s | 内容轻量 |

## 7. 验收条件

- [ ] 三页面正确渲染各自内容分支
- [ ] 参数表格正确展示

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | 配件产品页初始实现（ProductDetail 组件） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

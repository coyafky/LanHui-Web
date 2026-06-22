# SPEC: 专题页面组件模式 Topic Pattern

> 实现状态：✅ **完成**

---

## 1. 模式总结

每个产品专题（wenjie / xiaomi / zeekr / flooring）共用 5 组件结构。

## 2. 标准组件清单

| 组件 | 文件名模式 | Client? | 职责 |
|------|-----------|---------|------|
| AnchorNav | `{Topic}AnchorNav.tsx` | 是 | 锚点导航（车型/类别快速跳转） |
| ProductCard | `{Topic}ProductCard.tsx` | 是 | 产品卡片（3 态图片 + CTA） |
| ProductGrid | `{Topic}ProductGrid.tsx` | 否 | 卡片网格容器 |
| ProductTable | `{Topic}ProductTable.tsx` | 否 | 参数规格表格 |
| TopicBanner | `{Topic}TopicBanner.tsx` | 否 | 专题入口横幅 |

## 3. 各专题实现

| 专题 | 组件目录 | 主题色 | 是否有 ProductCard 3 态 |
|------|---------|--------|------------------------|
| 问界 | `src/components/wenjie/` | cyan | ✅ |
| 小米 | `src/components/xiaomi/` | orange | ✅ |
| 极氪 | `src/components/zeekr/` | orange | ✅（含 pending-review） |
| 地板 | `src/components/product/` | amber | ❌（不同结构） |

## 4. 图片三态模型

```typescript
type ImageStatus = "matched" | "pending-review" | "missing";
```

| 状态 | 显示 | 含义 |
|------|------|------|
| matched | 真实产品图 | 图片已就位 |
| pending-review | 占位 + 待审核标记 | 图已上传待确认 |
| missing | 占位图标 | 未上传图片 |

## 5. 容器规格

### 基础规格

`aspect-[4/3] + object-contain + Next/Image sizes` — 所有专题图片容器统一。

### 图片 `sizes` 策略

不同场景使用不同的 `sizes` 属性以优化 Core Web Vitals（LCP）：

| 使用场景 | sizes 值 | 说明 |
|---------|---------|------|
| 产品卡片（ProductCard） | `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw` | 响应式网格：大屏 4 列 → 中屏 3 列 → 小屏 2 列 |
| 专题横幅（TopicBanner） | `(min-width: 768px) 40vw, 100vw` | 中屏以上占 40% 宽度，移动端全宽 |
| 轮播 / 大图 | `(min-width: 1024px) 50vw, 100vw` | 半宽-全宽 |

### 字面量类型保证

所有图片规格使用字面量类型防止规格漂移：

```typescript
// zeekr-products.ts 示例
type Width = 1448;
type Height = 1086;
type Ratio = "4/3";
// 编译期保证宽高比一致
```

## 6. 各专题实现完整性

| 专题 | 组件目录 | 主题色 | 5 组件完备 | 3 态图片 | 字面量类型 | 图片 `sizes` | CI 验证脚本 | 备注 |
|------|---------|--------|-----------|---------|-----------|-------------|------------|------|
| 问界 Wenjie | `src/components/wenjie/` | cyan | ✅ | ✅ | ✅ | ✅ | ❌ | 44 款图全 pending（P1-4） |
| 小米 Xiaomi | `src/components/xiaomi/` | orange | ✅ | ✅ | ✅ | ✅ | ❌ | 组件结构完整，图片补齐中 |
| 极氪 Zeekr | `src/components/zeekr/` | orange | ✅ | ✅（含 pending-review） | ✅ | ✅ | ✅ `verify-zeekr-images.mjs` | **canonical 示例**，21/23 matched |
| 地板 Flooring | `src/components/product/` | amber | ❌（不同结构，非标准 5 组件） | ❌ | ❌ | ❌ | ❌ | perf 59/61 最差（P1-1），待重构为标准模式 |

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-13 | Claude Code | 专题组件模式初始定义（问界/小米） | 完成 | — |
| 2026-06-16 | Claude Code | ZEEKR 专题模式定型（5 组件 + 3 态 + 字面量类型） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

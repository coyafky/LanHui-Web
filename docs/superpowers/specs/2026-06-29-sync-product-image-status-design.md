---
comet_change: sync-product-image-status
role: technical-design
canonical_spec: openspec
---

# sync-product-image-status — Technical Design

## 1. Overview

将已存在的产品图片（`public/images/products/`）映射到产品数据文件（`src/lib/*-products.ts`），补全 `publicPath`/`width`/`height`/`aspectRatio` 并更新 `imageStatus`。

## 2. Matching Strategy

### 2.1 核心策略：中文名逐项手动配对

各品牌 key 命名差异显著，无统一算法：

| 品牌 | 映射清单 key | 产品 lib key/id | 匹配方式 |
|------|-------------|----------------|---------|
| li-auto 系列 | `li-auto-paint-protection-film` | `li-auto-series-paint-film` | 中文名 |
| li-auto i6 | `i6-paint-protection-film` | `paint-protection-film` | 去 `i6-` 前缀 + 中文名 |
| li-auto mega | `mega-paint-protection-film` | `paint-protection-film` | 去 `mega-` 前缀 + 中文名 |
| li-auto l9/one | manifest key | product key | 文件名关键词 + 中文名 |
| tesla | `paint-protection-film` | `tesla-featured-paint-ppf` | 中文名 |
| xiaomi SU7 | manifest productName | `name: "前包围"` | 中文名 |

### 2.2 匹配原则

- 中文名完全一致 → 直接匹配
- 中文名相近（如"后视镜"↔"后视镜壳"）→ 人工判断是否同一产品
- 无匹配 → 保持原状态不变

## 3. Image Status Assignment

| 品牌 | 图片来源 | imageStatus |
|------|---------|-------------|
| li-auto（全系） | AI 生成预览图 | `generated-preview` |
| tesla | AI 生成预览图 | `generated-preview` |
| xiaomi SU7 | 真实施工照片（有 sha256） | `matched` |
| xiaomi YU7 | — | `missing`（无匹配，不变） |
| xiaomi 系列 | — | `pending-review`（无系列图，不变） |

## 4. Type Extension for xiaomi Files

### 4.1 SU7 Interface

```typescript
export type XiaomiSu7ImageStatus = "matched" | "pending-review" | "missing";

export interface XiaomiSu7UpgradeProject {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: XiaomiSu7Category;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly imageStatus: XiaomiSu7ImageStatus;
  readonly sourceArea: "poster_project_matrix";
  // NEW: optional image fields for matched products
  readonly publicPath?: `/images/products/xiaomi/su7/${string}.png`;
  readonly width?: number;
  readonly height?: number;
}
```

### 4.2 YU7 Interface

```typescript
// FIX: remove duplicate "missing"
export type XiaomiYu7ImageStatus = "matched" | "pending-review" | "missing";

export interface XiaomiYu7UpgradeProject {
  // ... existing fields ...
  // NEW: optional image fields
  readonly publicPath?: `/images/products/xiaomi/yu7/${string}.png`;
  readonly width?: number;
  readonly height?: number;
}
```

## 5. Image Dimensions

| 来源 | width/height | aspectRatio |
|------|-------------|-------------|
| li-auto AI 图 | 1448 / 1086 | "4/3" |
| tesla AI 图 | 1448 / 1086 | "4/3" |
| xiaomi SU7 实拍 | manifest 实际值（非标准） | 不填 |

## 6. Execution Plan

按文件逐个处理，顺序：

1. `li-auto-i6-products.ts` — items.json 有标准 key 格式，先行验证匹配流程
2. `li-auto-mega-products.ts` — 同上模式
3. `li-auto-l9-products.ts` — manifest 模式
4. `li-auto-one-products.ts` — manifest 模式
5. `li-auto-series-upgrade-projects.ts` — items.json 40 条目中挑 21 个匹配
6. `tesla-products.ts` — manifest 12 条目中匹配 featured 产品
7. `xiaomi-su7-upgrade-projects.ts` — 先扩展类型，再更新 12 项
8. `xiaomi-yu7-upgrade-projects.ts` — 修复 typo，所有条目保持 missing

## 7. Verification

| 命令 | 检查内容 |
|------|---------|
| `npm run typecheck` | 类型安全，publicPath 字面量类型编译通过 |
| `npm test -- --run` | 现有测试全通过 |
| `npm run build` | SSG 构建不受影响 |
| 人工复查 | 每文件 imageStatus 分布合理 |

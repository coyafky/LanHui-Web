---
comet_change: fix-product-image-copy
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-09-fix-product-image-copy
status: final
---

# Design Doc: 产品图片标注修正

## 背景

将 `imageStatus: "generated-preview"` 及关联的前台文案（"功能预览图""生成预览图""AI 生成"）统一修正为正式的商品预览效果图表达。产品决策：网站是宣传展示用途，预览图应作为正式商品图展示，无需标注 AI 生成性质。

改动面广但逻辑简单：全局查找替换 + 组件 badge 删除 + Hero 免责声明删除。

## 技术方案

### 实施顺序（自上而下）

```
Step 1: 检查脚本就位
  └─ scripts/check-product-image-copy.mjs（新增）
  └─ package.json check:product-image-copy + 接入 check 链

Step 2: 核心类型+函数
  └─ src/lib/wenjie-preview-images.ts
       WenjiePreviewImageStatus: "generated-preview" → "product-preview"
       buildWenjieGeneratedPreviewImage → buildWenjieProductPreviewImage
       alt: "功能预览图" → "商品预览效果图"

Step 3: 产品数据文件（12 品牌）
  └─ 每个文件：类型字面量 + 数据值 imageStatus: "generated-preview" → "product-preview"
  └─ alt 文案同步修正

Step 4: wenjie 调用方
  └─ m6/m7/m8/series-upgrade-projects.ts — import + 函数调用更新

Step 5: 组件（~22 个）
  └─ imageStatus === "generated-preview" → "product-preview"
  └─ 删除 product-preview badge（AlertCircle + "效果预览" span）
  └─ alt 文案："功能预览图"/"效果预览图" → "商品预览效果图"
  └─ Hero 免责声明：直接删除

Step 6: 页面文件
  └─ src/app/product/zhijie/page.tsx — "功能预览图 · 后续补充" 删除

Step 7: 测试（~10 个）
  └─ 断言: "generated-preview" → "product-preview"
  └─ 描述: "AI 生成预览图" → "商品预览效果图"

Step 8: 审计脚本
  └─ scripts/test/image-status-audit.mjs — 计数器更新

Step 9: 全链验证
  └─ check:product-image-copy → typecheck → build → vitest
```

### 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 实施顺序 | 自上而下 | TS strict 即时暴露未同步处 |
| 图片路径 `/generated/` | 不改 | 内部资产组织方式，不影响 UX |
| 独立 ImageStatus 类型 | 不合 | 保持各品牌独立演进能力 |
| Badge 范围 | 只删 product-preview | 不碰 real/missing 逻辑 |
| 测试更新 | 断言+描述全量 | 消除测试中的禁用文案 |

### 检查脚本设计

`scripts/check-product-image-copy.mjs`：
- 扫描 `src/lib` `src/components` `src/app/product` `scripts`
- 禁止 `generated-preview` `功能预览图` `生成预览图` `AI 生成`
- 用拼接字符串构建 forbidden list（规避自检误报）
- 退出码 1 = 发现禁用文案，0 = 通过

### 组件 Badge 删除模式

两种模式统一处理：

```tsx
// 模式 1：带 AlertCircle（wenjie 系）
{project.imageStatus === "generated-preview" ? (
  <span><AlertCircle />{statusLabel}</span>
) : null}
// → 整个条件块删除

// 模式 2：纯文字 badge（其他品牌）
{project.imageStatus === "generated-preview" ? (
  <span>效果预览</span>
) : null}
// → 整个条件块删除
```

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 文件量大可能遗漏 | 检查脚本即时验证 + TS strict typecheck |
| alt 文案不统一（"功能预览图"/"效果预览图"并存） | 统一替换为"商品预览效果图" |
| 删除 badge 影响布局 | badge 是绝对定位 overlay，删除不影响主布局 |

## 测试策略

- `npm run check:product-image-copy` — 禁止禁用文案回归
- `npm run typecheck` — TS strict 类型兜底
- vitest — 现有测试全量更新后跑通
- `npm run build` — SSG 构建验证
- 浏览器抽查 8 个产品页面

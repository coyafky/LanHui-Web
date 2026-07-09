# Design: fix-product-image-copy

## Context

当前产品图系统使用 `imageStatus: "generated-preview"` 标识 AI 生成的预览图。前台组件根据此状态显示 "效果预览" badge（带 AlertCircle 图标）和 "功能预览图" 免责声明。产品决策：网站是宣传展示用途，这些图片应作为正式商品预览效果图展示，不应标注为 AI 生成/预览。

### 当前架构

```
src/lib/*-products.ts (类型 + 数据)
    │  imageStatus: "generated-preview"
    │  alt: "XX 功能预览图"
    ▼
src/lib/wenjie-preview-images.ts (辅助函数)
    │  buildWenjieGeneratedPreviewImage()
    │  返回 imageStatus + alt
    ▼
src/components/**/ProjectGrid.tsx (渲染层)
    │  imageStatus === "generated-preview" → badge 显示
    │  alt 直接传递给 Image 组件
    ▼
src/components/**/Hero.tsx (Hero 层)
    │  免责声明文案
```

### 影响矩阵

| 层 | 文件数 | 改动类型 | 风险 |
|----|--------|---------|------|
| 类型+辅助函数 | 2 | 重命名枚举值+函数 | 低 — TS strict 兜底 |
| 产品数据文件 | ~15 | 批量替换 imageStatus + alt | 低 — 字面量替换 |
| 组件 ProjectGrid | ~15 | 删除 badge 代码块 | 低 — UI 纯删减 |
| 组件 Hero/FeaturedGrid | ~7 | 删除免责声明 + alt 修正 | 低 |
| 测试文件 | ~8 | 断言同步 | 低 |
| 脚本 | 1 更新 + 1 新建 | 计数器更新 + 新增 | 低 |

## Goals / Non-Goals

**Goals:**
- `"generated-preview"` 在 `src/` 中 0 出现
- "功能预览图"/"生成预览图"/"AI 生成" 在 `src/` 中 0 出现
- `product-preview` 状态图片不显示 badge
- alt 统一为 "商品预览效果图"
- 新增检查脚本防止回归

**Non-Goals:**
- 不改图片路径 (`/generated/` 保留)
- 不移动/删除图片资产
- 不修改 docs/ 和 openspec/changes/ 下的历史文件
- 不引入新依赖

## Decisions

### 1. 新枚举值选择: `product-preview`

- **选择**: `"product-preview"`
- **备选**: `"preview"`, `"generated"`, `"ai-generated"`
- **理由**: `product-preview` 明确表达"产品预览"语义，区别于 "generated" 暗示 AI 生成，也比单纯 "preview" 更有业务含义

### 2. Badge 策略: 完全移除 product-preview 的 badge

- **选择**: 删除所有 `imageStatus === "product-preview"` 条件下的 badge 渲染代码
- **理由**: 用户确认 badge 反而降低信任度；alt 文案已足够传达信息
- **影响**: WYSIWYG — 删除条件分支和 `<span>` 元素，图片区域更干净

### 3. 每种产品类型独立 ImageStatus 类型，不合并

- **选择**: 保持各产品文件独立的 `ImageStatus` 类型定义
- **理由**: 各产品有独立演进需求，合并需要改动 imports（超出范围）
- **实际做法**: 每个产品文件内的类型字面量从 `"generated-preview"` 改为 `"product-preview"`

### 4. 图片路径 `/generated/` 目录名保持不变

- **选择**: 不修改文件系统路径
- **理由**: 目录名是内部资产组织方式，不影响前台用户体验；改路径需要迁移文件 → 风险高且超出范围

### 5. 检查脚本用拼接字符串规避自检误报

- **选择**: `scripts/check-product-image-copy.mjs` 中用 `"generated" + "-preview"` 构建 forbidden 列表
- **理由**: 脚本自身的 forbidden list 不应被自己扫描到

## Risks / Trade-offs

- **测试文件大量断言** — 每个产品专题有独立测试，需逐一更新 → 按文件逐个修改，TS strict 兜底
- **组件逻辑变更（删除 badge）** — 可能改变布局 → badge 是绝对定位的 overlay 元素，删除不影响主布局
- **Hero 免责声明删除** — 可能被认为是内容缺失 → 产品决策已确认，此为正向变更

## Migration Plan

1. `npm run check:product-image-copy` 接入 CI，先让检查脚本就位
2. 逐步修改源文件，每次修改后运行检查脚本验证
3. 全部修改完成后 `npm run check` 全链验证
4. 无需回滚计划（纯文案变更，无运行时风险）

# 修复 M1 Product 图片标注：generated-preview → product-preview

## Why

当前产品图数据使用 `imageStatus: "generated-preview"`，前台文案显示"功能预览图""生成预览图""AI 生成"，让用户感觉图片不正式、不可信，削弱宣传效果。产品决策明确：网站是宣传展示用途，这些图片应作为正式的商品预览效果图展示，需统一修正状态字段和文案。

## What Changes

- **BREAKING**: `imageStatus` 枚举值 `"generated-preview"` 全局重命名为 `"product-preview"`（类型定义 + 所有数据文件 + 组件判断 + 测试 + 脚本）
- 函数 `buildWenjieGeneratedPreviewImage` 重命名为 `buildWenjieProductPreviewImage`，同步更新所有 import
- 图片 alt 文案 "功能预览图" → "商品预览效果图"（src/lib + src/components）
- `product-preview` 状态图片不再显示 badge（删除 AlertCircle 图标 + "效果预览" 文案）
- Hero 组件中的 "功能预览图用于说明升级方向，不代表实车案例" 免责声明删除
- Hero 中的 "功能预览图 · 后续补充" 文案删除
- 新增 `scripts/check-product-image-copy.mjs` 检查脚本，禁止 `generated-preview`/`功能预览图`/`生成预览图`/`AI 生成` 在 src/ 中再次出现
- 更新 `scripts/test/image-status-audit.mjs` 中的 `"generated-preview"` 计数器
- `package.json` 新增 `check:product-image-copy` 命令，接入 `npm run check`

## Capabilities

### New Capabilities

无 —— 本次为纯文案/命名修正，不引入新 capability。

### Modified Capabilities

无 —— 无 spec 级行为变更，仅实现层面的字段和文案替换。

## Impact

- `src/lib/` — ~14 个产品数据文件（类型定义 + 数据 + 辅助函数）
- `src/components/` — ~22 个 ProjectGrid/Hero/FeaturedGrid 组件
- `src/lib/` — ~8 个测试文件（断言同步更新）
- `scripts/test/image-status-audit.mjs` — 计数器更新
- `scripts/check-product-image-copy.mjs` — 新增
- `package.json` — 新增 check 子命令

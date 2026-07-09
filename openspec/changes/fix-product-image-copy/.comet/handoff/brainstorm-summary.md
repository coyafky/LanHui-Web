# Brainstorm Summary

- Change: fix-product-image-copy
- Date: 2026-07-09

## 确认的技术方案

自上而下替换：类型定义 → 数据文件 → 调用方 → 组件 → 测试。TS strict 即时暴露未同步处，作为天然检查清单。

实施方案 A：
1. 先就位检查脚本
2. 改 wenjie-preview-images.ts 类型+函数
3. 逐个品牌数据文件替换 imageStatus 值
4. 组件层面：删除 product-preview badge + alt 修正 + 免责声明删除
5. 测试：断言+描述全量更新
6. 脚本：image-status-audit.mjs 计数器更新
7. 全链验证

## 关键取舍与风险

- 图片路径 /generated/ 不改 — 内部资产组织方式
- 每种产品的独立 ImageStatus 类型不合并 — 保持独立演进
- 组件中 real/missing badge 不动 — 只管 product-preview
- "效果预览图" alt 也统一改为 "商品预览效果图"
- wenjie-preview-images.ts: buildWenjieGeneratedPreviewImage → buildWenjieProductPreviewImage

## 测试策略

- check:product-image-copy 检查脚本禁止禁用文案回归
- TS strict typecheck 兜底
- vitest 全量跑通
- npm run build SSG 验证

## Spec Patch

无

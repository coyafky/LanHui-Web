# Brainstorm Summary

- Change: refactor-window-film-content-layer
- Date: 2026-07-09

## 确认的技术方案

方案 A — 直接迁移：新增 `WindowFilmPainPoints` 组件，数据从 `windowFilmPainPoints`（`window-film-details.ts`）导入，`page.tsx` 删除 `PAIN_POINTS` 常量并替换为组件。

## 关键取舍与风险

- 选择独立组件而非通用 PainPoints 组件（YAGNI，当前无第二个使用场景）
- 风险极低：纯文案迁移 + 组件抽取，不改变页面视觉，不改数据结构

## 测试策略

- 单元测试验证数据结构（长度、id 唯一、非空、无绝对化承诺词）
- 防回归脚本检查 `page.tsx` 不含 `PAIN_POINTS`

## Spec Patch

无

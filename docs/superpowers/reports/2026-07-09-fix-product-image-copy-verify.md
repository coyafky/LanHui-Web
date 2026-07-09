# Verification Report: fix-product-image-copy

- **Change:** fix-product-image-copy
- **Date:** 2026-07-09
- **Verify Mode:** full
- **Base Ref:** a9876ce
- **Branch:** feature/20260709/fix-product-image-copy

## Summary

全局将 `imageStatus: "generated-preview"` 替换为 `"product-preview"`，前台文案
"功能预览图""生成预览图""AI 生成"统一替换为"商品预览效果图"，删除 product-preview
状态图片的 AlertCircle badge 和 Hero 免责声明，新增 `check:product-image-copy`
检查脚本防止回归。

## Acceptance Criteria

| 标准 | 状态 |
|------|------|
| 代码中不再出现 `generated-preview` | PASS — src/ 0 命中 |
| 前台不再出现"功能预览图" | PASS — src/ 0 命中 |
| 前台不再出现"AI 生成" | PASS — src/ 0 命中 |
| 图片 alt 改为"商品预览效果图" | PASS — alt 文案已全局替换 |
| 产品图仍正常加载 | PASS — 图片路径未修改 |
| `npm run check:product-image-copy` 通过 | PASS — 479 文件, 0 命中 |
| `npm run build` 通过 | PASS — SSG 全路由正常 |

## Quality Gates

| Gate | Result |
|------|--------|
| `check:product-image-copy` | PASS |
| `tsc --noEmit` | PASS — 9 pre-existing errors (unchanged) |
| `vitest run` | PASS — 1005/1016 (11 pre-existing failures, unchanged) |
| `npm run build` | PASS |

### Pre-existing Test Failures (11, unchanged)

- `zeekr-migration.test.ts`: 4 failures (source dirs not cleaned + 23 vs 21 PNGs)
- `car-care/page.test.tsx`: 2 failures
- `api/upload/route.test.ts`: 3 failures
- `api/stores/route.test.ts`: 2 failures

Zero new failures introduced.

## Scope

- **63 files changed** (+631 / -569 lines)
- **17 data files**: type defs + imageStatus values
- **12 components**: badge removal + disclaimer removal + alt updates
- **12 test files**: assertion + description updates
- **2 scripts**: new `check-product-image-copy.mjs` + updated `image-status-audit.mjs`
- **1 package.json**: `check:product-image-copy` added to `check` chain

## Risk Assessment

- **Low risk** — 纯文案/命名修正，不改图片路径、不移动资产
- TS strict 作为编译时兜底 — 任何遗漏的 `"generated-preview"` 引用会导致 typecheck 失败
- `check:product-image-copy` 脚本作为 CI 防线 — 防止禁用文案回归

## Branch Handling

Branch `feature/20260709/fix-product-image-copy` is ready for merging.

10 commits, clean history, each task independently committed.

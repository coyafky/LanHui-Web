# ZEEKR 改装专题页 Build 报告(进行中)

> 工作分支:`worktree-agent-zeekr-v2` (基于 main @ 5a4963a)
> 启动时间:2026-06-16
> 范本 PRD:`docs/PRD/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md`

## 进度总览

| 子任务 | 状态 | RED | GREEN | 回归 | build | commit |
| --- | --- | --- | --- | --- | --- | --- |
| 1. 图片迁移 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ✓ `dbce48e` |
| 2. 数据层 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ✓ `6fe744b` |
| 3. CI 脚本 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ✓ `e37c348` |
| 4. 5 个组件 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ✓ `3d67843` |
| 5. 页面 + 入口 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ⏸ 待提交 |
| 6. 验证 + 合并 | 未启动 | | | | | |

## 子任务 1 — 图片迁移(已完成 GREEN)

### 已完成

- ✅ 源 ZEEKR/{极氪9X,极氪8X,Zeeker009}/ 三个子目录复制到 worktree
- ✅ 21 张 PNG 按 PRD §8.3 清单迁移到 `public/images/products/zeekr/{9x,8x,009}/`,ASCII slug 命名
- ✅ 源 ZEEKR/ 目录(含三个子目录 + .DS_Store)已删除
- ✅ 集成测试 `src/lib/zeekr-migration.test.ts` 16/16 GREEN
- ✅ `npx eslint scripts/migrate-zeekr-images.mjs src/lib/zeekr-migration.test.ts` 退出码 0
- ✅ `npx tsc --noEmit` 无新增错误(共 12 个 pre-existing 错误,无 zeekr 相关)
- ✅ `npm run build` 成功,所有 pre-existing 路由正常编译

### 修复:macOS APFS case-insensitive FS bug(2026-06-16)

**症状**:`git status` 报告 `?? public/images/products/ZEEKR/`(21 PNG 在内),但 `zeekr/` 也是同一目录。

**根因**:
```
$ stat -f "%d:%i %N" public/images/products/zeekr public/images/products/ZEEKR
16777231:90971591 public/images/products/zeekr
16777231:90971591 public/images/products/ZEEKR   ← 同一 inode!
```

macOS APFS 默认 **case-insensitive**,`zeekr/` 和 `ZEEKR/` 是同一个目录。

**修复**:
1. 用临时名 `mv ZEEKR _zeekr_rename_tmp && mv _zeekr_rename_tmp zeekr` 强制 case 改为小写
2. `migrate-zeekr-images.mjs` 删除源父目录步骤加 `SOURCE !== TARGET` 防御,避免重跑时误删目标
3. 清理 `.DS_Store`(源父目录残留)

**验证**:
- `find public/images/products/zeekr -type f -name "*.png" | wc -l` → 21
- `ls public/images/products/ZEEKR` → `No such file or directory`
- `npx vitest run src/lib/zeekr-migration.test.ts` → 16/16 GREEN

### PRD v2.0 §8.2 文件大小规格修订(用户决策 A)

**问题**:PRD v2.0 §8.2 规格表写「文件大小 ≤ 500 KB」,与实测不符。

| 指标 | 数值 |
| --- | --- |
| 21 张 PNG 实测最小 | 1051 KB |
| 实测最大 | **2357 KB** |
| 实测平均 | 1675 KB |
| 总大小 | 34.3 MB |

**根因**:PRD v2.0 编写时我未实际测量文件大小,凭印象写了 500 KB(假设 PNG 经压缩)。但实际源图为高分辨率(1448×1086)产品照片,白底/浅色场景,压缩后仍 1-2 MB。

**处置(用户决策 A)**:
- PRD §8.2/§8.6/§15/§16 的 500 KB → 3 MB(4 处编辑)
- 测试代码 `MAX_FILE_SIZE_BYTES` 3000 KB → 2500 KB(实测最大 × 1.06,留 4% 余量)

### 子任务 1 commit 信息(待提交)

```
chore(zeekr): migrate 21 product images to ASCII slug paths per PRD v2.0 §8.3

- Move public/images/products/ZEEKR/{极氪9X,极氪8X,Zeeker009}/ → zeekr/{9x,8x,009}/
- 20 matched + 1 pending-review (9X 行 15 命名差异)
- 2 missing (9X 行 8/9 源 Excel 无图,UI 降级)
- Delete source directories (handle macOS case-insensitive FS via temp rename)
- Add scripts/migrate-zeekr-images.mjs (idempotent, log to stdout, case-insensitive-safe)
- Add src/lib/zeekr-migration.test.ts (16 integration tests, MAX_FILE_SIZE = 2500 KB)
- Fix PRD v2.0 §8.2 file size spec: 500 KB → 3 MB (user decision A, 4 edits)
```

## 下一步

提交 Subtask 1 → 进入子任务 2(数据层 `src/lib/zeekr-products.ts`)。

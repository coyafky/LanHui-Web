# Task 5 — 检查脚本 · `check-admin-page-duplication.mjs`

## Status: DONE

## 创建内容

### 文件

1. **`scripts/check-admin-page-duplication.mjs`** — 节点脚本，检测 admin 页面中本应合并到共享 hook/component 的重复模式
   - 3 类检测 + 精确的 allow-list（排除共享实现自身 + 共享实现的测试文件 + API 路由文件）
   - 输出简洁的中文违规信息
   - exit 1 时有违规，exit 0 时通过

2. **`package.json`** — 新增脚本条目 + 加入 `check` 链
   - `"check:admin-page-duplication": "node scripts/check-admin-page-duplication.mjs"`
   - 插入位置：`check:region-duplication` 与 `check:product-page-tests` 之间

### 三类检测

| # | 检测项 | 模式 | 例外 |
|---|--------|------|------|
| 1 | `/api/articles/categories` 直接调用 | 任何文件中出现该 URL | `use-categories.ts` / `use-categories.test.tsx` / API route 文件 / 所有 `.test.` 文件 |
| 2 | `EntityImageUploader` + `Loader2` 内联 | 同时出现两个标识符 | `EntityImagePage.tsx` / `EntityImageUploader.tsx` / 文件不在 `src/app/admin/` 路径 |
| 3 | Store action 状态标记簇 | 出现 ≥3/5 个标记(`actionOpen`/`statusReason`/`acting`/`actionError`/`performStatusAction`) | `use-store-action.ts` / `use-store-action.test.tsx` / 已 `import useStoreAction` 的文件 / 不在 admin/store 路径的文件 |

## 脚本输出

```
No admin page duplication violations found.
```

当前代码库中所有可检测的重复模式均已提取为共享 hook/component，且消费方正确使用共享实现。

## Concerns

无。

## 验证方式

```
node scripts/check-admin-page-duplication.mjs
npm run check:admin-page-duplication   # 通过 package.json 别名
```

必要时可追踪新引入的重复：在 CI 或 pre-commit hook 中运行 `npm run check:admin-page-duplication`。

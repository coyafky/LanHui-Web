---
change: sync-product-image-status
design-doc: docs/superpowers/specs/2026-06-29-sync-product-image-status-design.md
base-ref: 34b904eb63664170a846ee5b2fa0519bbd3a7856
---

# Sync Product Image Status 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `public/images/products/` 下已有的 li-auto、tesla、xiaomi 三个品牌的产品图片资产映射到 `src/lib/*-products.ts` 中，补全 `publicPath`/`width`/`height`/`aspectRatio` 字段，并将 `imageStatus` 更新为 `generated-preview`（AI 图）或 `matched`（实拍图）。

**架构：** 纯数据文件更新，不涉组件/UI/路由/DB。按 8 个产品数据文件逐个处理，每个任务独立提交。匹配策略因品牌而异：li-auto 按 key 前缀去除后匹配，tesla 按 manifest key 匹配 featured 产品，xiaomi 按中文名匹配 manifest 条目。

**技术栈：** TypeScript（字面量类型 + `as const`）、Next.js 静态数据、runtime count assertion

**范围：** 涉及 8 个文件，共约 150+ 条产品条目更新。不修改任何组件、页面、API、路由或数据库。

---

## 修改文件清单

| 文件 | 职责 |
|------|------|
| `src/lib/li-auto-i6-products.ts` | 20 项项目，匹配 i6 items.json（去 `i6-` 前缀，含 2 个特殊映射） |
| `src/lib/li-auto-mega-products.ts` | 18 项项目，匹配 mega items.json（去 `mega-` 前缀） |
| `src/lib/li-auto-l9-products.ts` | ~14 项项目，匹配 l9 manifest.json（按 key/中文名） |
| `src/lib/li-auto-one-products.ts` | ~8 项项目，匹配 one manifest.json（按 key/中文名） |
| `src/lib/li-auto-series-upgrade-projects.ts` | 40 项（10 featured + 30 optional），匹配系列 items.json 中 21 条 |
| `src/lib/tesla-products.ts` | 42 项（10 featured + 32 optional），匹配 tesla manifest 中 ~8 条 |
| `src/lib/xiaomi-su7-upgrade-projects.ts` | 12 项，先扩展类型接口，再匹配 manifest 中 12 张实拍图 |
| `src/lib/xiaomi-yu7-upgrade-projects.ts` | 9 项，修复 `XiaomiYu7ImageStatus` 中重复的 `"missing"`，保持 `imageStatus: "missing"` |

---

## 任务列表

### 任务 1：li-auto-i6-products.ts

- [x] 1.1 读取 `public/images/products/li-auto/i6/generated/items.json` 确认 20 项 key 映射
- [x] 1.2 逐项更新 20 个产品条目：`imageStatus: "generated-preview"` + `publicPath` + `width: 1448` + `height: 1086` + `aspectRatio: "4/3"`
- [x] 1.3 处理 2 个特殊映射：`i6-sway-bar→stabilizer-bar`、`i6-wheels→wheel-rims`
- [x] 1.4 运行 `npx tsc --noEmit src/lib/li-auto-i6-products.ts` 确认类型通过

### 任务 2：li-auto-mega-products.ts

- [x] 2.1 逐项更新 18 个产品条目，去 `mega-` 前缀匹配
- [x] 2.2 运行 typecheck 确认

### 任务 3：li-auto-l9-products.ts

- [x] 3.1 读取 l9 manifest.json，按 key/中文名匹配产品条目
- [x] 3.2 更新匹配成功的条目
- [x] 3.3 运行 typecheck 确认

### 任务 4：li-auto-one-products.ts

- [x] 4.1 读取 one manifest.json，按 key/中文名匹配产品条目
- [x] 4.2 更新匹配成功的条目
- [x] 4.3 运行 typecheck 确认

### 任务 5：li-auto-series-upgrade-projects.ts

- [x] 5.1 先放宽 `imageStatus` 类型：`"pending-review"` → `"matched" | "generated-preview" | "pending-review" | "missing"`
- [x] 5.2 更新 10 项 featured + 11 项 optional 匹配条目
- [x] 5.3 运行 typecheck 确认

### 任务 6：tesla-products.ts

- [x] 6.1 扩展 `TeslaProject` 接口，添加 `readonly publicPath?`/`width?`/`height?`/`aspectRatio?`
- [x] 6.2 按中文名匹配 manifest 中 8 项 featured 产品条目
- [x] 6.3 运行 typecheck 确认

### 任务 7：xiaomi-su7-upgrade-projects.ts

- [x] 7.1 扩展 `XiaomiSu7UpgradeProject` 接口，添加 `readonly publicPath?`/`width?`/`height?`
- [x] 7.2 按 manifest 中文名匹配 12 项，更新为 `imageStatus: "matched"` + 实际尺寸
- [x] 7.3 运行 typecheck 确认

### 任务 8：xiaomi-yu7-upgrade-projects.ts

- [x] 8.1 修复 `XiaomiYu7ImageStatus`：`"matched" | "missing" | "missing"` → `"matched" | "pending-review" | "missing"`
- [x] 8.2 确认无匹配项，所有条目保持 `"missing"`
- [x] 8.3 运行 typecheck 确认

### 任务 8b（新增）：wenjie 系列图片路径修复

- [x] 8b.1 创建 `src/lib/wenjie-preview-images.ts`：model-aware `buildWenjieGeneratedPreviewImage(key, name, modelCategory?)`
- [x] 8b.2 更新 M6/M7/M8 数据：传入 modelCategory 参数，路径指向 `/images/products/wenjie/{M6,M7,M8}/generated/`
- [x] 8b.3 更新 wenjie series 数据：无 model → publicPath=null（组件 fallback 到 gradient placeholder）
- [x] 8b.4 更新 wenjie 4 个测试文件：匹配新路径约定 + null publicPath
- [x] 8b.5 图片数量验证：M6 17/17、M7 30/30、M8 30/30 全部匹配

### 任务 8c（新增）：组件渲染适配（跨品牌）

- [x] 8c.1 更新 wenjie 组件：conditionally render `<Image>` when `publicPath` exists
- [x] 8c.2 更新 li-auto 组件（6 个 grid）：conditionally render `<Image>` when `publicPath` exists
- [x] 8c.3 更新 tesla 组件（TeslaFeaturedGrid）：conditionally render `<Image>`
- [x] 8c.4 更新 xiaomi 组件（SU7/YU7）：conditionally render `<Image>`
- [x] 8c.5 删除 PosterStub 组件（遵循无海报政策）
- [x] 8c.6 修复 xiaomi-yu7 接口：添加 publicPath/width/height/aspectRatio 可选字段

### 任务 9：全局验证

- [x] 9.1 运行 `npm run typecheck`（0 个新错误，仅 9 个 pre-existing）
- [x] 9.2 运行 `npm test -- --run`（wenjie 86/86、li-auto/tesla/xiaomi 157/157 通过；39/43 文件通过）
- [x] 9.3 运行 `npm run build`（516/516 页编译成功）

---

## 执行顺序

```
任务 1 ───┐
任务 2 ───┤
任务 3 ───┤
任务 4 ───┤  并行可独立执行
任务 5 ───┤
任务 6 ───┤
任务 7 ───┤
任务 8 ───┘
            ↓
          任务 9（在所有修改后运行全局验证）
```

## 回滚策略

```bash
git revert HEAD~8..HEAD   # 回滚全部
```

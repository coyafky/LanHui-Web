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
| 5. 页面 + 入口 | ✅ 完成 | ✓ | ✓ | ✓ | ✓ | ✓ `b64fd04` |
| 6. 验证 + 合并 | 进行中 | ✓ | ✓ | ✓ | ✓ | ⏸ |

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

---

## 子任务 2-5 摘要(已完成,详见各自 commit message)

### 子任务 2 数据层 (commit `6fe744b`)

- `src/lib/zeekr-products.ts` 23 条产品行(9X 16 + 8X 6 + 009 1)
- 字面量类型:`ZeekrImageWidth=1448` / `ZeekrImageHeight=1086` / `ZeekrImageAspectRatio="4/3"` / `ZeekrTopicMeta.totalProducts=23` / `totalModels=3`
- 3 态 imageStatus: 20 matched + 1 pending-review(9X 行 15)+ 2 missing(9X 行 8/9)
- name vs rawName 清洗规则(冰箱垃圾桶按压款 / 尾箱垫7件套 / 挡泥板+内衬6件套)
- 36 测试覆盖结构 / 状态分布 / 字面量 / 名称清洗

### 子任务 3 CI 脚本 (commit `e37c348`)

- `scripts/verify-zeekr-images.mjs`: 6 校验项(像素/比例/命名/大小/路径/总数=21)
- `package.json` 加 `verify:zeekr-images`,串入 `check` 链
- 3 个集成测试(子进程调用 + 注入失败)

### 子任务 4 五个组件 (commit `3d67843`)

- `ZeekrAnchorNav` (Client) sticky desktop nav
- `ZeekrProductCard` (Client) 3 态 imageStatus UI
  - matched: Next/Image + aspect-[4/3] + object-contain + sizes
  - pending-review: 同上 + 左上角"待复核"角标
  - missing: 虚线降级容器 + ImageIcon
- `ZeekrProductGrid` (Server) 1/2/3/4 列响应式
- `ZeekrProductTable` (Server) 23 行列表,3 态徽章
- `ZeekrTopicBanner` (Server) /product 入口,orange 主题

### 子任务 5 页面 + 入口 (commit `b64fd04`)

- `src/app/product/zeekr/page.tsx`: RSC 页面
  - Hero (orange 主题,极氪改装专题)
  - 3 个车型分组 section (9X/8X/009)
  - 服务流程 4 步
  - 底部 CTA + JSON-LD ItemList
- `src/app/product/page.tsx` 在 <WenjieTopicBanner /> 后追加 <ZeekrTopicBanner />
- `public/images/products/zeekr/preview.png` 9X 01-table 占位图(待补 3 车型拼图)
- verify 脚本扫描范围限定为 zeekr/{9x,8x,009}/ 三个子目录(跳过根目录 meta 资源)

---

## 子任务 6 验证

### 全量检查链

| 命令 | 结果 |
| --- | --- |
| `npm run lint` | ✅ 0 errors, 11 pre-existing warnings(全在非 zeekr 文件) |
| `npm run typecheck` | ⚠ 12 pre-existing errors(analytics.test.ts, route.test.ts, news/[slug]/page.tsx 等),zeekr 0 新增 |
| `npm run verify:zeekr-images` | ✅ 21 个文件全部通过 |
| `npm run build` | ✅ 成功,/product/zeekr 加入静态路由 |
| `npx vitest run` | ✅ 220 tests,216 passed(4 pre-existing articles 测试 fail,与 zeekr 无关) |

注:`npm run check` 因 pre-existing typecheck 错误阻断,但 lint/verify/build 三项独立运行均通过。

### 视觉验证(4 张截图,见 `docs/test-reports/zeekr-screenshots/`)

| 页面 | 视口 | 文件 |
| --- | --- | --- |
| /product | 1440×900 | product.desktop-1440.png |
| /product/zeekr | 1440×900 | product-zeekr.desktop-1440.png |
| /product | 390×844 | product.mobile-390.png |
| /product/zeekr | 390×844 | product-zeekr.mobile-390.png |

肉眼检查(zeekr 桌面):
- Hero 显示"极氪改装专题"标题 + orange 主题渐变
- 3 个车型分组 section 正常显示
- 9X 行 1-7、10-14、16 显示图片;行 8(挡泥板+内衬6件套)、行 9(双层脚垫)显示虚线占位;行 15(后备箱储物盒)显示图片 + 左上"待复核"角标
- 8X 6 款全显示图片
- 009 1 款全显示图片
- 表格 23 行齐全,3 态徽章颜色正确(绿/琥珀/灰)
- 服务流程 4 步正常
- 底部 CTA + 合规说明

### 回归检查

| 路由 | HTTP | 备注 |
| --- | --- | --- |
| /product | 200 | 含 ZEEKR TOPIC banner,顺序 XIAOMI → WENJIE → ZEEKR → FLOORING |
| /product/wenjie | 200 | 无回归 |
| /product/xiaomi | 200 | 无回归 |
| /product/flooring | 200 | 无回归 |
| /product/window-film | 200 | 无回归 |
| /product/zeekr | 200 | 新增路由,静态化成功 |

## 最终提交

Subtask 6 commit 信息(待提交):
```
chore(zeekr): add build report + visual verification artifacts

- docs/test-reports/ZEEKR_BUILD_REPORT_2026-06-16.md (final)
- docs/test-reports/zeekr-screenshots/ (4 PNG)
- scripts/screenshot-zeekr.mjs (reproducible screenshot script)
```

→ 之后 --no-ff merge worktree-agent-zeekr-v2 → main,merge commit message:
`feat(zeekr): implement zeekr modification topic page per PRD v2.0 (cite ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)`

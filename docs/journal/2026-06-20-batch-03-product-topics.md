# 批 3 — 4 个产品主题专项 v1 PRD(2026-06-20)

> WINDOW_FILM / WENJIE / XIAOMI / FLOORING 4 个主题专项 PRD。product 分类从 55% → 100%,整体 83% → 97%。

---

## 1. 目标

补齐批 2 留下的 4 个产品主题专项 PRD,把 product 分类推到 100%。4 个主题专项共享 ZEEKR canonical 模式(字面量类型 + 3 态 imageStatus + 5 组件),需要单独 agent 保证一致性。

## 2. 范围

### 2.1 In scope
- 1 个子 agent 写 4 个主题专项 v1 PRD(单 agent 而非多 agent,4 个文件共享模式)
- 4 个 v0 旧 PRD git mv 到 archive
- product/README.md 更新(6/11 → 11/11)
- Master PRD §5.2 / §6.1 / §8 / §9 看板更新

### 2.2 Out of scope
- FLOORING 性能优化方案实施(P1-1 在 PRD §6.5 已写方案,等后续批)
- WENJIE 30+ 车型图片补图(P1-4 在 PRD §8.3 已列清单)
- 实际主题页面代码改动

## 3. 工作流

### 3.1 Worktree
- 分支名:`worktree-agent-doc-prd-fill2`
- 基线 commit:`d922e8c`(批 2 merge commit)

### 3.2 调度
- **单 agent 串行**(与批 2 的 5 agent 并行相反)
- 选择单 agent 原因:4 个主题共享 ZEEKR 模式,放 1 个 agent 让字面量类型 / 3 态 UI / CI 脚本引用保持一致
- agent 必须读 ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md 作为模板锚点

### 3.3 关键命令
```bash
# 创建 worktree
git worktree add .claude/worktrees/agent-doc-prd-fill2 -b worktree-agent-doc-prd-fill2 main

# 启动 1 个 agent
run_agent "读 product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md 作模板 → 写 4 个 v1 主题 PRD → 不要 commit"

# 验证产出
for f in WINDOW_FILM WENJIE XIAOMI FLOORING; do
  wc -l docs/PRD/product/${f}_TOPIC_PRD_2026-06-20.md
  grep "^## " docs/PRD/product/${f}_TOPIC_PRD_2026-06-20.md | head -10
done

# 单次 commit
git add docs/PRD/product/ docs/PRD/00_MASTER_PRD.md
git commit -m "docs(prd): 批 3 填表 - 4 个产品主题专项 v1 PRD"
```

## 4. 产出

### 4.1 文件清单(6 个,+2446 行)
| 文件 | 类型 | 行数 |
|---|---|---|
| `docs/PRD/product/WINDOW_FILM_TOPIC_PRD_2026-06-20.md` | 新建 | 501 |
| `docs/PRD/product/WENJIE_TOPIC_PRD_2026-06-20.md` | 新建 | 616 |
| `docs/PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md` | 新建 | 614 |
| `docs/PRD/product/FLOORING_TOPIC_PRD_2026-06-20.md` | 新建 | 698 |
| `docs/PRD/product/README.md` | 修改 | (+22 行) |
| `docs/PRD/00_MASTER_PRD.md` | 修改 | (+15 行) |
| **合计** | | **2446** |

### 4.2 Commit
| Hash | 标题 |
|---|---|
| `d301933` | docs(prd): 批 3 填表 - 4 个产品主题专项 v1 PRD |

### 4.3 Merge
| Hash | 标题 |
|---|---|
| `dc5bf26` | merge: 批 3 - 4 个产品主题专项 v1 PRD |

## 5. 决策

- **单 agent 而非 4 agent 并行**:4 个主题共享 ZEEKR canonical 模式,放 1 个 agent 保证字面量类型 (`Width=1448; Height=1086; AspectRatio="4/3"`) / 3 态 imageStatus 引用一致。多 agent 容易出现"微差"破坏统一性。
- **WINDOW_FILM 作为"特例"文档化**:WINDOW_FILM 与 wenjie/xiaomi/zeekr/flooring 4 主题结构不同 — 静态数据在 `window-film-details.ts` 而非 `<topic>-products.ts`,路由 `/[packageSlug]` 是子页而非 anchor,不需要 3 态 imageStatus。在 product/README.md 加"主题专项特例 (WINDOW_FILM)"章节文档化此差异。后续新主题专项时,需先判断属于 anchor 还是子页。
- **FLOORING §6.5 P1-1 性能优化作为硬性要求写进 PRD**:`/product/flooring` perf 59/61(全站最差,LCP 6.6s)。本批不只是写 PRD,而是把修复方案(LCP 6.6s → < 3s,perf 59/61 → 90/85)作为验收硬性要求写进 §6.5。实施时不能跳过。

## 6. 经验

### 6.1 踩坑
- (无新增 — 沿用批 1/2 经验:`cd X && cmd` 链式、agent 不 commit、orchestrator 验证)

### 6.2 新模式
- **共享模式的"单 agent 一致性"原则**:多个文件共享同一模板/模式时,优先单 agent 而非并行。ZEEKR → WINDOW_FILM/WENJIE/XIAOMI/FLOORING 是这个模式的典型应用。
- **特例文档化**:同类目下出现结构差异时,不要硬塞进通用模板。在分类 README 加"特例"章节,把差异写明 + 写明后续新条目怎么判断选哪个模式。

### 6.3 约定
- 主题专项字面量类型统一:`type Width = 1448; type Height = 1086; type AspectRatio = "4/3"`
- 3 态 imageStatus:`matched | pending-review | missing`
- 主题配色:xiaomi=orange, wenjie=cyan, zeekr=orange, flooring=amber
- 容器规格:`aspect-[4/3] + object-contain + Next/Image sizes`
- WINDOW_FILM 例外:不走 5 组件模式,数据在 `window-film-details.ts`,不要 CI 脚本

## 7. 未完成(进下一批)

- [x] 4 个主题专项 v1 PRD ✅
- [x] product 分类 100% ✅
- [ ] **批 4**:P0-6 清理测试门店(见 `admin/STORE_MANAGEMENT_PRD_2026-06-20.md §5.3`,1-2h)
- [ ] **批 5**:P0-7 修复 `/news/[slug]` content 字段(见 `public-site/NEWS_PRD_2026-06-20.md §8`,1h)
- [ ] **批 6**:补 cross-cutting 1 个子集扩展,让总完成度 → 100%(1-2h)

## 8. 关联

### 8.1 受影响的 PRD
- `product/README.md`(完成度 + 特例章节)
- `00_MASTER_PRD.md` §5.2 / §6.1 / §8 / §9

### 8.2 引用本批的 commit
- 任何后续实施 WINDOW_FILM/WENJIE/XIAOMI/FLOORING 的 commit 会引用本批 PRD
- FLOORING P1-1 性能优化 commit 会引用 `FLOORING_TOPIC_PRD_2026-06-20.md §6.5`

### 8.3 关联 batch
- 上一批:`docs/journal/2026-06-20-batch-02-prd-fill.md`
- 下一批:`docs/journal/2026-06-XX-batch-04-p0-cleanup.md`(待批 4 启动时新建)
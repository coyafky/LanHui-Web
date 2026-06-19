# 批 1 — PRD 文档体系重构(2026-06-19)

> 5 分类骨架 + 4 DB 文档 + Master PRD + 5 模板。完整文档体系从 0 到 1。

---

## 1. 目标

把散落的 12 个旧 PRD 文件(单文件 386 行 `docs/PRD.md` + 11 个零散 SPEC)重构为:
- **5 分类目录**(按页面类型)
- **Master + 子 PRD 两层**(Master 答"是什么",子 PRD 答"怎么实现")
- **独立 DB 文档体系**(4 份规格 + ER 图 + 种子数据)
- **5 模板**(让后续子 PRD 写法统一)

解决"页面做不好的原因是没前期做好设计"——把"PRD = 做完功能随手写写"变成"PRD = 设计阶段的契约"。

## 2. 范围

### 2.1 In scope
- 创建 7 个目录(`docs/PRD/{public-site,product,admin,feature,cross-cutting,archive,_templates}` + `docs/database/`)
- 12 个旧 PRD `git mv` 到分类目录(100% rename 检测保留历史)
- 写 4 份 DB 文档(README / SCHEMA / ER_DIAGRAMS / SEED_DATA)
- 写 Master PRD(9 节标准结构)
- 写 5 份分类 README
- 写 5 份子 PRD 模板(8 节标准)

### 2.2 Out of scope
- 子 PRD 实际内容(等批 2 填表)
- 后台 / 公开站 PRD 具体规格
- 性能 / 安全 / 部署等横切文档(等批 2)

## 3. 工作流

### 3.1 Worktree
- 分支名:`worktree-agent-doc-restructure`
- 基线 commit:`5f18603`(主仓 master rename 前)

### 3.2 调度
- **单 agent 串行**(orchestrator 直接干)
- 5 分类骨架 → 4 DB 文档 → Master → README → 模板,顺序生成

### 3.3 关键命令
```bash
# 创建 7 个目录
mkdir -p docs/PRD/{public-site,product,admin,feature,cross-cutting,archive,_templates} docs/database

# 12 个 git mv(分类)
git mv docs/PRD/AUDIT_AND_REGRESSION_PRD_2026-06-19.md docs/PRD/cross-cutting/
git mv docs/PRD/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md docs/PRD/product/
git mv docs/PRD/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md docs/PRD/public-site/
git mv docs/PRD/IMAGE_MANAGEMENT_PRD_2026-06-10.md docs/PRD/admin/
git mv docs/PRD/LOGO_BRAND_VISUAL_ALIGNMENT_PRD_2026-06-14.md docs/PRD/public-site/
git mv docs/PRD/STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md docs/PRD/admin/
git mv docs/PRD/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md docs/PRD/product/
git mv docs/PRD/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md docs/PRD/product/
git mv docs/PRD/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md docs/PRD/product/
git mv docs/PRD/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md docs/PRD/archive/
# ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md 已在 product/ 留 v1
# STORE_REGION_AND_STATUS_PRD_2026-06-14.md 是 untracked,cp 到 admin/

# 单次 commit 全部 27 文件
git add docs/PRD/ docs/database/
git commit -m "docs: 批 1 - 5 分类骨架 + 4 DB 文档 + Master + 5 模板"
```

## 4. 产出

### 4.1 文件清单(27 个,+2800 行)
| 路径 | 类型 | 行数 |
|---|---|---|
| `docs/PRD/00_MASTER_PRD.md` | 新建 | 315 |
| `docs/database/README.md` | 新建 | 96 |
| `docs/database/SCHEMA.md` | 新建 | 306 |
| `docs/database/ER_DIAGRAMS.md` | 新建 | 302 |
| `docs/database/SEED_DATA.md` | 新建 | 241 |
| `docs/PRD/{public-site,product,admin,feature,cross-cutting}/README.md` | 新建 | 5 × ~25 |
| `docs/PRD/_templates/{public-site,product,admin,feature,cross-cutting}.md` | 新建 | 5 × ~80 |
| 11 个旧 PRD | `git mv` | (略) |
| 1 个 untracked PRD | `cp` | (略) |

### 4.2 Commit
| Hash | 标题 |
|---|---|
| `10d2fe1` | docs: 批 1 - 5 分类骨架 + 4 DB 文档 + Master + 5 模板 |
| `5962939` | docs: 删除遗留的 docs/PRD.md (信息已下沉到 Master PRD) |

### 4.3 Merge
| Hash | 标题 |
|---|---|
| `f2d3bc4` | merge: 批 1 - PRD 文档体系重构 |

## 5. 决策

- **5 分类而非按功能/模块**:用户确认"按页面类型"(public-site/product/admin/feature/cross-cutting)。理由:页面类型跟路由结构一一对应,后续按 URL 找 PRD 直接。
- **Master 不下沉实现细节**:Master 答"是什么/怎么样",子 PRD 答"怎么实现/验收"。Master 不会膨胀成 1000+ 行单文件。
- **DB 文档独立成 `docs/database/`**:不进 PRD 树。理由:DB 规格不跟页面挂钩,是横向规格;4 份体系足够(SCHEMA + ER + SEED + README 索引)。
- **`git mv` 而非重写**:保留文件历史可追溯(`git log --follow`);100% rename 检测不丢 blame。
- **批 1 不写子 PRD 内容**:先骨架后填表。骨架稳定后,批 2 写各子 PRD 时不会再因为结构变更返工。

## 6. 经验

### 6.1 踩坑
- **`docs/PRD.md` 第一次 commit 没真删**:commit message 写了"合并到 Master",但 `git add` 没 stage 删除。后续单独 commit `5962939` 修。**教训:涉及删除的文件必须 `git rm -f` 显式 stage**。
- **Bash CWD 漂移**:worktree 里 `cd` 后跑命令,有时仍漂回主仓。后续 `cd X && cmd` 链式兜底。

### 6.2 新模式
- **Master + 子 PRD 两层**:Master 是契约索引,子 PRD 是实施规格。后续找 bug 看 Master §5 定位子 PRD。
- **8 节子 PRD 模板**:概述 / 用户故事 / 功能清单 / UI / 数据 / API / 验收 / CHANGELOG。统一格式让 grep / 模板填充 / 跨子 PRD 对比都简单。
- **9 节 Master PRD 模板**:定位 / 用户 / 技术栈 / IA / 子 PRD 地图 / 看板 / DoD / 路线图 / CHANGELOG。**§6 看板 + §9 CHANGELOG 是项目仪表盘核心**,每批后必须更新。

### 6.3 约定
- 子 PRD 文件名:`<FEATURE>_PRD_<YYYY-MM-DD>.md`
- 模板文件:`docs/PRD/_templates/<category>.md`
- 分类 README:`docs/PRD/<category>/README.md`
- 归档:`<FEATURE>_PRD_<YYYY-MM-DD>.md.archive`(v0 被替代时)

## 7. 未完成(进下一批)

- [x] 5 分类骨架 ✅
- [x] Master PRD + 5 模板 ✅
- [x] 4 份 DB 文档 ✅
- [ ] **23 个 v1 子 PRD 内容**(public-site 5 + product 5 通用 + admin 4 + feature 4 + cross-cutting 5)
- [ ] 9 个旧 v0 PRD git mv 到 `docs/PRD/archive/`
- [ ] 5 个分类 README 同步 v1 链接
- [ ] Master PRD §6.1 / §8 / §9 看板更新

## 8. 关联

### 8.1 受影响的 PRD
- 新建 Master PRD `00_MASTER_PRD.md`
- 新建 4 份 DB 文档

### 8.2 引用本批的 commit
- 任何后续 PRD commit 会引用 5 分类骨架
- 全站审计报告 `docs/PRD/AUDIT_AND_REGRESSION_PRD_2026-06-19.md` 早于本批,在批 2 重新分类

### 8.3 关联 batch
- 上一批:无(本批是文档体系从 0 到 1)
- 下一批:`docs/journal/2026-06-20-batch-02-prd-fill.md`
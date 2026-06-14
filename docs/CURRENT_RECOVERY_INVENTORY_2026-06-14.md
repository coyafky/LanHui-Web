# 当前成果盘点清单

日期：2026-06-14  
目的：在不回退、不清理当前混合目录的前提下，盘点哪些成果值得保留、哪些需要修复、哪些应暂缓或清理。

## 1. 版本层级

| 层级 | 位置 / 引用 | 状态 | 用途 |
| --- | --- | --- | --- |
| 干净基线 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website-clean-2026-06-13` | detached HEAD `e3de35d`，干净 | 安全参照版本，不在此目录直接混入当前成果。 |
| 当前混合目录 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website` | `main` 指向 `e3de35d`，叠加大量未追踪成果，`src/lib/data.ts` 和 `src/lib/news.ts` 有修改 | 需要从这里救出设计、产品页、后台和素材成果。 |
| 远端 main | `origin/main` at `c71d188` | 比当前本地多 5 个提交 | 包含首页 Hero 企业微信弹窗、后台设置页等已提交成果，后续应单独评估合入。 |

## 2. 总体判断

当前目录不是单一提交历史的线性结果，而是多个 worktree / agent 成果叠加：

- 有价值成果很多，不能直接 `git clean`。
- 产品专题、门店图片上传、后台文章编辑、企业微信首页设计属于应优先保留的业务成果。
- `.playwright-cli/`、多平台 agent commands、临时截图、奇怪临时文件属于清理候选。
- 需要先做“分模块救援”，再做构建验证，而不是一次性 `git add .`。

## 3. 产品页与专题

### 3.1 基线已有

| 模块 | 文件 | 状态 |
| --- | --- | --- |
| 产品中心 | `src/app/product/page.tsx` | 已提交基线，当前仍是基线版本，没有接入小米/问界/地板专题 banner。 |
| 传统产品详情 | `src/app/product/electric-steps/page.tsx`、`wheels`、`chassis`、`window-film`、`color-film`、`ppf` | 已提交基线，多数是轻量 wrapper，复用产品详情组件。 |
| 产品数据 | `src/lib/products.ts` | 已提交基线，支撑 6 个传统产品方向。 |

### 3.2 当前混合目录新增成果

| 模块 | 文件 / 资产 | 价值判断 | 处理建议 |
| --- | --- | --- | --- |
| 小米专题 | `src/app/product/xiaomi/page.tsx`、`src/components/xiaomi/*`、`src/lib/xiaomi-products.ts`、`public/images/products/xiaomi/*` | 高价值。已有 SU7 / YU7 产品图、表格、卡片、PRD 和实现计划。 | 保留。需要接入产品中心入口，并验证 PhoneCta 是否要改成企业微信优先。 |
| 问界专题 | `src/app/product/wenjie/page.tsx`、`src/components/wenjie/*`、`src/lib/wenjie-products.ts`、`public/images/products/wenjie/*` | 高价值。已有 M7 / M8 / M9 产品表和图片素材，但图片匹配存在人工复核风险。 | 保留。页面上线前复核图片对应关系，避免错配。 |
| 地板专题 | `src/app/product/flooring/page.tsx`、`src/components/product/Flooring*.tsx`、`src/lib/flooring-products.ts`、`public/images/products/flooring/*` | 高价值，但经历过多轮口径变化：从 PDF 画册页转为产品图 manifest。 | 保留代码和产品图 manifest；PDF 页面素材可暂存但不作为前端主内容。 |
| 产品中心专题入口 | `src/app/product/page.tsx` | 当前未接入专题 banner。之前曾有版本显示 `XiaomiTopicBanner`、`WenjieTopicBanner`、`FlooringTopicBanner`，但当前文件没有。 | 必须补接线：产品中心应有“热门车型与改装专题”区。 |
| PRD/计划 | `docs/PRD/*XIAOMI*`、`*WENJIE*`、`*FLOORING*`、`docs/plans/*` | 高价值，可作为后续 agent 执行规范。 | 保留。需要同步最新业务口径：企业微信优先、招商暂缓。 |

### 3.3 产品页风险

- 小米/问界页面仍使用 `PhoneCta`，而当前业务判断是企业微信二维码优先。
- 地板 PRD 已取消咨询 CTA，但页面实现需要确认是否也无旧 CTA。
- 产品中心未接入专题入口，导致新增专题可能成为“孤岛页面”。
- 地板 manifest 已切换为产品图版，需确认 `src/lib/flooring-products.ts` 是否与最新 manifest 完全一致。

## 4. 后台管理系统

### 4.1 基线已有能力

| 模块 | 文件 | 状态 |
| --- | --- | --- |
| 后台布局 | `src/app/admin/(dashboard)/layout.tsx`、`src/components/admin/Sidebar.tsx` | 已提交基线。 |
| 后台首页 | `src/app/admin/(dashboard)/page.tsx` | 已提交基线。 |
| 登录页 | `src/app/admin/login/page.tsx` | 已提交基线。 |
| 数据分析 | `src/app/admin/(dashboard)/analytics/page.tsx`、`src/app/api/analytics/*` | 已提交基线，且已有测试。 |
| 门店后台管理 CRUD | `src/app/admin/(dashboard)/stores/*`、`src/app/api/stores/*`、`src/components/admin/StoreForm.tsx`、`src/components/admin/RegionSelector.tsx` | 已提交基线，但当前混合目录中已有后续修复和增强。 |
| 文章管理 CRUD | `src/app/admin/(dashboard)/articles/*`、`src/app/api/articles/*` | 已提交基线。 |

### 4.2 当前混合目录新增 / 变化

| 模块 | 文件 | 价值判断 | 处理建议 |
| --- | --- | --- | --- |
| 门店后台管理增强 | `src/app/admin/(dashboard)/stores/page.tsx`、`stores/new/page.tsx`、`stores/[id]/page.tsx`、`src/components/admin/StoreForm.tsx`、`RegionSelector.tsx`、`src/app/api/stores/*`、`src/lib/validations/store.ts` | 高价值。包含门店列表、筛选、状态展示、新增、编辑、软删除、区域选择、电话 `phoneTel` 自动派生和 API CRUD。 | 单独作为“门店后台管理”模块保留，不要只归到图片上传。需要复核测试报告中发现的问题是否已在当前代码修复。 |
| 门店图片上传 | `src/app/admin/(dashboard)/stores/[id]/image/page.tsx`、`src/app/api/upload/route.ts`、`src/components/admin/EntityImageUploader.tsx`、`src/lib/image.ts` | 高价值。解决门店真实图片管理，符合 L4 信任体系。 | 保留但必须修 schema 和跳转问题。 |
| 门店图片迁移 | `prisma/migrations/20260610120000_add_store_image_path/migration.sql` | 高价值但未完整接线。 | `prisma/schema.prisma` 当前未出现 `Store.imagePath`，必须补 schema 并重新生成 Prisma Client。 |
| 占位图 | `public/images/placeholders/store.webp`、`province.webp` | 可保留。 | 与 `getStoreImage` 一起纳入图片策略。 |
| 图片上传测试报告 | `docs/test-reports/IMAGE_UPLOAD_TEST_2026-06-10.md` 与截图 | 高价值。记录了通过项与 BUG。 | 保留，用作修复验收依据。 |
| 后台设置页 | `origin/main` 中的 `/admin/settings`、settings API、settings components | 远端已提交成果。 | 不在当前混合目录中完整体现，应单独从 `origin/main` 评估合并。 |

### 4.3 后台风险

- `imagePath` 代码与迁移存在，但 `prisma/schema.prisma` 仍只有 `imageUrl`，会导致 Prisma 类型或运行时不一致。
- 图片上传测试报告曾记录 BUG：创建门店后应跳 `/admin/stores/{id}/image`，但被 `StoreForm` 内部跳转覆盖。当前混合目录中的 `StoreForm` 已出现“onSubmit 返回新门店 ID 后跳图片页”的修复逻辑，需要重新跑回归确认。
- 门店表单旧 `imageUrl` schema 仍存在，需决定保留兼容还是彻底切到 `imagePath`。
- 后台设置页在远端 `origin/main`，当前本地 `main` behind 5 commits，后续合并需防冲突。

## 5. 门店页与门店后台管理

### 5.1 前台门店页

| 模块 | 文件 | 状态 |
| --- | --- | --- |
| 门店网络首页 | `src/app/agent/page.tsx` | 已提交基线。按省份和门店列表展示。 |
| 省份页 | `src/app/agent/[slug]/page.tsx` | 已提交基线。 |
| 城市页 | `src/app/agent/[slug]/[city]/page.tsx` | 已提交基线。 |
| 门店详情 | `src/app/agent/store/[id]/page.tsx` | 已提交基线。 |
| 数据适配 | `src/lib/data.ts`、`src/lib/store.ts` | 基线 + 当前轻微修改。 |

### 5.2 后台门店管理

| 模块 | 文件 | 当前能力 | 判断 |
| --- | --- | --- | --- |
| 门店列表管理 | `src/app/admin/(dashboard)/stores/page.tsx` | 门店列表、状态 badge、筛选、分页/加载、编辑入口、删除确认。 | 高价值，属于后台核心模块。 |
| 新增门店 | `src/app/admin/(dashboard)/stores/new/page.tsx`、`src/components/admin/StoreForm.tsx` | 表单创建门店，当前代码注释显示创建成功后返回新门店 ID，并跳转图片上传页。 | 高价值，需要结合图片上传流程回归。 |
| 编辑门店 | `src/app/admin/(dashboard)/stores/[id]/page.tsx`、`StoreForm.tsx` | 拉取门店数据并复用表单保存修改。 | 高价值。 |
| 门店软删除 | `src/app/api/stores/[id]/route.ts` | `DELETE` 不是物理删除，而是设置 `isActive=false`。 | 合理，利于误删恢复。 |
| 区域选择 | `src/components/admin/RegionSelector.tsx` | 省份/城市联动选择。 | 高价值，但测试报告曾指出省市必填错误文案为英文，需要复核当前 schema。 |
| 表单校验 | `src/lib/validations/store.ts` | `StoreCreateSchema` / `StoreUpdateSchema`。 | 需要复核：`imageUrl` 仍在 schema 中，`provinceSlug/citySlug` 文案和 slug 格式约束可能仍需优化。 |
| 门店 API | `src/app/api/stores/route.ts`、`src/app/api/stores/[id]/route.ts` | GET/POST/PUT/DELETE，支持公开 active 数据与后台 all 查询。 | 高价值。测试报告曾指出重复 slug 返回 500，需要复核是否已修。 |
| 门店提交测试 | `docs/test-reports/STORE_SUBMIT_TEST_2026-06-10.md` 与截图 | 记录 `/admin/stores/new` 的提交、校验、权限、重复 slug、phoneTel 派生测试。 | 保留，作为门店后台管理回归依据。 |

### 5.3 当前修改

| 文件 | 变化 | 判断 |
| --- | --- | --- |
| `src/lib/data.ts` | `mapApiArticle` 增加 `content: raw.content ?? ""` | 合理，支撑新闻详情完整内容。可保留。 |
| `src/lib/news.ts` | `NewsItem` 增加 `content?: string` | 合理，支撑本地 fallback 新闻内容。可保留。 |

### 5.4 门店模块建议

- 门店后台管理和门店图片上传要作为两个相邻但独立的恢复模块：先确保门店 CRUD 稳，再接图片管理。
- 图片上传模块修好后，前台门店卡片和详情页应优先用 `imagePath`，再 fallback 到占位图。
- 当前招商暂缓，所以 `/agent` 页面继续定位为“门店网络”，不要改成加盟页。

## 6. 新闻页与后台新闻管理

### 6.1 已有能力

| 模块 | 文件 | 状态 |
| --- | --- | --- |
| 新闻列表页 | `src/app/news/page.tsx` | 已提交基线。 |
| 新闻详情页 | `src/app/news/[slug]/page.tsx` | 已提交基线。 |
| 文章 API | `src/app/api/articles/route.ts`、`src/app/api/articles/[id]/route.ts` | 已提交基线。支持列表、创建、详情、更新、删除。 |
| 后台文章列表 | `src/app/admin/(dashboard)/articles/page.tsx` | 已提交基线。 |
| 后台新建/编辑文章 | `src/app/admin/(dashboard)/articles/new/page.tsx`、`[id]/page.tsx` | 已提交基线。 |

### 6.2 当前混合目录新增成果

| 模块 | 文件 | 价值判断 | 处理建议 |
| --- | --- | --- | --- |
| Markdown 内容渲染 | `src/components/ArticleContent.tsx` | 高价值。新闻详情可展示富文本/Markdown。 | 保留。确认 `react-markdown` 依赖存在并构建通过。 |
| 文章编辑器 | `src/components/ArticleEditor.tsx` | 中高价值。可统一新建/编辑文章体验，但当前页面是否已复用需核查。 | 保留并评估是否替换重复表单代码。 |
| 数据类型补充 | `src/lib/data.ts`、`src/lib/news.ts` | 小而关键。 | 保留。 |

### 6.3 新闻模块风险

- 后台新建/编辑文章页面当前仍可能有重复表单逻辑，`ArticleEditor` 未必已接入。
- 新闻详情页是否已经使用 `ArticleContent` 需要复核。
- 若使用 Markdown，需要确认依赖和样式一致性。

## 7. 首页 Hero 与企业微信转化

### 7.1 当前本地状态

当前 `src/components/Hero.tsx` 仍是旧版：

- 文案：`让爱车更有型，也更好用`
- CTA：`浏览产品`、`查看门店`
- 没有企业微信二维码弹窗。

### 7.2 远端已有成果

`origin/main` 新增：

- `src/components/shared/WeChatConsultModal.tsx`
- `src/lib/wechat-modal.ts`
- `public/images/brand/wechat-qr.png`
- `scripts/generate-wechat-qr-placeholder.mjs`
- 修改 `src/components/Hero.tsx`
- 修改 `src/components/Header.tsx`
- 修改 `src/app/layout.tsx`

判断：这是符合当前 L3 “企业微信优先”策略的高价值成果。建议不要手写重做，优先从 `origin/main` 合入或 cherry-pick 后再适配文案。

## 8. 垃圾 / 缓存 / 暂不纳入候选

| 类别 | 路径示例 | 建议 |
| --- | --- | --- |
| Playwright 临时日志 | `.playwright-cli/*`、`test-results/` | 暂不纳入业务提交；有价值截图已经在 `docs/test-reports/`。 |
| 多平台 agent 技能同步 | `.agents/`、`.amazonq/`、`.augment/`、`.continue/`、`.cursor/`、`.gemini/`、`.opencode/`、`.windsurf/`、`.github/skills/` 等 | 先不要提交到业务分支。只保留明确需要的 `CLAUDE.md` / command 规范。 |
| 插件缓存 / worktree | `.claude/plugins/`、`.claude/worktrees/` | 不提交。 |
| 临时截图 | `carousel-desktop.png`、`electric-steps-desktop.png`、`electric-steps-compat.png`、`tc-f9-redirect-issue-list-page.png` | 若不是正式测试报告资产，建议清理或归档到 `docs/test-reports/`。 |
| 异常文件 | `E`、`class="text-xl md:text-2xl font-bold text-white mb-3"` | 高概率误生成，清理候选。 |
| repowiki 自动文档 | `.qoder/repowiki/*` | 当前不进入业务版本。 |

## 9. 推荐恢复顺序

### Phase 1：冻结与安全分支

1. 当前混合目录创建恢复分支：`codex/recover-current-design`。
2. 不执行 `git clean`，不执行 `reset --hard`。
3. 保留干净 worktree 作为对照。

### Phase 2：先救产品页

1. 纳入小米专题文件与素材。
2. 纳入问界专题文件与素材。
3. 纳入地板专题文件与产品图 manifest。
4. 修复产品中心入口，把三个专题 banner 接入 `/product`。
5. 将小米/问界页面 CTA 从电话优先调整为企业微信优先，或至少统一 CTA 策略。

### Phase 3：再救门店图片管理

1. 补 `prisma/schema.prisma` 的 `Store.imagePath` 字段。
2. 检查 `StoreForm` 跳转职责，修复创建后跳转到图片页的竞争。
3. 保留 `/api/upload`、`EntityImageUploader`、`/admin/stores/[id]/image`。
4. 跑图片上传测试报告中的关键回归。

### Phase 4：整理新闻系统

1. 保留 `ArticleContent` 和 `ArticleEditor`。
2. 让新闻详情页明确使用 Markdown 内容渲染。
3. 评估后台文章新建/编辑是否复用 `ArticleEditor`。
4. 保留 `src/lib/data.ts`、`src/lib/news.ts` 的 `content` 字段修改。

### Phase 5：合入远端企业微信与设置页

1. 从 `origin/main` 合入 Hero + WeChat modal。
2. 确认 Header 企业微信入口是否符合当前 C 端策略。
3. 后台设置页是否进入当前版本，由你决定；它不是 C 端转化必须项，但已经在远端提交。

## 10. 当前优先级结论

| 优先级 | 模块 | 原因 |
| --- | --- | --- |
| P0 | 不清理当前混合目录 | 有大量未提交成果，直接清理会丢设计。 |
| P1 | 产品中心专题入口 + 小米/问界/地板专题 | 这是新能源轻改方向的核心展示资产。 |
| P1 | 企业微信 Hero / Modal | 符合当前 L3 转化策略，比表单更适合现阶段。 |
| P1 | 门店图片上传修复 | 对新品牌信任体系很关键，但 schema 未完整落稳。 |
| P2 | 新闻 Markdown / 文章编辑器 | 有助于品牌知识内容建设。 |
| P2 | 后台设置页 | 远端已有，可作为后台体验增强，但不是当前第一优先级。 |
| P3 | agent 插件/缓存/临时日志清理 | 等业务成果救完再做。 |

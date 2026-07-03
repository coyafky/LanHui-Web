# 设计文档：根据新 Canonical PRD 更新 SPEC 文档

## 需求分析

### 现状
22 个 SPEC 文档普遍存在以下问题：
1. **内容过简** — 相比 canonical PRD 缺少数据模型、UI 规范、验收条件、SSR/ISR 配置等关键技术细节
2. **状态标记错误** — contact.md 标 ⬜ 但页面已实现 5 区块；home.md 标 ✅ 但有 5 个 P1 功能待补；admin/stores.md 标 ✅ 但状态机落后于 PRD
3. **PRD 引用已修复**（上一轮完成）但内容未同步
4. **AI 执行记录表已存在**（上一轮完成），保留不动

### 影响范围
- **22 个 SPEC 文件**需要不同程度的更新
- **1 个 INDEX.md** 需要更新状态计数
- 不涉及代码修改、不涉及路由修改、不涉及数据模型变更

### 关键原则
- SPEC 是 PRD 的"行为边界+数据合约"精简版，不复制 PRD 全部内容
- 状态标记必须反映实际代码实现
- 保留已有 AI 执行记录表（§9）

## 架构设计

### 分层策略
按紧急程度分 4 批执行，高优批可并行，低优批串行：

```
批 1（高优·可并行）: contact.md + home.md      ← 状态标记错误
批 2（高优·可并行）: brand.md + admin/stores.md ← 内容严重缺失
批 3（中优·可并行）: news.md + agent-store.md + admin/articles.md
批 4（低优·串行）: 其余 15 个 SPEC 一致性补充
```

每批内子任务无依赖关系，可完全并行。批之间无严格依赖，也可全部并行（每个 worktree 独立操作 SPEC 文件）。

### 修改模式
每个 SPEC 的修改遵循统一模式：
1. 保留现有 §1-§9 结构
2. 丰富各节内容（从对应 canonical PRD 提取关键信息）
3. 修正状态标记（对照实际代码）
4. 确保 PRD 引用正确
5. 不动 AI 执行记录表

## 子任务列表

### Task 1: contact.md — 状态修正 + 内容同步
- **文件**: `docs/SPEC/public-site/contact.md`
- **优先级**: 高（状态 ⬜→🔧 严重错误）
- **PRD**: `docs/PRD/public-site/CONTACT_PRD.md`
- **实际代码**: `src/app/contact/page.tsx`（已验证：5 区块完整实现）
- **修改内容**:
  - 状态从 ⬜ **未开始** → 🔧 **部分完成**
  - 更新路由状态为 ✅
  - 添加 F1-F14 功能清单表（F1-F9 ✅, F10-F14 ⚪）
  - 更新页面结构为实际 5 区块（Hero+联系信息+门店+流程+承诺）
  - 添加数据模型（ContactData inline type from code）
  - 添加已知问题（假 400、null qrCode、缺后台配置）
  - 添加电话降级策略说明
  - 添加验收条件
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 2: home.md — 状态修正 + 内容同步
- **文件**: `docs/SPEC/public-site/home.md`
- **优先级**: 高（状态 ✅→🔧 不准确）
- **PRD**: `docs/PRD/public-site/HOMEPAGE_PRD.md`
- **实际代码**: `src/app/page.tsx`（已验证：5 组件渲染）
- **修改内容**:
  - 状态从 ✅ **完成** → 🔧 **部分完成**
  - 添加 F1-F13 功能清单表（F1-F8 ✅, F9-F13 ⚪）
  - 添加 SSR/ISR 配置（revalidate=3600）
  - 添加 JSON-LD 要求（Organization schema）
  - 更新页面结构表含组件 Client/RSC 标记
  - 添加电话降级策略
  - 添加性能基线（LCP < 2.5s desktop）
  - 添加已知问题（P1-5 LCP 6.5s）
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 3: brand.md — 内容补充
- **文件**: `docs/SPEC/public-site/brand.md`
- **优先级**: 高（内容严重缺失）
- **PRD**: `docs/PRD/public-site/BRAND_PRD.md`
- **实际代码**: `src/lib/brand.ts`, `src/lib/certifications.ts`, `src/lib/history.ts`, `src/components/CertCard.tsx`
- **修改内容**:
  - 添加 F1-F20 功能清单表
  - 添加六项核心能力说明
  - 添加 Logo 资产规范（PRD §6.2）
  - 添加 3 路由区块结构（PRD §4）
  - 更新组件表（TimelineDot/MilestoneCard）
  - 添加 SSR/ISR（force-static）
  - 添加性能基线（P1-2 cert LCP 6.0s）
  - 添加 JSON-LD 要求（BreadcrumbList）
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 4: admin/stores.md — 状态修正 + 状态机同步
- **文件**: `docs/SPEC/admin/stores.md`
- **优先级**: 高（状态机落后于 PRD）
- **PRD**: `docs/PRD/admin/STORE_MANAGEMENT_PRD.md`
- **修改内容**:
  - 状态从 ✅ **完成** → 🔧 **部分完成**
  - 状态从 5 态改为 PRD 4 态机（pending/active/suspended/terminated）
  - 添加状态迁移图
  - 添加错误恢复策略
  - 添加操作日志要求
  - 添加 F17-F28 待补功能
  - 添加已知问题（P0-6 测试数据污染、P1-3 perf）
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 5: news.md — 内容补充
- **文件**: `docs/SPEC/public-site/news.md`
- **优先级**: 中
- **PRD**: `docs/PRD/public-site/NEWS_PRD.md`
- **修改内容**:
  - 添加 5 分类体系表
  - 添加阅读优先排版规范
  - 添加 TOC 自动生成要求
  - 添加 Article JSON-LD 要求
  - 添加 F3-F9 待补功能清单
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 6: agent-store.md — 内容补充
- **文件**: `docs/SPEC/public-site/agent-store.md`
- **优先级**: 中
- **PRD**: `docs/PRD/public-site/AGENT_PUBLIC_PRD.md`
- **修改内容**:
  - 添加门店等级表（PRD §5）
  - 添加三级筛选条规格
  - 添加移动端 Sheet 规格
  - 添加无结果/其他省份入口状态
  - 添加面包屑规范
  - 更新 4 页面区块结构
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 7: admin/articles.md — 内容补充
- **文件**: `docs/SPEC/admin/articles.md`
- **优先级**: 中
- **PRD**: `docs/PRD/admin/ARTICLE_MANAGEMENT_PRD.md`
- **修改内容**:
  - 添加 4 状态机（含 withdrawn）
  - 添加极简发布原则
  - 添加操作日志要求
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 8: 其余 15 个 SPEC — 一致性补充
- **文件**: 剩余 SPEC（product-center.md, product-topics.md, product-film.md, product-accessories.md, admin/login.md, admin/dashboard.md, api/*.md, components/*.md）
- **优先级**: 低
- **修改内容**:
  - 检查并补充缺失的 PRD 对接细节
  - 确保状态标记与实际一致
  - 补充 UI/交互规范、性能基线等
- **验证**: 内容不涉及代码，无需 tsc/build

### Task 9: INDEX.md — 状态计数更新
- **文件**: `docs/SPEC/INDEX.md`
- **优先级**: 低（依赖 Task 1-8 完成后）
- **修改内容**:
  - 更新全局状态总览表计数
  - 更新各模块状态标记
- **验证**: 内容不涉及代码，无需 tsc/build

## 验收标准

- [ ] contact.md 状态从 ⬜ 改为 🔧，内容反映实际 5 区块结构
- [ ] home.md 状态从 ✅ 改为 🔧，添加 F9-F13 待补和 SSR/ISR
- [ ] brand.md 包含六项能力和 Logo 资产规范
- [ ] admin/stores.md 状态从 ✅ 改为 🔧，状态机从 5 态改为 4 态
- [ ] 所有 22 个 SPEC 内容与对应 canonical PRD 对齐
- [ ] INDEX.md 状态计数与模块实际状态一致
- [ ] AI 执行记录表全部保留不动
- [ ] 所有 PRD 引用指向 canonical 文件（已在上一轮修复，确保本次不改动）

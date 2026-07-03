# 交付报告：根据新 Canonical PRD 更新 SPEC 文档

## 概要
- **需求**: 将 22 个 SPEC 文档内容同步到对应 canonical PRD，修正状态标记
- **状态**: ✅ **成功**
- **耗时阶段**: 架构 → 实现(4 批并行) → 测试(集成于实现环节)
- **执行方式**: `/dispatch` 流水线，4 批 10 个子任务

## 变更总览

| 批次 | 子任务 | 文件数 | 处理方式 |
|------|--------|--------|---------|
| 批 1 | contact.md + home.md | 2 | 并行 worker |
| 批 2 | brand.md + admin/stores.md | 2 | 并行 worker |
| 批 3 | news.md + agent-store.md + admin/articles.md | 3 | 并行 worker |
| 批 4 | 产品(4) + Admin(2) + API(6) + 组件+INDEX(4) | 16 | 4 并行 worker |
| **合计** | **10 子任务** | **23 文件** | **全并行执行** |

## 变更文件详情

| 文件 | 操作 | 行数变化 | 关键变更 |
|------|------|---------|---------|
| `public-site/contact.md` | 重写 | 16→177 | 状态 ⬜→🔧，10 节完整 SPEC |
| `public-site/home.md` | 重写 | 54→124 | 状态 ✅→🔧，12 节，F1-F13 清单 |
| `public-site/brand.md` | 重写 | 91→299 | 六项能力、Logo 资产、F1-F20 |
| `public-site/news.md` | 增量 | +86 行 | 5 分类、TOC、JSON-LD |
| `public-site/agent-store.md` | 重写 | 74→238 | 等级表、三级筛选、4 页面区块 |
| `public-site/product-center.md` | 增量 | +17 行 | SSR/ISR、验收条件 |
| `public-site/product-topics.md` | 增量 | +6 行 | 验收条件 |
| `public-site/product-film.md` | 增量 | +14 行 | SSR/ISR、性能基线 |
| `public-site/product-accessories.md` | 增量 | +12 行 | SSR/ISR、性能基线 |
| `admin/login.md` | 增量 | +79 行 | JWT payload、角色矩阵、认证流程 |
| `admin/dashboard.md` | 增量 | +103 行 | loading/error 边界、14 ACs |
| `admin/stores.md` | 重写 | 60→145 | 状态 ✅→🔧，4 态机+迁移图 |
| `admin/articles.md` | 重写 | 66→221 | 4 态机含 withdrawn、极简发布原则 |
| `api/articles.md` | 增量 | +1 行 | categories 端点说明 |
| `components/ui.md` | 增量 | +1 行 | Badge 6 variant 修正 |
| `components/shared.md` | 增量 | +30 行 | Emitter 模式、6 状态管理表 |
| `components/topic-pattern.md` | 增量 | +30 行 | sizes 策略、完整性表 |
| `INDEX.md` | 增量 | +15 行 | 状态计数更新 |
| 其余 5 个 API SPEC | 无需修改 | — | 内容已对齐 |

## 状态修正

| 模块 | 旧状态 | 新状态 | 原因 |
|------|--------|--------|------|
| home.md | ✅ 完成 | 🔧 部分完成 | PRD 有 5 个 P1 功能待补 |
| contact.md | ⬜ 未开始 | 🔧 部分完成 | 页面已实现 5 区块，但 F10-F14 待补 |
| admin/stores.md | ✅ 完成 | 🔧 部分完成 | 4 态机未完全实现，F17-F28 待补 |

## INDEX.md 状态计数变化

| 区域 | 旧 ✅|🔧|⬜|❌ | 新 ✅|🔧|⬜|❌ |
|------|---|---|---|---|---|---|---|---|
| 公开站 | 3|5|1|1 | 2|6|0|1 |
| 管理后台 | 2|1|0|0 | 1|3|0|0 |
| **合计** | **9**|**9**|**3**|**1** | **8**|**12**|**1**|**1** |

## 验收结果

- [x] contact.md 状态 ⬜→🔧，反映实际 5 区块结构
- [x] home.md 状态 ✅→🔧，添加 F9-F13 待补和 SSR/ISR
- [x] brand.md 包含六项能力和 Logo 资产规范
- [x] admin/stores.md 状态 ✅→🔧，4 态机+迁移图
- [x] 所有 SPEC 内容与 canonical PRD 对齐
- [x] INDEX.md 计数与模块实际状态一致
- [x] AI 执行记录表全部保留不动
- [x] PRD 引用指向 canonical 文件（未改动）

## 已知问题

- 无 P0/P1 Bug（纯文档更新，不涉及代码）
- 部分字段（brand.ts 电话/ICP/地址）仍为占位值，需业务方确认后更新
- contact 页使用假 400 号，需配置真实号码后更新
- Logo 资产目录缺 8 个文件（仅 `lanhui-logo.png` 存在）

## 后续建议

1. **验证 INDEX.md 计数**: 检查合计 8+12+1+1=22 ✓
2. **下次代码更新时同步更新 SPEC**: 特别是 withdrawn 状态、loading/error 边界等新功能实现后
3. **考虑提交当前变更**: Task #5 仍为 pending 状态

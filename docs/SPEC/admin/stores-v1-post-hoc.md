# SPEC: Admin 门店管理 Stores

> 对应 PRD：`docs/PRD/admin/STORE_MANAGEMENT_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

门店 CRUD 管理。列表/筛选/搜索/分组/分页，新建/编辑表单，图片上传管理。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin/stores` | page (Client) | 门店列表（TanStack Table） | ✅ |
| `/admin/stores/new` | page (Client) | 新建门店 | ✅ |
| `/admin/stores/[id]` | page (Client) | 编辑门店 | ✅ |
| `/admin/stores/[id]/image` | page (Client) | 门店主图管理 | ✅ |

## 3. 数据模型

### 门店字段 (Zod: `StoreCreateSchema`)

约 15 个字段，含 name, slug, address, phone, province, city, district, lat, lng, status, level, businessHours, description, tags, imagePath。

### 状态枚举 (PRD 4 态机)

| 状态 | 含义 | 公开站可见 | 是否可编辑 |
|------|------|-----------|-----------|
| `pending` 待发布 | 从未上线，资料准备中 | ❌ | 是 |
| `active` 营业中 | 正常合作并对车主展示 | ✅ | 是 |
| `suspended` 暂停合作 | 曾上线，当前暂时隐藏 | ❌ | 是 |
| `terminated` 终止合作 | 永久结束或录入作废 | ❌ | 默认只读 |

> 当前实现（2026-06-20 版）仍使用 `isActive: Boolean` 二元状态，尚未迁移到 4 态枚举。

### 等级枚举

flagship > premium > specialty > member（带颜色编码徽章）。

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| StoreForm | `src/components/admin/StoreForm.tsx` | 是 | 门店表单（react-hook-form+zod） |
| RegionSelector | `src/components/admin/RegionSelector.tsx` | 是 | 省市三级联动 |
| EntityImageUploader | `src/components/admin/EntityImageUploader.tsx` | 是 | 图片拖放/选择/上传 |
| Sidebar | `src/components/admin/Sidebar.tsx` | 是 | 侧边导航 |

## 5. API 依赖

- GET/POST `/api/stores` — 列表/创建
- GET/PUT/DELETE `/api/stores/[id]` — 详情/更新/删除
- POST/DELETE `/api/upload` — 图片上传/删除
- GET `/api/provinces`, `/api/cities` — 地理数据

---

## 6. 状态迁移图

### 6.1 允许转换

```
pending ──publish──> active ──suspend──> suspended
   │                   ▲                    │
   │                   └──── resume ────────┘
   │
   └──terminate──> terminated

suspended ──terminate──> terminated
```

### 6.2 禁止转换

- `active → terminated`：必须先经过 `suspended`，避免误操作
- `terminated → active`：禁止直接恢复。若重新加盟，必须新建门店记录
- 不物理删除有上线历史的门店

## 7. 状态动作规则

| 动作 | 前置状态 | 目标状态 | 前置条件 | 官网影响 |
|------|---------|---------|---------|---------|
| 保存待发布 | `pending` | `pending` | 最低保存字段（名称+省+市+地址+电话） | 无 |
| 发布门店 | `pending` | `active` | 展示必填字段和图片校验通过 | 立即展示 |
| 暂停合作 | `active` | `suspended` | 二次确认并记录原因 | 立即隐藏 |
| 恢复营业 | `suspended` | `active` | 重新核对联系方式和资料 | 恢复展示 |
| 终止合作 | `pending`/`suspended` | `terminated` | 高风险确认并记录原因 | 永久隐藏 |

## 8. 待补功能 F17-F28

| 编号 | 功能 | 说明 | 优先级 |
|------|------|------|--------|
| F17 | 状态机迁移 | 从 `isActive: Boolean` 迁移到 `status` 四态枚举 | P0 |
| F18 | 状态动作 UI | 发布/暂停/恢复/终止按钮 + 二次确认 + 原因记录 | P0 |
| F19 | 操作日志 | 门店状态变更记录，可追溯操作者和原因 | P1 |
| F20 | 批量操作 | 批量发布/暂停/终止门店 | P1 |
| F21 | 数据分析 | 门店统计看板（按省/市/状态分布） | P1 |
| F22 | 门店预览 | 后台查看门店在官网的展示效果 | P2 |
| F23 | 搜索增强 | 按状态+等级+图片完整度组合筛选 | P2 |
| F24 | 数据导出 | 门店列表导出 CSV/Excel | P2 |
| F25 | 图片管理增强 | 多图支持、相册管理 | P2 |
| F26 | 地区数据管理 | 后台省份/城市管理界面 | P3 |
| F27 | 门店通知 | 门店状态变更通知机制 | P3 |
| F28 | 门店历史 | 门店编辑历史版本对比 | P3 |

## 已知问题

| ID | 问题 | 说明 | 影响范围 | 优先级 |
|----|------|------|---------|--------|
| P0-6 | 测试门店数据污染前台 | 22 条测试门店 `isActive=true` 出现在公开 `/agent` 页面，店名为 ASCII 噪声 | 公开站 | P0 |
| P1-3 | 门店列表性能 | `/agent` 页面 27+ 门店卡片加载慢，Lighthouse Performance 64/75 | 公开站 | P1 |

## 验收条件

- [ ] 四种状态的显示和筛选
- [ ] 所有允许和禁止的状态转换
- [ ] 待发布门店不会进入官网
- [ ] 暂停后官网立即隐藏，恢复后重新展示
- [ ] 终止门店无法直接恢复
- [ ] 公开 API 仅返回 active
- [ ] 字段校验、重复门店、slug 冲突和省市不匹配
- [ ] 状态动作失败时不产生虚假状态
- [ ] admin/editor 权限差异
- [ ] 状态变更 ActivityLog
- [ ] 省份/城市级联关系与错误关系拒绝
- [ ] 按省/城市/等级/状态筛选和分组
- [ ] 筛选条件 URL 持久化
- [ ] 11 位联系电话校验
- [ ] 封面图上传/替换/删除及失败时保留旧图
- [ ] 三视口和键盘操作

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 门店 CRUD + 图片上传初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | 门店地区管理 + 状态管理实现 | 完成 | — |
| 2026-06-21 | Claude Code | 等级筛选 + 分组 + Badge 实现 | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 | 完成 | — |

---

## 10. 2026-06-24 增量更新：门店列表页现状补充

> 本节为增量补充，不替换上文历史记录。依据当前 `/admin/stores` 截图与代码实现补充当前列表页、状态机、API 和剩余差距。

### 10.1 Prompt Boost 规格摘要

用户意图：基于后台门店管理截图，更新 `docs/SPEC/admin/stores.md` 与 `docs/PRD/admin/STORE_MANAGEMENT_PRD.md`，使文档反映当前后台列表页真实体验，并为后续实现提供可执行规格。

相关文件：

| 类型 | 路径 | 说明 |
|------|------|------|
| 页面 | `src/app/admin/(dashboard)/stores/page.tsx` | 门店列表页，Client Component，TanStack Table |
| 表单 | `src/components/admin/StoreForm.tsx` | 新建/编辑门店表单 |
| 对话框 | `src/components/admin/ConfirmDialog.tsx` | 状态动作确认框 |
| API | `src/app/api/stores/route.ts` | 门店列表/创建 |
| API | `src/app/api/stores/[id]/route.ts` | 门店详情/更新/暂停兼容接口 |
| API | `src/app/api/stores/[id]/[action]/route.ts` | 状态机动作端点 |
| 校验 | `src/lib/validations/store.ts` | 门店字段、状态、等级 Zod 契约 |
| 状态机 | `src/lib/validations/store-transitions.ts` | 允许状态转换和动作映射 |
| 数据模型 | `prisma/schema.prisma` | Store / Province / City / ActivityLog |

### 10.2 Dispatch 设计摘要

本轮文档更新按 `/dispatch` 的四阶段结构拆解：

| 阶段 | 本轮动作 | 产出 |
|------|----------|------|
| Architect | 对比截图、现有 SPEC、PRD、页面代码、API 和 Prisma schema | 识别文档与实现差异 |
| Implement | 仅追加文档，不删除、不减少原有内容 | 在 SPEC/PRD 末尾补充 2026-06-24 增量章节 |
| Test | 文档级验证 | 确认新增内容引用真实路径和现有实现，不声称未落库的 enum 已实现 |
| Deploy | 不涉及部署 | 无运行时变更 |

### 10.3 当前列表页 UI 契约

截图对应的 `/admin/stores` 页面当前采用暗色后台工作台布局，页面头部展示：

- 标题：`门店管理`
- 数量徽章：显示当前 API 返回的 `pagination.total`，截图中为 `22 家`
- 主操作：右上角 `+ 新建门店`，跳转 `/admin/stores/new`

筛选与控制区分为两层：

| 控件 | 当前实现 | 备注 |
|------|----------|------|
| 搜索框 | 输入门店名称或地址，400ms debounce 后请求 API | 代码当前 placeholder 为“搜索门店名称或地址...”；PRD 目标还包含电话和 slug |
| 状态筛选 | `全部` + `pending/active/suspended/terminated` | 单选 select |
| 排序 | 最近更新、最早更新、最新创建、名称 A→Z、名称 Z→A、等级高→低 | UI 已有选项 |
| 分组 | 不分组、按省份、按城市、按等级 | UI 已有选项 |
| 省份筛选 | 全部省份 + `/api/provinces` 返回省份 | 位于高级筛选区 |
| 等级筛选 | `flagship/premium/specialty/member` chip 多选 | 支持多选 |
| 清除筛选 | 有搜索、省份、等级或状态筛选时显示 | 清空并回到第 1 页 |

表格列契约：

| 列 | 字段 | 展示规则 |
|----|------|----------|
| 门店名称 | `name` | 加粗显示 |
| 省份 | `provinceLabel` | 文本 |
| 城市 | `cityLabel` | 文本 |
| 等级 | `level` | `LevelBadge`，未设置显示 `—` |
| 电话 | `phone` | 文本 |
| 状态 | `status` | `StatusBadge` 四态展示 |
| 操作 | `id/status` | 编辑 + 当前状态允许的状态动作 |

### 10.4 当前状态机实现补充

当前代码已经存在 4 态状态主字段与动作端点，文档上文“仍使用 `isActive: Boolean` 二元状态”的历史说明仅代表旧实现阶段。当前实现应按以下方式理解：

- 应用层主状态：`status`
- 状态取值：`pending`、`active`、`suspended`、`terminated`
- 兼容字段：`isActive`
- 写入策略：状态动作端点双写 `status` 与 `isActive`
- 公开查询默认契约：非 admin 默认只返回 `status = active`
- 后台查询契约：`/api/stores?all=true` 且 admin 权限可返回所有状态

允许动作由 `src/lib/validations/store-transitions.ts` 提供：

| 当前状态 | 可执行动作 | 目标状态 |
|----------|------------|----------|
| `pending` | 发布 | `active` |
| `pending` | 终止 | `terminated` |
| `active` | 暂停 | `suspended` |
| `suspended` | 恢复 | `active` |
| `suspended` | 终止 | `terminated` |
| `terminated` | 无 | 终态，只读 |

动作 API：

```txt
POST /api/stores/[id]/publish
POST /api/stores/[id]/suspend
POST /api/stores/[id]/resume
POST /api/stores/[id]/terminate
```

动作校验：

| 动作 | 服务端校验 |
|------|------------|
| `publish` | 必须为 `pending`，必须设置 `level`、`provinceSlug`、`citySlug` |
| `suspend` | 必须为 `active`，必须填写 `statusReason` |
| `resume` | 必须为 `suspended`，必须有 `phone`、`address`、`businessHours` |
| `terminate` | 必须为 `pending` 或 `suspended`，必须填写 `statusReason` |

### 10.5 数据模型现实状态

当前 `prisma/schema.prisma` 中 `Store.status` 与 `Store.level` 仍为 `String` 字段，不是 Prisma enum。类型安全目前由应用层提供：

- `src/lib/validations/store.ts` 中的 `STORE_STATUSES`、`STORE_LEVELS`
- `StoreCreateSchema` / `StoreUpdateSchema`
- `src/lib/validations/store-transitions.ts` 的 `ALLOWED_TRANSITIONS`
- API route 的服务端校验

当前 Store 相关字段包括：

| 字段 | 当前 Prisma 类型 | 说明 |
|------|------------------|------|
| `status` | `String @default("pending")` | 应用层四态主字段 |
| `isActive` | `Boolean @default(true)` | 兼容旧查询和旧数据 |
| `statusReason` | `String?` | 暂停/终止原因 |
| `statusChangedAt` | `DateTime?` | 最近状态变更时间 |
| `statusChangedBy` | `String?` | 最近状态变更操作者 |
| `level` | `String @default("flagship")` | 应用层等级枚举 |

### 10.6 当前已实现能力清单

| 功能 | 当前状态 | 说明 |
|------|----------|------|
| 门店列表 | ✅ 已实现 | TanStack Table |
| 搜索 | ✅ 已实现 | 当前按名称和地址请求 API |
| 状态筛选 | ✅ 已实现 | 单选四态 |
| 省份筛选 | ✅ 已实现 | 来自 `/api/provinces` |
| 等级多选 | ✅ 已实现 | chip toggle group |
| 排序 UI | ✅ 已实现 | 列表页已有选项 |
| 分组 UI | ✅ 已实现 | 不分组/省份/城市/等级 |
| 状态 Badge | ✅ 已实现 | pending/active/suspended/terminated |
| 等级 Badge | ✅ 已实现 | flagship/premium/specialty/member |
| 状态动作按钮 | ✅ 已实现 | 按当前状态展示可执行动作 |
| 状态动作确认框 | ✅ 已实现 | suspend/terminate 需原因 |
| 状态动作 API | ✅ 已实现 | `/api/stores/[id]/[action]` |
| ActivityLog | ✅ 已实现 | create/update/suspend/action 写日志 |
| 图片上传 | ✅ 已实现 | 本地 WebP q80 |
| 分页 | ✅ 已实现 | API pagination |

### 10.7 当前剩余差距

以下为相对 PRD 目标仍需补齐或核验的项目：

| 差距 | 当前情况 | 后续要求 |
|------|----------|----------|
| URL 查询参数持久化 | 页面用本地 React state 管理筛选 | 筛选、排序、分页、分组应同步到 URL |
| 城市筛选 | API 支持 `city`，列表 UI 当前未提供城市 select | 选中省份后加载城市并启用城市筛选 |
| 图片完整度筛选 | PRD 定义但列表 UI 未实现 | 增加有图/缺图筛选 |
| 按状态分组 | PRD 定义，当前 groupMode 不含 `status` | 增加按合作状态分组 |
| 搜索范围 | PRD 要求名称/地址/电话/slug，API 当前名称/地址 | 扩展 API 搜索字段 |
| 排序服务端落地 | 列表页传 `sort`，当前 API 仍固定 `createdAt desc` | API 需按 sort 参数执行 orderBy |
| 空状态区分 | 当前统一“暂无门店数据” | 区分无数据、筛选无结果、加载失败 |
| 批量操作 | 未实现 | 后续功能 |
| CSV/Excel 导出 | 未实现 | 后续功能 |
| 多图/相册 | 未实现 | 后续功能 |
| Prisma enum | 未实现 | 如需强约束，应单独评估迁移 |

### 10.8 追加验收条件

- [ ] 列表页截图中的搜索、状态、排序、分组、省份、等级控件与文档一致
- [ ] `terminated` 门店在列表中仅显示编辑/已终止，不出现发布/恢复/暂停按钮
- [ ] `suspend` 和 `terminate` 未填写原因时前端阻止提交，服务端也返回 400
- [ ] 非 admin 请求 `/api/stores` 默认只能得到 `status=active` 门店
- [ ] admin 请求 `/api/stores?all=true` 可按 `status` 和 `level` 筛选
- [ ] 状态动作成功后写入 `status`、`isActive`、`statusChangedAt`、`statusChangedBy`
- [ ] 状态动作成功后写入 `ActivityLog`
- [ ] 文档不得删除或压缩既有 PRD/SPEC 内容；后续更新继续采用增量章节

> 增量更新时间：2026-06-24

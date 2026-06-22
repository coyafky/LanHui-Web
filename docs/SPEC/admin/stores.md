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

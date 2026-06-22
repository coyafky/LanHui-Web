# 后台 CMS PRD

> `/admin` 路由组,`force-dynamic`, `auth()` 守卫, 角色驱动权限。

## 2026-06-22 咨询渠道管理规划

- [CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md](./CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md) — 总部管理微信、企业微信、电话、二维码和启停状态。
- [公开站咨询承接 PRD](../public-site/CONSULTATION_CHANNEL_SYSTEM_PRD_2026-06-22.md)
- [路由与 API PRD](../api/CONSULTATION_CHANNEL_ROUTES_PRD_2026-06-22.md)
- [数据库模型 PRD](../database/CONSULTATION_CHANNEL_SCHEMA_PRD_2026-06-22.md)

该模块仍处于规划阶段，未进入编码。

## Canonical PRD（合并后）

2026-06-20 实现版与 2026-06-21 规划版已合并为单份 canonical PRD。旧版本存档于 `archive/`。

| 子 PRD | 文件 | 版本 | 说明 |
|---|---|---|---|
| 门店管理 | [`STORE_MANAGEMENT_PRD.md`](./STORE_MANAGEMENT_PRD.md) | v1（合并版） | 4 状态机 + D1-D9 决策 + 完整实现规格 |
| 文章管理 | [`ARTICLE_MANAGEMENT_PRD.md`](./ARTICLE_MANAGEMENT_PRD.md) | v1（合并版） | 4 状态机（含 withdrawn）+ 极简发布原则 |
| 用户行为分析 | [`ANALYTICS_SYSTEM_PRD.md`](./ANALYTICS_SYSTEM_PRD.md) | v0.1 | 8 语义事件 + 4 级兴趣层级 + 看板设计 |

### Design 文档（存档于 `archive/`）

| Design | 存档路径 |
|---|---|
| 后台总系统 Design（含工作台） | [archive](../../designs/admin/archive/ADMIN_SYSTEM_DESIGN_2026-06-21.md) + [ADMIN_DASHBOARD_DESIGN_2026-06-21.md](../../designs/admin/archive/ADMIN_DASHBOARD_DESIGN_2026-06-21.md) |
| 门店管理 Design | [archive](../../designs/admin/archive/STORE_MANAGEMENT_DESIGN_2026-06-21.md) |
| 文章 CMS Design | [archive](../../designs/admin/archive/ARTICLE_CMS_DESIGN_2026-06-21.md) |
| 用户行为分析 Design | [archive](../../designs/admin/archive/ANALYTICS_SYSTEM_DESIGN_2026-06-21.md) |

## 范围

| 路由 | Canonical PRD | 状态 |
|---|---|---|
| `/admin/login` | [`ADMIN_LOGIN_PRD_2026-06-20.md`](./ADMIN_LOGIN_PRD_2026-06-20.md) | 🟢 v1 |
| `/admin` (Dashboard) | [`ADMIN_DASHBOARD_PRD_2026-06-20.md`](./ADMIN_DASHBOARD_PRD_2026-06-20.md) | 🟢 v1（含 `/admin/analytics`） |
| `/admin/analytics` | [`ANALYTICS_SYSTEM_PRD.md`](./ANALYTICS_SYSTEM_PRD.md) | 🟡 v0.1 规划 |
| `/admin/articles` `/new` `/[id]` | [`ARTICLE_MANAGEMENT_PRD.md`](./ARTICLE_MANAGEMENT_PRD.md) | 🟢 v1 实现 / 🟡 v0.2 目标 |
| `/admin/stores` `/new` `/[id]` `/[id]/image` | [`STORE_MANAGEMENT_PRD.md`](./STORE_MANAGEMENT_PRD.md) | 🟢 v1 实现 / 🟢 v0.3 目标 |

## 完成度

**5 份 Canonical PRD，10 个 admin 路由全覆盖：**
- `/admin/login` (1)
- `/admin` + `/admin/analytics` (2)
- `/admin/articles*` (3)
- `/admin/stores*` (4)

## 子 PRD 模板

[../_templates/admin.md](../_templates/admin.md)

## 权限矩阵

| 操作 | admin | editor | 未登录 |
|---|---|---|---|
| 查看 `/admin` 看板 | ✅ | ✅ | ❌ → 跳转 login |
| 文章列表/编辑/发布 | ✅ | ✅ | ❌ |
| 删除文章 | ✅ | ❌ | ❌ |
| 门店管理 (CRUD) | ✅ | ❌ | ❌ |
| 数据分析 | ✅ | ❌ | ❌ |
| 用户管理 | ✅ | ❌ | ❌ |

详见 [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts) 类型扩展。

## 已知 P0/P1（2026-06-19 审计 + 2026-06-20 升级方案）

| ID | 问题 | Canonical PRD 位置 |
|---|---|---|
| P0-6 | 22 条测试门店污染前台 | [`STORE_MANAGEMENT_PRD.md`](./STORE_MANAGEMENT_PRD.md) §14 |
| P0-7 | `/news/[slug]` 全部 404 | [`ARTICLE_MANAGEMENT_PRD.md`](./ARTICLE_MANAGEMENT_PRD.md) §15 |
| P1-7 | Dashboard 文章分类 Top 5 未过滤草稿 | `ADMIN_DASHBOARD_PRD_2026-06-20.md` §5.3 |
| P1-8 | 本月预约 = 0（埋点未跑通） | `ADMIN_DASHBOARD_PRD_2026-06-20.md` §5.4 |
| P1-12 | 事件类型严重失衡 | `ANALYTICS_SYSTEM_PRD.md` §15 + `ADMIN_DASHBOARD` §5.4 |
| P1-13 | 热门门店 Top 10 空数据 | `ANALYTICS_SYSTEM_PRD.md` §15 + `ADMIN_DASHBOARD` §5.4 |
| P1-9~11 | 测试数据残留 | [`ARTICLE_MANAGEMENT_PRD.md`](./ARTICLE_MANAGEMENT_PRD.md) §15 + [`STORE_MANAGEMENT_PRD.md`](./STORE_MANAGEMENT_PRD.md) §14 |

完整见 [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

## 命名规范

Canonical PRD（无日期后缀，持续更新）：
- `STORE_MANAGEMENT_PRD.md`
- `ARTICLE_MANAGEMENT_PRD.md`
- `ANALYTICS_SYSTEM_PRD.md`

单版本 PRD（无需合并，保留日期）：
- `ADMIN_LOGIN_PRD_2026-06-20.md`
- `ADMIN_DASHBOARD_PRD_2026-06-20.md`
- `CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md`

## 归档（`archive/`）

| 文件 | 说明 |
|---|---|
| `STORE_MANAGEMENT_PRD_2026-06-20.md` | 门店 v1 实现版（已合并到 canonical） |
| `STORE_MANAGEMENT_PRD_2026-06-21.md` | 门店 v0.3 规划版（已合并到 canonical） |
| `ARTICLE_MANAGEMENT_PRD_2026-06-20.md` | 文章 v1 实现版（已合并到 canonical） |
| `ARTICLE_MANAGEMENT_PRD_2026-06-21.md` | 文章 v0.2 规划版（已合并到 canonical） |
| `ANALYTICS_SYSTEM_PRD_2026-06-21.md` | 分析 v0.1 规划版（已重命名为 canonical） |
| `ADMIN_SYSTEM_PRD_2026-06-21.md` | 后台总系统 PRD（设计文档） |
| `ARTICLE_CMS_PRD_2026-06-21.md` | 文章 CMS 规划版 |

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — User / Article / Store / ActivityLog
- [../../../src/app/admin/](../../../src/app/admin/) — 实现位置
- NextAuth 配置: [../../../src/lib/auth.ts](../../../src/lib/auth.ts)
- [../feature/AUTH_GUARD_PRD_2026-06-20.md](../feature/AUTH_GUARD_PRD_2026-06-20.md) — 认证守卫横切规范
- [../feature/IMAGE_UPLOAD_PRD_2026-06-20.md](../feature/IMAGE_UPLOAD_PRD_2026-06-20.md) — 图片上传横切规范

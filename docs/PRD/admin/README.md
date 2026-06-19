# 后台 CMS PRD

> `/admin` 路由组,`force-dynamic`, `auth()` 守卫, 角色驱动权限。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/admin/login` | [ADMIN_LOGIN_PRD_2026-06-20.md](./ADMIN_LOGIN_PRD_2026-06-20.md) | 🟢 v1 (340 行) |
| `/admin` (Dashboard) | [ADMIN_DASHBOARD_PRD_2026-06-20.md](./ADMIN_DASHBOARD_PRD_2026-06-20.md) | 🟢 v1 (369 行,含 `/admin/analytics`) |
| `/admin/analytics` | (合在 ADMIN_DASHBOARD PRD 内) | 🟢 |
| `/admin/articles` `/new` `/[id]` | [ARTICLE_MANAGEMENT_PRD_2026-06-20.md](./ARTICLE_MANAGEMENT_PRD_2026-06-20.md) | 🟢 v1 (453 行,含 P0-7 修复) |
| `/admin/stores` `/new` `/[id]` `/[id]/image` | [STORE_MANAGEMENT_PRD_2026-06-20.md](./STORE_MANAGEMENT_PRD_2026-06-20.md) | 🟢 v1 (531 行,含 P0-6 修复) |

## 完成度

**4/4 子 PRD 已建 (100%)**

10 个 admin 路由全覆盖:
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

详见 [../../src/types/next-auth.d.ts](../../src/types/next-auth.d.ts) 类型扩展。

## 已知 P0/P1 (2026-06-19 审计 + 2026-06-20 升级方案)

| ID | 问题 | 子 PRD 修复章节 |
|---|---|---|
| P0-6 | 22 条测试门店污染前台 | STORE_MANAGEMENT §5.3 完整 SQL 修复 + §6 种子清理 + §7 DoD 校验 |
| P0-7 | `/news/[slug]` 全部 404 | NEWS (public-site) §8 + ARTICLE_MANAGEMENT §5.4 双向修复 |
| P1-7 | Dashboard 文章分类 Top 5 未过滤草稿 | ADMIN_DASHBOARD §5.3 |
| P1-8 | 本月预约 = 0 (埋点未跑通) | ADMIN_DASHBOARD §5.4 |
| P1-12 | 事件类型严重失衡 | ANALYTICS_TRACKING (feature) §5 + ADMIN_DASHBOARD §5.4 |
| P1-13 | 热门门店 Top 10 空数据 | ANALYTICS_TRACKING (feature) §5 + ADMIN_DASHBOARD §5.4 |
| P1-9~11 | 测试数据残留 | ARTICLE_MANAGEMENT §5.5 + STORE_MANAGEMENT §5.3 |

完整见 [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

## 命名规范

`<ADMIN_FEATURE>_PRD_<YYYY-MM-DD>.md` 例:
- `ADMIN_LOGIN_PRD_2026-06-20.md`
- `ARTICLE_MANAGEMENT_PRD_2026-06-20.md`
- `STORE_MANAGEMENT_PRD_2026-06-20.md`

## 归档 (历史 v0)

只读保留:
- [../archive/IMAGE_MANAGEMENT_PRD_2026-06-10.md.archive](../archive/IMAGE_MANAGEMENT_PRD_2026-06-10.md.archive) — v0,内容已吸收到 ARTICLE_MANAGEMENT v1
- [../archive/STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md.archive](../archive/STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md.archive) — v0
- [../archive/STORE_REGION_AND_STATUS_PRD_2026-06-14.md.archive](../archive/STORE_REGION_AND_STATUS_PRD_2026-06-14.md.archive) — v0
- 后两个 v0 内容已合并到 STORE_MANAGEMENT v1

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — User / Article / Store / ActivityLog
- [../../src/app/admin/](../../src/app/admin/) — 实现位置
- NextAuth 配置: [../../src/lib/auth.ts](../../src/lib/auth.ts)
- [../feature/AUTH_GUARD_PRD_2026-06-20.md](../feature/AUTH_GUARD_PRD_2026-06-20.md) — 认证守卫横切规范
- [../feature/IMAGE_UPLOAD_PRD_2026-06-20.md](../feature/IMAGE_UPLOAD_PRD_2026-06-20.md) — 图片上传横切规范

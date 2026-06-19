# 后台 CMS PRD

> `/admin` 路由组,`force-dynamic`, `auth()` 守卫, 角色驱动权限。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/admin/login` | (待建) | ⚪ |
| `/admin` (Dashboard) | (待建) | ⚪ |
| `/admin/analytics` | (待建) | ⚪ |
| `/admin/articles` 系列 | (待建,图片管理内含) | ⚪ + 🟡 v0 [IMAGE_MANAGEMENT_PRD_2026-06-10.md](./IMAGE_MANAGEMENT_PRD_2026-06-10.md) |
| `/admin/stores` 系列 | (待建) | ⚪ + 🟡 v0 [STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md](./STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md) + [STORE_REGION_AND_STATUS_PRD_2026-06-14.md](./STORE_REGION_AND_STATUS_PRD_2026-06-14.md) |

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

## 已知 P0/P1 (2026-06-19 审计)

| ID | 问题 | 来源 |
|---|---|---|
| P0-6 | 22 条测试门店污染前台 (全 `isActive=true`,无 status 字段) | 审计 |
| P0-7 | `/news/[slug]` 全部 404 (`item.content` missing) | commit 0b8f38c |
| P1-7 | Dashboard 文章分类 Top 5 未过滤草稿 | 审计 |
| P1-8 | 本月预约 = 0 (埋点未跑通) | 审计 |
| P1-12 | 事件类型严重失衡 (695 pageview vs ~5 click) | 审计 |
| P1-13 | 热门门店 Top 10 空数据 (无 `store_view` 埋点) | 审计 |
| P1-9~11 | 测试数据残留 (分页测试 #1-3 / Playwright 测试文章 / ASCII 店名噪声) | 审计 |

完整见 [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

## 命名规范

`<ADMIN_FEATURE>_PRD_<YYYY-MM-DD>.md` 例:
- `ADMIN_LOGIN_PRD_2026-06-20.md`
- `ARTICLE_MANAGEMENT_PRD_2026-06-20.md`
- `STORE_MANAGEMENT_PRD_2026-06-20.md` (合并 STORE_REGION 系列)

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — User / Article / Store / ActivityLog
- [../../src/app/admin/](../../src/app/admin/) — 实现位置
- NextAuth 配置: [../../src/lib/auth.ts](../../src/lib/auth.ts)

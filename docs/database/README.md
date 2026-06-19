# 数据库设计文档 — 索引

> 蓝辉轻改 LANHUI 全站数据库(PostgreSQL)设计说明。
>
> 入口文档,详细规格见子文档。

---

## 文档地图

| 文档 | 内容 | 受众 |
|---|---|---|
| [SCHEMA.md](./SCHEMA.md) | 7 张表逐字段规格、类型、约束、索引、关联关系 | 后端 / 全栈 |
| [ER_DIAGRAMS.md](./ER_DIAGRAMS.md) | 4 张 Mermaid ER 图(全局 / 内容 / 区域门店 / 审计) | 全员 |
| [SEED_DATA.md](./SEED_DATA.md) | 种子数据来源、字段、幂等策略、回填流程 | 全栈 / 运维 |
| [../../prisma/schema.prisma](../../prisma/schema.prisma) | Prisma 源文件(单一事实源) | 后端 |

---

## 技术栈

- **DBMS**: PostgreSQL 16
- **ORM**: Prisma 7.8 + `@prisma/adapter-pg` (Driver Adapter)
- **迁移**: `prisma migrate deploy` / `prisma db push` (bootstrap)
- **端口**: `5433` (容器 `lanhui-postgres`,非默认 5432)

---

## 数据模型总览(7 表)

| 表 | 用途 | 写入入口 | 读取入口 |
|---|---|---|---|
| `User` | 管理员/编辑员账号 | `scripts/create-admin.ts` · `/api/auth/*` | `auth()` (NextAuth) |
| `Province` | 中国大陆 27 省份 | `prisma/seed.ts` (region seed) | `/api/provinces` · `/agent` |
| `City` | 75 个主要城市(隶属省份) | `prisma/seed.ts` | `/api/cities` · `/agent/[province]` |
| `Store` | 实体门店(隶属省/市) | `/api/stores` (POST) · `/admin/stores` | `/agent/store/[id]` · `/api/stores` |
| `Article` | 资讯/动态文章 | `/api/articles` (POST/PUT) | `/news` · `/news/[slug]` |
| `AnalyticsEvent` | 客户端埋点事件 | `/api/analytics/track` | `/admin/analytics` · `/api/analytics/stats` |
| `ActivityLog` | 后台管理操作审计 | 各 API write handler | `/api/activity-logs` |

---

## 关键设计决策

1. **静态数据不入库**:品牌 / 产品 / 资讯 / 证书 / 历程等 6 类不常变更的内容,放在 `src/lib/*.ts` 静态文件,SSG 优先,DB 仅存动态内容(门店、发布文章)。
2. **API 优先 + 静态降级**:所有读 API(`/api/stores` 等)失败时回退到 `src/lib/data.ts` 聚合层,保证 `npm run build` 无 DB 也可成功。
3. **不使用 DB session**:NextAuth v5 beta 用 JWT 签名(无 DB session 表),`User.password` 必存 bcrypt 哈希。
4. **活动日志按表分**:`ActivityLog` 通过 `@@map("activity_logs")` 映射到底线表名,符合 Rails 风格。
5. **省份/城市 slug 为主键**:无 cuid,用语义化 slug(`guangdong` / `guangzhou`),URL 友好。
6. **门店状态双字段**:`isActive`(DB 软删)+ `status`(草稿/已发布/下架)双重状态机,详见 admin 子 PRD。

---

## 索引策略(共 18 个)

按查询频次排序,关键复合索引:

- `Article(status, publishedAt)` — `/news` 列表主查询
- `Store(isActive, provinceSlug)` — `/agent/[province]` 过滤
- `AnalyticsEvent(timestamp)` — `/admin/analytics` 时间范围扫描
- `ActivityLog(actorId, createdAt)` — 操作审计按人按时间
- 详见 [SCHEMA.md §索引清单](./SCHEMA.md#索引清单)

---

## 迁移历史

| 迁移 | 说明 |
|---|---|
| `20260609073136_init` | 初始 7 张表 |
| `20260609100000_add_store_slug` | Store 加 slug 列 |
| `20260609120000_migrate_store_ids` | Store id 格式迁移 |
| `20260610120000_add_store_image_path` | Store 加 imagePath 本地存储路径 |
| `20260614042615_add_activity_log_and_indexes` | 加 ActivityLog + 性能索引 |
| `20260614134645_add_region_code_type` | 省份/城市加 code + type 行政编码 |

> ⚠️ DB 实际由 `prisma db push` bootstrap,`_prisma_migrations` 表为手动创建。详见 [../../CLAUDE.md](../../CLAUDE.md) "环境陷阱"。

---

## 数据生命周期

| 阶段 | 触发 | 工具 |
|---|---|---|
| 创建 | `npx tsx prisma/seed.ts` (本地) / 部署时 `prisma db seed` | seed.ts |
| 备份 | `docker exec lanhui-postgres pg_dump -U lanhui -d lanhui > backup.sql` | pg_dump |
| 重置 | `npx prisma migrate reset --force` ⚠️ 删全部数据 | prisma CLI |
| 迁移 | `npx prisma migrate deploy` (生产) | prisma CLI |

---

## 相关 /build 任务

- **B1**: 修复 `/news/[slug]` `item.content` 缺失(详见 `docs/PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md`)
- **B2**: 加 `Store.status` 草稿/已发布/下架三态字段(如尚未加)
- **B3**: `ActivityLog` 写操作埋点覆盖率(目前 7 个 API 写,日志只覆盖 2 个)

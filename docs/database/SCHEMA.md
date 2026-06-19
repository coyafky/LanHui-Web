# 数据库表结构 — 详细规格

> Prisma 7.8 + PostgreSQL 16。源文件: `prisma/schema.prisma`
>
> 本文档按 7 张表逐字段说明,包含类型、约束、默认值、索引、级联策略。

---

## 1. User — 管理员/编辑员

**用途**: NextAuth v5 Credentials 登录账号,角色驱动权限矩阵。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `String` (cuid) | ✅ | auto | 主键 |
| `email` | `String` | ✅ | — | **唯一**,登录账号 |
| `username` | `String` | ✅ | — | **唯一**,显示名 |
| `password` | `String` | ✅ | — | **bcrypt 哈希**(rounds=10),非明文 |
| `name` | `String?` | — | null | 真实姓名,可选 |
| `role` | `String` | ✅ | `"editor"` | `"admin"` / `"editor"` (枚举) |
| `status` | `String` | ✅ | `"active"` | `"active"` / `"suspended"` |
| `createdAt` | `DateTime` | ✅ | now() | — |
| `updatedAt` | `DateTime` | ✅ | auto | 自动更新 |

**索引**: `@@index([role, status])`

**关联**:
- `articles Article[]` — 1:N,作者关系
- `activities ActivityLog[]` — 1:N,操作日志

**约束**:
- `email` 与 `username` 唯一索引
- 删除用户受 `Article.author` / `ActivityLog.actor` Restrict 保护(防止孤儿内容)

**种子数据**: `prisma/seed.ts:62-75` — 默认 `admin@lanhui.com` / `admin` / `admin123` (开发用,生产必须改)

---

## 2. Province — 省份

**用途**: 中国大陆 27 省级行政区,前台 `/agent` 入口筛选项。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `slug` | `String` | ✅ | — | **主键**(语义化,如 `guangdong`) |
| `code` | `String?` | — | null | GB/T 2260 行政编码(如 `440000`),seed 回填 |
| `type` | `String?` | — | null | `"province"` / `"municipality"` / `"autonomous"` / `"special"` |
| `label` | `String` | ✅ | — | 中文名(如 `广东省`) |
| `description` | `String?` | — | null | SEO 描述 |
| `imageUrl` | `String?` | — | null | 头图(可选) |
| `order` | `Int` | ✅ | 0 | 列表排序(数值小靠前) |
| `isActive` | `Boolean` | ✅ | true | 启用/禁用 |
| `createdAt` | `DateTime` | ✅ | now() | — |
| `updatedAt` | `DateTime` | ✅ | auto | — |

**索引**:
- `@@index([isActive])` — 列表过滤
- `@@index([isActive, order])` — 排序 + 过滤组合

**关联**:
- `cities City[]` — 1:N
- `stores Store[]` — 1:N(冗余外键,详见 §4)

**种子数据**: `src/lib/regions/mainland-regions.ts` 的 `MAINLAND_PROVINCES` — 27 条

---

## 3. City — 城市

**用途**: 隶属省份的 75 个主要城市,前台 `/agent/[province]` 入口。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `slug` | `String` | ✅ | — | **主键**(语义化,如 `guangzhou`) |
| `code` | `String?` | — | null | GB/T 2260 编码(如 `440100`) |
| `type` | `String?` | — | null | `"city"` / `"prefecture"` / `"league"` / `"district"` |
| `provinceSlug` | `String` | ✅ | — | **外键** → `Province.slug` |
| `label` | `String` | ✅ | — | 中文名(如 `广州市`) |
| `description` | `String?` | — | null | — |
| `imageUrl` | `String?` | — | null | — |
| `order` | `Int` | ✅ | 0 | — |
| `isActive` | `Boolean` | ✅ | true | — |
| `createdAt` | `DateTime` | ✅ | now() | — |
| `updatedAt` | `DateTime` | ✅ | auto | — |

**索引**:
- `@@index([provinceSlug])` — 按省查询
- `@@index([isActive])` — 过滤

**关联**:
- `province Province` — N:1,`onDelete: Cascade`(省删除则市级联删)
- `stores Store[]` — 1:N

**种子数据**: `MAINLAND_CITIES` — 75 条,覆盖 27 省/直辖市/自治区

---

## 4. Store — 实体门店

**用途**: 业务核心表,前台 `/agent/store/[id]` 详情页 + 公开 /agent 列表。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `String` (cuid) | ✅ | auto | 主键 |
| `name` | `String` | ✅ | — | 店名(如 `顺德大良店`) |
| `slug` | `String` | ✅ | — | **唯一** URL slug |
| `provinceSlug` | `String` | ✅ | — | **外键** → `Province.slug` |
| `provinceLabel` | `String` | ✅ | — | 冗余存储省名(避免 join) |
| `citySlug` | `String` | ✅ | — | **外键** → `City.slug` |
| `cityLabel` | `String` | ✅ | — | 冗余存储市名 |
| `district` | `String?` | — | null | 区/县(如 `大良`) |
| `address` | `String` | ✅ | — | 详细地址 |
| `phone` | `String` | ✅ | — | 主联系电话 |
| `phoneTel` | `String` | ✅ | — | tel: 链接用(纯数字,无短横线) |
| `businessHours` | `String?` | — | null | 营业时间(如 `09:00-18:00`) |
| `description` | `String?` | — | null | 门店描述 |
| `imageUrl` | `String?` | — | null | 主图 OSS / 本地路径 |
| `imagePath` | `String?` | — | null | 本地存储相对路径(`/images/stores/<id>.webp`) |
| `isActive` | `Boolean` | ✅ | true | 启用/禁用 |
| `createdAt` | `DateTime` | ✅ | now() | — |
| `updatedAt` | `DateTime` | ✅ | auto | — |

**索引**:
- `@@index([provinceSlug])` — 按省筛选
- `@@index([citySlug])` — 按市筛选
- `@@index([isActive])` — 全局过滤草稿
- `@@index([slug])` — 详情页查询
- `@@index([isActive, provinceSlug])` — `/agent/[province]` 主查询

**关联**:
- `province Province` — N:1,`onDelete: Restrict`(防误删)
- `city City` — N:1,`onDelete: Restrict`
- `events AnalyticsEvent[]` — 1:N,门店埋点

**约束**:
- `slug` 唯一 — 防止 URL 冲突
- 删除门店不级联(需先下架) — Restrict

**冗余设计**: `provinceLabel` / `cityLabel` 存冗余字符串,免去 join,提升列表查询性能。代价是省/市改名需同步更新门店。

**状态机(双字段)**:
- `isActive` (boolean) — 软删开关
- `status` (String,计划中) — `"draft"` / `"published"` / `"offline"`,详见 admin 子 PRD
- 当前 22 条记录全为 `isActive=true` 但 `status` 字段尚未启用(B2 任务)

---

## 5. Article — 资讯/动态

**用途**: 品牌/门店/产品动态文章,前台 `/news` 列表 + `/news/[slug]` 详情。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `String` (cuid) | ✅ | auto | 主键 |
| `title` | `String` | ✅ | — | 文章标题 |
| `slug` | `String` | ✅ | — | **唯一** URL slug |
| `excerpt` | `String?` | — | null | 摘要(列表卡片用) |
| `content` | `String` | ✅ | — | **Markdown 正文**(详情页渲染) |
| `featuredImage` | `String?` | — | null | 头图 URL |
| `authorId` | `String` | ✅ | — | **外键** → `User.id` |
| `status` | `String` | ✅ | `"draft"` | `"draft"` / `"published"` / `"archived"` |
| `category` | `String?` | — | null | `"产品知识"` / `"产品动态"` / `"品牌动态"` / `"门店动态"` |
| `tags` | `String[]` | ✅ | `[]` | PostgreSQL text[] 数组 |
| `viewCount` | `Int` | ✅ | 0 | 浏览数(`/news/[slug]` GET 时 +1) |
| `isSticky` | `Boolean` | ✅ | false | 置顶 |
| `publishedAt` | `DateTime?` | — | null | 发布时间(可空,草稿时无) |
| `createdAt` | `DateTime` | ✅ | now() | — |
| `updatedAt` | `DateTime` | ✅ | auto | — |

**索引**:
- `@@index([status])` — 后台按状态过滤
- `@@index([slug])` — 详情页查询
- `@@index([category])` — 分类聚合
- `@@index([publishedAt])` — 按时间排序
- `@@index([status, publishedAt])` — `/news` 列表主查询(已发布 + 按时间倒序)

**关联**:
- `author User` — N:1,`onDelete: Restrict`(作者账号不能直接删,需先归档文章)

**约束**:
- `slug` 唯一
- `content` 必填 — **修复 BUG**: 当前 `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 但历史 commit 0b8f38c 曾误删此字段定义,见 audit PRD

**当前数据**: 8 条已发布 + 1 条草稿(含 3 条分页测试残留 + 1 条 Playwright 测试残留,B12 任务)

---

## 6. AnalyticsEvent — 客户端埋点

**用途**: 收集页面浏览、点击、预约等客户端事件,支撑 `/admin/analytics` 看板。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `String` (cuid) | ✅ | auto | 主键 |
| `type` | `String` | ✅ | — | `"pageview"` / `"click"` / `"store_view"` / `"booking"` 等 |
| `pathname` | `String` | ✅ | — | 事件发生路径(如 `/product/zeekr`) |
| `storeId` | `String?` | — | null | **外键** → `Store.id`(可选,门店相关事件用) |
| `metadata` | `Json?` | — | null | 扩展字段(标签、坐标等) |
| `userAgent` | `String?` | — | null | 浏览器 UA |
| `ip` | `String?` | — | null | 客户端 IP(限流用) |
| `timestamp` | `DateTime` | ✅ | now() | 事件时间 |

**索引**:
- `@@index([type])` — 按事件类型聚合
- `@@index([storeId])` — 门店热度
- `@@index([pathname])` — 页面热度
- `@@index([timestamp])` — 时间范围扫描

**关联**:
- `store Store?` — N:1,`onDelete: SetNull`(门店删除不影响历史事件)

**写入限制**: `/api/analytics/track` 限流 60/min/IP,`type` 字段白名单

**当前数据**:
- 总事件 ~695(主要是 pageview)
- **P1-12**: `click` 事件近零(~5 条),需 Button/Link 自动埋点
- **P1-13**: `store_view` 事件为 0,`/agent/store/[id]` 页面缺埋点

---

## 7. ActivityLog — 后台操作审计

**用途**: 记录 admin/editor 的所有写操作,支撑合规审计。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `String` (cuid) | ✅ | auto | 主键 |
| `actorId` | `String?` | — | null | **外键** → `User.id`(可选,匿名操作) |
| `action` | `String` | ✅ | — | `"create"` / `"update"` / `"delete"` / `"publish"` 等 |
| `entity` | `String` | ✅ | — | `"article"` / `"store"` / `"user"` 等 |
| `entityId` | `String` | ✅ | — | 实体 ID |
| `metadata` | `Json?` | — | null | 变更详情(diff / IP) |
| `createdAt` | `DateTime` | ✅ | now() | — |

**索引**:
- `@@index([actorId, createdAt])` — 按人按时间
- `@@index([createdAt])` — 全局时间扫描

**关联**:
- `actor User?` — N:1,`onDelete: SetNull`(用户删除保留历史)

**表名映射**: `@@map("activity_logs")` — 数据库表名 `activity_logs`(Rails 复数风格)

**当前覆盖**: 仅 2/7 个写 API 调用 `prisma.activityLog.create`(B3 任务待补)

---

## 索引清单(共 18 个)

| 表 | 索引字段 | 用途 |
|---|---|---|
| User | `role, status` | admin 列表按角色+状态过滤 |
| Province | `isActive` | 全局启用过滤 |
| Province | `isActive, order` | 公开 /agent 列表主查询 |
| City | `provinceSlug` | 按省查市 |
| City | `isActive` | 过滤 |
| Store | `provinceSlug` | 按省 |
| Store | `citySlug` | 按市 |
| Store | `isActive` | 全局 |
| Store | `slug` | 详情 |
| Store | `isActive, provinceSlug` | **公开 `/agent/[province]` 主查询** |
| Article | `status` | 后台过滤 |
| Article | `slug` | 详情 |
| Article | `category` | 分类聚合 |
| Article | `publishedAt` | 时间排序 |
| Article | `status, publishedAt` | **公开 `/news` 列表主查询** |
| AnalyticsEvent | `type` | 类型聚合 |
| AnalyticsEvent | `storeId` | 门店热度 |
| AnalyticsEvent | `pathname` | 页面热度 |
| AnalyticsEvent | `timestamp` | 时间范围 |
| ActivityLog | `actorId, createdAt` | 审计按人按时间 |
| ActivityLog | `createdAt` | 全局时间 |

---

## 级联策略总览

| 关系 | 策略 | 原因 |
|---|---|---|
| City → Province | **Cascade** | 省删则市必删 |
| Store → Province | **Restrict** | 防误删,有门店则不删省 |
| Store → City | **Restrict** | 同上 |
| Article → User (author) | **Restrict** | 作者账号不能直删 |
| AnalyticsEvent → Store | **SetNull** | 门店下架保留历史事件 |
| ActivityLog → User (actor) | **SetNull** | 删账号保留审计 |

---

## 已知问题

| ID | 问题 | 来源 |
|---|---|---|
| B1 | `Article.content` 字段引用报错 | `src/app/news/[slug]/page.tsx:94` |
| B2 | `Store.status` 字段缺失(草稿/已发布/下架) | admin audit |
| B3 | `ActivityLog` 写覆盖仅 2/7 | admin audit |
| — | `prisma migrate deploy` 报 P3005 | DB 由 `db push` bootstrap,`_prisma_migrations` 表手动建 |
| — | 22 条 `Store` 全为 `isActive=true` 但无 `status` 字段 → 测试数据污染前台 | P0-6 |

---

## 相关文档

- [ER 图](./ER_DIAGRAMS.md)
- [种子数据](./SEED_DATA.md)
- [架构文档](../../docs/ARCHITECTURE.md)
- [审计 PRD](../../docs/PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

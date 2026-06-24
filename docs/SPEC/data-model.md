# SPEC: 全局数据模型参考

> 全项目数据模型的单一起源参考。涵盖 Prisma Schema、静态数据类型、API 响应类型。
> 实现状态：🔧 **部分完成**（持续更新中）

---

## 1. 职责范围

维护全项目数据模型的一致性参考。所有 SPEC 模块的数据模型章节应引用此处定义，而非重新定义。

## 2. 数据库模型（Prisma Schema）

源文件：`prisma/schema.prisma`

### 2.1 User

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | String | @id @default(cuid()) | 主键 |
| `email` | String | @unique | 登录邮箱 |
| `username` | String | @unique | 登录用户名 |
| `password` | String | — | bcrypt 哈希 |
| `name` | String? | — | 显示名称 |
| `role` | String | @default("editor") | `admin` / `editor` |
| `status` | String | @default("active") | `active` / `disabled` |
| `articles` | Article[] | 关系 | 作者的文章 |
| `activities` | ActivityLog[] | 关系 | 操作日志 |

索引：`[role, status]`

### 2.2 Province

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `slug` | String | @id | 拼音标识（如 `guangdong`） |
| `code` | String? | @unique | 行政区划代码 |
| `type` | String? | — | 分类标记 |
| `label` | String | — | 中文名称 |
| `description` | String? | — | 描述 |
| `imageUrl` | String? | — | 配图 |
| `order` | Int | @default(0) | 排序权重 |
| `isActive` | Boolean | @default(true) | 是否启用 |

索引：`[isActive]`, `[isActive, order]`

### 2.3 City

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `slug` | String | @id | 拼音标识 |
| `code` | String? | @unique | 行政区划代码 |
| `type` | String? | — | 分类标记 |
| `provinceSlug` | String | 外键 → Province.slug | 所属省 |
| `label` | String | — | 中文名称 |
| `order` | Int | @default(0) | 排序权重 |
| `isActive` | Boolean | @default(true) | 是否启用 |

索引：`[provinceSlug]`, `[isActive]`

### 2.4 Store

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | String | @id @default(cuid()) | 主键 |
| `name` | String | — | 门店名称 |
| `slug` | String? | @unique | URL 标识 |
| `level` | StoreLevel | @default(flagship) | 门店等级 |
| `provinceSlug` | String | 外键 → Province.slug | 省份 |
| `citySlug` | String | 外键 → City.slug | 城市 |
| `address` | String | — | 详细地址 |
| `phone` | String | — | 显示电话 |
| `phoneTel` | String | — | tel: 链接电话 |
| `businessHours` | String? | — | 营业时间 |
| `imageUrl` | String? | — | 图片 URL |
| `imagePath` | String? | — | 本地存储路径 |
| `status` | String | @default("pending") | 见状态机 |
| `isActive` | Boolean | @default(true) | 软删除标志 |

StoreLevel 枚举：`flagship` / `premium` / `specialty` / `member`

索引：`[isActive]`, `[status]`, `[slug]`, `[level]`, `[level, status]`, `[provinceSlug]`, `[citySlug]`, `[isActive, provinceSlug]`, `[status, provinceSlug]`

### 2.5 Article

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | String | @id @default(cuid()) | 主键 |
| `title` | String | — | 文章标题 |
| `slug` | String | @unique | URL 标识 |
| `excerpt` | String? | — | 摘要 |
| `content` | String | — | Markdown 正文 |
| `featuredImage` | String? | — | 特色图 |
| `authorId` | String | 外键 → User.id | 作者 |
| `status` | String | @default("draft") | 见状态机 |
| `category` | String? | — | 分类 |
| `tags` | String[] | @default([]) | 标签数组 |
| `viewCount` | Int | @default(0) | 阅读计数 |
| `isSticky` | Boolean | @default(false) | 置顶 |
| `publishedAt` | DateTime? | — | 发布时间 |

索引：`[status]`, `[slug]`, `[category]`, `[publishedAt]`, `[status, publishedAt]`

### 2.6 AnalyticsEvent

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | String | @id @default(cuid()) | 主键 |
| `type` | String | — | 事件类型 |
| `pathname` | String | — | 页面路径 |
| `storeId` | String? | 外键 → Store.id | 关联门店 |
| `metadata` | Json? | — | 扩展数据 |
| `userAgent` | String? | — | UA 头 |
| `ip` | String? | — | 客户端 IP |
| `timestamp` | DateTime | @default(now()) | 事件时间 |

索引：`[type]`, `[storeId]`, `[pathname]`, `[timestamp]`

### 2.7 ActivityLog

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | String | @id @default(cuid()) | 主键 |
| `actorId` | String? | 外键 → User.id | 操作者 |
| `action` | String | — | 操作类型 |
| `entity` | String | — | 实体类型 |
| `entityId` | String | — | 实体 ID |
| `metadata` | Json? | — | 扩展数据 |
| `createdAt` | DateTime | @default(now()) | 操作时间 |

索引：`[actorId, createdAt]`, `[createdAt]`

## 3. 静态数据类型

### 3.1 Brand（`src/lib/brand.ts`）

```typescript
type Brand = {
  zh: string;           // "蓝辉轻改"
  en: string;           // "LANHUI"
  slogan: string;       // 品牌口号
  phone: string;        // 咨询电话
  phoneTel: string;     // tel: 链接
  icp: string;          // 备案号
  wechatQrCode: string | null; // 微信二维码路径
  address: string;      // 门店地址
  // ... 更多字段见源文件
};
```

### 3.2 Product（`src/lib/products.ts`）

```typescript
type ProductGroup = "light-mod" | "film";

type ProductSeries = {
  slug: string;
  name: string;
  description: string;
  href: string;
  image: string;
  features: string[];
};

type Product = {
  id: string;
  name: string;
  slug: string;
  group: ProductGroup;
  series?: ProductSeries[];
  // ... 更多字段见源文件
};
```

### 3.3 Store（`src/lib/store.ts`）

```typescript
type Store = {
  id: string;
  name: string;
  slug: string;
  level: "flagship" | "premium" | "specialty" | "member";
  province: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  phoneTel: string;
  businessHours: string;
  description: string;
  imageUrl: string | null;
  status: string;
  // ... 更多字段见源文件
};
```

### 3.4 NewsItem（`src/lib/news.ts`）

```typescript
type NewsItem = {
  id: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  imageUrl?: string;
  category?: string;
  // 注意：无 `content` 字段，但 `/news/[slug]` 尝试引用 `item.content`（pre-existing bug P0-7）
};
```

### 3.5 Certification & Milestone（`src/lib/certifications.ts` / `src/lib/history.ts`）

```typescript
type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
};

type Milestone = {
  year: string;
  title: string;
  description: string;
};
```

### 3.6 WindowFilm（`src/lib/window-film-details.ts`）

```typescript
type WindowFilmPackageDetails = {
  specs: { label: string; value: string }[];
  suitableFor: string[];
  highlights: string[];
  // ... 更多字段见源文件
};

type WindowFilmPackageFull = ProductPackage & WindowFilmPackageDetails;
```

## 4. API 响应类型

### 4.1 统一响应格式

```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
};
```

### 4.2 分页类型

```typescript
type ArticlesPagination = {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
};
```

## 5. 状态机

### 5.1 Store 状态

```
pending ──→ active ──→ suspended ──→ terminated
  ↑            │
  └────────────┘
```

| 状态 | 含义 | 公开站显示 |
|------|------|-----------|
| `pending` | 待审核，新建后默认 | ❌ 不显示 |
| `active` | 营业中 | ✅ 显示 |
| `suspended` | 暂停合作 | ❌ 不显示 |
| `terminated` | 终止合作（软删除） | ❌ 不显示 |

### 5.2 Article 状态

```
draft ──→ published ──→ withdrawn ──→ archived
  ↑                        │
  └────────────────────────┘
```

| 状态 | 含义 | 公开站显示 |
|------|------|-----------|
| `draft` | 草稿，新建后默认 | ❌ 不显示 |
| `published` | 已发布 | ✅ 显示 |
| `withdrawn` | 下架，保留编辑入口 | ❌ 不显示 |
| `archived` | 归档，只读 | ❌ 不显示 |

## 6. 类型关系图

```
User ──┬── Article (author)
       └── ActivityLog (actor)

Province ──┬── City
           └── Store (province)

City ── Store (city)

Store ── AnalyticsEvent (store)

AnalyticsEvent ── (独立采集，storeId 可选外键)

ActivityLog ── (独立记录，actorId 可选外键)
```

## 7. 枚举与常量

### 7.1 StoreLevel

```typescript
enum StoreLevel {
  flagship = "旗舰店"
  premium  = "精品店"
  specialty = "专营店"
  member   = "合作店"
}
```

### 7.2 Analytics Event Types

| type | 来源 | 说明 |
|------|------|------|
| `pageview` | 自动 | 路由变化时触发 |
| `click` | 手动 | 通用点击埋点 |
| `form_submit` | 手动 | 表单提交 |
| `store_view` | 手动 | 门店详情查看 |
| `reservation` | 手动 | 预约 |

### 7.3 用户角色

```typescript
type UserRole = "admin" | "editor";
```

## 8. 关联 SPEC

| SPEC | 数据模型依赖 |
|------|-------------|
| `admin/stores.md` | Store, Province, City, StoreLevel |
| `admin/articles.md` | Article, User, ActivityLog |
| `admin/login.md` | User, UserRole |
| `api/analytics.md` | AnalyticsEvent |
| `public-site/agent-store.md` | Store, Province, City |
| `public-site/news.md` | NewsItem, Article |
| `public-site/product-*.md` | Product, WindowFilmPackageFull |
| `public-site/brand.md` | Brand, Certification, Milestone |

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-22 | Claude Code | 创建全局数据模型参考，涵盖 7 个数据库表、6 个静态数据类型、API 响应格式、状态机 | 完成 | 跟踪 Prisma schema 变更保持同步 |

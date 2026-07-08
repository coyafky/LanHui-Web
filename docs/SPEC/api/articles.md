# SPEC: API /api/articles

> 功能规格说明书 — 文章 API 的完整行为合约。
> 对应 PRD：`docs/PRD/public-site/NEWS_PRD.md`、`docs/PRD/admin/README.md`
> 实现状态：`✅ 已完成`

---

## 1. 职责范围

管理文章的 CRUD、状态流转、批量操作。公开 GET 只返回 published 文章；写操作需要 admin/editor（DELETE 需 admin）。自动 revalidate ISR 缓存路径。不负责文章图片上传（由 `/api/upload` 负责）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|------|
| `prisma-data-ops` | 是 | Prisma 查询、slug 唯一性、状态流转 |
| faker/MSW | 是 | 文章 CRUD route 测试 |

## 2. 路由 / 入口

| 路径 | 类型 | 方法 | 鉴权 | 说明 |
|------|------|------|------|------|
| `/api/articles` | API | GET | 公开（admin/editor 可看全部状态） | 文章列表，分页+筛选 |
| `/api/articles` | API | POST | admin/editor | 创建文章 |
| `/api/articles/[id]` | API | GET | 公开（非 published 需鉴权） | 文章详情（id 或 slug），自增浏览计数 |
| `/api/articles/[id]` | API | PUT | admin/editor | 更新文章，非法状态跳转拦截 |
| `/api/articles/[id]` | API | DELETE | admin only | 真删除（物理删除） |
| `/api/articles/bulk` | API | POST | admin only | 批量操作（发布/撤回/归档/删除/置顶等） |
| `/api/articles/[id]/[action]` | API | POST | admin/editor | 单篇快捷动作（publish/withdraw/archive 等） |

## 3. 数据模型

### 3.1 Zod 校验（AI 可直接复制）

```typescript
import { z } from "zod";

const ARTICLE_STATUSES = ["draft", "published", "withdrawn", "archived"] as const;
type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

const LOCAL_ARTICLE_IMAGE_REGEX = /^\/images\/articles\/[a-zA-Z0-9_-]+\.webp$/;

export const ArticleCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空"),
  slug: z.string().trim().min(1).optional(),   // 不提供则自动生成（title + timestamp base36）
  excerpt: z.string().trim().max(300, "摘要不能超过 300 字").optional().nullable(),
  content: z.string().trim().min(1, "内容不能为空"),
  featuredImage: z.string().regex(LOCAL_ARTICLE_IMAGE_REGEX, "封面图路径无效").optional().nullable(),
  category: z.string().trim().min(1, "请选择分类").optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(ARTICLE_STATUSES).default("draft"),
  isSticky: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const ArticleUpdateSchema = ArticleCreateSchema.partial();
```

### 3.2 状态机

```
draft     ──→ published (发布)
draft     ──→ archived  (归档)
published ──→ withdrawn (撤回)
withdrawn ──→ published (重新发布)
withdrawn ──→ archived  (归档)
archived  ──→ draft     (恢复)
```

**非法跳转检测：**
| 从 | 到 | 拦截消息 |
|----|-----|---------|
| published | draft | "已发布文章需先撤回" |
| archived | published | "归档文章需先恢复为草稿" |
| published | archived | "已发布文章需先撤回再归档" |

### 3.3 发布前必填校验（`validateArticlePublishFields`）

当 status 变为 `published` 时：
- `title` 必须非空
- `slug` 必须非空
- `content` 必须非空
- `category` 必须非空

### 3.4 数据库表

| 表名 | 关键字段 | 类型 | 说明 |
|------|---------|------|------|
| `Article` | `id`, `slug`, `title`, `excerpt`, `content`, `featuredImage`, `category`, `tags`, `status`, `isSticky`, `publishedAt`, `viewCount`, `authorId` | Prisma model | 文章主表 |
| `User` | `id`, `name`, `role` | Prisma model | 作者关联 |

## 4. API 合约

### 4.1 `GET /api/articles`

**Query：** `status`, `category`, `page`(1), `limit`(20, max 100), `search`

**公开 → 仅 published；admin/editor → 所有或按 status 过滤。**

**成功 (200)：**
```json
{
  "success": true,
  "data": [{ "id": "cuid_xxx", "title": "...", "slug": "...", "status": "published", "author": { "id": "...", "name": "..." }, ... }],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

排序：`isSticky DESC, publishedAt DESC`（置顶优先）。

### 4.2 `POST /api/articles`

**鉴权**: admin 或 editor。

**特殊行为：**
- slug 不提供 → 自动生成 `generateSlug(title)`（title ASCII + timestamp base36）
- status === "published" → 校验 publish fields + 自动设置 `publishedAt = now()`（如未提供）
- slug 已存在 → 409

**成功 (201)：** `{ success: true, data: { ...article, author: { id, name } } }`

**Slug 自动生成规则：**
```typescript
function generateSlug(title: string): string {
  const timestamp = Date.now().toString(36);
  const sanitized = title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 40);
  return sanitized ? `${sanitized}-${timestamp}` : `article-${timestamp}`;
}
```

### 4.3 `GET /api/articles/[id]`

`[id]` 接受 id 或 slug。非 published 文章对非 admin/editor 返回 404（隐藏存在）。每次 GET → `viewCount + 1`。

### 4.4 `PUT /api/articles/[id]`

鉴权 admin/editor。状态变更走 `getIllegalArticleStatusTransitionMessage` 拦截非法跳转。

### 4.5 `DELETE /api/articles/[id]`

**物理删除**（真删除，非软删除），仅 admin。删除后 revalidate 所有相关缓存路径。

### 4.6 `POST /api/articles/bulk`

**仅 admin。** 支持批量动作：`publish`, `withdraw`, `republish`, `archive`, `restore`, `sticky`, `unsticky`, `delete`。

**请求体：**
```json
{
  "action": "publish",
  "ids": ["cuid1", "cuid2", "cuid3"],
  "reason": "批量发布 6 月资讯"
}
```

**响应 (200)：**
```json
{
  "success": true,
  "data": {
    "results": [
      { "id": "cuid1", "action": "publish", "from": "draft", "to": "published" },
      { "id": "cuid2", "action": "publish", "from": "draft", "to": "published", "error": "发布校验失败" }
    ],
    "summary": { "total": 3, "success": 2, "failed": 1 }
  }
}
```

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 公开只返回 published | 无 admin/editor session | `where.status = "published"` |
| BR2 | admin/editor 可查看所有状态 | session.role in admin/editor | 可选 `?status=` 过滤 |
| BR3 | 非 published 文章对公开用户隐藏 | GET /api/articles/[id] 非 published | 返回 404（不暴露存在） |
| BR4 | 文章创建默认 draft | POST 未指定 status | `status = "draft"` |
| BR5 | 发布前必填校验 | status 改为 published | title/slug/content/category 都必须非空 → 否则 400 |
| BR6 | 发布自动设 publishedAt | status === "published" 且无 publishedAt | 设为当前时间 |
| BR7 | slug 自动生成 | POST 无 slug | `generateSlug(title)`，格式：`<sanitized-title>-<timestamp36>` |
| BR8 | slug 唯一性校验 | POST slug 冲突 或 PUT 改 slug 冲突 | 409 |
| BR9 | 状态跳转拦截 | 非法状态转换 | 409 + 中文消息 |
| BR10 | DELETE 为物理删除 | DELETE 请求 | `prisma.article.delete()`，不可恢复 |
| BR11 | DELETE 仅 admin | editor 执行 DELETE | 403 "权限不足，仅管理员可删除文章" |
| BR12 | 写操作后 revalidate ISR | POST/PUT/DELETE/bulk | `revalidatePath("/news")`, `/news/[slug]`, `/admin/articles`, `/admin/articles/[id]` |
| BR13 | 浏览计数自增 | GET /api/articles/[id] | `viewCount + 1`，响应中返回更新后的值 |
| BR14 | 置顶优先排序 | GET 列表 | `orderBy: [{ isSticky: "desc" }, { publishedAt: "desc" }]` |

## 6. 错误处理矩阵

| 错误码/场景 | HTTP | 消息 | details |
|-------------|------|------|---------|
| 未登录 | 401 | "未认证" | — |
| session.user.id 缺失 | 401 | "登录状态异常，请重新登录" | — |
| 非 admin/editor | 403 | "权限不足" | — |
| 非 admin（DELETE） | 403 | "权限不足，仅管理员可删除文章" | — |
| Zod 校验失败 | 400 | "参数验证失败" | `{ fieldName: ["错误信息"] }` |
| 发布校验失败 | 400 | "发布校验失败" | `{ title: [...], slug: [...], ... }` |
| 文章不存在 | 404 | "文章不存在" | — |
| 非法状态跳转 | 409 | "已发布文章需先撤回" 等 | — |
| slug 已存在 | 409 | "Slug 已存在，请使用其他 Slug" | — |
| 其他异常 | 500 | "服务器内部错误" | — |

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| ARTICLE-AC-01 | 正常创建草稿 | POST 合法 body, status="draft" | 201 + data.status="draft" | happy |
| ARTICLE-AC-02 | 创建已发布文章 | POST body (title, slug, content, category), status="published" | 201 + publishedAt 非空 | happy |
| ARTICLE-AC-03 | slug 自动生成 | POST 无 slug | 201 + slug 非空 | happy |
| ARTICLE-AC-04 | 公开列表仅 published | GET /api/articles | data 中所有 status === "published" | happy |
| ARTICLE-AC-05 | admin 列表含草稿 | GET /api/articles (admin session) | data 含非 published | happy |
| ARTICLE-AC-06 | 按 slug 查询 | GET /api/articles/my-article | 200 + data.slug === "my-article" | happy |
| ARTICLE-AC-07 | 非 published 公开不可见 | GET /api/articles/draft-slug (无 session) | 404 | edge |
| ARTICLE-AC-08 | 浏览计数自增 | GET /api/articles/[id] × 2 | viewCount 增加 2 | happy |
| ARTICLE-AC-09 | 缺 title → 400 | POST body 无 title | 400 + fieldErrors | error |
| ARTICLE-AC-10 | 缺 content → 400 | POST body 无 content | 400 + fieldErrors | error |
| ARTICLE-AC-11 | slug 重复 → 409 | POST slug 已存在 | 409 | error |
| ARTICLE-AC-12 | 发布缺 category → 400 | POST status="published" 缺 category | 400 + details 含 category | error |
| ARTICLE-AC-13 | 非法状态跳转 → 409 | PUT 已 published 文章 status="draft" | 409 + "已发布文章需先撤回" | error |
| ARTICLE-AC-14 | 未认证 → 401 | POST 不带 session | 401 | error |
| ARTICLE-AC-15 | editor 不可 DELETE → 403 | DELETE (editor session) | 403 | error |
| ARTICLE-AC-16 | admin 删除文章 | DELETE 合法 id (admin session) | 200 + 数据库记录已删除 | happy |
| ARTICLE-AC-17 | 分页正确 | GET ?page=2&limit=5 | pagination 中 page=2, limit=5 | happy |
| ARTICLE-AC-18 | 搜索文章 | GET ?search=蓝辉 | data 中 title 匹配 | happy |
| ARTICLE-AC-19 | 批量发布 | POST /api/articles/bulk {"action":"publish","ids":[...]} | 200 + summary.success ≥ 0 | happy |

## 8. 已知问题

- [ ] 无 CSRF 保护
- [ ] 无请求限流
- [ ] `generateSlug` 纯中文标题 → slug = `article-<timestamp>`（不含中文转拼音），SEO 不友好
- [ ] 批量操作非事务——部分成功部分失败不回滚
- [ ] 无标签（tags）独立管理——tags 以 JSON array 存储，无 tag 表

## 9. 验收条件

- [ ] AC1: POST → 201 + 自动生成 slug
- [ ] AC2: 公开列表/详情仅可见 published
- [ ] AC3: 非法状态跳转被拦截
- [ ] AC4: DELETE 仅 admin 可用
- [ ] AC5: POST/PUT 后 revalidate 缓存路径
- [ ] AC6: `npm run build` 成功（SSG fallback 到静态数据）

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | 批量操作 + 状态机 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 重写 | 完成 | — |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| ARTICLE-AC-01 | §7 | `api/articles/route.test.ts` | "创建草稿 → 201" | ✅ |
| ARTICLE-AC-09 | §7 | `api/articles/route.test.ts` | "缺 title → 400" | ✅ |
| ARTICLE-AC-13 | §7 | `api/articles/[id]/route.test.ts` | "非法跳转 → 409" | ✅ |

---

> 最后更新: 2026-07-07
> 旧版 SPEC 归档为 `api/articles-v1-post-hoc.md`

# SPEC: Admin 文章管理 Articles

> 对应 PRD：`docs/PRD/admin/README.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

文章 CRUD 管理。列表/筛选/搜索/分页，Markdown 编辑器（创建+编辑）。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin/articles` | page (Client) | 文章列表 | ✅ |
| `/admin/articles/new` | page (Client) | 新建文章 | ✅ |
| `/admin/articles/[id]` | page (Client) | 编辑文章 | ✅ |

## 3. 数据模型

### Article (Zod: `ArticleCreateSchema`)

```typescript
{
  title: string;
  slug: string;         // 自动生成唯一性
  excerpt?: string;
  content: string;       // Markdown
  featuredImage?: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "withdrawn" | "archived";
  isSticky: boolean;
  publishedAt?: string;  // 首次发布自动设置
}
```

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| ArticleEditor | `src/components/ArticleEditor.tsx` | 是 | Markdown 编辑+预览分屏 |

## 5. API 依赖

- GET/POST `/api/articles` — 列表/创建
- GET/PUT/DELETE `/api/articles/[id]` — 详情/更新/删除
- GET `/api/articles/categories` — 分类聚合

## 6. 已知问题

- [P0-7] 消费端（`/news/[slug]`）与 Admin 创建的 content 字段不兼容
- [P2] 所有文章 authorName 硬编码"系统管理员"，缺 authorId 字段

## 7. 状态机

### 7.1 状态定义

| 状态 | 含义 | 官网可见 | 是否可编辑 |
|------|------|---------|-----------|
| `draft` 草稿 | 从未正式发布 | 否 | 是 |
| `published` 已发布 | 当前正式展示 | 是 | 是（直接修改线上版本） |
| `withdrawn` 已撤回 | 曾发布，当前下线 | 否 | 是 |
| `archived` 已归档 | 不再维护的历史内容 | 否 | 默认只读 |

### 7.2 允许的状态转换

```
draft ──publish──> published ──withdraw──> withdrawn
  │                   ▲                       │
  │                   └──── republish ────────┘
  │
  └──archive──> archived

withdrawn ──archive──> archived
archived ──restore──> draft
```

### 7.3 禁止转换

- `published → draft`：禁止，必须先进入 `withdrawn`，保留"曾发布"事实
- `archived → published`：禁止，必须先恢复为草稿并重新校验

### 7.4 当前实现差距

当前（2026-06-20 实现版）使用 **3 状态**（`draft` / `published` / `archived`），已实现：
- draft ↔ published 切换（发布/取消发布）
- draft → archived / published → archived
- archived → draft（恢复）

**差距**：缺少 `withdrawn` 状态。当前 published → draft 直接切换，不保留"曾发布"事实。

---

## 8. 极简发布原则

基于一期"极简发布"产品原则：

- **最小表单**：默认只展示标题、分类、正文、封面图 4 字段，摘要/标签/SEO 放入可选的"更多设置"
- **slug 自动生成**：从标题自动生成（timestamp 后缀防重），运营无需手填
- **作者自动关联**：由登录用户自动关联，不要求运营选择
- **SEO 自动生成**：SEO 标题/描述由系统自动生成，不展示独立输入
- **已发布 slug 不可重复编辑**：发布后 slug 锁定，避免 URL 变更导致死链
- **避免审核流**：一期不引入没有明确业务需要的审核流
- **直接修改线上版本**：编辑已发布文章后保存即更新官网（方案 A）

---

## 9. 操作日志

每个写操作必须在事务中追加 ActivityLog：

```typescript
await prisma.$transaction([
  prisma.article.update({ where: { id }, data }),
  prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: "update",   // 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'withdraw' | 'republish' | 'archive' | 'restore' | 'sticky' | 'unsticky'
      entity: "Article",
      entityId: id,
      metadata: {
        diff: { title, slug, status, isSticky, ... },  // 仅变更字段
        ip: req.headers.get("x-forwarded-for"),
      },
    },
  }),
]);
```

### 日志覆盖范围

| 操作 | action 值 | 前提状态变化 |
|------|-----------|-------------|
| 创建文章 | `create` | 新文章 |
| 更新文章 | `update` | 任意 → 任意 |
| 删除文章 | `delete` | 任意 → 删除 |
| 发布 | `publish` | draft → published |
| 撤回 | `withdraw` | published → withdrawn |
| 重新发布 | `republish` | withdrawn → published |
| 归档 | `archive` | draft/withdrawn → archived |
| 恢复 | `restore` | archived → draft |
| 置顶 | `sticky` | isSticky: false → true |
| 取消置顶 | `unsticky` | isSticky: true → false |

---

## 10. 待补功能清单

以下为已规划但尚未实现的功能，按优先级排序：

| # | 功能 | 路由 | 优先级 | 说明 |
|---|------|------|--------|------|
| F9 | 批量多选 | `/admin/articles` | P0 | checkbox 全选/反选 |
| F10 | 批量发布/归档/删除 | `/admin/articles` | P0 | 循环 API + ActivityLog |
| F17 | 头图管理：复用 `EntityImageUploader` | `/admin/articles/[id]/image` | P0 | `entity="article"` 分支 |
| F18 | 头图 webp 转码 + local FS 存储 | `/admin/articles/[id]/image` | P0 | Sharp q80 转码 |
| F19 | 头图替换/删除 | `/admin/articles/[id]/image` | P1 | 替换清理旧文件 |
| F20 | ActivityLog 完整实现 | API | P0 | 当前仅部分实现 |
| F21 | `/news/[slug]` 渲染详情（P0-7） | `/news/[slug]` | P0 | NewsItem 缺 content |
| F22 | NewsItem type 加 `content: string`（P0-7） | `src/types/news.ts` | P0 | 类型补充 |
| F23 | 静态 news 数据补 `content` 字段（P0-7） | `src/lib/news.ts` | P0 | 数据补充 |
| F26 | 「分页测试 #1/#2/#3」清理（P1-10） | DB 清理 | P1 | 手动 SQL |
| F27 | 「Playwright 测试文章」清理（P1-11） | DB 清理 | P1 | 手动 SQL |

---

## 11. 验收条件

### 11.1 功能验收

- [ ] 列表加载 → 7 列展示，分页 20/页
- [ ] 搜索 → 标题模糊匹配
- [ ] 状态筛选（4 种状态）
- [ ] 分类筛选
- [ ] 新建文章 → 必填校验 + slug 自动生成 + 保存草稿
- [ ] 编辑文章 → 加载已有数据 → 修改 → 更新成功
- [ ] 发布文章（draft → published）→ `publishedAt` 设为 now
- [ ] 撤回文章（published → withdrawn）→ 官网不在 `/news` 展示
- [ ] 重新发布（withdrawn → published）→ 官网恢复可见
- [ ] 归档文章 → 公开站不展示
- [ ] 恢复归档（archived → draft）→ 可编辑
- [ ] 置顶 → 公开站列表置顶显示
- [ ] 封面图上传/替换/删除
- [ ] 单条删除 → 二次确认 → DB 删除 + ActivityLog
- [ ] 批量多选 → 全选/反选/清空
- [ ] 批量发布/归档/删除 → 二次确认

### 11.2 状态与权限

- [ ] 四种状态的显示和筛选
- [ ] 所有允许和禁止的状态转换
- [ ] 撤回后官网立即不可见
- [ ] 重新发布后官网恢复可见
- [ ] 归档文章默认只读
- [ ] 非 published 状态不被公开 API 获取
- [ ] editor 可创建/编辑/封面图
- [ ] editor 试图删除 → 403「权限不足，删除需 admin」
- [ ] admin 全部权限
- [ ] 未登录访问任意 admin 路由 → 重定向 `/admin/login`

### 11.3 数据卫生

- [ ] 写操作（POST/PUT/DELETE/bulk）全部有 ActivityLog
- [ ] slug 全站唯一（unique 约束），重复返回 409
- [ ] 状态切换有审计记录（action 独立）
- [ ] 删除前二次确认
- [ ] 测试数据 0 条（分页测试 / Playwright 测试文章）

---

> 最后更新: 2026-06-22

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 文章 CRUD + Markdown 编辑器实现 | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 | 完成 | — |

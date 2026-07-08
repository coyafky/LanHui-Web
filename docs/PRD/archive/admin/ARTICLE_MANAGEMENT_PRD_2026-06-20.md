# ARTICLE_MANAGEMENT_PRD_2026-06-20.md

> **页面**: `/admin/articles` + `/admin/articles/new` + `/admin/articles/[id]`
> **类型**: 后台 CMS 内容管理(`force-dynamic` + `auth()` 守卫)
> **优先级**: P0
> **Owner**: 冯科雅 (Coya)
> **版本**: v1(从 v0 `IMAGE_MANAGEMENT_PRD_2026-06-10.md` 升级)
> **最后更新**: 2026-06-20

> **升级说明**:
> - v0: `IMAGE_MANAGEMENT_PRD_2026-06-10.md`(图片管理系统 v1.2,**只**含门店图片;**本轮已归档**至 `archive/IMAGE_MANAGEMENT_PRD_2026-06-10.md.archive`)
> - v1: 本文档**合并**图片管理到文章头图,合并到统一 Article CRUD;补 P0-7(`item.content`)修复方案 + P1-10/11(测试数据清理)+ 完整状态机 + 批量操作
> - **不**再单独建 `IMAGE_MANAGEMENT_PRD_2026-06-20.md`,统一在此文档体现

---

## 1. 概述

### 1.1 目标

文章管理后台提供完整的 Article 生命周期 CRUD(创建 / 读取 / 编辑 / 删除 / 状态切换 / 置顶)+ 头图管理(local FS + webp 转码)+ 分类字典管理(动态从 DB 拉取)+ 列表筛选 / 分页 / 搜索 / 批量操作。

### 1.2 权限

- **可见角色**: admin + editor
- **写权限**:
  - 创建 / 编辑: editor+ (admin / editor 均可)
  - 删除 / 批量删除: **admin only**
  - 状态切换 (publish / draft / archive): editor+
  - 置顶 / 取消置顶: editor+
  - 上传头图: editor+
- **前台可见**: 公开站 `/news` 只显示 `status='published'`,草稿和归档不公开

### 1.3 范围

- ✅ 包含:
  - 列表 `/admin/articles`(7 列 + 分页 + 搜索 + 状态/分类筛选)
  - 新建 `/admin/articles/new`(标题 / slug / 摘要 / 内容 / 分类 / 标签 / 状态 / 置顶)
  - 编辑 `/admin/articles/[id]`(同新建 + 状态 radio 含 archived)
  - 头图管理:复用 `EntityImageUploader`,`entity="article"` 分支(本轮实施)
  - 批量操作:多选 + 批量发布 / 批量归档 / 批量删除(admin only)
  - 状态机:draft ↔ published ↔ archived + 置顶切换
  - 分类字典:从 `/api/articles/categories` 动态拉取,fallback 4 项静态
- ❌ 不包含:
  - 富文本编辑器(当前用 `<textarea>` + Markdown,可视化编辑器 v2 候选)
  - 多语言文章(本期中文 only)
  - 文章版本控制(每次保存覆盖,v2 候选)
  - 评论管理(后台无评论入口)
  - 文章模板 / 草稿自动保存(v2 候选)

---

## 2. 用户故事

| # | 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|---|
| US-1 | editor | 发布品牌动态 | 新建 → 填标题/摘要/Markdown 内容 → 选分类 → 保存草稿 → 发布 | P0 |
| US-2 | editor | 修改已发布文章 | 编辑器列表 → 点击编辑 → 修改内容 → 更新 | P0 |
| US-3 | editor | 暂时下架某篇文章 | 列表 kebab 菜单 → 「取消发布」(status: published → draft) | P0 |
| US-4 | editor | 长期下架 | 列表 kebab 菜单 → 「归档」(status → archived) | P1 |
| US-5 | editor | 重要公告置顶 | 列表 kebab → 「置顶」(isSticky=true) → 公开站 `/news` 排序提前 | P1 |
| US-6 | admin | 清理测试文章 | 多选 → 「批量删除」→ 二次确认 → 删除 | P0(P1-10/11 修复) |
| US-7 | editor | 上传文章头图 | 编辑器 → 「头图」区 → 拖拽 jpg → 上传 → webp 预览 | P0 |
| US-8 | admin | 搜索「问界」相关文章 | 搜索框输入「问界」→ 列表筛选标题匹配 | P0 |
| US-9 | editor | 删除文章时确认 | 弹窗「此操作不可撤销,确定吗?」 → 确认后删除 | P0 |
| US-10 | 访客 | 访问 `/news/wenjie-m9-modification-guide` | 200 + 完整内容渲染 | P0(P0-7 修复) |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 7 列文章列表(标题/分类/状态/作者/发布时间/浏览/操作) | `/admin/articles` | P0 | ✅ |
| F2 | 搜索(标题模糊匹配) | `/admin/articles` | P0 | ✅ |
| F3 | 状态筛选(全部/草稿/已发布/已归档) | `/admin/articles` | P0 | ✅ |
| F4 | 分类筛选(从 `/api/articles/categories` 拉,失败 fallback) | `/admin/articles` | P0 | ✅ |
| F5 | 分页(默认 20/页) | `/admin/articles` | P0 | ✅ |
| F6 | 状态切换(发布 / 取消发布 / 归档) | `/admin/articles` | P0 | ✅(kebab 菜单) |
| F7 | 置顶 / 取消置顶 | `/admin/articles` | P1 | ✅ |
| F8 | 单条删除(admin + 二次确认) | `/admin/articles` | P0 | ✅ |
| F9 | 批量多选 | `/admin/articles` | P0 | ⚪ 待补 |
| F10 | 批量发布 / 归档 / 删除 | `/admin/articles` | P0 | ⚪ 待补(P1-10/11 修复依赖) |
| F11 | 新建文章表单(8 字段) | `/admin/articles/new` | P0 | ✅ |
| F12 | 标题自动生成 slug(timestamp 后缀) | `/admin/articles/new` | P0 | ✅ |
| F13 | 标签输入(回车添加 / 标签可删除) | `/admin/articles/new` `/[id]` | P1 | ✅ |
| F14 | 分类 / 状态 radio | `/admin/articles/new` `/[id]` | P0 | ✅ |
| F15 | 编辑器 (Markdown `<textarea>`) | `/admin/articles/new` `/[id]` | P0 | ✅ |
| F16 | 编辑文章(同新建 + 状态含 archived) | `/admin/articles/[id]` | P0 | ✅ |
| F17 | 头图管理:复用 `EntityImageUploader`,`entity="article"` | `/admin/articles/[id]/image` | P0 | ⚪ 待补(扩展 EntityImageUploader) |
| F18 | 头图 webp 转码 + local FS | `/admin/articles/[id]/image` | P0 | ⚪ 待补 |
| F19 | 头图替换 / 删除 | `/admin/articles/[id]/image` | P1 | ⚪ 待补 |
| F20 | ActivityLog 记录 (create/update/delete/publish/archive) | API | P0 | ⚪ 部分实现(API 层需补) |
| F21 | `/news/[slug]` 渲染详情(P0-7 修复) | `/news/[slug]` | P0 | ⚪ 待补 |
| F22 | NewsItem type 加 `content: string` 字段(P0-7) | `src/types/news.ts` | P0 | ⚪ 待补 |
| F23 | 静态 news 数据补 `content` 字段(P0-7) | `src/lib/news.ts` | P0 | ⚪ 待补 |
| F24 | 列表 kebab 菜单(操作按钮) | `/admin/articles` | P0 | ✅ |
| F25 | 创建 / 更新 banner(顶部绿条) | `/admin/articles` | P2 | ✅ |
| F26 | 「分页测试 #1/#2/#3」清理(P1-10) | DB 清理 | P1 | ⚪ 手动 |
| F27 | 「Playwright 测试文章」清理(P1-11) | DB 清理 | P1 | ⚪ 手动 |

---

## 4. UI / 交互

### 4.1 视觉规范

- **背景**: `bg-zinc-950`(继承 layout)
- **列表行**: `hover:bg-zinc-900/50`,斑马纹 `bg-zinc-900` / `bg-zinc-800/50`
- **状态徽章**:
  - `draft` → `bg-zinc-700 text-zinc-300`(灰)
  - `published` → `bg-emerald-900/50 text-emerald-400`(绿)
  - `archived` → `bg-yellow-900/50 text-yellow-400`(黄)
- **置顶徽章**: `bg-orange-500/20 text-orange-400`(橙)
- **新建 CTA**: `bg-orange-500` 实心按钮
- **筛选栏**: 搜索 input + 2 个 `<select>`,focus → `border-orange-500`
- **操作菜单**: kebab `MoreHorizontal` icon → dropdown
- **删除确认**: 浏览器原生 `confirm()`(本轮) / 自定义 modal(v2 候选)

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `ArticlesPage` | `src/app/admin/(dashboard)/articles/page.tsx` | Client | 482 行,7 列表 |
| `NewArticlePage` | `src/app/admin/(dashboard)/articles/new/page.tsx` | Client | 347 行,新建表单 |
| `EditArticlePage` | `src/app/admin/(dashboard)/articles/[id]/page.tsx` | Client | 392 行,编辑表单 |
| `EntityImageUploader` | `src/components/admin/EntityImageUploader.tsx` | Client | **扩展 `entity` 支持 `'article'`** |
| `CATEGORIES_FALLBACK` | 内联在 3 个文件 | const | 4 项静态 fallback |
| `STATUS_MAP` | 内联在 articles/page.tsx | const | 状态徽章样式 |

### 4.3 状态机

```
                  ┌──── restore ────┐
                  ▼                  │
              [archived] ───────────┤
                  │                  │
              archive              restore
                  │                  │
[published] ◄── publish ── [draft] ─┘
                  │
              unpublish
                  │
                  └──────────────────► [draft]
```

- **draft → published**:仅当 title + content 非空
- **published → draft** (unpublish):无限制
- **published → archived**:无限制
- **draft → archived**:无限制
- **archived → draft** (restore):无限制
- **isSticky**:独立 boolean,与状态无关

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 7 列全展开,kebab 菜单右对齐 |
| Tablet 768 | 表格 `overflow-x-auto` 横向滚动,筛选栏上下排 |
| Mobile 390 | 表格变卡片堆叠? 当前**不**改(横向滚动可接受) |

### 4.5 可访问性

- ✅ 语义化 HTML(`<table>` / `<thead>` / `<tbody>`)
- ✅ radio + label 关联
- ✅ kebab 菜单 `aria-expanded`(本轮待补)
- ✅ 焦点管理:创建成功 → banner → 焦点回到顶部(可优化)
- ⚠️ 颜色对比度:`zinc-400` on `zinc-900` ≈ 7:1,达标

---

## 5. 数据模型

### 5.1 主表

```
DB: Article        # 文章主表
DB: User           # 作者
DB: ActivityLog    # 审计日志
```

```
Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String   // ← P0-7:必须存在(Markdown)
  category    String?  // '新闻' | '行业动态' | '产品知识' | '公司公告' | ...
  tags        String[] // Postgres text[]
  status      String   // 'draft' | 'published' | 'archived'
  isSticky    Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  authorId    String   // ← P2-4b:必须存在(关联 User.id)
  author      User     @relation(...)
  featuredImage String?  // ← 本轮新增(头图相对路径 /images/articles/{id}.webp)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, publishedAt(sort: Desc)])
  @@index([authorId])
  @@index([isSticky, publishedAt(sort: Desc)])
}
```

### 5.2 ActivityLog 记录

每个写操作必须在事务中追加 ActivityLog:

```ts
await prisma.$transaction([
  prisma.article.update({ where: { id }, data }),
  prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: "update",   // 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'archive' | 'restore' | 'sticky' | 'unsticky'
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

### 5.3 P0-7 修复(NewsItem.content 缺失)

**根因**(commit 0b8f38c 引入):

- `src/app/news/[slug]/page.tsx:94` 引用 `item.content`
- `NewsItem` 类型(在 `src/types/news.ts` 或 `src/lib/news.ts`)**无** `content` 字段
- 结果:`/news/[slug]` 任何路由 500(类型错)或 404

**修复方案**:

1. `src/types/news.ts` 加 `content: string`(必填)
2. `src/lib/news.ts` 静态数据每条 news 加 `content: \`# {title}\n\n详细内容...\``
3. `src/app/news/[slug]/page.tsx:94` 改为渲染 `<div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }} />`
4. 验证:`/news/[slug]` 所有路由 200

### 5.4 P1-10 / P1-11 修复(测试数据残留)

**根因**:审计发现 `分页测试 #1` / `分页测试 #2` / `分页测试 #3` / `Playwright 测试文章` 4 条测试数据混入正式库。

**修复方案**:

1. 手动 SQL:`DELETE FROM "Article" WHERE title IN ('分页测试 #1', '分页测试 #2', '分页测试 #3', 'Playwright 测试文章')`
2. 验证:`SELECT COUNT(*) FROM "Article"` = 真实数据条数
3. 后续:批量删除工具(F10)上线后,不再需要手动 SQL

### 5.5 P0-6 关联(测试门店污染)

虽然主表是门店,但文章测试数据清理逻辑一致:**清理 → 加约束(seed 不可污染正式库)**。详见 [STORE_MANAGEMENT_PRD_2026-06-20.md](./STORE_MANAGEMENT_PRD_2026-06-20.md) §5.4。

---

## 6. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/articles?page&limit&status&category&search` | 公开(草稿过滤) | 列表 |
| GET | `/api/articles/[id]` | 公开 | 详情 |
| POST | `/api/articles` | editor+ | 创建 |
| PUT | `/api/articles/[id]` | editor+(删除字段除外) | 更新 |
| DELETE | `/api/articles/[id]` | **admin only** | 删除 |
| POST | `/api/articles/bulk` (本轮新增) | admin | 批量操作(publish/archive/delete) |
| GET | `/api/articles/categories` | 公开 | 分类字典 |
| POST | `/api/upload?entity=article&entityId={id}` | editor+ | 头图上传 |
| DELETE | `/api/upload?entity=article&entityId={id}` | editor+ | 头图删除 |

**统一响应**: `{ success: boolean, data?, error?, details? }`

**写操作必做**:

1. `auth()` 校验 session
2. 角色检查(admin / editor)
3. Zod 输入校验(`src/lib/validations/article.ts`)
4. Prisma 事务 + ActivityLog
5. `revalidatePath('/admin/articles')` + `revalidatePath('/news')`

### 6.1 错误码契约

| HTTP Code | 场景 | 前端处理 |
|---|---|---|
| 200 | 成功 | toast「保存成功」+ 跳转列表 |
| 400 | Zod 校验失败 | 显示 `details` 字段级错误 |
| 401 | 未登录 | 重定向 login |
| 403 | editor 试图删除 | inline error「权限不足,删除需 admin」 |
| 404 | 文章不存在 | inline error「文章不存在」 |
| 409 | slug 重复 | inline error「slug 已被占用」 |
| 500 | 服务器错 | inline error「服务器错误」 |

### 6.2 头图上传(扩展 EntityImageUploader)

**文件**: `src/components/admin/EntityImageUploader.tsx`

**本轮改动**:

```diff
- export type ImageEntity = "store" | "province" | "article" | "product";
+ export type ImageEntity = "store" | "province" | "article" | "product";
+ // 本轮启用 'article' 分支(原 v0 仅 'store')

  interface EntityImageUploaderProps {
    entity: ImageEntity;     // 本轮接受 "article"
    entityId: string;
    currentPath: string | null;
    placeholderPath: string;  // '/images/placeholders/article.webp'
    onUploadSuccess: (newPath: string) => void;
    onDeleteSuccess: () => void;
  }
```

**API**:`POST /api/upload?entity=article&entityId={id}`(已实现,本轮启用 article 分支)

**存储路径**:`/public/images/articles/{id}.webp`

**Schema**:`Article.featuredImage: String?`(本轮新增)

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] 列表加载 → 7 列展示,分页 20/页
- [ ] 搜索「问界」→ 列表筛选标题包含「问界」的文章
- [ ] 状态筛选「已发布」→ 列表只剩 published 状态
- [ ] 分类筛选 → 列表按分类过滤
- [ ] 新建文章 → 必填校验 + slug 自动生成 + 保存草稿
- [ ] 编辑文章 → 加载已有数据 → 修改 → 更新成功
- [ ] 发布文章(草稿 → published)→ `publishedAt` 自动设为 now
- [ ] 归档文章(published → archived)→ 公开站 `/news` 不再展示
- [ ] 置顶文章 → 公开站 `/news` 列表置顶显示(置顶文章优先)
- [ ] 头图上传 → 1.5s 内显示 webp 预览 + 路径持久化
- [ ] 头图替换 → 旧文件物理删除
- [ ] 头图删除 → DB `featuredImage = null` + 文件删除
- [ ] 单条删除 → 二次确认 → DB 删除 + ActivityLog
- [ ] 批量多选(checkbox)→ 全选 / 反选 / 清空
- [ ] 批量发布 / 归档 / 删除 → 二次确认 → 循环 API + ActivityLog

### 7.2 权限

- [ ] editor 可创建 / 编辑 / 头图
- [ ] editor 试图删除 → 403「权限不足」
- [ ] admin 全部权限
- [ ] 未登录访问任意 admin 路由 → 重定向 `/admin/login`
- [ ] 公开 `/news` 只显示 `status='published'`

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] Playwright e2e `articles list paginates` 通过
- [ ] Playwright e2e `create article → publish → appears in /news` 通过
- [ ] Playwright e2e `editor cannot delete article` 通过
- [ ] Playwright e2e `article image upload happy path` 通过
- [ ] Playwright e2e `admin bulk delete 3 test articles` 通过
- [ ] 三视口截图 OK

### 7.4 数据卫生

- [ ] 写操作(POST/PUT/DELETE/bulk)全部有 ActivityLog
- [ ] 头图存储路径 = `/images/articles/{id}.webp`,统一 webp
- [ ] slug 全站唯一(unique 约束),重复返回 409
- [ ] 测试数据 0 条(`分页测试 #1/#2/#3` + `Playwright 测试文章`)
- [ ] `/news/[slug]` 所有路由 200 + 内容渲染正常(P0-7)
- [ ] NewsItem.content 字段存在(P0-7)
- [ ] 删除前二次确认(浏览器 confirm 或自定义 modal)
- [ ] 状态切换有审计记录(`publish` / `unpublish` / `archive` / `restore` action 独立)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-10 | v0 | `IMAGE_MANAGEMENT_PRD_2026-06-10.md` v1.2(只含 Store 头图 + BUG-1 修复) | Claude (prompt-boost) |
| 2026-06-15 | v0.5 | Article CRUD 实装(列表 / 新建 / 编辑 + 状态机) | Coya |
| 2026-06-19 | v0.8 | 审计发现 P0-7(`item.content`) / P1-10/11(测试数据) / P1-12(埋点) | Coya |
| 2026-06-20 | v1 | 合并 IMAGE_MANAGEMENT 到 Article + 完整规格化 + 头图 article 分支 + 批量操作 + DoD | Coya |
| 2026-06-20 | v1.1 | 本文档归档 v0 IMAGE_MANAGEMENT_PRD 至 `archive/IMAGE_MANAGEMENT_PRD_2026-06-10.md.archive` | Coya |

---

## 附录 A: 已知 P0 / P1 关联(2026-06-19 审计)

| ID | 问题 | 修复方向 | 优先级 |
|---|---|---|---|
| P0-6 | 测试门店污染(22 条 `isActive=true`,无 status 字段) | [STORE_MANAGEMENT_PRD_2026-06-20.md](./STORE_MANAGEMENT_PRD_2026-06-20.md) 处理 | P0 |
| P0-7 | `/news/[slug]` 全部 404 (`item.content`) | §5.3: NewsItem + 静态数据补 content | P0 |
| P1-10 | `分页测试 #1/#2/#3` 测试数据 | §5.4: 手动 SQL + 批量删除 | P1 |
| P1-11 | `Playwright 测试文章` 残留 | §5.4: 手动 SQL + 批量删除 | P1 |
| P1-12 | 695 PV vs ~5 click(埋点失效) | [ADMIN_DASHBOARD_PRD_2026-06-20.md](./ADMIN_DASHBOARD_PRD_2026-06-20.md) F17 | P0 |
| P2-4b | 文章作者 = "系统管理员"(NewsItem 无 authorId) | §5.1 + §6.1 写入 authorId | P2 |

完整: [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

---

## 附录 B: 权限矩阵

| 操作 | admin | editor | 未登录 |
|---|---|---|---|
| 列表 `/admin/articles` | ✅ | ✅ | ❌ → login |
| 新建 `/admin/articles/new` | ✅ | ✅ | ❌ |
| 编辑 `/admin/articles/[id]` | ✅ | ✅ | ❌ |
| 删除单条 | ✅ | ❌ → 403 | ❌ |
| 状态切换 (publish / draft / archive) | ✅ | ✅ | ❌ |
| 置顶 / 取消置顶 | ✅ | ✅ | ❌ |
| 头图上传 / 替换 / 删除 | ✅ | ✅ | ❌ |
| 批量操作 | ✅ | ❌ → 403 | ❌ |
| 公开 `/news` 列表 | ✅ | ✅ | ✅(只看 published) |
| 公开 `/news/[slug]` | ✅ | ✅ | ✅(只看 published) |
| 公开 `GET /api/articles` | ✅ | ✅ | ✅(只看 published) |
| 公开 `GET /api/articles/[id]` | ✅ | ✅ | ✅(只看 published) |

详见 [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts)

---

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../../src/app/admin/(dashboard)/articles/](../../../src/app/admin/(dashboard)/articles/) — 实现位置
- [../../../src/lib/validations/article.ts](../../../src/lib/validations/article.ts) — Zod schema
- [../../../src/components/admin/EntityImageUploader.tsx](../../../src/components/admin/EntityImageUploader.tsx) — 头图组件
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Article / User / ActivityLog
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12
- [../_templates/admin.md](../_templates/admin.md) — 后台模板
- [./STORE_MANAGEMENT_PRD_2026-06-20.md](./STORE_MANAGEMENT_PRD_2026-06-20.md) — P0-6 关联

---

## 附录 D: 子任务拆分建议(本轮 `/build` 直接消费)

按 ZEEKR build 模式,每个修复独立 commit + RED→GREEN→回归:

| # | 任务 | 文件 | 估时 |
|---|---|---|---|
| T1 | P0-7 修复:NewsItem + 静态数据 + 渲染补 `content` 字段 | `src/types/news.ts` + `src/lib/news.ts` + `src/app/news/[slug]/page.tsx` | 1h |
| T2 | P0-7 验证:`/news/[slug]` 所有路由 200 + 内容渲染 | `e2e/audit-full-site.spec.ts` | 30min |
| T3 | Article schema 加 `featuredImage: String?` + `authorId: String`(P2-4b) | `prisma/schema.prisma` + 手工迁移 | 1h |
| T4 | 手动 SQL 清理 `分页测试 #1/#2/#3` + `Playwright 测试文章`(P1-10/11) | DB 直连 | 10min |
| T5 | EntityImageUploader 启用 `article` 分支 + `featuredImage` API 写入 | `EntityImageUploader.tsx` + `/api/upload` + `/api/articles/[id]` | 2h |
| T6 | 文章列表加批量多选(checkbox + 全选 + 反选) | `articles/page.tsx` | 1h |
| T7 | `POST /api/articles/bulk` + 列表批量操作 UI | `route.ts` + `articles/page.tsx` | 2h |
| T8 | Article CRUD ActivityLog 补全(action 细分) | `src/app/api/articles/[id]/route.ts` | 1h |
| T9 | Playwright e2e 批量删除 | `e2e/audit-full-site.spec.ts` | 30min |
| T10 | 三视口截图 + Lighthouse 复跑 | `scripts/audit/screenshot-all.mjs` | 20min |
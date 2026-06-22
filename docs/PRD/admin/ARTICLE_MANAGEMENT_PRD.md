# 蓝辉文章内容管理系统 PRD

> **系统范围**：`/admin/articles`、`/admin/articles/new`、`/admin/articles/[id]` 及关联 API/图片能力
> **用户**：总部 admin、editor
> **版本**：v1（合并 2026-06-20 实现版 + 2026-06-21 规划版）
> **最后更新**：2026-06-22
>
> **来源**：从 `ARTICLE_MANAGEMENT_PRD_2026-06-20.md`（v1 实现版）与 `ARTICLE_MANAGEMENT_PRD_2026-06-21.md`（v0.2 规划版）合并
> **当前实现状态**：见 `docs/SPEC/admin/articles.md`

---

## 1. 系统目标

让总部运营人员能够完成文章从构思、编辑、预览、发布、撤回、重新发布到归档的完整生命周期，并支持封面图、正文配图、官网 SEO 和微信公众号内容复用。

系统必须保证：

- 已发布内容可控，误发后可以快速撤回。
- 撤回不丢失文章和历史信息。
- 草稿与曾经发布过的文章有明确区别。
- 图片失败、保存失败和会话过期时尽量保留用户输入。
- 每个发布状态变化都有权限校验和操作日志。

### 1.1 一期产品原则：极简发布

- 初稿字段越少越好，让运营人员可以快速开始写作。
- 发布步骤越短越好，不引入没有明确业务需要的审核流。
- 一期不为了"功能完整"增加复杂版本、多人协作或高级 SEO 表单。
- 只有会直接影响官网展示或内容识别的字段才设为发布必填。
- 高级能力后续按真实运营问题逐步增加。

---

## 2. 用户与权限

| 能力 | admin | editor | 未登录 |
|---|---|---|---|
| 查看文章列表 | ✅ | ✅ | ❌ |
| 新建和编辑草稿 | ✅ | ✅ | ❌ |
| 预览文章 | ✅ | ✅ | ❌ |
| 发布文章 | ✅ | ✅ | ❌ |
| 撤回和重新发布 | ✅ | ✅ | ❌ |
| 归档和恢复 | ✅ | 待确认 | ❌ |
| 永久删除 | admin only | ❌ | ❌ |
| 批量操作（发布/归档/删除） | ✅ | ❌ | ❌ |
| 置顶/取消置顶 | ✅ | ✅ | ❌ |
| 封面图上传/替换/删除 | ✅ | ✅ | ❌ |
| 公开 `/news` 列表 | ✅ | ✅ | ✅（只看 published） |
| 公开 `/news/[slug]` | ✅ | ✅ | ✅（只看 published） |

**权限规则**：
- editor 试图删除 → 返回 403「权限不足，删除需 admin」
- 未登录访问任意 admin 文章路由 → 重定向 `/admin/login`
- 公开 API 只返回 `status='published'` 的文章

---

## 3. 文章状态机

### 3.1 状态定义

| 状态 | 含义 | 官网可见 | 是否可编辑 |
|---|---|---|---|
| `draft` 草稿 | 从未正式发布 | 否 | 是 |
| `published` 已发布 | 当前正式展示 | 是 | 是（直接修改线上版本） |
| `withdrawn` 已撤回 | 曾发布，当前下线 | 否 | 是 |
| `archived` 已归档 | 不再维护的历史内容 | 否 | 默认只读 |

### 3.2 允许的状态转换

```
draft ──publish──> published ──withdraw──> withdrawn
  │                   ▲                       │
  │                   └──── republish ────────┘
  │
  └──archive──> archived

withdrawn ──archive──> archived
archived ──restore──> draft
```

### 3.3 状态动作规则

| 动作 | 前置状态 | 目标状态 | 前置条件 | 官网影响 |
|---|---|---|---|---|---|
| 保存草稿 | draft | draft | 标题可暂不完整 | 无 |
| 发布 | draft | published | 必填字段、正文和发布校验全部通过 | 立即可见 |
| 撤回 | published | withdrawn | 必须填写撤回原因或确认 | 立即隐藏 |
| 重新发布 | withdrawn | published | 再次通过发布校验 | 恢复可见 |
| 归档 | draft/withdrawn | archived | 二次确认 | 后台归档区可查 |
| 恢复编辑 | archived | draft | 二次确认 | 无 |
| 置顶切换 | 任意 | 不变 | 无额外条件 | 公开站列表排序提前 |

### 3.4 禁止转换

- `published → draft`：禁止直接转换，必须先进入 `withdrawn`，保留"曾发布"事实
- `archived → published`：禁止直接发布，必须先恢复为草稿并重新校验
- 默认不允许永久删除已发布过的文章（admin 可永久删除草稿）

### 3.5 当前实现说明

当前（2026-06-20 实现版）使用 **3 状态**（`draft` / `published` / `archived`），已实现：
- draft ↔ published 切换（发布/取消发布）
- draft → archived / published → archived
- archived → draft（恢复）
- isSticky 独立 boolean，与状态无关

**与目标的差距**：缺少 `withdrawn` 状态（当前 published → draft 直接切换，不保留"曾发布"事实）。迁移计划见 §14 数据迁移。

---

## 4. 页面地图

| 页面 | 主要任务 | 必须覆盖的状态 |
|---|---|---|
| `/admin/articles` | 搜索、筛选、查看状态、执行状态动作、批量操作 | 加载、空、筛选无结果、失败、批量操作 |
| `/admin/articles/new` | 创建和保存草稿 | 未保存、保存中、保存成功、校验失败、离开提醒 |
| `/admin/articles/[id]` | 编辑、预览、发布、撤回、归档 | 4 种文章状态、冲突、会话过期 |
| 文章预览 | 查看官网最终效果 | 草稿/撤回文章的授权预览 |

### 4.1 当前页面组件

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `ArticlesPage` | `src/app/admin/(dashboard)/articles/page.tsx` | Client | 482 行，7 列表 |
| `NewArticlePage` | `src/app/admin/(dashboard)/articles/new/page.tsx` | Client | 347 行，新建表单 |
| `EditArticlePage` | `src/app/admin/(dashboard)/articles/[id]/page.tsx` | Client | 392 行，编辑表单 |
| `EntityImageUploader` | `src/components/admin/EntityImageUploader.tsx` | Client | 扩展 `entity` 支持 `'article'` |
| `CATEGORIES_FALLBACK` | 内联在 3 个文件 | const | 4 项静态 fallback |
| `STATUS_MAP` | 内联在 articles/page.tsx | const | 状态徽章样式 |

---

## 5. 文章字段规格

| 字段 | 草稿必填 | 发布必填 | 说明 |
|---|---|---|---|
| 标题 | 是 | 是 | 草稿最低识别字段 |
| slug | 否，系统自动生成 | 是且唯一 | 从标题生成（timestamp 后缀防重），运营无需手填 |
| 摘要 | 否 | 否 | 可从正文自动截取，允许手工修改 |
| 正文 | 否 | 是 | 核心内容，Markdown 格式 |
| 分类 | 否 | 是 | 使用少量固定分类 |
| 标签 | 否 | 否 | 一期默认不展示 |
| 封面图 | 否 | 待确认 | 是否发布必填待确认 |
| 正文配图 | 否 | 否 | 支持多图 |
| 作者 | 系统自动 | 是 | 登录用户自动关联，不要求运营选择 |
| SEO 标题 | 不展示独立输入 | 系统生成 | 默认使用文章标题 |
| SEO 描述 | 不展示独立输入 | 系统生成 | 优先摘要，否则截取正文 |
| 发布时间 | 否 | 系统自动 | 首次发布设 `publishedAt = now`，重新发布规则待确认 |
| isSticky | 否 | 否 | 独立置顶标记，不与任何状态绑定 |
| 头图路径 | 否 | 否 | `featuredImage: String?`，存储 `/images/articles/{id}.webp` |

### 5.1 一期推荐表单

运营人员默认只看到：

1. **标题** — 必填
2. **分类** — 从动态分类字典选择，4 项静态 fallback（品牌动态/门店动态/产品知识/产品动态）
3. **正文** — Markdown 编辑器（当前 `<textarea>`）
4. **封面图** — 上传区域

摘要放入可选的"更多设置"区域；slug、作者、SEO 和发布时间由系统自动处理；标签一期默认不展示。

---

## 6. UI / 交互规范

### 6.1 视觉规范

- **背景**：`bg-zinc-950`（继承 layout）
- **列表行**：`hover:bg-zinc-900/50`，斑马纹 `bg-zinc-900` / `bg-zinc-800/50`
- **状态徽章**：
  - `draft` → `bg-zinc-700 text-zinc-300`（灰）
  - `published` → `bg-emerald-900/50 text-emerald-400`（绿）
  - `withdrawn` → `bg-amber-900/50 text-amber-400`（黄，待确认）
  - `archived` → `bg-yellow-900/50 text-yellow-400`（黄）
- **置顶徽章**：`bg-orange-500/20 text-orange-400`（橙）
- **新建 CTA**：`bg-orange-500` 实心按钮
- **筛选栏**：搜索 input + 2 个 `<select>`，focus → `border-orange-500`
- **操作菜单**：kebab `MoreHorizontal` icon → dropdown
- **删除确认**：浏览器原生 `confirm()`（当前）/ 自定义 modal（v2 候选）

### 6.2 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 7 列全展开，kebab 菜单右对齐 |
| Tablet 768 | 表格 `overflow-x-auto` 横向滚动，筛选栏上下排 |
| Mobile 390 | 表格横向滚动可接受 |

### 6.3 可访问性

- ✅ 语义化 HTML（`<table>` / `<thead>` / `<tbody>`）
- ✅ radio + label 关联
- ✅ kebab 菜单 `aria-expanded`（待补）
- ✅ 焦点管理：创建成功 → banner → 焦点回到顶部（可优化）
- ✅ 颜色对比度：`zinc-400` on `zinc-900` ≈ 7:1，达标

---

## 7. 编辑与保存流程

### 7.1 核心流程

- **新文章首次保存**：标题 + 内容最小字段，保存为 `draft`
- **编辑已发布文章**：一期采用**方案 A（直接修改线上版本）**——编辑 published 文章后点击保存，官网立即更新
  - 优点：实现简单，适合快速纠错
  - 风险：误操作直接影响线上内容
  - 备选方案 B/C 见 §7.2
- **离开未保存提醒**：使用 `beforeunload` 事件
- **保存失败保留**：客户端保留编辑内容，显示重试入口
- **会话过期**：提示重新登录，尽量恢复未保存内容

### 7.2 已发布文章修改策略（备选方案）

| 方案 | 描述 | 适用场景 |
|---|---|---|
| A：直接修改线上版本 | 保存即更新官网 | 一期推荐，实现简单 |
| B：线上版本 + 修改稿 | 编辑产生独立修改稿，预览后"更新发布"才替换线上 | 需要多次修改/内部确认时 |
| C：先撤回再编辑 | 已发布文章必须撤回为 `withdrawn` 才能编辑 | 规则简单安全，但小改会导致临时下线 |

基于"一期极简发布"原则，复杂修改稿和完整版本历史不进入一期。

---

## 8. 图片与媒体

### 8.1 封面图管理

- 上传、预览、替换和删除，复用 `EntityImageUploader` 组件（`entity="article"` 分支）
- 支持拖拽上传，接受 JPG/PNG/WebP，最大 5MB
- 服务端使用 Sharp 转换为 WebP q80
- 存储路径：`/public/images/articles/{id}.webp`
- 数据库字段：`Article.featuredImage: String?`
- 替换时成功写入新图后再清理旧图
- 删除前二次确认；删除后回到默认占位图
- 上传、替换和删除均写入操作日志

### 8.2 正文配图（一期不强制）

- 支持多图插入
- 图片格式、大小、尺寸、压缩和 WebP 转换
- 上传失败、部分成功和重试
- 删除文章或替换图片时的孤儿文件处理

### 8.3 微信公众号复用

一期推荐 CMS 为网站内容源，提供公众号友好的复制或导出，不做自动发布和双向同步。

仍需确认：
- 网站首发还是公众号首发
- 需要纯文本、Markdown、HTML 还是公众号富文本格式
- 图片是否自动转入公众号素材库

---

## 9. 功能清单与实现状态

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 7 列文章列表（标题/分类/状态/作者/发布时间/浏览/操作） | `/admin/articles` | P0 | ✅ |
| F2 | 搜索（标题模糊匹配） | `/admin/articles` | P0 | ✅ |
| F3 | 状态筛选（全部/草稿/已发布/已归档） | `/admin/articles` | P0 | ✅ |
| F4 | 分类筛选（从 `/api/articles/categories` 拉，失败 fallback） | `/admin/articles` | P0 | ✅ |
| F5 | 分页（默认 20/页） | `/admin/articles` | P0 | ✅ |
| F6 | 状态切换（发布/取消发布/归档） | `/admin/articles` | P0 | ✅ |
| F7 | 置顶/取消置顶 | `/admin/articles` | P1 | ✅ |
| F8 | 单条删除（admin + 二次确认） | `/admin/articles` | P0 | ✅ |
| F9 | 批量多选 | `/admin/articles` | P0 | ⚪ 待补 |
| F10 | 批量发布/归档/删除 | `/admin/articles` | P0 | ⚪ 待补 |
| F11 | 新建文章表单（8 字段） | `/admin/articles/new` | P0 | ✅ |
| F12 | 标题自动生成 slug（timestamp 后缀） | `/admin/articles/new` | P0 | ✅ |
| F13 | 标签输入（回车添加/可删除） | `/admin/articles/new` `/[id]` | P1 | ✅ |
| F14 | 分类/状态 radio | `/admin/articles/new` `/[id]` | P0 | ✅ |
| F15 | 编辑器（Markdown `<textarea>`） | `/admin/articles/new` `/[id]` | P0 | ✅ |
| F16 | 编辑文章（同新建 + 状态含 archived） | `/admin/articles/[id]` | P0 | ✅ |
| F17 | 头图管理：复用 `EntityImageUploader`，`entity="article"` | `/admin/articles/[id]/image` | P0 | ⚪ 待补 |
| F18 | 头图 webp 转码 + local FS | `/admin/articles/[id]/image` | P0 | ⚪ 待补 |
| F19 | 头图替换/删除 | `/admin/articles/[id]/image` | P1 | ⚪ 待补 |
| F20 | ActivityLog 记录（create/update/delete/publish/archive） | API | P0 | ⚪ 部分实现 |
| F21 | `/news/[slug]` 渲染详情（P0-7 修复） | `/news/[slug]` | P0 | ⚪ 待补 |
| F22 | NewsItem type 加 `content: string` 字段（P0-7） | `src/types/news.ts` | P0 | ⚪ 待补 |
| F23 | 静态 news 数据补 `content` 字段（P0-7） | `src/lib/news.ts` | P0 | ⚪ 待补 |
| F24 | 列表 kebab 菜单（操作按钮） | `/admin/articles` | P0 | ✅ |
| F25 | 创建/更新 banner（顶部绿条） | `/admin/articles` | P2 | ✅ |
| F26 | 「分页测试 #1/#2/#3」清理（P1-10） | DB 清理 | P1 | ⚪ 手动 |
| F27 | 「Playwright 测试文章」清理（P1-11） | DB 清理 | P1 | ⚪ 手动 |
| F28 | `withdrawn` 状态迁移（从 published→draft 改为 published→withdrawn） | DB + API | P1 | ⚪ 待规划 |

---

## 10. 数据模型

### 10.1 Prisma Schema

```prisma
model Article {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  excerpt       String?
  content       String    // Markdown
  category      String?   // '品牌动态' | '门店动态' | '产品知识' | '产品动态' | ...
  tags          String[]  // Postgres text[]
  status        String    // 'draft' | 'published' | 'withdrawn' | 'archived'
  isSticky      Boolean   @default(false)
  publishedAt   DateTime?
  viewCount     Int       @default(0)
  authorId      String    // 关联 User.id
  author        User      @relation(fields: [authorId], references: [id])
  featuredImage String?   // 头图相对路径 /images/articles/{id}.webp
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status, publishedAt(sort: Desc)])
  @@index([authorId])
  @@index([isSticky, publishedAt(sort: Desc)])
}
```

### 10.2 ActivityLog 记录

每个写操作必须在事务中追加 ActivityLog：

```ts
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

### 10.3 分类字典

分类从 DB 动态拉取（`GET /api/articles/categories`），API 失败时 fallback 到 4 项静态值：

```
品牌动态 | 门店动态 | 产品知识 | 产品动态
```

---

## 11. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/articles?page&limit&status&category&search` | 公开（草稿过滤） | 文章列表 |
| GET | `/api/articles/[id]` | 公开 | 文章详情 |
| POST | `/api/articles` | editor+ | 创建文章 |
| PUT | `/api/articles/[id]` | editor+ | 更新文章 |
| DELETE | `/api/articles/[id]` | **admin only** | 删除文章 |
| POST | `/api/articles/bulk` | admin | 批量操作（publish/archive/delete） |
| GET | `/api/articles/categories` | 公开 | 分类字典 |
| POST | `/api/upload?entity=article&entityId={id}` | editor+ | 头图上传 |
| DELETE | `/api/upload?entity=article&entityId={id}` | editor+ | 头图删除 |

**统一响应**：`{ success: boolean, data?, error?, details? }`

**写操作必做**：

1. `auth()` 校验 session
2. 角色检查（admin / editor）
3. Zod 输入校验（`src/lib/validations/article.ts`）
4. Prisma 事务 + ActivityLog
5. `revalidatePath('/admin/articles')` + `revalidatePath('/news')`

### 11.1 错误码契约

| HTTP Code | 场景 | 前端处理 |
|---|---|---|
| 200 | 成功 | toast「保存成功」+ 跳转列表 |
| 400 | Zod 校验失败 | 显示 `details` 字段级错误 |
| 401 | 未登录 | 重定向 login |
| 403 | editor 试图删除 | inline error「权限不足，删除需 admin」 |
| 404 | 文章不存在 | inline error「文章不存在」 |
| 409 | slug 重复 | inline error「slug 已被占用」 |
| 500 | 服务器错 | inline error「服务器错误」 |

### 11.2 头图上传（EntityImageUploader 扩展）

**文件**：`src/components/admin/EntityImageUploader.tsx`

当前已支持 `entity` 类型：`"store" | "province" | "article" | "product"`，本轮启用 `'article'` 分支。

**API**：`POST /api/upload?entity=article&entityId={id}`（已实现）
**存储路径**：`/public/images/articles/{id}.webp`
**Schema**：`Article.featuredImage: String?`

---

## 12. 异常与恢复清单

| 场景 | 预期处理 |
|---|---|
| slug 重复 | 阻止保存并定位到 slug 字段 |
| 图片上传失败 | 保留正文和其他字段，允许单独重试 |
| 保存时网络中断 | 保留编辑内容，显示重试入口 |
| 文章已被他人修改 | 阻止静默覆盖，展示冲突信息 |
| 会话过期 | 提示重新登录，尽量恢复未保存内容 |
| 发布校验失败 | 不改变状态，逐项展示缺失字段 |
| 撤回失败 | 文章保持 published，不显示虚假成功 |
| 重新发布失败 | 文章保持 withdrawn |
| 删除前确认 | 弹窗「此操作不可撤销，确定吗？」→ 确认后删除 |

---

## 13. 测试范围

### 13.1 功能验收

- [ ] 列表加载 → 7 列展示，分页 20/页
- [ ] 搜索「问界」→ 列表筛选标题包含「问界」的文章
- [ ] 状态筛选「已发布」→ 列表只剩 published 状态
- [ ] 分类筛选 → 列表按分类过滤
- [ ] 新建文章 → 必填校验 + slug 自动生成 + 保存草稿
- [ ] 编辑文章 → 加载已有数据 → 修改 → 更新成功
- [ ] 发布文章（draft → published）→ `publishedAt` 自动设为 now
- [ ] 撤回文章（published → withdrawn）→ 官网 `/news` 不再展示
- [ ] 重新发布（withdrawn → published）→ 官网恢复可见
- [ ] 归档文章（published → archived）→ 公开站 `/news` 不再展示
- [ ] 恢复归档（archived → draft）→ 可编辑
- [ ] 置顶文章 → 公开站 `/news` 列表置顶显示
- [ ] 封面图上传 → 1.5s 内显示 webp 预览 + 路径持久化
- [ ] 封面图替换 → 旧文件物理删除
- [ ] 封面图删除 → DB `featuredImage = null` + 文件删除
- [ ] 单条删除 → 二次确认 → DB 删除 + ActivityLog
- [ ] 批量多选（checkbox）→ 全选/反选/清空
- [ ] 批量发布/归档/删除 → 二次确认 → 循环 API + ActivityLog

### 13.2 状态与权限

- [ ] 四种状态的显示和筛选
- [ ] 所有允许和禁止的状态转换
- [ ] 撤回后官网立即不可见
- [ ] 重新发布后官网恢复可见
- [ ] 归档文章默认只读
- [ ] 草稿、撤回、归档文章不能被公开 API 获取
- [ ] editor 可创建/编辑/封面图
- [ ] editor 试图删除 → 403「权限不足」
- [ ] admin 全部权限
- [ ] 未登录访问任意 admin 路由 → 重定向 `/admin/login`
- [ ] 公开 `/news` 只显示 `status='published'`
- [ ] 字段校验、slug 冲突、网络失败和重复提交
- [ ] 封面和正文图片的上传、替换、失败恢复
- [ ] 桌面、平板和移动端编辑体验

### 13.3 质量门

- [ ] `npx tsc --noEmit` 通过（允许 9 个 pre-existing 错）
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] Playwright e2e `articles list paginates` 通过
- [ ] Playwright e2e `create article → publish → appears in /news` 通过
- [ ] Playwright e2e `editor cannot delete article` 通过
- [ ] Playwright e2e `article image upload happy path` 通过
- [ ] Playwright e2e `admin bulk delete 3 test articles` 通过
- [ ] 三视口截图 OK

### 13.4 数据卫生

- [ ] 写操作（POST/PUT/DELETE/bulk）全部有 ActivityLog
- [ ] 封面图存储路径 = `/images/articles/{id}.webp`，统一 webp
- [ ] slug 全站唯一（unique 约束），重复返回 409
- [ ] 测试数据 0 条（`分页测试 #1/#2/#3` + `Playwright 测试文章`）
- [ ] `/news/[slug]` 所有路由 200 + 内容渲染正常（P0-7）
- [ ] NewsItem.content 字段存在（P0-7）
- [ ] 删除前二次确认
- [ ] 状态切换有审计记录（action 独立）

---

## 14. 数据迁移影响

### 14.1 当前与目标的差距

| 维度 | 当前（v1 实现） | 目标（v0.2 规划） |
|---|---|---|
| 文章状态 | `draft` / `published` / `archived` | `draft` / `published` / `withdrawn` / `archived` |
| 撤回机制 | published → draft（不保留历史） | published → withdrawn（保留曾发布事实） |
| 封面图 | 已实现 `featuredImage` 字段 | 已实现 |
| 表单字段 | 8 字段全展示 | 4 字段默认 + 更多设置折叠 |
| Slug 编辑 | 自动生成，运营不可见 | 自动生成，运营不可见 |
| ActivityLog | 部分实现 | 全写操作必有 |

### 14.2 状态迁移方案

```
当前 published → draft 的取消发布操作 → 改为 published → withdrawn
当前数据库中 status='draft' 但曾发布过的文章 → 需人工确认区分 draft/withdrawn
```

---

## 15. 已知 P0/P1

| ID | 问题 | 说明 | 优先级 |
|---|---|---|---|
| P0-7 | `/news/[slug]` 全部 404 | `NewsItem` 类型无 `content` 字段，8 条已发布文章详情全不可达 | P0 |
| P1-10 | 「分页测试 #1/#2/#3」残留 | 测试数据混入正式库，需手动 SQL 清理 | P1 |
| P1-11 | 「Playwright 测试文章」残留 | 测试数据混入正式库，需手动 SQL 清理 | P1 |
| P2-4b | 文章作者 =「系统管理员」 | `NewsItem` 无 `authorId`，只存硬编码 `authorName` | P2 |

完整审计清单见 `docs/SPEC/INDEX.md`

---

## 16. 开放问题

1. 编辑已发布文章时，保存是否立即更新线上内容（方案 A vs B vs C）
2. editor 是否拥有归档和恢复权限
3. 草稿允许保存到什么最低完整程度
4. 是否需要待审核状态
5. 是否需要自动保存和文章版本历史
6. 是否允许永久删除，以及删除哪些状态的文章
7. 编辑器类型（当前 `<textarea>` Markdown）与公众号复用方式
8. 封面图是否作为发布必填

---

## 17. 固化决策记录

| 日期 | 决策 | 来源 |
|---|---|---|
| 2026-06-21 | 一期采用极简发布原则，默认表单只展示标题/分类/正文/封面图 4 字段 | 规划评审 |
| 2026-06-21 | 摘要放入可选的"更多设置"，标签一期默认不展示 | 规划评审 |
| 2026-06-21 | slug 由系统从标题自动生成（timestamp 后缀），运营无需手填 | 规划评审 |
| 2026-06-21 | 作者由登录用户自动关联，SEO 标题/描述由系统自动生成 | 规划评审 |
| 2026-06-21 | `published → draft` 禁止直接转换，必须先进入 `withdrawn` | 规划评审 |
| 2026-06-21 | `archived → published` 禁止直接发布，必须先恢复为草稿 | 规划评审 |
| 2026-06-21 | CMS 为网站内容源，公众号复制/导出做，自动发布/双向同步不做 | 规划评审 |

---

## 18. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-10 | v0 | `IMAGE_MANAGEMENT_PRD_2026-06-10.md` v1.2（只含 Store 头图） | Claude |
| 2026-06-15 | v0.5 | Article CRUD 实装（列表/新建/编辑 + 状态机） | Coya |
| 2026-06-19 | v0.8 | 审计发现 P0-7 / P1-10/11 / P1-12 | Coya |
| 2026-06-20 | v1 | 合并 IMAGE_MANAGEMENT 到 Article + 完整规格化 + 头图 article 分支 + 批量操作 + DoD | Coya |
| 2026-06-21 | v0.2 | 极简发布原则 + 4 状态机（含 withdrawn）+ 默认 4 字段表单 | Coya / Codex |
| 2026-06-22 | v1 | 合并 06-20 实现版与 06-21 规划版为单份 canonical PRD | Coya |

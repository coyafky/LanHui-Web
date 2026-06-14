# 后台文章管理：新建文章失败与封面图字段移除测试报告

> 目标读者：Claude Code 架构师、Coder、Tester。本文只描述问题、证据、修复范围和验收用例，供后续修复执行使用。

## 1. 测试背景

后台文章管理当前存在三个用户可感知问题：

1. 新建文章提交后返回 `POST /api/articles 500`，页面显示 `服务器内部错误`。
2. 新建/编辑文章页仍展示 `封面图 URL` 字段，但业务已确认第一版文章后台不需要封面图管理。
3. 后台应支持稳定创建文章：创建成功后要有明确提示，并且新文章能在后台文章列表中显示。

本报告基于当前代码、用户提供的错误日志和本地 Docker PostgreSQL 状态编写，测试日期为 2026-06-14。

## 2. 当前环境

| 项目 | 结果 |
| --- | --- |
| 项目路径 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website` |
| 前端服务 | `localhost:3000` |
| 数据库 | Docker PostgreSQL，`localhost:5433/lanhui` |
| 数据库连接 | 可连接 |
| `User` 记录 | 1 个 admin 用户 |
| `Article` 记录 | 9 篇 |
| 当前 admin 用户 | `admin@lanhui.com` / `username=admin` / `role=admin` / `status=active` |
| 文章创建接口 | `POST /api/articles` |

## 3. 关键结论

当前文章创建 500 的直接错误是 Prisma 创建文章时缺少作者关联：

```text
Argument `author` is missing.
authorId: undefined
```

用户提供的服务端日志显示：

```text
const article = await prisma.article.create({
  data: {
    title: "demo",
    slug: "demo-mqdd4e8k",
    excerpt: "demo",
    content: "# demo\n",
    featuredImage: null,
    category: "新闻",
    tags: [],
    status: "draft",
    isSticky: false,
    publishedAt: null,
    authorId: undefined,
  }
})

Argument `author` is missing.
```

根因判断：

- `src/app/api/articles/route.ts` 在创建文章时使用 `authorId: session.user.id`。
- `src/lib/auth.ts` 的 NextAuth callbacks 只把 `role` 写入 token/session，没有把 `user.id` 写入 token，也没有把 `token.id` 写回 `session.user.id`。
- 结果是：TypeScript 类型上以为 `session.user.id` 存在，但运行时实际为 `undefined`。
- `Article.authorId` 在 Prisma schema 中是必填外键，没有默认值。
- Prisma 收到 `authorId: undefined` 后无法建立 `author` relation，因此抛出 `Argument author is missing`，API 落入通用 catch 返回 500。

所以修复重点不是改 `publishedAt`，也不是改文章表结构，而是修复认证 session 注入和 API 的 authorId 防御校验。

## 4. 相关文件

| 文件 | 当前问题 |
| --- | --- |
| `src/lib/auth.ts` | NextAuth `jwt` / `session` callbacks 没有注入 `user.id`。 |
| `src/app/api/articles/route.ts` | `POST` 直接使用 `session.user.id` 写 `authorId`，但没有运行时校验。 |
| `src/app/api/articles/[id]/route.ts` | `PUT` / `DELETE` 的 `logActivity` 也使用 `session.user.id`，需要跟随认证修复验证。 |
| `src/lib/validations/article.ts` | `featuredImage` 仍在 schema 中作为 URL 字段。 |
| `src/app/admin/(dashboard)/articles/new/page.tsx` | 新建文章页仍有 `封面图 URL` 输入框，并提交 `featuredImage`。 |
| `src/app/admin/(dashboard)/articles/[id]/page.tsx` | 编辑文章页仍有 `封面图 URL` 输入框，并提交 `featuredImage`。 |
| `src/app/admin/(dashboard)/articles/page.tsx` | 列表页负责展示创建后的文章，需要回归确认。 |

## 5. 问题清单

### BUG-1：新建文章时 `session.user.id` 为 `undefined`，导致 `POST /api/articles` 500

| 项目 | 内容 |
| --- | --- |
| 优先级 | P0 / Critical |
| 类型 | 后台核心功能阻塞 |
| 现象 | 新建文章提交后页面显示 `服务器内部错误`，接口返回 500。 |
| 服务端证据 | `authorId: undefined`、`Argument author is missing.` |
| 根因 | NextAuth session 没有注入 user id，API 写入必填外键 `authorId` 时拿到 `undefined`。 |
| 影响 | 后台无法稳定创建文章；草稿和发布流程都被阻塞。 |

#### 修复要求

必须修复 NextAuth 的 id 注入：

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
    }
    return session;
  },
}
```

同时需要确保 NextAuth 类型声明与运行时一致：

- `session.user.id` 类型应存在。
- JWT token 类型应包含 `id` 和 `role`。

`POST /api/articles` 也必须增加运行时防御：

- 如果 `session.user.id` 缺失，返回 401 或 500 前的明确错误，不允许继续调用 Prisma。
- 推荐返回：

```json
{
  "success": false,
  "error": "登录状态异常，请重新登录"
}
```

状态码建议使用 401。

### BUG-2：后台文章表单仍展示封面图 URL

| 项目 | 内容 |
| --- | --- |
| 优先级 | P0 / Critical |
| 类型 | 产品需求变更 |
| 现象 | 新建/编辑文章页存在 `封面图 URL` 输入框。 |
| 业务要求 | 第一版文章后台不需要封面图管理。 |
| 影响 | 运营人员会误以为必须维护封面图；无效 URL 也可能触发表单或 API 校验错误。 |

#### 修复要求

必须从后台文章表单移除可见封面图字段：

- 从 `src/app/admin/(dashboard)/articles/new/page.tsx` 移除 `featuredImage` state。
- 从新建页 UI 移除 `封面图 URL` 输入框。
- 从新建页提交 payload 移除 `featuredImage`。
- 从 `src/app/admin/(dashboard)/articles/[id]/page.tsx` 移除 `featuredImage` state。
- 从编辑页 UI 移除 `封面图 URL` 输入框。
- 从编辑页提交 payload 移除 `featuredImage`。

数据库层面可以暂时保留 `Article.featuredImage` 字段用于旧数据兼容读取，但后台第一版不允许运营编辑该字段。

`ArticleCreateSchema` / `ArticleUpdateSchema` 可暂时保留 `featuredImage` 兼容 API 旧 payload，但推荐改为：

- 页面不提交 `featuredImage`。
- API 不要求 `featuredImage`。
- 如果未来要恢复封面图管理，另开“文章封面图管理 PRD”，走统一图片上传，不使用外部 URL 输入。

### BUG-3：API 错误提示过于笼统

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | UX / 错误处理 |
| 现象 | 当前 UI 只展示 `服务器内部错误`，无法指导用户处理。 |
| 根因 | `POST /api/articles` catch 中统一返回 500；前端只展示 `json.error`。 |
| 影响 | 用户不知道是登录状态异常、slug 重复、参数错误还是服务端异常。 |

#### 修复要求

至少区分以下情况：

| 情况 | 状态码 | 错误文案 |
| --- | ---: | --- |
| 未登录 | 401 | `未认证` |
| session 缺少 user id | 401 | `登录状态异常，请重新登录` |
| 非 admin/editor | 403 | `权限不足` |
| Zod 参数错误 | 400 | `参数验证失败` + details |
| slug 重复 | 409 | `Slug 已存在，请使用其他 Slug` |
| 其他未知错误 | 500 | `服务器内部错误` |

前端应展示这些中文错误，不应只依赖 console。

### BUG-4：创建成功后缺少明确成功提示与列表可见性确认

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | 后台核心流程 |
| 现象 | 当前成功后直接 `router.push("/admin/articles")`，没有明确成功提示。 |
| 期望 | 创建成功后用户看到成功提示，并能在后台文章列表看到新文章。 |

#### 推荐成功流程

第一版建议采用：

1. 用户提交 `/admin/articles/new`。
2. API 返回 201。
3. UI 显示 `文章创建成功`。
4. 跳转 `/admin/articles`。
5. 新文章出现在列表中，或可通过标题搜索找到。

如果项目没有 toast 组件，可先使用列表页 query param 或 session storage 显示一次性成功提示。

### BUG-5：历史测试报告已记录同一根因，但当前代码仍未完全修复

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | 回归缺陷 |
| 证据 | `docs/ARTICLE_MODULE_TEST_2026-06-09.md` 已记录 `session.user.id` 为 `undefined`。 |
| 当前状态 | `src/lib/auth.ts` 仍只注入 `role`，没有注入 `id`。 |
| 影响 | 旧问题在当前后台文章创建流程中再次复现。 |

后续修复必须补上回归测试，避免再次被设计/后台重构覆盖掉。

## 6. 修复边界

### 必须做

- 修复 NextAuth `session.user.id` 注入。
- `POST /api/articles` 在创建前校验 `session.user.id`。
- 移除后台文章新建页和编辑页的 `封面图 URL` 字段。
- 新建/编辑文章提交 payload 不包含 `featuredImage`。
- 新建文章成功后有明确提示。
- 新建文章成功后能在后台文章列表显示。
- 补充自动化测试或手动测试记录。

### 本轮不做

- 不做文章封面图上传。
- 不做文章封面图外链 URL 管理。
- 不删除数据库 `Article.featuredImage` 列，除非另开迁移 PRD。
- 不做富文本编辑器升级。
- 不做新闻前台详情页重构。
- 不做 SEO 封面图/OG 图管理。

## 7. 建议测试用例

### 7.1 表单 UI 测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| UI-1 新建页移除封面图 | 打开 `/admin/articles/new` | 页面不存在 `封面图 URL`，不存在 featured image 输入框。 |
| UI-2 编辑页移除封面图 | 打开 `/admin/articles/{id}` | 页面不存在 `封面图 URL`，不存在 featured image 输入框。 |
| UI-3 必填字段 | 不填标题或内容提交 | 浏览器或表单显示必填错误，不发起无效创建。 |
| UI-4 错误展示 | 触发 slug 重复或登录异常 | 页面顶部显示明确中文错误。 |

### 7.2 API 测试

| 用例 | 请求 | 期望 |
| --- | --- | --- |
| API-1 创建草稿成功 | admin 登录后 `POST /api/articles`，title/content/status=draft | 201，返回 `success: true` 和文章 id。 |
| API-2 创建发布文章成功 | status=published，不传 publishedAt | 201，自动写入 publishedAt。 |
| API-3 未登录 | 无 session 创建文章 | 401。 |
| API-4 非 admin/editor | 普通角色创建文章 | 403。 |
| API-5 session 缺 id | 模拟 session.user 无 id | 401，返回 `登录状态异常，请重新登录`，不调用 Prisma。 |
| API-6 重复 slug | 使用已存在 slug | 409，返回 `Slug 已存在，请使用其他 Slug`。 |
| API-7 不传 featuredImage | payload 不包含 featuredImage | 201，不被 Zod 拦截。 |
| API-8 传 featuredImage=null | 旧客户端兼容 payload | 如保留兼容 schema，应 201；如果决定禁用，应明确 400。 |

### 7.3 端到端测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| E2E-1 最小字段创建草稿 | 填标题、内容，状态草稿，提交 | 创建成功，有成功提示，文章列表可见。 |
| E2E-2 创建已发布文章 | 填标题、内容，状态发布，提交 | 创建成功，列表状态为已发布，发布时间存在。 |
| E2E-3 摘要/分类/标签可选 | 不填摘要、分类、标签 | 创建成功。 |
| E2E-4 重复 slug | 使用已存在 slug | 表单显示 `Slug 已存在，请使用其他 Slug`，页面不崩。 |
| E2E-5 封面图字段不存在 | 新建与编辑页检查 | 页面无封面图 URL 字段，payload 不含 `featuredImage`。 |

## 8. 验收标准

修复完成必须同时满足：

- `/admin/articles/new` 不再出现 `封面图 URL`。
- `/admin/articles/{id}` 不再出现 `封面图 URL`。
- 新建/编辑文章提交 payload 不包含 `featuredImage`。
- admin 登录后 `session.user.id` 在运行时存在且等于数据库 User.id。
- `POST /api/articles` 创建草稿返回 201。
- `POST /api/articles` 创建发布文章返回 201，并自动设置 `publishedAt`。
- 新建文章成功后出现明确中文成功提示。
- 新文章在 `/admin/articles` 列表可见，或可通过搜索标题找到。
- session 缺少 user id 时，不调用 Prisma，返回明确错误。
- 重复 slug 返回 409，UI 显示中文错误。
- `npm run lint` 通过。
- `npm run typecheck` 通过。
- 相关单元测试通过，建议至少覆盖 `src/lib/auth.ts` session 回调、`src/lib/validations/article.ts`、`src/app/api/articles/route.ts`。

## 9. 给 Claude Code 的修复建议顺序

1. 先修 `src/lib/auth.ts`：JWT token 和 session 都注入 `user.id`。
2. 同步修 NextAuth 类型声明，确保类型和运行时一致。
3. 在 `POST /api/articles` 创建前增加 `session.user.id` 运行时校验。
4. 移除新建/编辑文章页中的 `featuredImage` state、UI 和提交 payload。
5. 增加创建成功提示，并确认列表可见。
6. 补充 API 单测和 E2E/手动截图验证。

## 10. 当前复测命令摘录

```bash
PGPASSWORD=lanhui_password psql 'postgresql://lanhui@localhost:5433/lanhui' \
  -c 'select id,email,username,name,role,status from "User" order by "createdAt";' \
  -c 'select count(*) as articles from "Article";'

tail -n 160 .next/dev/logs/next-development.log
```

当前数据库用户证据：

```text
id                         | email             | username | name       | role  | status
cmq6fjtyw0000xag6ot1xqow9  | admin@lanhui.com  | admin    | 系统管理员 | admin | active
```

关键错误：

```text
authorId: undefined
Argument `author` is missing.
POST /api/articles 500
```

# Tester 报告 — ARTICLE_EDIT_404_BUG

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Playwright 验证 → 复现 + 定位 |
| 范围 | `/admin/articles/[id]` 编辑页打开现有文章显示「文章不存在」 |
| 验证 | 11 篇文章中 cuid-based 访问全 404，slug-based 访问 200 OK |
| 严重度 | **P0（核心编辑功能完全瘫痪）** |

---

## 1. 复现链路

1. `admin@lanhui.com` / `admin123` 登录
2. 在 `/admin/articles` 列表点击任意一行的「编辑」（或直接访问 `/admin/articles/<cuid>`）
3. **期望**：编辑表单打开，所有字段预填该文章数据
4. **实际**：表单打开但**所有字段为空** + 顶部红色错误条显示 **「文章不存在」**

---

## 2. Playwright 自动化探测结果

测试脚本：`.claude/test-edit-article-404.mjs`（headless Chromium 1208, viewport 1440×900）

测试对象：已知存在的文章 `蓝辉轻改品牌官网正式上线`，DB id = `cmq7f2na60000oig6vigpzqll`，slug = `brand-website-launch`

| 探针 | 期望 | 实际 | 结果 |
| --- | --- | --- | :---: |
| 访问 `/admin/articles/cmq7f2na60000oig6vigpzqll` | 标题预填 | 标题为空 | ❌ |
| 访问 `/admin/articles/cmq7f2na60000oig6vigpzqll` | 错误条不显示 | 顶部红色条 "文章不存在" 显眼 | ❌ |
| 访问 `/admin/articles/brand-website-launch`（slug 旁路） | 标题预填 "蓝辉轻改品牌官网正式上线" | ✅ 标题预填正确 | ✅ |
| `GET /api/articles/cmq7f2na60000oig6vigpzqll` | 200 + data | **404 "文章不存在"** | ❌ |
| `GET /api/articles/brand-website-launch` | 200 + data | **200 + data** | ✅ |
| Admin 角色访问时草稿文章可见性 | 应可访问（admin/editor 通过守卫） | 因 cuid 查询失败先 404，**永远走不到守卫** | ❌ |

截图证据：
- `/tmp/articles-edit-404-screenshots/01-edit-by-cuid.png` — 顶部红条「文章不存在」+ 全部空字段
- `/tmp/articles-edit-404-screenshots/02-edit-by-slug.png` — 正常预填（作为对比，证明 bug 仅在 cuid 路径）

---

## 3. 根因分析

### 3.1 关键代码

`src/app/api/articles/[id]/route.ts:15-24`：

```ts
// 先尝试按 ID 查询，如果 id 不是 cuid 格式则按 slug 查询
const isCuid = id.startsWith("cl") && id.length > 20;     // ← BUG
const article = await prisma.article.findFirst({
  where: isCuid ? { id } : { slug: id },
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});
```

### 3.2 实际 cuid 格式（Prisma + cuid v1）

| ID 样本 | 前 2 字符 | startsWith("cl") |
| --- | :---: | :---: |
| `cmq7f2na60000oig6vigpzqll` | `cm` | **false** |
| `cmq7f2nac0001oig65aprfskm` | `cm` | **false** |
| `cmq7f2naj0002oig6qugs2ici` | `cm` | **false** |
| `cmq7imwpn000w4vg6ujgj8tpt` | `cm` | **false** |
| `cmq7j8jcn00114vg654dm4m45` | `cm` | **false** |

**Prisma 生成的 cuid（cuid v1 算法）格式为 `c` + 一个 base-36 字符 + 后续 23 字符**。第 2 个字符可以是 `0-9` 或 `a-z` 任意一个。原作者误以为 cuid 都以 `cl` 开头（旧 CUID v0 草案或他记忆中的某个版本）。本项目所有 11 篇文章的 id 都以 `cm` 开头——**`id.startsWith("cl")` 在生产数据上永远是 false**。

### 3.3 事件链

```
1. 用户访问 /admin/articles/cmq7f2na60000oig6vigpzqll
   ↓
2. [id]/page.tsx:54 触发 fetch('/api/articles/cmq7f2na60000oig6vigpzqll')
   ↓
3. 路由 line 16: isCuid = 'cmq7...'.startsWith('cl') = false
   ↓
4. 路由 line 17-18: prisma.article.findFirst({ where: { slug: 'cmq7f2na60000oig6vigpzqll' } })
   ↓
5. 数据库没有以 cuid 字符串作为 slug 的文章 → null
   ↓
6. 路由 line 26-30: 返回 404 { success: false, error: '文章不存在' }
   ↓
7. [id]/page.tsx:56-58: if (!json.success) setError('文章不存在')
   ↓
8. setLoading(false) → 渲染空表单 + 错误条
```

### 3.4 影响范围

| 项 | 值 |
| --- | --- |
| 受影响路径 | `/admin/articles/[id]` 编辑页 |
| 受影响 API | `GET /api/articles/[id]`（仅 cuid 路径；slug 路径巧合 work）|
| 受影响用户 | 全部 admin / editor（无法编辑任何文章）|
| 数据完整性 | OK（PUT/DELETE 路径用的是 `findUnique({ where: { id } })` 不受影响；GET 是唯一坏掉的）|
| 严重度 | **P0**：所有文章编辑/回退草稿/重新编辑草稿等核心管理功能 100% 瘫痪 |
| 绕过方法 | 手动改 URL 里的 cuid 为 slug（如 `/admin/articles/brand-website-launch`）可正常加载——这就是 Playwright 探针里 slug 路径"巧合能 work"的原因 |

### 3.5 顺带发现的相关 Bug（不在本任务范围，但值得记录）

| 优先级 | 描述 |
| --- | --- |
| P2 | `[id]/page.tsx` 当 API 返回错误时**仍然渲染空表单**——这导致用户看到「文章不存在」+ 看似可用的空表单。理想行为是 error 时只显示错误条 + 「返回列表」链接，**不渲染空表单**。 |
| P3 | `route.ts:17` 的 `findFirst` + 动态 where 在 cuid 格式错误时如果未来改用 `findUnique` 会有 P2023 异常（Invalid id format），需要提前防御。 |

---

## 4. 修复方案

### 推荐方案：单查询 OR 条件（最小改动，1 行核心代码 + 单元测试）

`route.ts:15-24` 改为：

```ts
// 同时按 id 和 slug 查询（cuid 走 id 分支，slug 走 slug 分支）
// Prisma 7 对 OR 中的非 cuid 格式 id 会静默跳过该分支，不抛 P2023
const article = await prisma.article.findFirst({
  where: { OR: [{ id }, { slug: id }] },
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});
```

**为什么这样能 work**：
- 真实 cuid（如 `cmq7f2na60000oig6vigpzqll`）→ id 分支命中 → 拿到记录
- 真实 slug（如 `brand-website-launch`）→ id 分支静默失败、slug 分支命中 → 拿到记录
- 都不存在 → null → 仍然返回 404
- Prisma 7 在 OR 查询中遇到非法 cuid 格式会跳过该匹配（不会抛 P2023），所以无需额外 try/catch
- 单次查询，性能与原版持平

### 备选方案 A：try/catch + 两次 findUnique

```ts
let article = null;
try {
  article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
} catch {
  // id 不是合法 cuid 格式，按 slug 兜底
  article = await prisma.article.findUnique({
    where: { slug: id },
    include: { author: { select: { id: true, name: true } } },
  });
}
if (!article) {
  article = await prisma.article.findUnique({
    where: { slug: id },
    include: { author: { select: { id: true, name: true } } },
  });
}
```

**缺点**：3 次查询（2 findUnique + 1 兜底），代码冗长。

### 备选方案 B：写个 cuid 校验辅助函数

```ts
function looksLikeCuid(s: string): boolean {
  return /^c[a-z0-9]{20,30}$/i.test(s);
}
const article = await prisma.article.findFirst({
  where: looksLikeCuid(id) ? { id } : { slug: id },
  include: { ... },
});
```

**缺点**：正则需要维护；不解决「slug 形如 `cfoo123`」的歧义；最差情况下还是会出错。

### 4.1 推荐方案的验证逻辑

需要覆盖的场景：
1. **GET by valid cuid** → 200 + data ✅
2. **GET by valid slug** → 200 + data ✅
3. **GET by non-existent cuid** → 404 ✅
4. **GET by non-existent slug** → 404 ✅
5. **GET by draft article as admin** → 200（admin 守卫通过）✅
6. **GET by draft article as public** → 404 ✅
7. **GET by archived article as admin** → 200 ✅
8. **GET by archived article as public** → 404 ✅

---

## 5. 验收标准

- [ ] `GET /api/articles/cmq7f2na60000oig6vigpzqll`（真实 cuid）→ 200 + data
- [ ] `GET /api/articles/brand-website-launch`（slug）→ 200 + data
- [ ] `GET /api/articles/nonexistent-cuid-xxx` → 404
- [ ] `GET /api/articles/nonexistent-slug` → 404
- [ ] 编辑页 `/admin/articles/<cuid>` 加载后：标题/Slug/摘要/内容/分类/标签/状态/置顶 全部正确预填
- [ ] 编辑页 `/admin/articles/<cuid>` 加载后：**不**显示「文章不存在」错误条
- [ ] 草稿文章（status=draft）admin 访问 → 200 + data
- [ ] 草稿文章 public 访问 → 404
- [ ] Playwright 探针 5 个场景全过
- [ ] 至少 3 个新 vitest 单元测试覆盖 cuid / slug / not-found 路径
- [ ] `npx tsc --noEmit` 通过（0 新错误）
- [ ] `npx vitest run` 全过
- [ ] `npm run build` 通过

---

## 6. 后续工单（不在本 bug 范围）

| 优先级 | 描述 |
| --- | --- |
| P2 | `[id]/page.tsx` error 时不渲染空表单；改为错误条 + 返回链接 |
| P2 | 引入 `src/lib/cuid.ts` 校验辅助，统一所有路由的 id 解析（store/[id] 等是否有同样问题需要审计）|
| P3 | `route.ts:17` `findFirst` 是否需要防御 Prisma 7 driverAdapterError 中的非法 id 抛错 |

---

## 7. 签字

**Bug 已稳定复现。** Playwright 截图 + API 探针双重确认 cuid 路径 100% 失败，slug 路径 100% 巧合 work。根因为 `route.ts:16` 的 cuid 格式检测用了错误的字符串前缀（`startsWith("cl")`），生产 cuid 全部以 `cm` 开头。

**等待用户决策**：
- **方案 OR**（推荐）：单行 OR 改动 + 单元测试，1 个文件 ~3 行核心改动
- **方案 try/catch**：3 次查询
- **方案 cuid 正则**：1 个新辅助文件 + 路由改动

确认方案后进入 `/dispatch` 流水线。

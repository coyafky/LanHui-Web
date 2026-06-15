# 验证报告 — ARTICLE_EDIT_404_FIX

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Coder (commit `b02d90a`) → Merge (`6e9b11c`) → 验证 |
| 范围 | `/admin/articles/[id]` 编辑页 cuid 路径 404 — 根因修复 |
| 方案 | OR 条件 `where: { OR: [{ id }, { slug: id }] }` |
| 验证 | tsc 0 新错误 + vitest 162/162 + build 成功 + Playwright 6 探针全过 |

---

## 1. 根因

`src/app/api/articles/[id]/route.ts:15-18` 旧代码：
```ts
const isCuid = id.startsWith("cl") && id.length > 20;
const article = await prisma.article.findFirst({
  where: isCuid ? { id } : { slug: id },
  ...
});
```

Prisma cuid v1 生成的 ID 格式为 `c` + base-36 字符 + 23 字符。第 2 字符可以为 `0-9` 或 `a-z` 任意一个。本项目 11 篇文章的 ID 全部以 `cm` 开头——**`startsWith("cl")` 永远为 false** → 路由总是按 slug 查 cuid 字符串 → null → 404。

---

## 2. 修复

`route.ts` 单文件 1 处核心改动（+4/-2）：

```ts
// 同时按 id 和 slug 查询（cuid 走 id 分支，slug 走 slug 分支）
// Prisma 7 对 OR 中的非 cuid 格式 id 会静默跳过该分支，不抛 P2023
const article = await prisma.article.findFirst({
  where: { OR: [{ id }, { slug: id }] },
  include: { author: { select: { id: true, name: true } } },
});
```

`PUT/DELETE/GET 守卫`（auth guard lines 33-42）**未触动**。

---

## 3. 验证门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 12 预存错误，0 新错误 | 全部在 `analytics.test.ts` 等无关文件 |
| `npx vitest run` | ✅ 16 files / 162 tests passed | 158 baseline + 4 new = 162 |
| `npx vitest run src/app/api/articles/[id]/route.test.ts` | ✅ 22/22 pass | 18 existing + 4 new = 22 |
| `npm run build` | ✅ 成功 | 静态页生成无错误 |
| Playwright 探针 (worktree :3002) | ✅ 6/6 全过 | 见 §4 |

---

## 4. Playwright 端到端验证

| 探针 | 修复前 (main) | 修复后 (worktree) |
| --- | :---: | :---: |
| 访问 `/admin/articles/cmq7f2na60000oig6vigpzqll`（cuid）| 空表单 + 「文章不存在」红条 | **标题预填 "蓝辉轻改品牌官网正式上线"** ✅ |
| `GET /api/articles/cmq7f2na60000oig6vigpzqll` | 404 | **200 + data** ✅ |
| 访问 `/admin/articles/brand-website-launch`（slug）| 标题预填 | **标题预填** ✅ |
| `GET /api/articles/brand-website-launch` | 200 + data | **200 + data** ✅ |
| cuid 错误条不显示 | 显示 | **不显示** ✅ |
| 编辑页 7 个字段（标题/Slug/摘要/内容/分类/标签/状态）预填 | 0/7 | **7/7** ✅ |

**全 6 探针通过**。Bug 完全修复，slug 路径无 regression。

截图证据：
- `/tmp/articles-edit-404-screenshots/01-edit-by-cuid.png` — 修复后：所有字段预填，零错误条

---

## 5. 新增单元测试（4 个，全在 `src/app/api/articles/[id]/route.test.ts`）

| # | 测试 | 描述 |
| --- | --- | --- |
| 1 | `[回归] 真实格式 cuid (cm 前缀) → 200 + data.id 匹配` | 用真实 DB cuid `cmq7f2na60000oig6vigpzqll` 验证 id 分支命中 |
| 2 | `[回归] slug 格式 id (不以 cl/cm 开头) → 200 + author 关联` | 用 `brand-website-launch` 验证 slug 分支命中 |
| 3 | `不存在的 id (任意格式) → 404 + 文章不存在` | 用 `cmghost00000000000000000` 验证 null 路径 |
| 4 | `[OR 验证] 真实 cuid 调用 findFirst 时 where 为 OR 数组` | 间谍 `findFirst`，断言 `where: { OR: [{id}, {slug: id}] }` 形状正确 |

`route.test.ts` 总数：18 原有 + 4 新增 = 22，全通过。2 个原有 GET 断言的 where 形状从 `isCuid` 分支断言更新为 OR 断言（保留测试意图和语义覆盖）。

---

## 6. 改动文件

```
commit b02d90a — fix(articles): OR-based id-or-slug lookup in GET /api/articles/[id]
commit 6e9b11c — merge

src/app/api/articles/[id]/route.ts        M  +4/-2
src/app/api/articles/[id]/route.test.ts   M  +84
```

2 个文件，+88/-2。

---

## 7. Bug 报告

| 严重度 | 数量 |
| --- | --- |
| P0 阻断 | 0 |
| P1 严重 | 0 |
| P2 一般 | 0 |
| P3 轻微 | 0 |

---

## 8. 签字

**门禁 3：通过。** 0 P0/P1/P2/P3，162/162 测试通过，build 成功，Playwright 端到端 6 探针全过。

**用户操作**：
1. dev server HMR 自动 pick，无需重启
2. 访问 `/admin/articles`，点击任意文章的「编辑」
3. 7 个字段（标题/Slug/摘要/内容/分类/标签/状态/置顶）全部正确预填

---

## 9. 后续工单

| 优先级 | 工单 | 描述 |
| --- | --- | --- |
| P2 | `[id]/page.tsx` error 时不渲染空表单 | 当前错误时仍渲染空表单+错误条；应改为「错误条 + 返回链接」独占视图 |
| P2 | 审计其他 admin 路由是否也有 cuid 检测反模式 | `src/app/api/stores/[id]/route.ts` 等是否用类似 `startsWith("cl")` 检测需审计 |
| P3 | 统一 `src/lib/cuid.ts` 校验辅助 | 集中管理 cuid 正则 + 测试，跨路由复用 |

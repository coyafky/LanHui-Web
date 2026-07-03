# PRD Required Sections

> 所有新增或重写 PRD 都必须覆盖本文件中的 7 个核心章节。各业务模板可以扩展，但不能省略这些内容。
>
> 最后更新: 2026-06-26

---

## 1. 背景

- 当前问题是什么。
- 谁遇到了这个问题。
- 为什么现在要处理。
- 关联的历史文档、截图、bug、用户反馈。

---

## 2. 目标

- 用户目标:
- 业务目标:
- 工程目标:
- 可量化结果:

---

## 3. 非目标

明确本次不做什么，例如:

- 不新增数据库字段。
- 不调整 SEO 文案。
- 不改 admin 权限模型。
- 不引入新依赖。
- 不处理历史数据清洗。

---

## 4. 修改范围

| 类型 | 范围 |
|---|---|
| 页面 | `src/app/...` |
| 组件 | `src/components/...` |
| 数据 | `src/lib/...` / `prisma/schema.prisma` |
| API | `src/app/api/.../route.ts` |
| 资产 | `public/...` |
| 文档 | `docs/...` |

---

## 5. 验收标准

验收标准必须可验证、可勾选:

- [ ] 用户可以完成某个关键动作。
- [ ] 某个状态下显示明确 UI。
- [ ] 某个 API 返回统一 `{ success, data?, error?, details? }`。
- [ ] 移动端 390px 无横向滚动、文字不重叠。
- [ ] 图片从 `public/` 加载，无本地绝对路径。

避免写:

- “体验更好”
- “页面更高级”
- “性能优化”

---

## 6. 验证命令

按任务类型列出必要命令:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:e2e
```

局部验证示例:

```bash
npx vitest run src/app/api/stores/route.test.ts
npx playwright test e2e/admin-store-status.spec.ts
```

涉及 UI 时必须写浏览器检查:

- 390px mobile
- 768px tablet
- 1440px desktop

---

## 7. 风险边界

至少检查:

- Auth / role / session 风险。
- Prisma migration / seed / rollback 风险。
- Build without Postgres 风险。
- 内容真实性风险: 价格、证书、官方合作、地址电话。
- 图片资产风险: 缺图、比例漂移、本地绝对路径。
- SEO / analytics 风险。
- 已知 pre-existing 问题。

---

## 推荐嵌入方式

在任意 PRD 模板中加入:

```markdown
## 背景

## 目标

## 非目标

## 修改范围

## 验收标准

## 验证命令

## 风险边界
```

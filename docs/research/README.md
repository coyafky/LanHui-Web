# Research Docs

> `docs/research/` 用于沉淀技术研究、概念解释和外部资料摘取后的项目化结论。
>
> 最后更新: 2026-06-26

---

## 适用内容

- Next.js 16 / React 19 的项目内用法解释。
- Prisma 7 driver adapter、迁移、错误形状、seed、数据运维说明。
- NextAuth v5、Zod、Playwright、Vitest、Tailwind v4、Base UI 等技术说明。
- 从 `.qoder/repowiki/` 摘取后重新整理的项目知识。

---

## 不放这里

- 单次实现计划: 放 `docs/plans/`。
- 单次测试结果: 放 `docs/test-reports/`。
- 页面美观性评分: 放 `docs/design-reviews/`。
- 当天流水账: 放 `docs/daily/YYYY-MM-DD/`。
- 产品需求: 放 `docs/PRD/`。

---

## qoder 内容摘取规则

来源目录:

- `.qoder/repowiki/zh/content/项目概述.md`
- `.qoder/repowiki/zh/content/快速开始.md`

摘取时必须:

1. 只保留对当前 LANHUI 项目仍准确的内容。
2. 修正过时信息，例如 shadcn/ui 当前使用 Base UI primitives，不是 Radix。
3. 将泛化模板表述改写成蓝辉项目语境。
4. 标注来源文件和摘取日期。
5. 不把 qoder 原文大段复制到正式研究报告。

---

## 推荐模板

```markdown
# [Topic] Research — YYYY-MM-DD

## 结论

## 项目适用范围

## 背景知识

## 当前代码对应位置

## 风险和误用

## 验证方式

## 来源
```

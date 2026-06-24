---
description: Apply Vercel React/Next.js performance rules to LANHUI code — code review, refactoring, or implementation with 70 prioritized rules
---

# /react-best-practices — Vercel React 性能准则

Use this command to apply the official **Vercel React Best Practices** (70 rules, 8 categories) to LANHUI code. The skill ships with 70 individual rule files in `rules/` for targeted lookups, plus `AGENTS.md` (108 KB) for full reference.

## 适用场景

- **Code review**: 检查现有 React/Next.js 代码是否有 waterfall、bundle bloat、unnecessary re-render
- **Refactor**: 重构一个组件或页面以应用 Vercel 推荐模式
- **新功能实现**: 写新组件时,边写边对齐 Vercel 准则
- **性能审计**: 找出 Lighthouse 分数低的具体代码原因

## 不适用场景

- 纯后端 / API / DB 工作 → 用 `/dispatch` 配合 `prisma-data-ops`
- 视觉设计 → 用 `/web-design-engineer`
- 通用代码风格 → 用 `/review` 五维
- 品牌/UI 一致性 → 用 `ui-ux-pro-max`(dispatch 阶段 3 触发)

## 8 大类规则(按优先级)

| # | 类别 | 优先级 | 关键影响 |
|---|------|--------|----------|
| 1 | `async-` Eliminating Waterfalls | CRITICAL | 串行→并行 fetch,可砍 50%+ LCP |
| 2 | `bundle-` Bundle Size | CRITICAL | barrel imports / 动态 import / 预加载 |
| 3 | `server-` Server-Side Performance | HIGH | RSC + cache + parallel fetching |
| 4 | `client-` Client-Side Data Fetching | MEDIUM-HIGH | SWR dedup / event listener 优化 |
| 5 | `rerender-` Re-render Optimization | MEDIUM | memo / useRef / transitions |
| 6 | `rendering-` Rendering Patterns | MEDIUM | conditional / content-visibility |
| 7 | `js-` JavaScript Performance | LOW | 微优化(cache / hoist / early exit) |
| 8 | `advanced-` Advanced Patterns | LOW | 边缘 case(event handler refs / latest) |

## 工作流

1. **理解目标**: 用户说"优化 X"或"检查 Y"时,先确定优化对象(component / page / route / fetch chain)
2. **定位相关规则**: 在 `rules/` 目录下用前缀匹配(如 `async-`, `bundle-`, `client-`)
3. **读完整规则**: 读取目标规则文件,每个文件含 "incorrect vs correct" 对比 + 影响说明
4. **应用规则**: 给出改写后的代码片段,保留项目约定(2-space / 命名导出 / TypeScript strict)
5. **验证**: `npx tsc --noEmit` + `npm run build`,对照前后性能指标

## 常用入口

```bash
# 列出所有规则
ls .claude/skills/react-best-practices/rules/

# 按前缀过滤
ls .claude/skills/react-best-practices/rules/ | grep "^async-"
ls .claude/skills/react-best-practices/rules/ | grep "^bundle-"
ls .claude/skills/react-best-practices/rules/ | grep "^client-"

# 读单条规则
cat .claude/skills/react-best-practices/rules/async-suspense-boundaries.md
```

## 与 LANHUI 项目的契合度

| 项目特征 | Vercel 规则对位 |
|---------|-----------------|
| Next.js 16 App Router | `server-parallel-fetching` + `server-cache-react` + `async-suspense-boundaries` |
| shadcn/ui (Base UI) | `bundle-barrel-imports`(按需导入单组件) |
| 大量 public 数据 + 客户端埋点 | `client-swr-dedup` + `client-event-listeners` |
| 主题页(zeekr / wenjie / xiaomi) | `bundle-dynamic-imports`(大产品图按需加载) |
| 管理后台表格 + 筛选 | `rerender-memo` + `rerender-defer-reads` + `client-localstorage-schema` |

## 已知基线

- `npm run lighthouse:run` mobile 性能中位数 76 / desktop 86(2026-06-19 audit)
- 11 个路由 < 80 分 → 大概率命中 `async-` + `bundle-` 类规则
- LCP 最高 6.6s(`/product/flooring`)→ 优先排查 waterfall + image 加载

## 注意

- **不要盲目应用所有 70 条** — 多数项目只能用上 5-10 条
- **先测后改** — 改前后跑 `lighthouse:run` 对比,确认实际效果
- **与项目约定不冲突优先** — Vercel 规则是性能导向,LANHUI 还有 TS strict + 命名导出 + 2-space 等约定,优先满足项目约定

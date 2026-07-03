---
description: Optimize a LANHUI page visually — produces standalone HTML/CSS/React prototypes or design critiques for visual exploration before porting to Next.js
---

# /web-design-engineer — LANHUI 页面优化

Use this command to **explore visual improvements** for a LANHUI page before committing changes to the Next.js codebase. The skill produces standalone HTML/CSS/JS artifacts that you preview in a browser, then port the winning direction into `src/` via `/build`.

## 适用场景

- 重新设计或打磨公开站页面（`/`、`/agent`、`/product/*`、`/news`、`/brand/*`）
- A/B 探索同一页面的 2-3 种视觉方向
- 对现有页面跑设计清单 critique
- 构建组件原型（Hero / CTA / 卡片网格）后再接入 Next.js
- 给 admin 后台做视觉一致性升级（`/admin/*`）

## 不适用场景

- 纯 Next.js 实现工作 → 用 `/build`(需有 approved PRD)
- 后端 / API / DB 变更 → 用 `/dispatch`
- 跑中的站点做性能 / a11y 审计 → 用现有 `npm run lighthouse:run` + Playwright

## 工作流

按 web-design-engineer skill 的 6 步走(详见 `.claude/skills/web-design-engineer/SKILL.md`):

1. **Step 0 Verify Facts** — 任何品牌相关工作,通过 WebSearch 核实品牌事实,不要编造
2. **Step 1 Understand Requirements** — 澄清范围、产出类型、目标设备、断点
3. **Step 2 Gather Design Context** — 读取目标 route + 相关组件 + `src/lib/brand.ts` + `tailwind.config.ts` + `src/app/globals.css`
4. **Step 3 Declare Design System** — 复述 LANHUI tokens(zinc-950/900/800 + orange-500/400 + blue-400 + OKLCH)
5. **Step 4 v0 Draft** — 给出 3 个差异化方向(读 `references/design-directions.md` 选 school,**禁止同 school 3 个**)
6. **Step 5 Full Build** — 输出独立 HTML/CSS/React 原型到 `/tmp/wde-artifacts/<page>-v<N>.html`(**不写到 `src/`**)
7. **Step 6 Verification** — 走 pre-delivery checklist
8. **Step 7 Critique** — 按 `references/critique-guide.md` 打分

## LANHUI 特定约束

- **品牌**:logo 用 `public/images/logo/` 实物,不写 CSS 占位色块
- **真实素材**:车身 / 车型 / 证书图必须用 `public/images/` 已有图,不用 CSS silhouette
- **暗色主题**:shadcn/ui Base UI primitives + Tailwind v4,oklch,不要降级到 hex hardcode
- **响应式断点**:mobile-first,390 / 768 / 1440px 三档必测
- **文案**:核心 slogan 从 `src/lib/brand.ts` 拉,不要编造
- **a11y**:对比度 ≥ 4.5:1,focus 状态可见,button 44×44px+

## 输出

- 一个或多个独立 HTML 文件放在 `/tmp/wde-artifacts/`
- 一份简短的 critique 报告(分数 + 问题 + 下一步建议)
- 如用户确认采用某个方向,路由到 `/build` 生成精确 PRD 后落地 Next.js

## 停止条件

以下情况停下问用户:

- 品牌事实不清楚(logo / 电话 / ICP / 地址)— 永远不要编造
- 目标页面无 PRD — 先提议一份再设计
- 用户想跳过 Step 4 的 3 方向对比 — 确认是否要单刀直入
- skill 输出引用了真实产品图 — 必须先 fetch 真实素材

## References

- Skill workflow: `.claude/skills/web-design-engineer/SKILL.md`
- Direction taxonomy: `.claude/skills/web-design-engineer/references/design-directions.md`
- Style recipes (25 named anchors): `.claude/skills/web-design-engineer/references/style-recipes/INDEX.md`
- Advanced patterns (Tweaks panel / device frames / dark mode / oklch): `.claude/skills/web-design-engineer/references/advanced-patterns.md`
- Critique rubrics: `.claude/skills/web-design-engineer/references/critique-guide.md`
- Upstream: https://github.com/ConardLi/garden-skills/tree/main/skills/web-design-engineer (v1.2.2)

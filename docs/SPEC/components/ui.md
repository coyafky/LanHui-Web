# SPEC: 基础 UI 组件

> 实现状态：✅ **完成**

---

## 1. 职责范围

shadcn/ui Base UI 基础组件层。所有页面级组件的基础构建块。

## 2. 组件清单

| 组件 | 文件 | Client? | 说明 |
|------|------|---------|------|
| Badge | `src/components/ui/badge.tsx` | 否 | 6 variant（default/secondary/destructive/outline/ghost/link） |
| Button | `src/components/ui/button.tsx` | 是 | CVA 变体管理 |
| Card | `src/components/ui/card.tsx` | 否 | 7 子组件（Card/CardHeader/CardFooter/CardTitle/CardAction/CardDescription/CardContent） |
| Carousel | `src/components/ui/carousel.tsx` | 是 | Embla 封装（CarouselContent/Item/Previous/Next） |
| Table | `src/components/ui/table.tsx` | 是 | 8 子组件（Table/Header/Body/Footer/Head/Row/Cell/Caption） |

## 3. 实现方式

基于 `@shadcn/ui`（base-nova），非 Radix。使用 Base UI 的 `useRender` 和 `useTheme`。

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | shadcn/ui base-nova 基础组件集成（Button/Card/Badge/Table/Carousel） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

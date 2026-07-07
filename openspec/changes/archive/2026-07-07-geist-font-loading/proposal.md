# Proposal: Geist 字体加载

## Why

`globals.css` 声明 `--font-sans: "Geist"`，但 `layout.tsx` 从未通过 `next/font` 加载字体文件。全站实际渲染为系统默认字体，Geist 声明形同虚设。

## What

在 `layout.tsx` 中用 `next/font/google` 加载 `Geist` + `Geist_Mono`，通过 CSS variable 注入 Tailwind v4 主题。

## Impact

- 修改文件：1 个（`src/app/layout.tsx`）
- 不引入新依赖（`next/font/google` 内置于 Next.js）
- 不改 `globals.css`

# Brainstorm Summary

- Change: unify-product-header-footer
- Date: 2026-07-08

## 确认的技术方案

1. 新增 `src/app/product/layout.tsx` (Server Component, `{children}` 外包裹 `<Header/>` + `<Footer/>`)
2. 44 个 page.tsx 删除 Header/Footer import + JSX
3. `ProductDetail.tsx` 移除 Header/Footer（保留 `<main>`）
4. `FilmPageHero.tsx` 移除 Header
5. 检查脚本 `check-product-layout.mjs` 防止回归

## 关键取舍与风险

- Header/Footer 均为纯 `<Header />` / `<Footer />` 无传参，无兼容风险
- `<main id="main-content">` 继续由各页面负责，layout 不补 main
- window-film/[packageSlug] 原有 Header 无 Footer bug 自动修复

## 测试策略

- 检查脚本（grep 扫描）替代手动测试
- `npm run build` 验证编译
- Playwright 抽查 5 个关键页面无双 Header/Footer

## Spec Patch

无 — 不需要新增 delta spec。

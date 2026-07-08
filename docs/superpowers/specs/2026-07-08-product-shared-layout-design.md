---
comet_change: unify-product-header-footer
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-08-unify-product-header-footer
status: final
---

# 产品路由共享布局 — 技术设计

## 架构

```
src/app/layout.tsx                    ← root layout (不改)
  └─ src/app/product/layout.tsx      ← NEW: <Header/> + {children} + <Footer/>
        ├─ page.tsx                   ← 移除 Header/Footer
        └─ **/page.tsx                ← 移除 Header/Footer
```

## 组件

### ProductLayout (`src/app/product/layout.tsx`)

Server Component。无 props。渲染：

```tsx
<Header />
{children}
<Footer />
```

不加 `<main>`，不引入额外 wrapper。

### 共享组件改造

- `ProductDetail.tsx`：删除 `Header`/`Footer` import + JSX，保留内部 `<main>` 和业务内容
- `FilmPageHero.tsx`：删除 `Header` import + JSX

### 检查脚本 (`scripts/check-product-layout.mjs`)

扫描规则：
1. `src/app/product/layout.tsx` 存在
2. `src/app/product/**/page.tsx` 无 Header/Footer
3. `src/components/ProductDetail.tsx` 无 Header/Footer
4. `src/components/film/FilmPageHero.tsx` 无 Header

任一项违反 exit 1。接入 `npm run check` 链。

## 风险

- 所有 44 个页面都是纯 `<Header />` / `<Footer />` 无传参，迁移无兼容风险
- 检查脚本防止双 Header/Footer 回归

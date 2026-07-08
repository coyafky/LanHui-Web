# Design: unify-product-header-footer

## 架构决策

### 方案：App Router 嵌套 layout.tsx

```
src/app/layout.tsx          ← root layout (不改)
  └─ src/app/product/layout.tsx  ← NEW: <Header/> + {children} + <Footer/>
        ├─ page.tsx              ← 产品中心首页 (移除 Header/Footer)
        ├─ zeekr/page.tsx        ← 品牌页 (移除 Header/Footer)
        ├─ zeekr/9x/page.tsx     ← 车型页 (移除 Header/Footer)
        └─ ...
```

Next.js App Router 的嵌套 layout 天然支持路由段共享包裹，无需引入额外 wrapper 或 context。

### 共享组件改造

- `ProductDetail.tsx`：移除内部 Header/Footer，保留 `<main>` 和业务内容
- `FilmPageHero.tsx`：移除内部 `<Header />`，组件只返回 Hero section
- `WindowFilmPackageDetail.tsx`：只含 `<main>`，无需改动

### 检查脚本

扫描 `src/app/product/**/page.tsx`，确保没有 import 或渲染 Header/Footer。同时检查共享组件。接入 `npm run check` 链。

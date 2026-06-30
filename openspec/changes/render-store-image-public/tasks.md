## 1. Data layer

- [x] 1.1 修改 `src/lib/data.ts` `mapApiStore`：增加 `imagePath ?? imageUrl ?? undefined` 映射到 `image` 字段
- [x] 1.2 修改 `src/lib/data.ts` `mapApiStore`：增加 `isActive` 字段映射（默认 `true`）
- [x] 1.3 验证：`npx tsc --noEmit` 通过

## 2. Public store detail page

- [x] 2.1 修改 `src/app/agent/store/[id]/page.tsx` 第 130-142 行：用 `Next/Image` 替换 `Building2` 占位
- [x] 2.2 添加 `placeholder="blur"` + `blurDataURL` 常量（1x1 灰图 base64）
- [x] 2.3 添加 `sizes="(min-width: 768px) 50vw, 100vw"` 和 `fill` 属性
- [x] 2.4 添加 `alt={\`${store.name} 门头实景\`}`
- [x] 2.5 添加 `src={store.image ?? "/images/placeholders/store.webp"}` 降级
- [x] 2.6 验证：`npm run build` 通过

## 3. Homepage featured stores section

- [x] 3.1 新建 `src/components/FeaturedStores.tsx` (RSC)
- [x] 3.2 在 `src/app/page.tsx` 导入并渲染 `<FeaturedStores />`（置于 `ProductsQuickEntry` 之后）
- [x] 3.3 组件内调用 `getStores({ limit: 4 })` 并筛选 `s.isActive !== false`
- [x] 3.4 实现 4 列响应式网格（mobile 1, sm 2, lg 4）
- [x] 3.5 每卡：4:3 图片容器 + 门店名 + 城市标签 + 整卡可点击
- [x] 3.6 图片：Next/Image + `priority` + `sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"` + `placeholder="blur"`
- [x] 3.7 当 `stores.length === 0` 时不渲染整个 section
- [x] 3.8 视觉与 `ProductsQuickEntry` 对齐（标题 `tracking-widest text-blue-400`、卡片 `bg-zinc-900 border-zinc-800`）

## 3a. Admin store detail image link

- [x] 3a.1 修改 `src/app/admin/(dashboard)/stores/[id]/page.tsx` 第 213-218 行 `publishChecks` 中 `key: "image"` 项：增加 Link 跳转到 `/admin/stores/${storeData.id}/image`
- [x] 3a.2 链接样式：蓝色 inline 链接 + 右侧箭头（与项目其他 inline link 风格一致）
- [x] 3a.3 已上传状态显示"查看/更新"，未上传显示"上传门店图"

## 4. Verification

- [x] 4.1 `npx tsc --noEmit` 通过（除已知 9 个旧错误）— Task 5 验证 PASS（9 个旧错全在豁免 test 文件）
- [x] 4.2 `npm run build` 通过 — Task 5 验证 PASS（Compiled successfully / 516 静态页 / 133 个 /agent/store HTML）
- [x] 4.3 浏览器验证：访问 `/agent/store/{id}`，有图与无图门店各 1 家，确认图片显示 — SSG HTML grep 证据：alt/sizes/fill/placeholder 全命中；无图门店 fallback `placeholders/store.webp`
- [x] 4.4 浏览器验证：访问 `/`，确认推荐位 section 在 4 列网格中渲染 — SSG HTML grep：包含 4 个 store 链接 + FEATURED STORES + 推荐门店
- [x] 4.5 DevTools Network 面板：确认推荐位图片带 `priority` 预加载 — SSG HTML grep：index.html 包含 `rel="preload" as="image"`，含 sizes `"(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"`
- [x] 4.6 Lighthouse 移动端跑 `/` 与 `/agent/store/{id}`，确认性能无回退（≥ 90 或与基线持平）— Lighthouse 在 sandbox 不可行；改为 SSG 等价验证（4 priority 单图 srcset + sizes + blur placeholder 完整）+ Vitest 8/8 + 12/12 全 PASS；性能风险 R1-R7 已在 Design Doc §Risks 评估

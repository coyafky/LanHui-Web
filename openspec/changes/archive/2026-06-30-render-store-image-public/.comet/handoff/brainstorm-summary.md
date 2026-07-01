# Brainstorm Summary

- Change: render-store-image-public
- Date: 2026-06-30
- Phase: design (active brainstorming)

## 已确认事实（来源：proposal / design / spec / 用户对话）

### 目标
1. 公开详情页 `/agent/store/[id]` 显示已上传的 `Store.imagePath`（替代 `Building2` 占位符）
2. 首页新增「推荐门店」section，曝光 `isActive=true` 的门店
3. Admin 门店详情页加跳转链接到 `/admin/stores/[id]/image`（闭环 admin UX）

### 范围边界（Non-Goals）
- 不改 schema（`imagePath`/`imageUrl` 双字段已存在）
- 不改 admin 上传链路、`/admin/stores` 列表
- 不在 `/agent` 列表、`/agent/[slug]` 区域页、`/agent/[slug]/[city]` 城市页展示门店图
- 不在推荐位用地理位置排序

### 关键技术决策（design.md D1-D6）
- D1: `mapApiStore`: `image: raw.imagePath ?? raw.imageUrl ?? undefined`
- D2: 详情页 `Next/Image` + `placeholder="blur"` + `sizes="(min-width: 768px) 50vw, 100vw"` + `fill`
- D3: `<FeaturedStores />` RSC，4 张，`isActive !== false` 守卫
- D4: 推荐位 `priority` 预加载
- D5: 视觉对齐 `ProductsQuickEntry`（`bg-zinc-900 border-zinc-800` 卡片、`tracking-widest text-blue-400` 标题）
- D6: Admin 跳转链接置于 `publishChecks` 中 `key: "image"` 项旁

### Spec 验收场景（5 REQUIREMENT, 13 SCENARIO）
1. Store image data mapping — imagePath 优先 / imageUrl 回退 / undefined 兜底
2. Public store detail page image rendering — 有图/无图/sizes
3. Homepage featured stores section — active=4 张 / 无 active 不渲染 / 无图 fallback / priority
4. Image SEO attributes — alt=`"<store.name> 门头实景"` / 不设 width+height / 必须 sizes
5. Admin store image management entry point — 链接可见 / 无图显示「上传」/ 有图显示「管理」

### 既有约束（项目环境）
- Next.js 16.2.1 + React 19 + TS strict
- Tailwind v4 暗色主题（zinc-950/900/800 + blue-400 accent）
- 主题页已有 `Next/Image + sizes + object-contain + aspect-[4/3]` 视觉规范
- 静态 fallback：`src/lib/data.ts` API 优先、失败 fallback 静态 `src/lib/store.ts`
- ISR revalidate=3600s，admin 上传后最多 1 小时延迟（接受）

## 待确认项（候选，需澄清）

### Q1. FeaturedStores card 内容深度（**待用户确认**）
候选 A（最小）：图片 + 门店名 + 城市徽标
候选 B（中等）：图片 + 门店名 + 城市 + 简短地址（1 行截断）
候选 C（丰富）：图片 + 门店名 + 城市 + 地址 + 营业时间标记 + 距离参考（占位）
**推荐 A** —— 与 `ProductsQuickEntry` 信息密度对齐，避免与详情页重复

### Q2. Section title 文案（**待用户确认**）
候选 A：推荐门店
候选 B：精选门店
候选 C：线下门店
候选 D：我们的门店
**推荐 A（推荐门店）** —— 与「`isActive=true` 筛选 + 4 张限量曝光」语义最匹配

### Q3. 详情页图无图时的视觉降级（**候选**）
候选 A：`/images/placeholders/store.webp` + 文案「门店图片即将上线」（两段式占位）
候选 B：仅 `placeholders/store.webp`，无文案（与设计 D2 一致）
**推荐 B** —— 单一 fallback 图，避免引入新文案分支

## 候选方案（如需切换策略）

### Plan A：纯前端修复（推荐）
- 仅修改前端代码（`mapApiStore` + 详情页 + 首页 + admin 链接）
- 不动 schema、API、middleware
- 估算工作量：4 文件 + 1 新组件
- 风险等级：低（向后兼容，已映射 `imageUrl` 回退）

### Plan B：扩展 admin 上传元数据
- 在 `/admin/stores/[id]/image` 加 alt 文本输入、拍摄时间字段
- 涉及 schema 变更 + API 改造
- **拒绝** —— 越出当前 scope，运营需求未确认

### Plan C：批量导入存量门店图
- 提供批量上传/链接 CLI
- **拒绝** —— 非当前任务；admin 已有单店上传链路

## 测试策略

### 自动化
1. `npx tsc --noEmit` —— 验证类型（已知 9 个 test 旧错不计）
2. `npm run build` —— 验证 SSG 构建不破
3. 单元测试：
   - `mapApiStore` 三个场景（imagePath only / imageUrl only / 双 null）
   - `<FeaturedStores />` empty/4-张/无 active 守卫

### 浏览器验证
- `/agent/store/{有图门店}` 渲染 `Next/Image`，无破图
- `/agent/store/{无图门店}` 渲染 `placeholders/store.webp`
- `/` 推荐位 4 列网格，`priority` 标签出现在 Network
- `/admin/stores/{id}` 显示「管理主图」链接，点击跳转到 `/admin/stores/{id}/image`

### 视觉验证（对齐 `ProductsQuickEntry`）
- 标题 `tracking-widest text-blue-400` + 灰白副标题
- 卡片 `bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700`
- 移动 1 列 / sm 2 列 / lg 4 列响应式

## 风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| R1: 首页 4 张 priority 图可能拖慢 LCP | 低 | webp q80 + Next/Image 自动 srcset，单图 < 100KB |
| R2: `Store` 表全 `isActive=false` | 中 | 守卫 `stores.length === 0` 不渲染整个 section |
| R3: `getStores` API 当前不返回 `isActive` | 中 | `mapApiStore` 补字段，前端 `isActive !== false` 默认 true |
| R4: ISR revalidate 时延 | 低 | admin 已知 1 小时延迟；Cloudflare purge 可手动 |
| R5: 历史 `imageUrl` 数据缺失 | 低 | 映射优先级 `imagePath ?? imageUrl` 兼容 |

## Spec Patch 候选

无 —— 当前 proposal/spec 已覆盖所有验收场景；如 Q1/Q2 答案变更可回写。

## 下一步

1. **澄清 Q1 / Q2**（影响最终 UI 文案与信息密度）
2. 用户确认设计方案后，写入 Design Doc
3. Spec self-check + 用户审查
4. 调用 `writing-plans` 进入 build 阶段
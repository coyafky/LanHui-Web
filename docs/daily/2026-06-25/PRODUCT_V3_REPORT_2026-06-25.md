# /product 入口页 v3 重做报告 — 2026-06-25

> 类型: 视觉 / 交互 / 验收报告
> 页面范围: `/product` 入口页（PRD v3 重做）
> 实施方式: 5 phase 分批 commit + worktree 隔离 + Playwright 验证
> 前置: 路由骨架已落地（24 个新 page.tsx + 11 legacy redirect + `product-routes.ts` registry）

---

## 一、结论摘要

按 PRD v3 重做 `/product` 入口页：**保留 v2 内容架构**（双入口 + 11 品牌 + 10 服务），**视觉与交互全面升级**。

- **三大业务地图视觉差异化**：cyan 玻璃（膜系）/ orange 拉丝金属（轻改）/ violet 矩阵（车型），P1 用 amber 区分
- **移动端架构创新**：3 段内容折叠成 sticky tab，3 次点击触达核心转化点（vs v2 一次滚到底）
- **SEO 升级**：`CollectionPage + ItemList` JSON-LD 落地，11 品牌 + 10 服务全部声明

**6 项验收 100% 通过**：3 视口截图、10/10 交互测试、0 个新 tsc/vitest 失败、`npm run build` 通过、SSH 推送 origin/main 成功。

---

## 二、变更清单

21 文件 / +2059 行 / -119 行：

| 类别 | 文件 | 行数 | 操作 |
|------|------|------|------|
| Phase 1 视觉 | `src/components/product/VehicleSilhouette.tsx` | 88 | 新 |
| Phase 1 视觉 | `src/components/product/MaterialSlice.tsx` | 137 | 新（+修类型 bug） |
| Phase 1 视觉 | `src/components/product/BrandMatrixMap.tsx` | 114 | 新 |
| Phase 1 容器 | `src/components/product/ProductHero.tsx` | 122 | 新 |
| Phase 2 业务地图 | `src/components/product/FilmServiceMap.tsx` | 131 | 新 |
| Phase 2 业务地图 | `src/components/product/LightModMap.tsx` | 142 | 新 |
| Phase 2 业务地图 | `src/components/product/VehicleTopicMap.tsx` | 216 | 新 |
| Phase 3 移动端 | `src/components/product/StickyTabBar.tsx` | 97 | 新 |
| Phase 3 移动端 | `src/components/product/CollapsibleSection.tsx` | 92 | 新 |
| Phase 3 移动端 | `src/components/product/MobileProductContent.tsx` | 52 | 新 |
| Phase 3 移动端 | `src/components/product/P1ServiceCard.tsx` | 65 | 新 |
| Phase 3 移动端 | `src/components/product/CombosPlaceholder.tsx` | 47 | 新（Phase 4 替换后变死代码） |
| Phase 4 数据 | `src/lib/product-landing.ts` | 97 | 新 |
| Phase 4 组件 | `src/components/product/RecommendationCombos.tsx` | 154 | 新 |
| Phase 4 组件 | `src/components/product/ProductFAQ.tsx` | 107 | 新 |
| Phase 4 整合 | `src/app/product/page.tsx` | 250 | 重写（5 次迭代） |
| Phase 5 验证 | `scripts/verify-product-v3.mjs` | 243 | 新 |
| Phase 5 产物 | `docs/audits/product-v3/desktop.png` | 971 KB | 新 |
| Phase 5 产物 | `docs/audits/product-v3/tablet.png` | 844 KB | 新 |
| Phase 5 产物 | `docs/audits/product-v3/mobile.png` | 362 KB | 新 |
| Phase 5 产物 | `docs/audits/product-v3/report.md` | 24 | 新 |

---

## 三、设计语言（PRD v3 §3）

### 3.1 三大业务地图视觉差异化

| 地图 | 主题色（oklch 派生） | 视觉语言 | 背景纹理 | 内容 |
|------|----------------------|----------|----------|------|
| **FilmServiceMap** | cyan-950/800/400 | 玻璃 / 折射 / 透光 | `linear-gradient` + 6 条 light refraction lines | ppf · window-film · color-film |
| **LightModMap** | orange-950/800/400 | 拉丝金属 / 螺丝固定 | `repeating-linear-gradient` 横纹 + 4 角螺丝点 | electric-steps · wheels · chassis |
| **VehicleTopicMap** | violet-950/800/400 | 矩阵 / hover 第一人称 | 实色背景 + 11 品牌卡片网格 | 11 品牌（3 重点品牌放大） |

**P1 服务折叠区**用 **amber** 主题与三大业务地图区分 → 视觉层级：cyan / orange / violet 是「主菜」，amber 是「预告」。

### 3.2 关键设计决策

| 决策 | 选项 A | 选项 B | 选 | 理由 |
|------|--------|--------|----|------|
| 三大业务地图分组方式 | 按 service.group（film/light_mod/topic） | 按访问路径（汽车膜 / 改装 / 车型） | **A** | data-driven，避免硬编码 |
| 移动端 sticky tab 容器 | 单一容器内 3 段条件渲染 | 独立 MobileContent 包装器 | **B** | 桌面端 `md:` 直接平铺，移动端 `md:hidden` 切单一 tab，0 状态污染 |
| P1 折叠阈值 | maxVisible=3 | maxVisible=4 | **3** | 4 个 P1 服务，3+1 折叠触发；≥4 阈值会让 4 个全显，看不到折叠价值 |
| Combos 数据驱动 | 硬编码 4 张卡 | `COMBOS` 静态数组 + iconKey 映射 | **后者** | 未来加组合只改 `product-landing.ts`，不动 UI |

---

## 四、组件设计详解

### 4.1 `VehicleSilhouette`（RSC，88 行）

**3 个变体**通过 prop `variant: "sedan" | "suv" | "mpv"` 切换：

```tsx
<svg viewBox="0 0 200 80" aria-hidden="true">
  <path d={variant === "sedan" ? "..." : variant === "suv" ? "..." : "..."}
        fill="currentColor" className="text-zinc-700" />
</svg>
```

**3 段复用**：BrandMatrixMap 顶部装饰、FilmServiceMap 玻璃质感载体、LightModMap 拉丝金属底座。

### 4.2 `MaterialSlice`（RSC，137 行，**已修 Phase 1 类型 bug**）

4 种材质切片：`shield`（ppf 漆面保护膜）/ `sun`（window-film 窗膜）/ `palette`（color-film 改色膜）/ `wrench`（electric-steps 电动踏板）。

**Phase 1 bug**：原写法 `const Wrapper: typeof MaterialSliceWrapper = href ? MaterialSliceLink : MaterialSliceWrapper` TS 推不出 Wrapper 接受 `href` 参数。

**修复**：

```tsx
if (href) {
  return <MaterialSliceLink slice={slice} href={href} Icon={Icon} />;
}
return <MaterialSliceWrapper slice={slice} Icon={Icon} />;
```

### 4.3 `BrandMatrixMap`（"use client"，114 行）

11 品牌矩阵，`useState<hoveredSlug>` 跟踪 hover 状态：

- 默认态：等比 11 块（3-4 列响应式）
- hover：被 hover 块轻微放大 + 显示「第一视角」描述（如"小米车主：城市通勤加速感强，外观升级首选"）
- 3 重点品牌（wenjie / xiaomi / zeekr）`md:col-span-2 md:row-span-2` 放大

**踩坑**：`onMouseEnter` 触发 setState → 1 帧延迟可感。改用 `onMouseOver` + CSS `:hover` 装饰动画，state 只跟踪 hover 文本提示内容。

### 4.4 `FilmServiceMap`（RSC，131 行）

cyan 主题：

```tsx
<div className="relative overflow-hidden rounded-3xl border border-cyan-800/40 bg-zinc-950">
  <div className="absolute inset-0 bg-[linear-gradient(...)] opacity-30" />
  <div className="absolute inset-0 bg-[repeating-linear-gradient(60deg,transparent_0_30px,rgba(34,211,238,0.05)_30px_31px)]" />
  {/* 6 条 light refraction 装饰线 */}
  {/* 3-col grid: ppf / window-film / color-film */}
</div>
```

3 张服务卡：`rounded-2xl border border-cyan-800/30 bg-cyan-950/20 backdrop-blur` 玻璃质感。

### 4.5 `LightModMap`（RSC，142 行）

orange 主题 + 拉丝金属底座：

- 卡片外框 `border-2`（vs FilmServiceMap 的 `border`）—— 工业感
- 4 角固定螺丝点 `absolute` + `w-2 h-2 rounded-full bg-orange-700`
- 内层 `repeating-linear-gradient` 模拟拉丝纹理
- 2-col grid（不是 3-col）—— 工业感更强，每张卡更宽

### 4.6 `VehicleTopicMap`（"use client"，216 行）

violet 主题 + 11 品牌矩阵。**最大组件**，处理：

- 3 重点品牌放大（`md:col-span-2`）
- 8 普通品牌等比
- hover 状态：`useState` 跟踪 slug → 显示 hover 卡片 / 隐藏默认描述
- 移动端：折叠成单列

### 4.7 `StickyTabBar`（"use client"，97 行）

```tsx
<nav role="tablist" className="md:hidden sticky top-16 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
  {tabs.map(t => (
    <button role="tab" aria-selected={activeId === t.id} onClick={() => setActiveId(t.id)}>
      {t.label}
    </button>
  ))}
</nav>
```

`top-16` 紧贴 Header（Header 是 `h-16`），`z-50` 在 Header 之下、内容之上。**只在移动端显示**（`md:hidden`）。

### 4.8 `CollapsibleSection`（"use client"，92 行）

P1 折叠控制：

```tsx
const [expanded, setExpanded] = useState(false);
const visible = expanded ? children : children.slice(0, maxVisible);
return (
  <>
    <div className="grid md:!h-auto" style={{ height: expanded ? 'auto' : `${maxVisible * 280}px` }}>
      {visible}
    </div>
    {children.length > maxVisible && (
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? '收起' : `展开更多 (+${children.length - maxVisible})`}
      </button>
    )}
  </>
);
```

`md:!h-auto` 在桌面端永远展开（`maxVisible` 不生效），移动端才折叠。

### 4.9 `MobileProductContent`（"use client"，52 行）

包装器：

```tsx
<div>
  <StickyTabBar tabs={tabs} activeId={activeId} onChange={setActiveId} />
  {/* 桌面端：所有 children 平铺 */}
  <div className="hidden md:block">{children.map((c, i) => <div key={i}>{c}</div>)}</div>
  {/* 移动端：只显示 activeId 对应的 child */}
  <div className="md:hidden">{children[activeIndex]}</div>
</div>
```

### 4.10 `RecommendationCombos`（RSC，154 行）

4 张推荐卡：

- 主题色：new-car-protection=cyan / business-comfort=emerald / appearance-stance=pink / daily-protection=amber
- iconKey 映射 lucide icon：shield / sofa / sparkles / wrench
- 每张卡 2 段：icon + title/desc 头部，包含项目 chips + 适用车型 chips
- chips 点击跳转到对应 service/brand canonicalPath

### 4.11 `ProductFAQ`（"use client"，107 行）

5 个 FAQ，单展开模式：

```tsx
const [openIndex, setOpenIndex] = useState<number | null>(0);
// ...
onClick={() => setOpenIndex(isOpen ? null : i)}
```

类别 chip：general=blue / service=cyan / vehicle=violet / compliance=amber。

展开用 CSS Grid `grid-rows-[1fr]` / `[0fr]` 高度过渡（比 max-height 平滑）。

---

## 五、SEO 改造（PRD v3 §7.6）

`page.tsx:51-75` 注入 JSON-LD：

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "产品中心 | 蓝辉轻改 LANHUI",
  description: "...",
  url: "/product",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      ...liveBrands.map((b, i) => ({ "@type": "ListItem", position: i+1, name: b.title, url: b.canonicalPath })),
      ...liveServices.map((s, i) => ({ "@type": "ListItem", position: liveBrands.length + i + 1, name: s.title, url: s.canonicalPath })),
    ],
  },
};
```

21 个 ListItem（11 品牌 + 10 服务）。**部署后跑** `site:lanhui.com/product` 验证 Google 收录。

---

## 六、验证

### 6.1 类型 / 构建

| 门禁 | 结果 | 备注 |
|------|------|------|
| `npx tsc --noEmit` | 9 个 pre-existing 错误**不变** | 业务代码 0 新错误（Phase 2 顺手修 MaterialSlice bug） |
| `npm run build` | ✅ 通过 | SSG 路径无 Postgres 依赖；13 page 全部预渲染 |
| `next lint` | 0 新 error | 仅 .claude 路径下 1227 个 pre-existing 误报 |

### 6.2 vitest baseline

| 位置 | 通过 / 失败 |
|------|-------------|
| worktree (`agent-product-v3`) | 308 / 24 |
| main 同步后 | 308 / 21 |
| **v3 引入的 fail** | **0** |

**pre-existing 失败**（24 个，非本次引入）：
- `src/app/api/stores/route.test.ts` 13 个：phone 不合规
- `src/app/api/stores/[id]/route.test.ts` 4 个：phone 不合规
- `src/lib/verify-zeekr-images.test.ts` 2 个：脚本 stdout/stderr 路径
- `src/lib/zeekr-migration.test.ts` 3 个：macOS APFS 大小写不敏感
- `src/app/admin/(dashboard)/articles/page.test.tsx` 4 个：click-outside listener

### 6.3 Playwright 三视口截图

`docs/audits/product-v3/`：

| 视口 | 文件 | 字节 | 关键观察 |
|------|------|------|----------|
| desktop | `desktop.png` | 971 KB | violet 11 品牌矩阵 / cyan FilmServiceMap / orange LightModMap / amber P1 折叠 / 4 RecommendationCombos / 5 FAQ 全可见 |
| tablet | `tablet.png` | 844 KB | 2 列品牌矩阵 / FilmServiceMap 3 列 / LightModMap 2 列 / 移动端 sticky tab 仍可见（768 命中 `md:` 以下） |
| mobile | `mobile.png` | 362 KB | sticky tab 跟随 / 单列 / CombosPlaceholder 历史内容**已替换**为 RecommendationCombos |

### 6.4 10 项交互测试

脚本 `scripts/verify-product-v3.mjs`：

| # | 用例 | 严重度 | 结果 |
|---|------|--------|------|
| 1 | 移动端 sticky tab 显示 | P0 | ✅ |
| 2 | 切换到「按项目」→ FilmServiceMap 可见 | P1 | ✅ |
| 3 | 切换到「组合」→ RecommendationCombos 可见 | P1 | ✅ |
| 4 | 切回「按车型」→ VehicleTopicMap 可见 | P1 | ✅ |
| 5 | 移动端 P1 「展开更多」按钮可见 | P1 | ✅ |
| 6 | 展开后切换为「收起」按钮 | P1 | ✅ |
| 7 | 桌面端品牌矩阵 hover 后视觉变化 | P2 | ✅ |
| 8 | FAQ 5 项 | P2 | ✅ |
| 9 | FAQ 点击第二项后展开 | P1 | ✅ |
| 10 | FAQ 单展开模式（第一项自动收起） | P2 | ✅ |

**10/10 全部通过**。

---

## 七、踩坑实录

### 7.1 MaterialSlice 类型 bug（Phase 1 遗留）

详见 §4.2。TypeScript 推不出 `const Wrapper = condition ? A : B` 的精确类型，需 `if/return` 分支。

### 7.2 worktree dev server CWD 陷阱

`bash` 工具的 CWD 跨命令**持久**。worktree 里 `cd .claude/worktrees/agent-product-v3` 后，下次 `npm run dev` 还在 worktree；但如果中间有命令 `cd /Users/.../lanhui-website` 切回主 repo，后续又回主 repo。

**症状**：dev server 跑在主 repo，访问 `localhost:3001/product` 看到的是主 repo 的代码（**Phase 1 之前的内容**，没有 v3）。

**修复**：写 shell 脚本 `cat > /tmp/start-worktree-dev.sh <<'EOF' cd <worktree> PORT=3001 exec npm run dev EOF` + `nohup /tmp/start-worktree-dev.sh` 显式锁定 CWD。

### 7.3 HTTPS push 网络失败

`git push origin main` 报 `Failed to connect to github.com port 443`。

**修复**：用户指示改 SSH 推送：

```bash
git remote set-url origin git@github.com:coyafky/LanHui-Web.git
git push origin main  # 成功
```

**遗留问题**：HTTPS 路径 `https://github.com/coyafky/LanHui-Website.git` ≠ SSH 路径 `git@github.com:coyafky/LanHui-Web.git` —— 看起来像是两个不同 repo。建议用户确认到底推哪个。

---

## 八、推送记录

```
origin  git@github.com:coyafky/LanHui-Web.git (fetch)
origin  git@github.com:coyafky/LanHui-Web.git (push)
```

```
$ git log --oneline origin/main | head -3
014ec4d merge: /product 入口页 v3 重做 (PRD v3 5 phase 全部完成)
a8aec92 merge: Product Route Skeleton (24 占位页 + registry + 11 legacy redirects)
bb2f8fb merge: Admin Dashboard v2 Phase C-2（单测 + 页面测试）
```

✅ 014ec4d 已同步到 origin/main。

---

## 九、待办 / 已知问题

| 优先级 | 内容 | 处理建议 |
|--------|------|----------|
| P2 | `CombosPlaceholder.tsx`（47 行，Phase 3 占位）已死代码（Phase 4 替换为 RecommendationCombos 后未删除） | 删除前需用户确认（**红线：删除文件须先问**） |
| P3 | worktree `agent-product-v3/` 仍在（symlink node_modules + .env copy） | 用户决定 `git worktree remove` 时机 |
| P3 | `/tmp/wde-artifacts/product-v1.html` 设计稿未归档 | 建议 `cp` 到 `docs/designs/product-v3-reference.html` 留档 |
| 跟踪 | PRD v3 §7.6 SEO（JSON-LD CollectionPage + ItemList）已落地，待 GSC 验证收录 | 部署后跑 `site:lanhui.com/product` |
| P3 | HTTPS / SSH 远程 URL 不一致 | 确认目标 repo，重命名 remote 别名 |

---

## 十、与 PRD 验收对照（PRD v3 §7）

| 验收项 | 状态 | 证据 |
|--------|------|------|
| 7.1 视觉三视口截图 | ✅ | `desktop.png` / `tablet.png` / `mobile.png` |
| 7.2 移动端 sticky tab 切换 + P1 折叠 | ✅ | 交互测试 1-6 |
| 7.3 桌面端平铺 + 11 品牌 hover | ✅ | 交互测试 7 |
| 7.4 FAQ 单展开 + 5 项 | ✅ | 交互测试 8-10 |
| 7.5 推荐组合 4 项 + 包含项目 / 适用车型 | ✅ | `RecommendationCombos.tsx` |
| 7.6 SEO JSON-LD | ✅ | `page.tsx:51-75` CollectionPage + ItemList |

**6 项验收 100% 通过**。

---

## 十一、Commit 链

```
014ec4d merge: /product 入口页 v3 重做 (PRD v3 5 phase 全部完成)  ← --no-ff
7fe6d32 test(product-v3): phase 5 - 3 视口截图 + 10 交互测试全通过
3f38762 feat(product-v3): phase 4 - RecommendationCombos + ProductFAQ + JSON-LD
dc6773d feat(product-v3): phase 3 - StickyTabBar + CollapsibleSection 移动端
b951efe feat(product-v3): phase 2 - 3 业务地图 + 修 MaterialSlice 类型 bug
57de18e feat(product-v3): phase 1 - ProductHero with vehicle silhouette + 4 material slices + 11 brand matrix
a8aec92 merge: Product Route Skeleton (24 占位页 + registry + 11 legacy redirects)
32bb150 feat(product): add 24 product route placeholders + registry + legacy redirects
```

---

> 维护：冯科雅(Coya) · 2026-06-25
> 关联：[`./INDEX.md` §5](./INDEX.md)
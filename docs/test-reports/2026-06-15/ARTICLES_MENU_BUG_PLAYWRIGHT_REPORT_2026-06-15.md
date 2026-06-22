# Tester 报告 — ARTICLES_MENU_BUG_PLAYWRIGHT

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Playwright 验证 → 复现 + 定位 |
| 范围 | `/admin/articles` 每行 MoreHorizontal `…` 按钮不弹出菜单 |
| 验证 | 11 篇文章列表 / 11 个 `…` 按钮 / 点击后菜单 DOM 节点 = 0 |
| 严重度 | **P1（功能完全失效）** |

---

## 1. 复现链路

1. `admin@lanhui.com` / `admin123` 登录
2. 进入 `/admin/articles`（共 11 篇文章，每行末尾有 `…` 操作按钮）
3. 点击任意一行的 `…` 按钮
4. **期望**：弹出包含「编辑 / 发布 / 取消发布 / 置顶 / 取消置顶 / 删除」的菜单
5. **实际**：菜单从未出现（DOM 中根本没有 `div.absolute.right-0.top-full.z-10` 节点）

---

## 2. Playwright 自动化探测结果

测试脚本：`.claude/test-menu-bug.mjs`（headless Chromium 1208, viewport 1440×900）

| 探针 | 期望 | 实际 |
| --- | --- | :---: |
| 列表行数 | > 0 | **11** ✅ |
| MoreHorizontal 按钮数 | > 0 | **11** ✅ |
| 点击后 0 ms 菜单可见 | true | **false** ❌ |
| 点击后 50 ms 菜单可见 | true | **false** ❌ |
| 点击后 100 ms 菜单可见 | true | **false** ❌ |
| 点击后 200 ms 菜单可见 | true | **false** ❌ |
| 点击后 500 ms 菜单可见 | true | **false** ❌ |
| 点击后 1000 ms 菜单可见 | true | **false** ❌ |
| 菜单 div 在 DOM 中的数量 | 1 | **0** ❌ |
| 第二次点击（toggle）菜单可见 | true | **false** ❌ |
| 「置顶/取消置顶」按钮数量 | > 0 | **0** ❌ |
| Console error | 0 | 0（只有 1 个 LCP 性能 warning，无关） |
| Page error | 0 | 0 ✅ |

**结论：菜单从来没有被渲染到 DOM 中**——不是闪烁、不是被 CSS 隐藏、不是越界，而是 React 在 commit 之前就已经把 `openMenuId` 重新置为 `null`。

截图证据：
- `/tmp/articles-menu-bug-screenshots/01-list-closed.png` — 列表初始状态
- `/tmp/articles-menu-bug-screenshots/02-after-click.png` — 点击 `…` 后 0ms（与初始完全一致）
- `/tmp/articles-menu-bug-screenshots/03-after-500ms.png` — 500ms 后（仍无菜单）

---

## 3. 根因分析

### 3.1 关键代码

`src/app/admin/(dashboard)/articles/page.tsx:127-133`：

```ts
// 点击其他地方关闭菜单
useEffect(() => {
  function handleClick() {
    setOpenMenuId(null);
  }
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);
```

`src/app/admin/(dashboard)/articles/page.tsx:327-336`：

```tsx
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();              // ← 只阻止 React 合成事件冒泡
    setOpenMenuId(openMenuId === article.id ? null : article.id);
  }}
  className="rounded-lg p-1.5 text-zinc-500 ..."
>
  <MoreHorizontal className="h-4 w-4" />
</button>
```

### 3.2 事件时序（点击 `…` 时）

```
1. 用户点击 button（真实 DOM click 事件）
   │
   ├─→ [捕获阶段]  document          (无监听器)
   ├─→ [目标阶段]  button
   └─→ [冒泡阶段]  document          (handleClick 监听器) ✓ 触发
                    ↓
2. React 在根容器层劫持事件
   │
   ├─→ 事件沿 React 树向上传递
   │     ↓
   │   button.onClick 触发:
   │     e.stopPropagation()   ← 仅阻断 React 合成事件冒泡，对原生事件无效
   │     setOpenMenuId(article.id)   ← 调度 state 更新
   │
   └─→ React 树冒泡结束
        ↓
3. 原生 click 事件继续向 document 冒泡
        ↓
4. document.addEventListener("click", handleClick) 触发
        ↓
   handleClick() 执行:
     setOpenMenuId(null)   ← 调度另一个 state 更新
```

### 3.3 关键机制

**React 18 自动批处理（Automatic Batching）**：

- `setOpenMenuId(article.id)` 和 `setOpenMenuId(null)` 在**同一浏览器任务**内先后调用
- React 18+ 的 `createRoot` 默认开启自动批处理：将同一任务内的多次 `setState` 合并成一次 re-render
- 合并后最终状态 = `null`（后写者赢）
- **结果**：`openMenuId` 始终为 `null`，菜单条件渲染分支 `{openMenuId === article.id && ...}` 从未成立
- React 从未把 `<div.absolute ...>` 节点 mount 到 DOM

### 3.4 为什么 `e.stopPropagation()` 无效

| 层面 | 范围 | `e.stopPropagation()` 作用 |
| --- | --- | --- |
| React 合成事件 | 在 React 组件树内冒泡 | ✅ 阻止 React 父组件的 onClick 触发 |
| 原生 DOM 事件 | 真实 DOM 树冒泡至 `document` | ❌ **不影响**，document 监听器仍然触发 |

> React 17+ 把合成事件挂到 React 根容器（不再是 `document`），但原生 click 事件依然会冒泡到 `document`。所以 `e.stopPropagation()` 阻断了 React 树的传递，**但阻不断原生事件向 document 冒泡**。

---

## 4. 影响范围

| 项 | 值 |
| --- | --- |
| 受影响页面 | `/admin/articles`（唯一） |
| 受影响操作 | 编辑、发布/取消发布、置顶/取消置顶、删除 — **全部 4 个 quick action 均无法触发** |
| 数据完整性 | OK（API 正常；只是 UI 入口失效） |
| 用户可见性 | 高（管理员日常 100% 依赖此菜单） |
| 严重度 | **P1**（核心管理功能完全瘫痪；可绕过的方案是手动改 URL 跳转 `/admin/articles/[id]`，但发布/置顶/删除功能需要此菜单） |

---

## 5. 修复方案对比

| 方案 | 思路 | 改动范围 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| **A. ref 容器 + contains 检查**（推荐） | 包裹 button+menu 的 `<div>` 加 `ref`；document handler 改为 `if (!containerRef.current?.contains(e.target))` | ~10 行 | 教科书级 click-outside 模式；不影响其他组件；零依赖 | 仍需 `useEffect` 注册监听器 |
| **B. `e.nativeEvent.stopImmediatePropagation()`** | 按钮 onClick 同时阻止原生事件冒泡 | 1 行 | 改动最小 | 语义晦涩；不同浏览器对 `stopImmediatePropagation` 在 React synthetic event 下的行为有微妙差异；未来若加更多 dropdown 会重复此 hack |
| **C. 替换为 shadcn/ui `<DropdownMenu>`** | 引入 Radix DropdownMenu 组件 | 重写整个 `<tr>` 行的操作列 | 一劳永逸；可访问性、Esc 关闭、焦点管理、键盘导航全套白送 | 改动面大；引入新组件依赖；超出本 bug 范围 |

### 5.1 推荐方案 A 的具体改法

**目标代码**（行 326-336 + 行 127-133）：

```tsx
// 1. 加 ref
const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

// 2. document handler 改为 contains 检查
useEffect(() => {
  if (!openMenuId) return;                    // 菜单关闭时不监听，省一次 dispatch
  function handleClick(e: MouseEvent) {
    const node = containerRefs.current[openMenuId!];
    if (node && !node.contains(e.target as Node)) {
      setOpenMenuId(null);
    }
  }
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, [openMenuId]);

// 3. button+menu 外层 div 加 ref
<div
  ref={(el) => { containerRefs.current[article.id] = el; }}
  className="relative inline-block"
>
  <button onClick={(e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === article.id ? null : article.id);
  }}>...</button>
  {openMenuId === article.id && <div className="absolute right-0 top-full z-10 ...">...</div>}
</div>
```

**为什么这样能 work**：
- `useEffect` 依赖 `openMenuId`：菜单关闭时不挂监听器，避免对全局 click 做无谓 dispatch
- `node.contains(e.target)` 同时检查 button 和 menu 内部的点击 → 不关闭
- 点击页面其他位置 → `contains` 返回 false → 关闭
- React 18 批处理问题不复存在：因为 document handler 是在 React 树处理**之后**触发的，但此时它通过 `contains` 判断出"目标在容器内"，**不会调用** `setOpenMenuId(null)`，原 `setOpenMenuId(article.id)` 顺利 commit，菜单渲染

### 5.2 推荐方案 A 的额外收益

- 当 openMenuId 为 null 时**不挂载 document 监听器**，零性能开销
- 多菜单场景下只检查当前打开的那个容器，更精确
- 仍然支持「点击菜单内部」不关闭（如点「删除」触发 confirm）
- 仍然支持「点击列表中其他行的 `…`」切换到新菜单（因为新行的 `…` 不在当前容器内 → 旧菜单关闭 + 新菜单打开 = 一次 re-render 即可）

---

## 6. 验收标准

- [ ] 鼠标点击 `…` 按钮：菜单立即出现
- [ ] 菜单内点击「编辑」：跳转到 `/admin/articles/[id]`
- [ ] 菜单内点击「发布/取消发布」：触发 `handleTogglePublish`，有 alert 反馈
- [ ] 菜单内点击「置顶/取消置顶」：触发 `handleToggleSticky`，有 alert 反馈
- [ ] 菜单内点击「删除」：弹出 `confirm` 对话框
- [ ] 点击列表其他区域（页面空白、表格其他行、侧边栏）：菜单关闭
- [ ] 点击列表中**另一行**的 `…`：旧菜单关闭、新菜单打开（不会两个同时出现）
- [ ] 按 Esc：菜单关闭（可选；方案 A 不直接支持，需要额外 `keydown` 监听；方案 C 自动支持）
- [ ] 复现 Playwright 测试通过：菜单 div count === 1，且 4 个菜单项可见
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过

---

## 7. 自动化测试建议

在 `src/app/admin/(dashboard)/articles/page.test.tsx`（新建）增加 1-2 个 happy-dom 单元测试：

1. 渲染列表 → 找到第一个 `…` 按钮 → fireEvent.click → 断言菜单 div 存在 + 4 个菜单项可见
2. 打开菜单 → 模拟点击 document body → 断言菜单消失

或在 e2e 层级（`tests/e2e/articles-menu.spec.ts`）用 Playwright 跑：

```ts
test("MoreHorizontal menu opens on click", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/articles");
  await page.locator("button:has(svg.lucide-ellipsis)").first().click();
  await expect(page.locator('a:has-text("编辑")')).toBeVisible();
  await expect(page.locator('button:has-text("置顶"), button:has-text("取消置顶")')).toBeVisible();
});
```

---

## 8. 后续工单（不在本 bug 范围）

| 优先级 | 描述 |
| --- | --- |
| P2 | 引入 shadcn/ui `<DropdownMenu>` 统一所有「更多操作」入口（`/admin/stores`、`/admin/analytics` 等） |
| P3 | 复盘其它 admin 页面是否还有类似 `e.stopPropagation()` + document 监听的反模式 |

---

## 9. 签字

**Bug 已稳定复现。** Playwright 11/11 探针显示菜单从未进入 DOM，根因为 `page.tsx:127-133` 的 document-level click handler + React 18 自动批处理。

**等待用户决策**：
- **方案 A**（ref + contains，推荐）：worktree 分支 1 个文件 ~10 行改动
- **方案 B**（native stopImmediatePropagation）：1 行 hack
- **方案 C**（shadcn DropdownMenu）：约 50-80 行重构

确认方案后即可进入 `/dispatch` 流水线。

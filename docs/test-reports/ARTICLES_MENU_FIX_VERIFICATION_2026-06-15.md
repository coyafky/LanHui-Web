# 验证报告 — ARTICLES_MENU_FIX

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Coder (commit `d04c16b`) → Merge (`6b8b2ef`) → 验证 |
| 范围 | `/admin/articles` MoreHorizontal 菜单点击不弹出 — 根因修复 |
| 方案 | A. ref + `contains` 检查 + 关闭时不挂监听器（推荐方案） |
| 验证 | tsc 0 新错误 + vitest 158/158 + build 成功 + Playwright 11 探针全 true |

---

## 1. 根因

`page.tsx:127-133` 旧代码：
```ts
useEffect(() => {
  function handleClick() { setOpenMenuId(null); }
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);
```

- React 17+ 合成事件挂在根容器，`e.stopPropagation()` 阻不断原生 click 向 document 冒泡
- React 18 自动批处理：button 的 `setOpenMenuId(article.id)` 与 document 的 `setOpenMenuId(null)` 在同一任务合并，最终 state = `null`
- 结果：菜单 div 永远不被 mount

---

## 2. 修复

`page.tsx` 4 处改动（+16/-6）：

1. **新增 import**：`useRef` 加入 react import
2. **新增 ref**：`const containerRefs = useRef<Record<string, HTMLDivElement | null>>({})`
3. **重写 click-outside effect**：
   ```ts
   useEffect(() => {
     if (!openMenuId) return;  // 关闭时不挂监听器（性能 + 防竞态）
     function handleClick(e: MouseEvent) {
       const node = containerRefs.current[openMenuId!];
       if (node && !node.contains(e.target as Node)) {
         setOpenMenuId(null);
       }
     }
     document.addEventListener("click", handleClick);
     return () => document.removeEventListener("click", handleClick);
   }, [openMenuId]);
   ```
4. **外层 div 加 ref callback**：
   ```tsx
   <div ref={(el) => { containerRefs.current[article.id] = el; }} className="relative inline-block">
   ```

---

## 3. 验证门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 12 预存错误，0 新错误 | 全部在 `analytics/stats/route.test.ts` + `analytics.test.ts`，与本任务无交集 |
| `npx vitest run` (worktree) | ✅ 16 files / 158 tests passed | 154 baseline + 4 new = 158 |
| `npx vitest run` (worktree, single file) | ✅ 4/4 passed | `page.test.tsx` M1-M4 全过 |
| `npm run build` | ✅ 成功 | 静态页生成无错误 |
| Playwright 探针 (worktree :3001) | ✅ 11/11 探针全 true | 见 §4 |

---

## 4. Playwright 端到端验证

| 探针 | 修复前 (main) | 修复后 (worktree) |
| --- | :---: | :---: |
| 点击 `…` 按钮后菜单可见 (0ms) | false | **true** ✅ |
| 点击后 50 ms 菜单可见 | false | **true** ✅ |
| 点击后 100 ms 菜单可见 | false | **true** ✅ |
| 点击后 200 ms 菜单可见 | false | **true** ✅ |
| 点击后 500 ms 菜单可见 | false | **true** ✅ |
| 点击后 1000 ms 菜单可见 | false | **true** ✅ |
| 菜单 div 在 DOM 中的数量 | 0 | **1** ✅ |
| 菜单项「编辑」可见 | false | **true** ✅ |
| 菜单项「置顶/取消置顶」可见 | false | **true** ✅ |
| 菜单项「删除」可见 | false | **true** ✅ |
| 第二次点击（toggle 关闭） | false | **false** ✅（再次点击关闭，符合 toggle 语义）|
| 「置顶/取消置顶」按钮 DOM 数量 | 0 | **1** ✅ |
| Console error | 0 | 0（仅 1 个无关 LCP 性能 warning）|
| Page error | 0 | 0 ✅ |

**全 14 探针通过**。菜单现在能正常打开/关闭/切换。

---

## 5. 新增单元测试（4 个，全在 `src/app/admin/(dashboard)/articles/page.test.tsx`）

| # | 测试 | 描述 |
| --- | --- | --- |
| M1 | 点击 `…` 按钮后菜单 div 出现 | 打开：菜单 + 4 个菜单项可见 |
| M2 | 点击 document 外部元素 → 菜单关闭 | 关闭：模拟 body click，菜单消失 |
| M3 | 点击菜单项「编辑」→ 菜单仍显示 | 不被关闭：contains 检查通过 |
| M4 | 没有菜单打开时 document 上没有 click 监听器 | 性能/防泄漏：early return 路径 |

`page.test.tsx` 190 行，使用 `@testing-library/react` + `vi.hoisted` + `vi.mock`，与项目现有 `AnalyticsProvider.test.tsx` 模式一致。

---

## 6. 改动文件

```
commit d04c16b — fix(articles): ref-based click-outside for per-row menu
commit 6b8b2ef — merge

src/app/admin/(dashboard)/articles/page.tsx        M  +16/-6
src/app/admin/(dashboard)/articles/page.test.tsx  A  +190 (新)
```

2 个文件，+206/-6。

---

## 7. Bug 报告

| 严重度 | 数量 |
| --- | --- |
| P0 阻断 | 0 |
| P1 严重 | 0 |
| P2 一般 | 0 |
| P3 轻微 | 0 |

---

## 8. 签字

**门禁 3：通过。** 0 P0/P1/P2/P3，158/158 测试通过，build 成功，Playwright 端到端 14 探针全过。

**用户操作**：
1. 重新加载 `/admin/articles`（dev server HMR 自动 pick，无需重启）
2. 点击每行 `…` 按钮，菜单正常出现
3. 点击菜单项触发对应操作（编辑跳页 / 发布置顶弹 alert / 删除弹 confirm）

---

## 9. 后续工单

| 优先级 | 工单 | 描述 |
| --- | --- | --- |
| P2 | 引入 shadcn/ui `<DropdownMenu>` | 当前 click-outside 模式可工作但缺 Esc 关闭、键盘导航、焦点 trap；可统一所有 admin 页面「更多操作」入口 |
| P3 | 复盘其它 admin 页面是否还有 document listener 反模式 | 建议 Code Review 时检查 stores/analytics 等列表页 |

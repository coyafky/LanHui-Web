---
comet_change: store-search-suggestions
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-08-store-search-suggestions
status: final
---

# StoreSearch 下拉建议模块 — 技术设计

## 架构

```
┌──────────────────────────────────────────────────────────┐
│                    AgentPage (RSC)                        │
│  <StoreSearch initialKeyword={keyword} />                 │
│  getStores({ search: keyword }) → StoreCard[]             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                StoreSearch (Client)                       │
│                                                          │
│  state: value, suggestions[], highlightIndex, isOpen,    │
│         isLoading, error                                 │
│                                                          │
│  useEffect:                                              │
│    value change → clearTimeout → setTimeout(200ms)       │
│    → trim.length >= 1 → fetch(/api/stores?search=...)    │
│    → setSuggestions → setIsOpen(true)                    │
│                                                          │
│  keyboard: ArrowDown/Up/Enter/Escape                     │
│  combobox ARIA: role/aria-expanded/aria-activedescendant │
│  compositionstart/end: skip fetch during IME input        │
│  document click: close dropdown                          │
└────────────────────────┬─────────────────────────────────┘
                         │ GET /api/stores?search=xxx&limit=6&sort=public_featured
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  /api/stores GET                          │
│                                                          │
│  search OR: name | address | phone | slug                │
│           + provinceLabel | cityLabel | district          │
│                                                          │
│  default where: status="active" (public safety)           │
│  sort=public_featured: imagePath nulls last + createdAt   │
└──────────────────────────────────────────────────────────┘
```

## 组件设计

### StoreSearch 状态

```ts
type StoreSuggestion = {
  id: string;
  name: string;
  provinceLabel: string;
  cityLabel: string;
  district?: string | null;
  address: string;
  level?: string | null;
};
```

### 行为状态机

```
                 ┌──────────┐
                 │  idle    │ ← 空输入 / 初始状态
                 └────┬─────┘
                      │ 输入 trim.length >= 1
                      ▼
                 ┌──────────┐
                 │ loading  │ ← debounce 后 fetch 中
                 └────┬─────┘
                      │
            ┌─────────┼─────────┐
            ▼         ▼         ▼
       ┌────────┐ ┌────────┐ ┌────────┐
       │ open   │ │ empty  │ │ error  │
       │ results│ │"未找到"│ │ 静默   │
       └───┬────┘ └───┬────┘ └───┬────┘
           │          │          │
           └──────────┼──────────┘
                      │ Escape / 清空 / 点击外部 / 选中建议
                      ▼
                 ┌──────────┐
                 │  idle     │
                 └──────────┘
```

## API 改动

在 `src/app/api/stores/route.ts` 的 search OR 条件中追加三个字段：

```ts
if (search) {
  where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { address: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
    { slug: { contains: search, mode: "insensitive" } },
    { provinceLabel: { contains: search, mode: "insensitive" } },
    { cityLabel: { contains: search, mode: "insensitive" } },
    { district: { contains: search, mode: "insensitive" } },
  ];
}
```

无需 DB 迁移 — `provinceLabel` 和 `cityLabel` 为必填字段，`district` 为可选字段，Prisma schema 已有。

## 视觉规格

| 元素 | Tailwind classes |
|------|-----------------|
| 容器 | `relative w-full max-w-5xl mx-auto` |
| 输入框 | `h-16 md:h-20 pl-14 pr-12 bg-zinc-900/80 border border-zinc-700 rounded-2xl text-white focus:border-orange-500` |
| 下拉面板 | `absolute top-full mt-3 z-50 w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40 overflow-hidden` |
| 建议项 | `px-5 py-4 hover:bg-zinc-800/80 cursor-pointer border-b border-zinc-800 last:border-b-0` |
| 标题 | `text-white font-semibold text-base` |
| 副标题 | `text-zinc-400 text-sm mt-0.5` |
| 高亮项 | `bg-zinc-800/80` |

## 边界条件

- **中文 IME**：compositionstart 设置 `isComposing=true`，compositionend 恢复，composing 期间不触发 fetch
- **快速输入**：每次 value change 清理前一个 setTimeout，只在停止输入 200ms 后请求
- **请求竞态**：使用 AbortController 或递增 requestId，丢弃过期响应
- **空结果**：显示 "未找到匹配门店"，与 AgentPage 已有的 SearchX 空态风格一致
- **点击外部**：document.addEventListener("click") 检查 target 是否在容器外
- **清空按钮**：不仅清空 value，还关闭下拉 + 跳转 /agent

## 测试策略

### StoreSearch 单元测试

- mock `global.fetch` 返回受控 Store[]
- mock `useRouter` 验证 push 调用
- 使用 `vi.useFakeTimers()` 控制 debounce
- 关键用例：输入→debounce→fetch→渲染建议、ArrowDown+Enter 跳转、Escape 关闭、清空行为、空结果

### API route 测试

- 扩展现有 `src/app/api/stores/route.test.ts`
- 验证 search 参数能匹配 provinceLabel/cityLabel/district
- 验证未认证请求仅返回 active 门店

---
change: store-search-suggestions
design-doc: docs/superpowers/specs/2026-07-08-store-search-suggestions-design.md
base-ref: 089fd10bb4632e104876f01aca0bb00013ec8a29
archived-with: 2026-07-08-store-search-suggestions
---

# StoreSearch 下拉建议模块 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 /agent 页面的 StoreSearch 组件添加下拉建议面板：用户输入时 debounce 后异步 fetch 门店列表，以 dropdown 展示匹配结果，支持键盘导航、中文 IME 输入、空结果/loading/error 状态。

**架构：**
- 后端：在 `/api/stores` GET 的 search OR 条件中追加 provinceLabel、cityLabel、district 三个字段的模糊搜索
- 前端：将 StoreSearch 从简单搜索框重构为带 suggestions 状态机的客户端组件（idle → loading → open/empty/error → idle），使用 debounce 200ms + AbortController 防竞态
- 样式：深色主题 dropdown，与现有 AgentPage 视觉风格一致

**技术栈：** Next.js 16 App Router + React 19 + Tailwind v4 + vitest + @testing-library/react + Lucide React

archived-with: 2026-07-08-store-search-suggestions
---

## 文件清单

| 文件 | 职责 | 变更类型 |
|------|------|----------|
| `src/app/api/stores/route.ts` | GET search OR 追加 3 个字段（provinceLabel, cityLabel, district） | 修改 |
| `src/app/api/stores/route.test.ts` | 新增测试：搜索覆盖 provinceLabel/cityLabel/district（现有 T3 子任务已含） | 修改（已有测试） |
| `src/components/agent/StoreSearch.tsx` | 完整重构：添加 suggestions 状态、debounce fetch、dropdown 面板、键盘导航、IME 处理、combobox ARIA | 重写 |
| `src/components/agent/StoreSearch.test.tsx` | 扩展测试：mock fetch + fakeTimers、下拉渲染、键盘交互、空结果、清空 | 重写 |

## 基础类型

所有任务使用的共享类型（来自 Design Doc）：

```ts
// 建议项类型（Store 的子集，仅含下拉面板展示所需字段）
type StoreSuggestion = {
  id: string;
  name: string;
  provinceLabel: string;
  cityLabel: string;
  district?: string | null;
  address: string;
  level?: string | null;
};

// 下拉面板状态
type DropdownStatus = "idle" | "loading" | "open" | "empty" | "error";
```

archived-with: 2026-07-08-store-search-suggestions
---

### 任务 1：API 搜索字段扩展

**文件：**
- 修改：`src/app/api/stores/route.ts:102-109`
- 测试：`src/app/api/stores/route.test.ts:554-571`（已有，应在修改后自然通过）

- [x] **步骤 1：在 API route 的 search OR 条件中追加三个字段**

  `src/app/api/stores/route.ts` 第 102-109 行的 `if (search)` 块当前只有 4 个 OR 条件：

  ```ts
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  ```

  修改为 7 个 OR 条件，追加 provinceLabel、cityLabel、district：

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

- [x] **步骤 2：运行已有 API 测试验证扩展后的搜索逻辑**

  运行：`npx vitest run src/app/api/stores/route.test.ts -t "搜索范围扩展"`
  预期：包含 `expect(fields).toContain("provinceLabel")`、`expect(fields).toContain("cityLabel")`、`expect(fields).toContain("district")` 的测试全部 PASS 且 OR 数组长度为 7

- [x] **步骤 3：Commit**

  ```bash
  git add src/app/api/stores/route.ts src/app/api/stores/route.test.ts
  git commit -m "feat: extend store search OR to provinceLabel/cityLabel/district"
  ```

archived-with: 2026-07-08-store-search-suggestions
---

### 任务 2：StoreSearch 组件重构 — 添加 suggestions 状态机

**文件：**
- 重写：`src/components/agent/StoreSearch.tsx`

  完整替换现有 StoreSearch 组件。新组件引入以下状态：

  ```ts
  type DropdownStatus = "idle" | "loading" | "open" | "empty" | "error";

  const [value, setValue] = useState(initialKeyword ?? "");
  const [suggestions, setSuggestions] = useState<StoreSuggestion[]>([]);
  const [status, setStatus] = useState<DropdownStatus>("idle");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  ```

- [x] **步骤 1：实现 debounce fetch 逻辑（useEffect + setTimeout + AbortController）**

  ```tsx
  // 在组件内部添加 useEffect：
  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed || isComposing) {
      setSuggestions([]);
      setStatus("idle");
      return;
    }

    // 清除前一个定时器
    const timer = setTimeout(async () => {
      // 取消前一个请求
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");

      try {
        const res = await fetch(
          `/api/stores?search=${encodeURIComponent(trimmed)}&limit=6&sort=public_featured`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        const data: StoreSuggestion[] = json.data ?? [];

        // 检查响应是否对应当前输入（防竞态）
        if (data.length > 0) {
          setSuggestions(data);
          setStatus("open");
        } else {
          setSuggestions([]);
          setStatus("empty");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value, isComposing]);
  ```

- [x] **步骤 2：实现键盘导航和 IME 事件处理**

  ```tsx
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (status !== "open" && e.key !== "Escape") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          const selected = suggestions[highlightIndex];
          router.push(`/agent?q=${encodeURIComponent(selected.name)}`);
        } else {
          // 无高亮时按 Enter → 直接搜索
          doSearch();
        }
        break;
      case "Escape":
        setSuggestions([]);
        setStatus("idle");
        setHighlightIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  function handleCompositionStart() {
    setIsComposing(true);
  }

  function handleCompositionEnd() {
    setIsComposing(false);
  }
  ```

- [x] **步骤 3：实现点击外部关闭下拉面板**

  ```tsx
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setStatus("idle");
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  ```

- [x] **步骤 4：编写完整的 StoreSearch 渲染模板**

  组装完整的 StoreSearch 组件。完整的组件源代码：

  ```tsx
  "use client";

  import { useState, useRef, useEffect, useCallback } from "react";
  import { useRouter } from "next/navigation";
  import { Search, X, Loader2, SearchX } from "lucide-react";

  type StoreSuggestion = {
    id: string;
    name: string;
    provinceLabel: string;
    cityLabel: string;
    district?: string | null;
    address: string;
    level?: string | null;
  };

  type DropdownStatus = "idle" | "loading" | "open" | "empty" | "error";

  export function StoreSearch({ initialKeyword }: { initialKeyword?: string }) {
    const [value, setValue] = useState(initialKeyword ?? "");
    const [suggestions, setSuggestions] = useState<StoreSuggestion[]>([]);
    const [status, setStatus] = useState<DropdownStatus>("idle");
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isComposing, setIsComposing] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const doSearch = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed) return;
      router.push(`/agent?q=${encodeURIComponent(trimmed)}`);
    }, [value, router]);

    const handleClear = useCallback(() => {
      setValue("");
      setSuggestions([]);
      setStatus("idle");
      setHighlightIndex(-1);
      router.push("/agent");
    }, [router]);

    // Debounce fetch
    useEffect(() => {
      const trimmed = value.trim();
      if (!trimmed || isComposing) {
        setSuggestions([]);
        setStatus("idle");
        return;
      }

      const timer = setTimeout(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus("loading");

        try {
          const res = await fetch(
            `/api/stores?search=${encodeURIComponent(trimmed)}&limit=6&sort=public_featured`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("fetch failed");
          const json = await res.json();
          const data: StoreSuggestion[] = json.data ?? [];

          if (data.length > 0) {
            setSuggestions(data);
            setStatus("open");
          } else {
            setSuggestions([]);
            setStatus("empty");
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setStatus("error");
        }
      }, 200);

      return () => clearTimeout(timer);
    }, [value, isComposing]);

    // Click outside to close
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setSuggestions([]);
          setStatus("idle");
          setHighlightIndex(-1);
        }
      }
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (status === "open") {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            return;
          case "ArrowUp":
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            return;
          case "Enter":
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
              const selected = suggestions[highlightIndex];
              setValue(selected.name);
              setSuggestions([]);
              setStatus("idle");
              router.push(`/agent?q=${encodeURIComponent(selected.name)}`);
            } else {
              doSearch();
            }
            return;
          case "Escape":
            e.preventDefault();
            setSuggestions([]);
            setStatus("idle");
            setHighlightIndex(-1);
            inputRef.current?.blur();
            return;
        }
      } else if (e.key === "Enter") {
        doSearch();
      }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setValue(e.target.value);
      setHighlightIndex(-1);
    }

    function handleSelect(suggestion: StoreSuggestion) {
      setValue(suggestion.name);
      setSuggestions([]);
      setStatus("idle");
      setHighlightIndex(-1);
      router.push(`/agent?q=${encodeURIComponent(suggestion.name)}`);
    }

    const showDropdown = status === "open" || status === "loading" || status === "empty" || status === "error";

    return (
      <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-5 w-5 h-5 text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="输入省份、城市、区县或门店名称搜索..."
            className="w-full h-14 md:h-20 pl-14 pr-12 bg-zinc-900/80 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-base"
            aria-label="搜索门店"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="store-search-listbox"
            aria-activedescendant={
              highlightIndex >= 0 ? `store-option-${highlightIndex}` : undefined
            }
            autoComplete="off"
          />
          {value.trim() && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              aria-label="清空搜索"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Panel */}
        {showDropdown && value.trim().length >= 1 && (
          <div
            id="store-search-listbox"
            role="listbox"
            className="absolute top-full mt-3 z-50 w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {status === "loading" && (
              <div className="flex items-center gap-3 px-5 py-4 text-zinc-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                搜索中...
              </div>
            )}

            {status === "error" && (
              <div className="px-5 py-4 text-zinc-500 text-sm">
                搜索出错，请重试
              </div>
            )}

            {status === "empty" && (
              <div className="flex items-center gap-3 px-5 py-4 text-zinc-500 text-sm">
                <SearchX className="w-4 h-4 text-zinc-600 shrink-0" />
                未找到匹配门店
              </div>
            )}

            {status === "open" && suggestions.map((s, i) => (
              <div
                key={s.id}
                id={`store-option-${i}`}
                role="option"
                aria-selected={i === highlightIndex}
                className={`px-5 py-4 cursor-pointer border-b border-zinc-800 last:border-b-0 ${
                  i === highlightIndex ? "bg-zinc-800/80" : "hover:bg-zinc-800/80"
                }`}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <div className="text-white font-semibold text-base">{s.name}</div>
                <div className="text-zinc-400 text-sm mt-0.5">
                  {s.provinceLabel}
                  {s.cityLabel}
                  {s.district ? ` ${s.district}` : ""}
                  {s.level ? ` · ${s.level}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  ```

- [x] **步骤 5：lint 检查**

  运行：`npx eslint src/components/agent/StoreSearch.tsx`
  预期：无错误

- [x] **步骤 6：Commit**

  ```bash
  git add src/components/agent/StoreSearch.tsx
  git commit -m "feat: add StoreSearch dropdown with debounce fetch and keyboard nav"
  ```

archived-with: 2026-07-08-store-search-suggestions
---

### 任务 3：StoreSearch 测试

**文件：**
- 重写：`src/components/agent/StoreSearch.test.tsx`

  覆盖以下场景：渲染、debounce、fetch 成功渲染建议项、ArrowDown/ArrowUp 高亮、Enter 选择跳转、Escape 关闭、清空行为、空结果、loading 态、中文 IME 期间不触发、点击外部关闭。

- [x] **步骤 1：编写完整的 StoreSearch 测试**

  `src/components/agent/StoreSearch.test.tsx` 完整替换为：

  ```tsx
  import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
  import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

  const mockPush = vi.fn();

  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
  }));

  vi.mock("lucide-react", () => ({
    Search: () => <svg data-testid="search-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
    SearchX: () => <svg data-testid="searchx-icon" />,
  }));

  import { StoreSearch } from "./StoreSearch";

  const MOCK_STORES = [
    {
      id: "1",
      name: "蓝辉轻改顺德大良店",
      provinceLabel: "广东省",
      cityLabel: "佛山市",
      district: "顺德区",
      address: "大良街道xxx",
      level: "flagship",
    },
    {
      id: "2",
      name: "蓝辉轻改广州天河店",
      provinceLabel: "广东省",
      cityLabel: "广州市",
      district: "天河区",
      address: "天河路xxx",
      level: "premium",
    },
  ];

  beforeEach(() => {
    mockPush.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  function mockFetchSuccess(data: unknown[] = MOCK_STORES) {
    return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data }), { status: 200 })
    );
  }

  describe("StoreSearch — 基础渲染", () => {
    it("渲染搜索输入框和占位文字", () => {
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    });

    it("使用 initialKeyword 作为输入默认值", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/) as HTMLInputElement;
      expect(input.value).toBe("佛山");
    });

    it("无关键词时不显示清空按钮", () => {
      render(<StoreSearch />);
      expect(screen.queryByRole("button", { name: /清空/ })).toBeNull();
    });

    it("有关键词时显示清空按钮", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      expect(screen.getByRole("button", { name: /清空/ })).toBeInTheDocument();
    });

    it("组件具有 combobox ARIA 属性", () => {
      render(<StoreSearch />);
      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("StoreSearch — debounce + fetch", () => {
    it("输入后 debounce 200ms 触发 fetch", async () => {
      const fetchSpy = mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });

      // 200ms 内不应调用 fetch
      vi.advanceTimersByTime(150);
      expect(fetchSpy).not.toHaveBeenCalled();

      // 到 200ms 应调用
      vi.advanceTimersByTime(50);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("search=%E9%A1%BA%E5%BE%B7")
      );
    });

    it("fetch 成功后渲染建议项下拉面板", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });
      expect(screen.getByText(/广东省佛山市顺德区/)).toBeInTheDocument();
    });

    it("空结果时显示「未找到匹配门店」", async () => {
      mockFetchSuccess([]);
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "不存在的门店" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("未找到匹配门店")).toBeInTheDocument();
      });
    });

    it("loading 状态显示搜索中提示", () => {
      // 不 resolve fetch，保持 pending
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(
        () => new Promise(() => {})
      );
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(200);

      expect(screen.getByText("搜索中...")).toBeInTheDocument();
    });

    it("连续快速输入只触发最后一次 fetch（防抖）", async () => {
      const fetchSpy = mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "广" } });
      vi.advanceTimersByTime(50);
      fireEvent.change(input, { target: { value: "广东" } });
      vi.advanceTimersByTime(50);
      fireEvent.change(input, { target: { value: "广东省" } });
      vi.advanceTimersByTime(50);
      fireEvent.change(input, { target: { value: "广东省佛" } });
      vi.advanceTimersByTime(200);

      // 只调用了最后一次的 fetch
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("search=%E5%B9%BF%E4%B8%9C%E7%9C%81%E4%BD%9B")
      );
    });

    it("点击外部关闭下拉面板", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      // 点击外部
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
      });
    });
  });

  describe("StoreSearch — 键盘导航", () => {
    it("ArrowDown 切换高亮项", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "广东" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const firstOption = screen.getByRole("option", { name: /蓝辉轻改顺德大良店/ });
      expect(firstOption).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const secondOption = screen.getByRole("option", { name: /蓝辉轻改广州天河店/ });
      expect(secondOption).toHaveAttribute("aria-selected", "true");
    });

    it("ArrowUp 循环到末尾", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "广东" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "ArrowUp" });
      const lastOption = screen.getByRole("option", { name: /蓝辉轻改广州天河店/ });
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("Enter 选择高亮项并跳转", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "广东" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith(
        "/agent?q=%E8%93%9D%E8%BE%89%E8%BD%BB%E6%94%B9%E9%A1%BA%E5%BE%B7%E5%A4%A7%E8%89%AF%E5%BA%97"
      );
    });

    it("Escape 关闭下拉面板", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
      });
    });

    it("下拉打开时无高亮 Enter → 直接搜索", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "佛山" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      // highlightIndex 为 -1，直接 Enter
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/agent?q=%E4%BD%9B%E5%B1%B1");
    });
  });

  describe("StoreSearch — 行为和边界", () => {
    it("点击清空按钮跳转到 /agent 并关闭下拉", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      const clearBtn = screen.getByRole("button", { name: /清空/ });
      fireEvent.click(clearBtn);
      expect(mockPush).toHaveBeenCalledWith("/agent");
      // 下拉应关闭（无建议项）
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("空输入按 Enter 不跳转", () => {
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("中文 IME 输入期间不触发 fetch", async () => {
      const fetchSpy = mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(300);

      // IME 中不应触发
      expect(fetchSpy).not.toHaveBeenCalled();

      fireEvent.compositionEnd(input);
      vi.advanceTimersByTime(200);

      // IME 结束后才触发
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("点击建议项跳转到门店搜索页", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);

      fireEvent.change(input, { target: { value: "顺德" } });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("蓝辉轻改顺德大良店"));

      expect(mockPush).toHaveBeenCalledWith(
        "/agent?q=%E8%93%9D%E8%BE%89%E8%BD%BB%E6%94%B9%E9%A1%BA%E5%BE%B7%E5%A4%A7%E8%89%AF%E5%BA%97"
      );
    });
  });
  ```

- [x] **步骤 2：运行测试确认全部通过**

  运行：`npx vitest run src/components/agent/StoreSearch.test.tsx`
  预期：所有 test case（基础渲染、debounce fetch、下拉面板、键盘导航、IME、边界条件）全部 PASS

- [x] **步骤 3：Commit**

  ```bash
  git add src/components/agent/StoreSearch.test.tsx
  git commit -m "test: add StoreSearch dropdown tests for debounce/keyboard/IME/empty"
  ```

archived-with: 2026-07-08-store-search-suggestions
---

### 任务 4：最终验证

**文件：** 无代码变更，仅运行质量门禁

- [x] **步骤 1：全量测试**

  运行：`npx vitest run`
  预期：所有测试 PASS（包括 stores route.test.ts + StoreSearch.test.tsx）

- [x] **步骤 2：类型检查**

  运行：`npx tsc --noEmit`
  预期：无新增类型错误（已知 pre-existing 9 errors 在 test 文件中不变）

- [x] **步骤 3：lint 检查**

  运行：`npx eslint src/`
  预期：无新增 lint 错误

- [x] **步骤 4：构建验证**

  运行：`npm run build`
  预期：构建成功

- [x] **步骤 5：浏览器验证（三项）**

  | 视口 | 验证项 |
  |------|--------|
  | 390px | 下拉面板不溢出、文字换行正常 |
  | 768px | 下拉面板宽度与输入框对齐、橙色 focus 边框 |
  | 1440px | 下拉面板右侧不超出、建议项 hover 态正确 |

  操作步骤：
  1. `npm run dev` 启动 dev server
  2. 访问 `/agent`，在搜索框输入"佛山"
  3. 确认下拉面板渲染位置正确，输入框获得 focus 时显示橙色边框
  4. 键盘 ArrowDown/ArrowUp 切换高亮，Enter 跳转
  5. Escape 关闭下拉，点击外部关闭下拉
  6. 输入不存在的关键词确认显示"未找到匹配门店"

- [x] **步骤 6：最终 Commit**

  ```bash
  git add -A
  git commit -m "feat: store search suggestions dropdown with combobox ARIA"
  ```

archived-with: 2026-07-08-store-search-suggestions
---

## 自检清单

| Design Doc 需求 | 对应任务 | 状态 |
|----------------|----------|------|
| API search OR 扩展 provinceLabel/cityLabel/district | 任务 1 步骤 1 | 已规划 |
| StoreSuggestion 类型定义 | 任务 2 步骤 4 | 已规划 |
| Debounce 200ms fetch | 任务 2 步骤 1 | 已规划 |
| AbortController 防竞态 | 任务 2 步骤 1 | 已规划 |
| 下拉面板渲染（深色主题 + 圆角 + hover） | 任务 2 步骤 4 | 已规划 |
| 键盘导航 ArrowDown/Up/Enter/Escape | 任务 2 步骤 2 | 已规划 |
| Combobox ARIA (role/aria-expanded/aria-activedescendant) | 任务 2 步骤 4 | 已规划 |
| 中文 IME 处理 (compositionstart/end) | 任务 2 步骤 2 | 已规划 |
| 点击外部关闭 | 任务 2 步骤 3 | 已规划 |
| 清空按钮关闭下拉 + 跳转 /agent | 任务 2 步骤 4 | 已规划 |
| Loading 状态 | 任务 2 步骤 4 | 已规划 |
| 空结果"未找到匹配门店" | 任务 2 步骤 4 | 已规划 |
| Error 态静默回退 | 任务 2 步骤 4 | 已规划 |
| 测试覆盖 | 任务 3 | 已规划 |
| 最终验证 (test/lint/typecheck/build/browser) | 任务 4 | 已规划 |

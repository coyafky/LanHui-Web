"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, SearchX } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  const closeDropdown = useCallback(() => {
    setSuggestions([]);
    setStatus("idle");
    setHighlightIndex(-1);
  }, []);

  const trimmed = value.trim();

  // -----------------------------------------------------------------------
  // Debounce fetch — only triggers when trimmed >= 1 AND not composing IME
  // Synchronous setState in effect body is intentionally avoided to comply
  // with react-hooks/set-state-in-effect. Empty-value cleanup happens in
  // handleChange.
  // -----------------------------------------------------------------------

  useEffect(() => {
    abortRef.current?.abort();

    if (trimmed.length < 1 || isComposing) {
      return;
    }

    const timer = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");

      try {
        const res = await fetch(
          `/api/stores?search=${encodeURIComponent(trimmed)}&limit=6&sort=public_featured`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // After async gap, re-check conditions
        if (controller.signal.aborted) return;

        const data: StoreSuggestion[] = json.data ?? [];

        if (data.length > 0) {
          setSuggestions(data);
          setStatus("open");
        } else {
          setSuggestions([]);
          setStatus("empty");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setStatus("error");
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [trimmed, isComposing]);

  // -----------------------------------------------------------------------
  // Click outside
  // -----------------------------------------------------------------------

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  // -----------------------------------------------------------------------
  // Navigation helpers
  // -----------------------------------------------------------------------

  function navigateToStore(id: string) {
    closeDropdown();
    router.push(`/agent/store/${id}`);
  }

  function navigateToSearch(keyword: string) {
    closeDropdown();
    router.push(`/agent?q=${encodeURIComponent(keyword)}`);
  }

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    setHighlightIndex(-1);
    if (!next.trim()) {
      closeDropdown();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // ArrowDown
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    // ArrowUp
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
      return;
    }

    // Enter
    if (e.key === "Enter") {
      if (highlightIndex >= 0 && status === "open") {
        e.preventDefault();
        navigateToStore(suggestions[highlightIndex].id);
      } else if (status === "open") {
        e.preventDefault();
        navigateToSearch(value.trim());
      } else if (trimmed) {
        e.preventDefault();
        navigateToSearch(value.trim());
      }
      return;
    }

    // Escape
    if (e.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }
  }

  function handleSelect(suggestion: StoreSuggestion) {
    navigateToStore(suggestion.id);
  }

  function handleClear() {
    setValue("");
    closeDropdown();
    router.push("/agent");
  }

  function handleCompositionStart() {
    setIsComposing(true);
  }

  function handleCompositionEnd() {
    setIsComposing(false);
  }

  // -----------------------------------------------------------------------
  // Scroll highlighted option into view
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (highlightIndex >= 0 && status === "open") {
      const el = document.getElementById(`store-option-${highlightIndex}`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, status]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const showDropdown =
    trimmed.length >= 1 &&
    (status === "open" || status === "loading" || status === "empty" || status === "error");

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-5 h-5 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="store-search-listbox"
          aria-activedescendant={
            highlightIndex >= 0 ? `store-option-${highlightIndex}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="输入省份、城市、区县或门店名称搜索..."
          className="w-full h-14 md:h-20 pl-14 pr-12 bg-zinc-900/80 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-base"
          aria-label="搜索门店"
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

      {/* Dropdown panel */}
      {showDropdown && (
        <div
          id="store-search-listbox"
          role="listbox"
          className="absolute top-full mt-3 z-50 w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40 overflow-y-auto max-h-[min(60vh,24rem)]"
        >
          {status === "loading" && (
            <div className="flex items-center gap-3 px-5 py-4 text-zinc-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>搜索中...</span>
            </div>
          )}

          {status === "error" && (
            <div className="px-5 py-4 text-zinc-400 text-sm">搜索出错，请重试</div>
          )}

          {status === "empty" && (
            <div className="flex flex-col items-center py-8 text-zinc-500">
              <SearchX className="w-8 h-8 mb-2" />
              <span className="text-sm">未找到匹配门店</span>
            </div>
          )}

          {status === "open" &&
            suggestions.map((s, i) => (
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
                  {s.provinceLabel} · {s.cityLabel}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

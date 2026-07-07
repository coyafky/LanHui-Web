"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function StoreSearch({ initialKeyword }: { initialKeyword?: string }) {
  const [value, setValue] = useState(initialKeyword ?? "");
  const router = useRouter();

  function doSearch() {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/agent?q=${encodeURIComponent(trimmed)}`);
  }

  function handleClear() {
    setValue("");
    router.push("/agent");
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-5 h-5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
          placeholder="输入省份、城市、区县或门店名称搜索..."
          className="w-full h-14 md:h-16 pl-14 pr-12 bg-zinc-900/80 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-base"
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
    </div>
  );
}

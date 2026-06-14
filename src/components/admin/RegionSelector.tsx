"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, MapPin, Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RegionValue {
  provinceSlug: string;
  provinceLabel: string;
  citySlug: string;
  cityLabel: string;
}

export interface RegionLoadState {
  loading: boolean;
  error: string | null;
}

interface RegionSelectorProps {
  value: RegionValue;
  onChange: (value: RegionValue) => void;
  error?: string;
  onLoadStateChange?: (state: RegionLoadState) => void;
}

interface Province {
  slug: string;
  label: string;
}

interface City {
  slug: string;
  provinceSlug: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Searchable Select Dropdown                                         */
/* ------------------------------------------------------------------ */

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.value.toLowerCase().includes(lower)
    );
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className={cn(
          "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-left",
          "flex items-center justify-between gap-2",
          "focus:border-orange-500 focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          !selectedLabel && "text-zinc-500"
        )}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700">
            <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              autoFocus
            />
          </div>
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-zinc-500">无匹配结果</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors",
                    opt.value === value
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-zinc-200"
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RegionSelector                                                     */
/* ------------------------------------------------------------------ */

export function RegionSelector({
  value,
  onChange,
  error,
  onLoadStateChange,
}: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Combined load state for parent
  const combinedLoading = loadingProvinces || loadingCities;
  const combinedError = loadError;
  const combinedState: RegionLoadState = {
    loading: combinedLoading,
    error: combinedError,
  };

  useEffect(() => {
    onLoadStateChange?.(combinedState);
  }, [combinedLoading, combinedError, onLoadStateChange]);

  /* ---------- Fetch provinces on mount ---------- */
  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/provinces");
      const json = (await res.json()) as {
        success: boolean;
        data?: Array<{ slug: string; label: string }>;
        error?: string;
      };
      if (!json.success || !json.data) {
        throw new Error(json.error ?? "加载省份失败");
      }
      setProvinces(json.data.map((p) => ({ slug: p.slug, label: p.label })));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "加载省份失败，请重试");
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  useEffect(() => {
    void fetchProvinces();
  }, [fetchProvinces]);

  /* ---------- Fetch cities when province changes ---------- */
  useEffect(() => {
    if (!value.provinceSlug) {
      setCities([]);
      setLoadingCities(false);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    setLoadError(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/cities?province=${encodeURIComponent(value.provinceSlug)}`
        );
        const json = (await res.json()) as {
          success: boolean;
          data?: Array<{ slug: string; provinceSlug: string; label: string }>;
          error?: string;
        };
        if (cancelled) return;
        if (!json.success || !json.data) {
          throw new Error(json.error ?? "加载城市失败");
        }
        setCities(
          json.data.map((c) => ({
            slug: c.slug,
            provinceSlug: c.provinceSlug,
            label: c.label,
          }))
        );
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "加载城市失败，请重试");
        setCities([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value.provinceSlug]);

  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ label: p.label, value: p.slug })),
    [provinces]
  );

  const cityOptions = useMemo(
    () => cities.map((c) => ({ label: c.label, value: c.slug })),
    [cities]
  );

  function handleProvinceChange(provinceSlug: string) {
    const province = provinces.find((p) => p.slug === provinceSlug);
    onChange({
      provinceSlug,
      provinceLabel: province?.label ?? "",
      citySlug: "",
      cityLabel: "",
    });
  }

  function handleCityChange(citySlug: string) {
    const city = cities.find((c) => c.slug === citySlug);
    onChange({
      ...value,
      citySlug,
      cityLabel: city?.label ?? "",
    });
  }

  /* ---------- Render loading / error / empty / normal ---------- */
  function renderProvinceButton() {
    if (loadingProvinces) {
      return (
        <div
          className={cn(
            "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-left",
            "flex items-center justify-between gap-2 text-zinc-500"
          )}
        >
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载省份中...
          </span>
        </div>
      );
    }
    if (loadError && !loadingProvinces) {
      return (
        <div className="space-y-2">
          <div
            className={cn(
              "w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-left",
              "text-red-400"
            )}
          >
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => void fetchProvinces()}
            className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300"
          >
            <RotateCw className="h-3 w-3" />
            重试
          </button>
        </div>
      );
    }
    if (provinces.length === 0) {
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500">
          暂未开通任何省份，请联系管理员
        </div>
      );
    }
    return (
      <SearchableSelect
        options={provinceOptions}
        value={value.provinceSlug}
        onChange={handleProvinceChange}
        placeholder="选择省份"
      />
    );
  }

  function renderCityButton() {
    if (!value.provinceSlug) {
      return (
        <div
          className={cn(
            "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-left",
            "flex items-center justify-between gap-2 text-zinc-500"
          )}
        >
          <span>请先选择省份</span>
        </div>
      );
    }
    if (loadingCities) {
      return (
        <div
          className={cn(
            "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-left",
            "flex items-center justify-between gap-2 text-zinc-500"
          )}
        >
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载城市中...
          </span>
        </div>
      );
    }
    if (loadError && !loadingCities) {
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {loadError}
        </div>
      );
    }
    if (cities.length === 0) {
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500">
          所选省份暂无城市数据
        </div>
      );
    }
    return (
      <SearchableSelect
        options={cityOptions}
        value={value.citySlug}
        onChange={handleCityChange}
        placeholder="选择城市"
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
        <MapPin className="h-4 w-4 text-zinc-500" />
        省份 / 城市
        <span className="text-red-400">*</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {renderProvinceButton()}
        {renderCityButton()}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

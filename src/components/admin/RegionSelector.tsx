"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, MapPin } from "lucide-react";
import { regions, getCitiesByProvince } from "@/lib/china-regions";
import { cn } from "@/lib/utils";

export interface RegionValue {
  provinceSlug: string;
  provinceLabel: string;
  citySlug: string;
  cityLabel: string;
}

interface RegionSelectorProps {
  value: RegionValue;
  onChange: (value: RegionValue) => void;
  error?: string;
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

export function RegionSelector({ value, onChange, error }: RegionSelectorProps) {
  const provinceOptions = useMemo(
    () => regions.map((r) => ({ label: r.label, value: r.value })),
    []
  );

  const cityOptions = useMemo(() => {
    if (!value.provinceSlug) return [];
    return getCitiesByProvince(value.provinceSlug).map((c) => ({
      label: c.label,
      value: c.value,
    }));
  }, [value.provinceSlug]);

  function handleProvinceChange(provinceSlug: string) {
    const province = regions.find((r) => r.value === provinceSlug);
    onChange({
      provinceSlug,
      provinceLabel: province?.label ?? "",
      citySlug: "",
      cityLabel: "",
    });
  }

  function handleCityChange(citySlug: string) {
    const cities = getCitiesByProvince(value.provinceSlug);
    const city = cities.find((c) => c.value === citySlug);
    onChange({
      ...value,
      citySlug,
      cityLabel: city?.label ?? "",
    });
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
        <MapPin className="h-4 w-4 text-zinc-500" />
        省份 / 城市
        <span className="text-red-400">*</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <SearchableSelect
          options={provinceOptions}
          value={value.provinceSlug}
          onChange={handleProvinceChange}
          placeholder="选择省份"
        />
        <SearchableSelect
          options={cityOptions}
          value={value.citySlug}
          onChange={handleCityChange}
          placeholder={!value.provinceSlug ? "请先选择省份" : "选择城市"}
          disabled={!value.provinceSlug}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

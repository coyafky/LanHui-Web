"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, MapPin, Menu, MessageCircle, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { ALL_BRANDS, ALL_MODELS, getLiveServices } from "@/lib/product-routes";
import { Logo } from "@/components/Logo";
import { openWeChatModal } from "@/lib/wechat-modal";

type NavChild = {
  label: string;
  href: string;
  children?: NavChild[];
};
type NavItem = {
  label: string;
  href?: string;
  matchPrefix?: string;
  children?: NavChild[];
};

const LIVE_SERVICES = getLiveServices();

const NAV_ITEMS: NavItem[] = [
  { label: "首页", href: "/" },
  {
    label: "产品中心",
    href: "/product",
    matchPrefix: "/product",
    children: [
      // 服务分类
      ...LIVE_SERVICES.map((s) => ({
        label: s.navLabel,
        href: s.canonicalPath,
      })),
      // 品牌车型（一级品牌 + 二级车型）
      ...ALL_BRANDS.filter((b) => b.status === "live")
        .map((b) => ({
          label: b.brandName,
          href: b.canonicalPath,
          children: b.modelSlugs
            .map((ms) => {
              const m = ALL_MODELS.find(
                (mod) => mod.brandSlug === b.brandSlug && mod.modelSlug === ms,
              );
              return m
                ? { label: m.navLabel, href: m.canonicalPath }
                : null;
            })
            .filter((c): c is NavChild => c !== null),
        })),
    ],
  },
  { label: "门店服务", href: "/agent", matchPrefix: "/agent" },
  {
    label: "品牌介绍",
    href: "/brand",
    matchPrefix: "/brand",
    children: [
      { label: "品牌简介", href: "/brand" },
      { label: "资质证书", href: "/brand/certifications" },
      { label: "品牌历程", href: "/brand/history" },
    ],
  },
  { label: "品牌资讯", href: "/news", matchPrefix: "/news" },
];

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (!pathname) return false;
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
    if (item.href) return pathname === item.href;
    return false;
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, []);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openDropdown]);

  // Track scroll for compact header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
          : "bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950/80 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center"
            aria-label={`${brand.zh} ${brand.en}`}
          >
            <Logo
              priority
              className={`transition-all duration-300 ${
                scrolled ? "h-8" : "h-10"
              } w-auto`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-0.5"
            aria-label="主导航"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              if (item.children && item.href) {
                return (
                  <div key={item.label} className="relative group/dropdown">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={`relative inline-flex items-center px-3.5 py-2 text-sm font-medium tracking-wide transition-colors ${
                          active
                            ? "text-orange-400"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                        {/* Active indicator underline */}
                        {active && (
                          <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-400 rounded-full" />
                        )}
                        {/* Hover underline */}
                        {!active && (
                          <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-400/0 group-hover/dropdown:bg-orange-400 rounded-full transition-all duration-300" />
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(item.label)}
                        className={`p-1.5 -ml-0.5 transition-colors rounded-md hover:bg-white/5 ${
                          active
                            ? "text-orange-400"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={openDropdown === item.label}
                        aria-label={`展开 ${item.label} 子菜单`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {/* Dropdown */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 mt-1 w-56 origin-top transition-all duration-200 ${
                        openDropdown === item.label
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                      }`}
                    >
                      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 p-1.5">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          // 品牌（有子车型）→ 右箭头 + 右侧 flyout
                          if (child.children && child.children.length > 0) {
                            return (
                              <div
                                key={child.label}
                                className="relative group/brand"
                              >
                                <Link
                                  href={child.href}
                                  className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${
                                    childActive
                                      ? "text-orange-400 bg-orange-400/10"
                                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                                  }`}
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <span>{child.label}</span>
                                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover/brand:text-zinc-400 transition-colors" />
                                </Link>
                                {/* Sub-flyout: 车型列表 */}
                                <div className="absolute left-full top-0 ml-1 w-28 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 p-1.5 opacity-0 invisible group-hover/brand:opacity-100 group-hover/brand:visible transition-all duration-150 origin-left">
                                  {child.children.map((model) => {
                                    const modelActive = pathname === model.href;
                                    return (
                                      <Link
                                        key={model.label}
                                        href={model.href}
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                          modelActive
                                            ? "text-orange-400 bg-orange-400/10"
                                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                                        }`}
                                        onClick={() => setOpenDropdown(null)}
                                      >
                                        {model.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`block px-4 py-2.5 text-sm rounded-lg transition-colors ${
                                childActive
                                  ? "text-orange-400 bg-orange-400/10"
                                  : "text-zinc-300 hover:text-white hover:bg-white/5"
                              }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`relative inline-flex items-center px-3.5 py-2 text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? "text-orange-400"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {/* Active indicator underline */}
                  {active && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-400 rounded-full" />
                  )}
                  {/* Hover underline */}
                  {!active && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-400/0 hover:bg-orange-400 rounded-full transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Contact us (desktop) */}
            <button
              type="button"
              onClick={openWeChatModal}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-zinc-200 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              联系我们
            </button>

            {/* CTA (desktop) */}
            <Link
              href="/agent/store/shunde-daliang"
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30 transition-all duration-300 hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              查看门店
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="切换菜单"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-0 z-40 transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-zinc-950 border-l border-white/5 shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
            <span className="text-sm font-medium text-zinc-400 tracking-wide">
              导航菜单
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={closeMobileMenu}
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Panel body */}
          <nav className="h-[calc(100%-8rem)] overflow-y-auto overscroll-contain px-4 py-6">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  <MobileDropdown
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    onClose={closeMobileMenu}
                  />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors min-h-[48px] ${
                      isActive(item)
                        ? "text-orange-400 bg-orange-400/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </nav>

          {/* Panel footer CTA */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-zinc-950">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openWeChatModal();
              }}
              className="w-full mb-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-medium text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              联系我们
            </button>
            <Link
              href="/agent/store/shunde-daliang"
              onClick={closeMobileMenu}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25"
            >
              <MapPin className="w-5 h-5" />
              查看门店
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileDropdown({
  item,
  pathname,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active =
    (item.matchPrefix && pathname.startsWith(item.matchPrefix)) ||
    pathname === item.href;

  return (
    <div>
      <div className="flex items-stretch rounded-xl overflow-hidden min-h-[48px]">
        {item.href && (
          <Link
            href={item.href}
            onClick={onClose}
            className={`flex-1 flex items-center px-4 text-[15px] font-medium transition-colors ${
              active
                ? "text-orange-400 bg-orange-400/10"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.label}
          </Link>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`px-4 flex items-center justify-center transition-colors rounded-r-xl ${
            active
              ? "text-orange-400 bg-orange-400/10 hover:bg-orange-400/15"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
          aria-expanded={open}
          aria-label={`展开 ${item.label} 子菜单`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 mt-1 space-y-0.5">
          {item.children!.map((child) => {
            const childActive = pathname === child.href;
            return (
              <Link
                key={child.label}
                href={child.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-lg text-sm transition-colors min-h-[44px] ${
                  childActive
                    ? "text-orange-400 bg-orange-400/10"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

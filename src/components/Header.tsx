"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CalendarCheck, Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { products } from "@/lib/products";
import { Logo } from "@/components/Logo";

type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href?: string;
  matchPrefix?: string;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "首页", href: "/" },
  {
    label: "产品中心",
    href: "/product",
    matchPrefix: "/product",
    children: products.map((p) => ({
      label: p.name,
      href: `/product/${p.slug}`,
    })),
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

  // Close dropdown when clicking outside the nav or pressing Escape
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

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md shadow-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center"
            aria-label={`${brand.zh} ${brand.en}`}
          >
            <Logo priority className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav
            ref={navRef}
            className="hidden md:flex items-center gap-1"
            aria-label="主导航"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const linkClass = `inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-zinc-300 hover:text-white"
              }`;
              if (item.children && item.href) {
                return (
                  <div key={item.label} className="relative">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={linkClass}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(item.label)}
                        className={`p-2 -ml-1 transition-colors ${
                          active
                            ? "text-orange-400"
                            : "text-zinc-300 hover:text-white"
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={openDropdown === item.label}
                        aria-label={`展开 ${item.label} 子菜单`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {openDropdown === item.label && (
                      <div className="absolute left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-2 z-10">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return item.children ? (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.label)}
                    className={linkClass}
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={`ml-1 w-4 h-4 transition-transform ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-2 z-10">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href!} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA (desktop) */}
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-md shadow-orange-900/30 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            预约咨询
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-zinc-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="切换菜单"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <MobileDropdown
                  key={item.label}
                  item={item}
                  onClose={() => setMobileOpen(false)}
                />
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="block px-3 py-3 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
          <div className="mt-2 pt-3 border-t border-zinc-800 px-4 pb-4">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <CalendarCheck className="w-5 h-5" />
              预约咨询
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileDropdown({ item, onClose }: { item: NavItem; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="w-full flex items-stretch border border-zinc-800 rounded-md overflow-hidden min-h-[44px]">
        <Link
          href={item.href!}
          onClick={() => onClose?.()}
          className="flex-1 flex items-center px-3 text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          {item.label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-4 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 hover:text-white border-l border-zinc-800"
          aria-expanded={open}
          aria-label={`展开 ${item.label} 子菜单`}
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && (
        <div className="pl-2 mt-1 space-y-1">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              onClick={() => onClose?.()}
              className="block px-3 py-3 rounded-md text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white min-h-[44px]"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

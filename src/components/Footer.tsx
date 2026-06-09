import Link from "next/link";
import { Phone, MapPin, Clock, Mail, ArrowUpRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { products } from "@/lib/products";
import { Logo } from "@/components/Logo";

const QUICK_LINKS = [
  { label: "首页", href: "/" },
  { label: "产品中心", href: "/product" },
  { label: "门店服务", href: "/agent" },
  { label: "品牌介绍", href: "/brand" },
  { label: "品牌资讯", href: "/news" },
];

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 text-zinc-400">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-14 lg:py-20">
          {/* Brand column — spans 4 on desktop */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-block mb-5"
              aria-label={`${brand.zh} ${brand.en}`}
            >
              <Logo className="h-9 w-auto brightness-110" />
            </Link>
            <p className="text-sm leading-relaxed text-zinc-500 max-w-xs">
              {brand.shortDescription}
            </p>
            {/* Slogan */}
            <p className="mt-4 text-xs tracking-widest text-orange-400/70 uppercase">
              {brand.slogan}
            </p>
          </div>

          {/* Quick nav — spans 2 */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-xs font-semibold text-zinc-300 tracking-widest uppercase mb-5">
              快捷导航
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product center — spans 3 */}
          <div className="sm:col-span-1 lg:col-span-3">
            <h3 className="text-xs font-semibold text-zinc-300 tracking-widest uppercase mb-5">
              产品中心
            </h3>
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {p.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — spans 3 */}
          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="text-xs font-semibold text-zinc-300 tracking-widest uppercase mb-5">
              联系方式
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors duration-200">
                  <MapPin className="w-4 h-4 text-orange-400" />
                </span>
                <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200">
                  {brand.address}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors duration-200">
                  <Phone className="w-4 h-4 text-orange-400" />
                </span>
                <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200">
                  {brand.phone}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors duration-200">
                  <Clock className="w-4 h-4 text-orange-400" />
                </span>
                <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200">
                  {brand.businessHours}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors duration-200">
                  <Mail className="w-4 h-4 text-orange-400" />
                </span>
                <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200">
                  {brand.email}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-600">
              © {brand.foundedYear} {brand.en} {brand.zh}. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>{brand.icp}</span>
              <span className="w-px h-3 bg-zinc-800" />
              <span>{brand.police}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

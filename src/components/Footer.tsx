import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { brand } from "@/lib/brand";
import { products } from "@/lib/products";
import { Logo } from "@/components/Logo";

const QUICK_LINKS = [
  { label: "首页", href: "/" },
  { label: "产品中心", href: "/product" },
  { label: "门店服务", href: "/agent" },
  { label: "品牌介绍", href: "/brand" },
  { label: "资质证书", href: "/brand/certifications" },
  { label: "品牌历程", href: "/brand/history" },
  { label: "品牌资讯", href: "/news" },
  { label: "预约咨询", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-block mb-4"
              aria-label={`${brand.zh} ${brand.en}`}
            >
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {brand.shortDescription}
            </p>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              快捷导航
            </h3>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product center */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              产品中心
            </h3>
            <ul className="space-y-2 text-sm">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              联系方式
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>{brand.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{brand.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{brand.businessHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 text-sm text-center text-zinc-600">
          <p>
            © {brand.foundedYear} {brand.en} {brand.zh}. All Rights Reserved.
          </p>
          <div className="mt-2 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <span>{brand.icp}</span>
            <span className="hidden md:inline">·</span>
            <span>{brand.police}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

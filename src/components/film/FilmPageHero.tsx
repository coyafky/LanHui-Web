import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";

export function FilmPageHero({
  title,
  description,
  breadcrumbLabel,
}: {
  title: string;
  description: string;
  breadcrumbLabel: string;
}) {
  return (
    <>
      <Header />
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 -z-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 bg-orange-500" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center text-sm text-zinc-500 mb-6">
            <Link href="/product" className="hover:text-white transition-colors">
              产品中心
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-zinc-300">{breadcrumbLabel}</span>
          </nav>
          <p className="inline-block text-xs tracking-widest mb-3 text-orange-400">
            汽车膜系
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </section>
    </>
  );
}
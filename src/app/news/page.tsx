import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Newspaper,
  Sparkles,
  Tag,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getArticles } from "@/lib/data";
import type { NewsItem } from "@/lib/news";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "品牌资讯 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改品牌资讯，覆盖品牌动态、门店动态与产品动态。",
};

const PAGE_SIZE = 5;
const CATEGORY_OPTIONS = [
  "车型方案",
  "产品知识",
  "施工与养护",
  "门店动态",
  "品牌动态",
  "产品动态",
] as const;

type SearchParams = {
  page?: string | string[];
  category?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeCategory(value: string | string[] | undefined): string | undefined {
  const category = firstParam(value);
  if (!category) return undefined;
  return CATEGORY_OPTIONS.includes(category as (typeof CATEGORY_OPTIONS)[number])
    ? category
    : undefined;
}

function parseCurrentPage(value: string | string[] | undefined): number {
  const raw = firstParam(value);
  return Math.max(1, parseInt(raw ?? "1", 10) || 1);
}

function pageHref(page: number, category?: string): string {
  const searchParams = new URLSearchParams();
  if (category) searchParams.set("category", category);
  if (page > 1) searchParams.set("page", String(page));
  const query = searchParams.toString();
  return query ? `/news?${query}` : "/news";
}

function categoryHref(category?: string): string {
  if (!category) return "/news";
  return `/news?category=${encodeURIComponent(category)}`;
}

function buildPaginationItems(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const pageNumbers: number[] = [];
  const pageWindow = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - pageWindow && i <= page + pageWindow)
    ) {
      pageNumbers.push(i);
    }
  }

  const items: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of pageNumbers) {
    if (prev && n - prev > 1) items.push("ellipsis");
    items.push(n);
    prev = n;
  }
  return items;
}

function NewsHero({
  total,
  activeCategory,
}: {
  total: number;
  activeCategory?: string;
}) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#09090b_0%,#111827_46%,#09090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14 md:pt-28 md:pb-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm tracking-widest text-orange-400 mb-4">
            <Newspaper className="w-4 h-4" aria-hidden />
            NEWS CENTER
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            内容中心
          </h1>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            围绕车型方案、产品知识、施工养护与门店动态，整理车主做轻改决策前需要看的内容。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
              <BookOpen className="w-4 h-4 text-orange-400" aria-hidden />
              {total} 篇已发布
            </span>
            {activeCategory ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-900/60 bg-orange-950/30 px-3 py-1.5 text-sm text-orange-300">
                <Filter className="w-4 h-4" aria-hidden />
                当前分类：{activeCategory}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryTabs({ activeCategory }: { activeCategory?: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="mb-3 flex items-center gap-2 text-xs tracking-widest text-zinc-500">
        <Filter className="w-4 h-4" aria-hidden />
        CATEGORY
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-label="资讯分类筛选">
        <Link
          href={categoryHref()}
          aria-current={!activeCategory ? "page" : undefined}
          className={
            !activeCategory
              ? "rounded-md border border-orange-700/60 bg-orange-500/15 px-3 py-2 text-sm text-orange-300"
              : "rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-orange-400 hover:border-zinc-700"
          }
        >
          全部
        </Link>
        {CATEGORY_OPTIONS.map((category) => (
          <Link
            key={category}
            href={categoryHref(category)}
            aria-current={activeCategory === category ? "page" : undefined}
            className={
              activeCategory === category
                ? "rounded-md border border-orange-700/60 bg-orange-500/15 px-3 py-2 text-sm text-orange-300"
                : "rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-orange-400 hover:border-zinc-700"
            }
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewsCard({ item, featured }: { item: NewsItem; featured: boolean }) {
  return (
    <Card
      className="bg-zinc-900 border border-zinc-800 text-white shadow-none transition-colors hover:border-zinc-700"
    >
      <article>
        <CardHeader className="gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
            {featured ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-orange-800/60 bg-orange-500/20 px-2 py-1 text-orange-400">
                <Sparkles className="w-3 h-3" aria-hidden />
                推荐阅读
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300">
              <Tag className="w-3 h-3" aria-hidden />
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 px-1 py-1">
              <Calendar className="w-3 h-3" aria-hidden />
              {item.date}
            </span>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">
            <Link
              href={`/news/${item.slug}`}
              className="transition-colors hover:text-orange-300"
            >
              {item.title}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
            {item.summary}
          </p>
        </CardContent>
        <CardFooter className="border-zinc-800 bg-zinc-950/40">
          <Link
            href={`/news/${item.slug}`}
            className="inline-flex items-center text-orange-400 font-medium text-sm hover:text-orange-300 transition-colors"
          >
            阅读全文
            <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
          </Link>
        </CardFooter>
      </article>
    </Card>
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeCategory = normalizeCategory(params.category);
  const currentPage = parseCurrentPage(params.page);
  const { articles: newsItems, pagination } = await getArticles({
    status: "published",
    category: activeCategory,
    limit: PAGE_SIZE,
    page: currentPage,
  });

  const { page, totalPages } = pagination;
  const items = buildPaginationItems(page, totalPages);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCategory ? `${activeCategory}资讯` : "蓝辉轻改内容中心",
    description: metadata.description,
    url: activeCategory ? `/news?category=${activeCategory}` : "/news",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pagination.total,
      itemListElement: newsItems.map((item, index) => ({
        "@type": "ListItem" as const,
        position: (page - 1) * PAGE_SIZE + index + 1,
        name: item.title,
        url: `/news/${item.slug}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col bg-zinc-950">
        <NewsHero total={pagination.total} activeCategory={activeCategory} />

        <section className="py-12 md:py-16 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryTabs activeCategory={activeCategory} />
            {newsItems.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-14 text-center">
                <Newspaper className="w-8 h-8 text-zinc-600 mx-auto mb-3" aria-hidden />
                <p className="text-zinc-400">当前分类暂无资讯</p>
                <Link
                  href="/news"
                  className="mt-4 inline-flex items-center text-sm text-orange-400 hover:text-orange-300"
                >
                  查看全部资讯
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {newsItems.map((item, index) => (
                  <NewsCard
                    key={item.slug}
                    item={item}
                    featured={page === 1 && index === 0 && !activeCategory}
                  />
                ))}
              </div>
            )}

            <p className="text-center text-xs text-zinc-600 pt-4 flex items-center justify-center gap-2">
              <Newspaper className="w-4 h-4" aria-hidden />
              共 {pagination.total} 条资讯 · 持续更新中
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-1 pt-6"
                aria-label="分页"
              >
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1, activeCategory)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden />
                    上一页
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {items.map((it, idx) =>
                    it === "ellipsis" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-2 text-zinc-600 select-none"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={it}
                        href={pageHref(it, activeCategory)}
                        aria-current={it === page ? "page" : undefined}
                        className={
                          it === page
                            ? "rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white"
                            : "rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        }
                      >
                        {it}
                      </Link>
                    )
                  )}
                </div>

                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1, activeCategory)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}

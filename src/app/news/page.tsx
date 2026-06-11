import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getArticles } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "品牌资讯 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改品牌资讯，覆盖品牌动态、门店动态与产品动态。",
};

const PAGE_SIZE = 5;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { articles: newsItems, pagination } = await getArticles({
    status: "published",
    limit: PAGE_SIZE,
    page: currentPage,
  });

  function pageHref(page: number): string {
    if (page <= 1) return "/news";
    return `/news?page=${page}`;
  }

  // Build page numbers to display: first, last, current ±1
  const pageNumbers: number[] = [];
  const { page, totalPages } = pagination;
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
      pageNumbers.push(i);
    }
  }
  // Add ellipsis markers
  const items: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of pageNumbers) {
    if (prev && n - prev > 1) items.push("ellipsis");
    items.push(n);
    prev = n;
  }

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">NEWS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">品牌资讯</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              关注蓝辉轻改的品牌、门店与产品动态。
            </p>
          </div>
        </section>

        {/* News list */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {newsItems.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">暂无资讯</p>
            ) : (
              newsItems.map((item) => (
                <article
                  key={item.slug}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.date}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-950/40 border border-blue-800/50 text-blue-300 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center text-orange-400 font-medium text-sm hover:text-orange-300 transition-colors"
                  >
                    阅读全文
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </article>
              ))
            )}

            <p className="text-center text-xs text-zinc-600 pt-4 flex items-center justify-center gap-2">
              <Newspaper className="w-4 h-4" />
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
                    href={pageHref(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                        href={pageHref(it)}
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
                    href={pageHref(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

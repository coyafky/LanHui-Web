import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, ArrowLeft, Tag, Newspaper } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { newsItems, getAllNewsSlugs } from "@/lib/news";

export function generateStaticParams() {
  return getAllNewsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return { title: "资讯详情 | 蓝辉轻改 LANHUI" };
  return {
    title: `${item.title} | 品牌资讯 | 蓝辉轻改 LANHUI`,
    description: item.summary,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) notFound();

  // Related: same category, exclude self
  const related = newsItems
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <nav className="flex items-center text-sm text-zinc-500 mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                首页
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link
                href="/news"
                className="hover:text-white transition-colors"
              >
                品牌资讯
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300 line-clamp-1">{item.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-950/40 border border-blue-800/50 text-blue-300">
                <Tag className="w-3 h-3" />
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                {item.date}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {item.title}
            </h1>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-10">
              <p className="text-lg text-zinc-200 leading-relaxed mb-8 border-l-4 border-orange-500 pl-4">
                {item.summary}
              </p>

              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4">
                <p>
                  蓝辉轻改将围绕「让爱车更有型，也更好用」这一长期方向，逐步完善
                  产品矩阵、门店服务与品牌内容。
                </p>
                <p>
                  本条资讯为
                  <span className="text-orange-400 font-medium mx-1">
                    {item.category}
                  </span>
                  类内容，详细说明将根据品牌发展节奏持续补充。当前阶段，门店网络与
                  真实业务数据以
                  <Link
                    href="/agent"
                    className="text-blue-400 hover:text-blue-300 mx-1"
                  >
                    顺德大良店
                  </Link>
                  公开信息为准。
                </p>
                <p className="text-sm text-zinc-500">
                  如果您希望第一时间获取品牌动态，可在
                  <Link
                    href="/contact"
                    className="text-orange-400 hover:text-orange-300 mx-1"
                  >
                    预约咨询
                  </Link>
                  页面留下联系方式，我们会在有重要更新时主动同步。
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
              <Link
                href="/news"
                className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回资讯列表
              </Link>
              <Link
                href="/agent"
                className="inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                查看顺德大良店
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-12 bg-black border-t border-zinc-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-6">
                <Newspaper className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-bold text-white">相关资讯</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/news/${r.slug}`}
                    className="group block bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 p-5 transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/50 text-blue-300">
                        {r.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {r.date}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                      {r.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

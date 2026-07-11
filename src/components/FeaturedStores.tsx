import Image from "next/image";
import Link from "next/link";
import { listStores } from "@/lib/store-query";

/** Next/Image placeholder：1x1 灰图 base64，避免 CLS（~30 字节） */
const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";

const STORE_PLACEHOLDER = "/images/placeholders/store.webp";

/**
 * 首页「推荐门店」section
 * - RSC：零 JS 增量
 * - 数据通过 getStores({ level: "flagship", limit: 4 }) 拉取（API 优先 / 静态 fallback）
 * - 过滤 s.isActive !== false（向后兼容：缺失字段视为 true）
 * - 空守卫：active.length === 0 时整个 section 不渲染
 * - 4 列响应式：mobile 1 / sm 2 / lg 4
 * - 视觉对齐 ProductsQuickEntry（标题 tracking-widest text-blue-400、卡片 bg-zinc-900 border-zinc-800）
 */
export async function FeaturedStores() {
  const stores = listStores({ level: "flagship", limit: 4 });
  const active = stores.filter((s) => s.isActive !== false);

  if (active.length === 0) return null;

  return (
    <section className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm tracking-widest text-blue-400 mb-3">
            FEATURED STORES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            推荐门店
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            精选星辉旗舰店，优先展示已开放的旗舰服务中心。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {active.map((store) => (
            <Link
              key={store.id}
              href={`/agent/store/${store.id}`}
              className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-colors"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                <Image
                  src={store.image ?? STORE_PLACEHOLDER}
                  alt={`${store.name} 门头实景`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {store.name}
                </h3>
                <span className="inline-flex items-center mt-2 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  {store.cityLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

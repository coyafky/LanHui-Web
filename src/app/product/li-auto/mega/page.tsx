import type { Metadata } from "next";
import Link from "next/link";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { liAutoMegaPageConfig } from "@/lib/li-auto-mega-page-config";
import { LiAutoMegaTopicViewTrack } from "@/components/li-auto/LiAutoMegaTopicViewTrack";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import {
  liAutoMegaUpgradeProjects,
  LI_AUTO_MEGA_PROJECT_COUNT,
} from "@/lib/li-auto-mega-products";

const MODEL_KEY = "MEGA" as const;
const MODEL_NAME = "理想 MEGA";
const CANONICAL_PATH = "/product/li-auto/mega";

const PAGE_TITLE =
  "理想 MEGA 轻改升级方案｜车衣隔热膜铝地板电吸门小桌板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理理想 MEGA 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、铝地板、平衡杆、360 软包脚垫、底盘护板、包围、防虫网、尾翼、主副驾电吸门、刹车卡钳、迎宾踏板、小桌板、大灯、轮毂和内饰镀膜等 18 项项目。新车保护、商务座舱、外观个性、行车防护与灯光细节 5 大场景，到店评估、按标准流程施工。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想 MEGA 轻改",
    "理想 MEGA 改装",
    "理想 MEGA 车衣",
    "理想 MEGA 隔热膜",
    "理想 MEGA 铝地板",
    "理想 MEGA 电吸门",
    "理想 MEGA 小桌板",
    "理想 MEGA 底盘护板",
    "蓝辉轻改",
  ],
  alternates: {
    canonical: CANONICAL_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function LiAutoMegaPage() {
  const breadcrumbItems = getProductBreadcrumbs(CANONICAL_PATH);
  const breadcrumbSchema = getProductBreadcrumbSchema(CANONICAL_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    numberOfItems: liAutoMegaUpgradeProjects.length,
    itemListElement: liAutoMegaUpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#project-${p.key}`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col bg-zinc-950">
        <LiAutoMegaTopicViewTrack
          topicKey="li-auto-mega"
          brandSlug="li-auto"
          modelSlug="mega"
          projectCount={LI_AUTO_MEGA_PROJECT_COUNT}
        />

        <VehiclePageRenderer config={liAutoMegaPageConfig} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/product/li-auto"
              className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors"
            >
              返回理想系列
            </Link>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WindowFilmPackageDetail } from "@/components/window-film/WindowFilmPackageDetail";
import {
  getAllWindowFilmPackageSlugsWithDetails,
  getWindowFilmPackageWithDetails,
} from "@/lib/window-film-details";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

type Params = { packageSlug: string };

/** PRD §10.1 + §14.2 — 静态生成 7 个套餐详情页 */
export async function generateStaticParams(): Promise<Params[]> {
  return getAllWindowFilmPackageSlugsWithDetails().map((slug) => ({
    packageSlug: slug,
  }));
}

/** PRD §14.2 — 每个详情页独立 metadata */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { packageSlug } = await params;
  const pkg = getWindowFilmPackageWithDetails(packageSlug);
  if (!pkg) {
    return {
      title: "套餐未找到 | 蓝辉轻改 LANHUI",
    };
  }
  const title = `${pkg.name}汽车窗膜方案 | 蓝辉轻改 LANHUI`;
  const description = `${pkg.name}适合${pkg.audience}，前挡采用${pkg.frontProduct}，侧后挡采用${pkg.rearProduct}，围绕隔热、防晒、隐私与日常驾驶舒适度提供汽车窗膜搭配说明。`;
  return {
    title,
    description,
    // 不写价格、不写"最强"、不写"官方指定"、不写未授权案例（PRD §14.2 注）
  };
}

export default async function WindowFilmPackagePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { packageSlug } = await params;
  const pkg = getWindowFilmPackageWithDetails(packageSlug);
  if (!pkg) notFound();

  const breadcrumbItems = getProductBreadcrumbs("/product/window-film");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/window-film");

  return (
    <>
      <WindowFilmPackageDetail pkg={pkg} breadcrumbItems={breadcrumbItems} />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
        />
      )}
    </>
  );
}

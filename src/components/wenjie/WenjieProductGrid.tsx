import { WenjieProductCard } from "./WenjieProductCard";
import { type WenjieProduct } from "@/lib/wenjie-products";

type WenjieProductGridProps = {
  products: WenjieProduct[];
};

/**
 * 车型分组内的产品卡片网格（Server Component）
 */
export function WenjieProductGrid({ products }: WenjieProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <WenjieProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
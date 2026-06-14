import { XiaomiProductCard } from "./XiaomiProductCard";
import { type XiaomiProduct } from "@/lib/xiaomi-products";

type XiaomiProductGridProps = {
  products: XiaomiProduct[];
};

/**
 * 车型分组内的产品卡片网格（Server Component）
 */
export function XiaomiProductGrid({ products }: XiaomiProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <XiaomiProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
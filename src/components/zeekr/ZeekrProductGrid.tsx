import { ZeekrProductCard } from "./ZeekrProductCard";
import { type ZeekrProduct } from "@/lib/zeekr-products";

type ZeekrProductGridProps = {
  products: ZeekrProduct[];
};

/**
 * 车型分组内的产品卡片网格（Server Component）
 * 与 wenjie 网格结构一致:1/2/3/4 列响应式
 */
export function ZeekrProductGrid({ products }: ZeekrProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <ZeekrProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

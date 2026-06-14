import Image from "next/image";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  xiaomiCategoryLabel,
  type XiaomiProduct,
} from "@/lib/xiaomi-products";

type XiaomiProductTableProps = {
  products: XiaomiProduct[];
};

/**
 * 产品表格：序号 / 产品名称 / 主分类 / 图片缩略
 * PRD §5.2：仅展示用，不含价格、材质承诺
 */
export function XiaomiProductTable({ products }: XiaomiProductTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-16 text-zinc-400">序号</TableHead>
            <TableHead className="text-zinc-400">产品名称</TableHead>
            <TableHead className="text-zinc-400 hidden md:table-cell">
              主分类
            </TableHead>
            <TableHead className="text-zinc-400 w-24 hidden sm:table-cell">
              缩略
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className="border-zinc-800">
              <TableCell className="text-zinc-400 font-mono">
                {String(p.orderInModel).padStart(2, "0")}
              </TableCell>
              <TableCell className="text-white font-medium">
                {p.displayName}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  {xiaomiCategoryLabel[p.category]}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="relative w-16 h-12 bg-zinc-950 rounded-md overflow-hidden">
                  <Image
                    src={p.image.publicPath}
                    alt={p.image.alt}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    loading="lazy"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
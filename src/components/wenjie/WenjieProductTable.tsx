import { ImageIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type WenjieProduct } from "@/lib/wenjie-products";

type WenjieProductTableProps = {
  products: WenjieProduct[];
};

/**
 * 产品表格：车型 / 序号 / 产品名称 / 分类 / 图片状态
 * PRD §8.4：完整列出 44 个产品行；字段见 PRD §8.4
 */
export function WenjieProductTable({ products }: WenjieProductTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-16 text-zinc-400">车型</TableHead>
            <TableHead className="w-16 text-zinc-400">序号</TableHead>
            <TableHead className="text-zinc-400">产品名称</TableHead>
            <TableHead className="text-zinc-400 hidden md:table-cell">
              分类
            </TableHead>
            <TableHead className="text-zinc-400 hidden sm:table-cell w-32">
              图片状态
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className="border-zinc-800">
              <TableCell className="font-mono">
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30"
                >
                  {p.vehicleModel}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-400 font-mono">
                {String(p.orderInModel).padStart(2, "0")}
              </TableCell>
              <TableCell className="text-white font-medium">
                {p.productName}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  {p.category}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {p.imageStatus === "matched" ? (
                  <Badge
                    variant="outline"
                    className="border-cyan-700/60 text-cyan-400"
                  >
                    已匹配
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden />
                    图片待补充
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
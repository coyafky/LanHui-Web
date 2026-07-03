import Link from "next/link";
import { Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = {
  services: readonly ServiceRoute[];
};

const ICON_MAP: Record<string, typeof Sparkles> = {
  flooring: Layers,
  "floor-mats": Sparkles,
};

const TAGLINE_MAP: Record<string, string> = {
  flooring: "地板、滑轨、尾箱区域统一升级，提升座舱完整度",
  "floor-mats": "多款汽车垫图库展示，覆盖座舱、后排、尾箱与细节效果",
};

export function PracticalAccessoryMap({ services }: Props) {
  if (services.length === 0) return null;

  return (
    <section
      aria-labelledby="practical-accessory-title"
      className="relative overflow-hidden rounded-3xl border border-amber-900/40 bg-zinc-950"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(245,158,11,0.14),transparent_34%),linear-gradient(135deg,rgba(113,63,18,0.18),transparent_58%)]"
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs tracking-widest text-amber-400 mb-2">
            PRACTICAL ACCESSORIES · 实用配件
          </p>
          <h2
            id="practical-accessory-title"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            围绕座舱日常使用的保护与质感升级
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            从汽车地板到汽车垫，优先解决清洁维护、空间整洁和内饰统一感。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = ICON_MAP[service.serviceSlug] ?? Sparkles;
            const tagline = TAGLINE_MAP[service.serviceSlug] ?? service.title;

            return (
              <Link
                key={service.serviceSlug}
                href={service.canonicalPath}
                className="group block"
              >
                <Card className="h-full bg-zinc-900/70 border-zinc-800 text-zinc-100 transition-colors group-hover:border-amber-600/60 group-hover:bg-zinc-900">
                  <CardHeader>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-700/40 bg-amber-950/40">
                        <Icon
                          className="h-5 w-5 text-amber-300"
                          aria-hidden="true"
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-600/40 bg-amber-500/10 text-amber-200"
                      >
                        {service.status === "live" ? "已上线" : "整理中"}
                      </Badge>
                    </div>
                    <CardTitle className="text-white group-hover:text-amber-100">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {tagline}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

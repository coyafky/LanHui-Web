import { CheckCircle2, Layers, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { carMatScenarios, carMatValues } from "@/lib/carmat-products";

const ICONS = [CheckCircle2, Layers, Sparkles, CheckCircle2] as const;

export function CarMatValueGrid() {
  return (
    <section className="bg-black py-14 md:py-18 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 md:mb-11">
          <p className="text-xs tracking-widest text-amber-400 mb-3">
            WHY CARMAT
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            不只是一张脚垫，而是座舱日常保护方案
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-zinc-400 leading-relaxed">
            页面先展示已有产品图和服务边界，具体覆盖区域、颜色和安装方式需要结合到店车型确认。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {carMatValues.map((value, index) => {
            const Icon = ICONS[index] ?? CheckCircle2;

            return (
              <Card
                key={value.title}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-950/40">
                    <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-white">{value.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {carMatScenarios.map((scenario) => (
            <Card
              key={scenario.label}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            >
              <CardHeader>
                <Badge
                  variant="outline"
                  className="w-fit border-amber-600/40 bg-amber-500/10 text-amber-200"
                >
                  {scenario.label}
                </Badge>
                <CardTitle className="text-white">{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {scenario.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

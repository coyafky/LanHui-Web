import { CircleDot, Gauge, Ruler, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wheelFitmentChecks, wheelValues } from "@/lib/wheel-products";

const ICONS = [Ruler, CircleDot, Gauge, ShieldCheck] as const;

export function WheelValueGrid() {
  return (
    <section className="bg-black py-14 md:py-18 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 md:mb-11">
          <p className="text-xs tracking-widest text-sky-400 mb-3">
            FITMENT FIRST
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            轮毂升级先看数据，再看风格
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-zinc-400 leading-relaxed">
            轮毂不是只换外观。尺寸、ET、孔距、中心孔、载重和轮胎规格都需要结合原车状态确认。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {wheelValues.map((value, index) => {
            const Icon = ICONS[index] ?? CircleDot;

            return (
              <Card
                key={value.title}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-sky-700/40 bg-sky-950/40">
                    <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
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

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {wheelFitmentChecks.map((item) => (
            <Card
              key={item.label}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            >
              <CardHeader>
                <Badge
                  variant="outline"
                  className="w-fit border-sky-600/40 bg-sky-500/10 text-sky-200"
                >
                  {item.label}
                </Badge>
                <CardTitle className="text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

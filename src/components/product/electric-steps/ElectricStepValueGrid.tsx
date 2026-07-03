import { Cable, Footprints, ShieldCheck, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  electricStepFitmentChecks,
  electricStepValues,
} from "@/lib/electric-step-products";

const ICONS = [Footprints, Truck, ShieldCheck, Cable] as const;

export function ElectricStepValueGrid() {
  return (
    <section className="bg-black py-14 md:py-18 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 md:mb-11">
          <p className="text-xs tracking-widest text-orange-400 mb-3">
            STEP SYSTEM
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            电动踏板先确认结构，再确认款式
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-zinc-400 leading-relaxed">
            电动踏板涉及底盘安装位、门体信号和电气接口，适配面广，但必须以实车检查为准。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {electricStepValues.map((value, index) => {
            const Icon = ICONS[index] ?? Footprints;

            return (
              <Card
                key={value.title}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-orange-700/40 bg-orange-950/40">
                    <Icon className="h-5 w-5 text-orange-300" aria-hidden="true" />
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
          {electricStepFitmentChecks.map((item) => (
            <Card
              key={item.label}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            >
              <CardHeader>
                <Badge
                  variant="outline"
                  className="w-fit border-orange-600/40 bg-orange-500/10 text-orange-200"
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

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { electricStepProcess } from "@/lib/electric-step-products";

export function ElectricStepServiceFlow() {
  return (
    <section className="bg-zinc-950 py-14 md:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 md:mb-11">
          <p className="text-xs tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            电动踏板到店流程
          </h2>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400">
            先确认车型结构，再选择灯带款式，最后完成安装调试和交付复查。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {electricStepProcess.map((item) => (
            <Card
              key={item.step}
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            >
              <CardHeader>
                <span className="text-xs tracking-widest text-orange-400">
                  {item.step}
                </span>
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

        <div className="mt-10 rounded-2xl border border-orange-900/40 bg-orange-950/15 p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              电动踏板必须以实车确认结果为准
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              建议提前准备车型、年款和主要乘员使用场景，现场确认底盘固定点、电气接口、灯带方式和离地间隙。
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-orange-400 md:mt-0"
          >
            联系蓝辉轻改
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

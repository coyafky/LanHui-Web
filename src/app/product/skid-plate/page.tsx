import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Gauge, Wrench, ClipboardCheck, MapPin, MessageCircle } from "lucide-react";
import { getServiceRoute } from "@/lib/product-routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { openWeChatModal } from "@/lib/wechat-modal";

export const metadata: Metadata = {
  title: "底盘护板｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改提供底盘护板安装服务，保护底盘免受路面冲击，适合城市与轻度越野用车场景。",
};

const valuePoints = [
  {
    icon: ShieldCheck,
    title: "防护升级",
    description: "有效抵御路面碎石、坑洼对底盘关键部件的冲击，降低维修成本。",
  },
  {
    icon: Gauge,
    title: "轻量化材质",
    description: "采用高强度铝合金或复合材质，兼顾防护性能与整车轻量化需求。",
  },
  {
    icon: Wrench,
    title: "专车开模",
    description: "针对主流新能源车型开模，原车孔位安装，不破坏原车结构。",
  },
  {
    icon: ClipboardCheck,
    title: "质保无忧",
    description: "提供安装后质保服务，让您放心驾驶、无忧出行。",
  },
];

const serviceSteps = [
  {
    step: "01",
    title: "到店检测",
    description: "技师对车辆底盘进行全面检查，确认护板适配规格。",
  },
  {
    step: "02",
    title: "专业安装",
    description: "使用专业工具进行安装，确保贴合紧密、无异响。",
  },
  {
    step: "03",
    title: "交车验收",
    description: "安装完成后进行路试验收，确认防护效果与驾驶体验。",
  },
];

export default async function SkidPlatePage() {
  const service = getServiceRoute("skid-plate");
  if (!service || service.type !== "service_category") notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/skid-plate");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/skid-plate");

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "底盘护板安装服务",
    provider: { "@type": "Organization", name: "蓝辉轻改" },
    description: "蓝辉轻改提供底盘护板安装服务，保护底盘免受路面冲击。",
    areaServed: { "@type": "City", name: "深圳" },
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {breadcrumbItems && breadcrumbItems.length > 0 && (
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />
          )}

          {/* H1 + 简介 */}
          <div className="mb-14 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
              底盘护板
            </h1>
            <p className="text-zinc-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              底盘护板是安装在车辆底盘下方的保护装置，能有效防止路面碎石、坑洼及异物对发动机、
              变速箱、油箱等关键部件的冲击。蓝辉轻改提供专车定制的底盘护板安装服务，
              兼顾防护性能与轻量化需求，让您的爱车从容应对复杂路况。
            </p>
          </div>

          {/* 价值点 Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">为什么选择底盘护板</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valuePoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="rounded-xl border border-cyan-800/50 bg-cyan-950/20 p-6 transition-colors hover:border-cyan-700/60"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/30 text-cyan-400 mb-4">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{point.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 服务流程 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">服务流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 pt-12 text-center"
                >
                  <span className="absolute top-4 left-4 text-4xl font-bold text-cyan-400/20 select-none">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 到店咨询 CTA */}
          <section className="text-center">
            <div className="inline-block rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/30 text-cyan-400 mb-5">
                <MessageCircle className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">到店咨询</h2>
              <p className="text-zinc-400 text-sm md:text-base mb-6 max-w-md mx-auto">
                底盘护板需根据具体车型定制方案，建议您到店或通过微信咨询，获取专属安装建议。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={openWeChatModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-500/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  微信咨询
                </button>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  返回产品中心
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InfoRow } from "@/components/InfoRow";
import { stores } from "@/lib/store";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "联系我们 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改顺德大良店联系方式：到店咨询、电话沟通，提供电动踏板、轮毂升级、汽车膜系等一站式轻改服务。",
};

// TODO: 后续从数据库/API获取
const contactData = {
  hotline: {
    number: "400-XXX-XXXX",
    displayNumber: "400-XXX-XXXX",
    serviceHours: "周一至周日 9:00-18:00",
  },
  wechat: {
    id: "lanhui_qinggai",
    qrCode: null as string | null,
  },
  serviceProcess: [
    {
      step: 1,
      title: "电话/到店咨询",
      description: "沟通需求，了解车型与用车场景",
    },
    {
      step: 2,
      title: "方案推荐",
      description: "技师根据车型推荐最优轻改方案",
    },
    {
      step: 3,
      title: "预约施工",
      description: "确认方案后预约施工时间",
    },
    {
      step: 4,
      title: "交付验收",
      description: "施工完成，验收确认，享受质保",
    },
  ],
  brandPromises: [
    "正品保证，假一赔十",
    "专业技师，持证上岗",
    "质保服务，售后无忧",
  ],
};

export default function ContactPage() {
  const store = stores[0];
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* 模块 1: Hero 区 */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              CONTACT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">联系我们</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              欢迎到店咨询，专业技师为您推荐最优轻改方案。
            </p>
          </div>
        </section>

        {/* 模块 2: 核心联系信息区 */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hotline card */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-6 h-6 text-orange-400" />
                    <h2 className="text-xl font-bold text-white">咨询热线</h2>
                  </div>
                  <a
                    href={
                      store?.phoneTel !== "#contact"
                        ? store?.phoneTel
                        : contactData.hotline.number.startsWith("400")
                          ? `tel:${contactData.hotline.number}`
                          : "#contact"
                    }
                    className="text-3xl md:text-4xl font-bold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {store?.phone !== "联系方式待补充"
                      ? store?.phone
                      : contactData.hotline.displayNumber}
                  </a>
                  <p className="text-sm text-zinc-400 mt-2">
                    服务时间：{contactData.hotline.serviceHours}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/agent"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-900/30 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    查找门店
                  </Link>
                </div>
              </div>
            </div>

            {/* Three-column info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 门店地址 */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    门店地址
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {store ? store.address : brand.address}
                </p>
              </div>

              {/* 营业时间 */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    营业时间
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {store ? store.businessHours : brand.businessHours}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {contactData.hotline.serviceHours}
                </p>
              </div>

              {/* 服务项目 */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    服务项目
                  </h3>
                </div>
                <ul className="text-sm text-zinc-400 space-y-1">
                  {["电动踏板升级", "轮毂升级", "底盘升级", "汽车窗膜", "改色膜", "隐形车衣"].map((service) => (
                    <li key={service} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400/70" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 模块 3: 门店信息卡片 */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Store info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-orange-400" />
                    {store ? store.name : brand.currentStore}
                  </h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    {store ? store.description : ""}
                  </p>
                  <dl className="space-y-4 text-sm">
                    <InfoRow
                      icon={<MapPin className="w-4 h-4 text-orange-400" />}
                      label="门店地址"
                    >
                      {store ? store.address : brand.address}
                    </InfoRow>
                    <InfoRow
                      icon={<Phone className="w-4 h-4 text-orange-400" />}
                      label="联系电话"
                    >
                      {store ? (
                        <a
                          href={store.phoneTel}
                          className="text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {store.phone}
                        </a>
                      ) : (
                        brand.phone
                      )}
                    </InfoRow>
                    <InfoRow
                      icon={<Clock className="w-4 h-4 text-orange-400" />}
                      label="营业时间"
                    >
                      {store ? store.businessHours : brand.businessHours}
                    </InfoRow>
                  </dl>
                </div>

                {/* Action side */}
                <div className="md:w-64 flex flex-col gap-4">
                  <Link
                    href={`/agent/store/${store?.id ?? "shunde-daliang"}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-900/30 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    导航到店
                  </Link>
                  <Link
                    href="/product"
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                  >
                    浏览产品
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 模块 4: 咨询须知/服务流程 */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-sm tracking-widest text-orange-400 mb-2">
                PROCESS
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                服务流程
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactData.serviceProcess.map((item) => (
                <div
                  key={item.step}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 relative"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                    <span className="text-lg font-bold text-orange-400">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 模块 5: 品牌信任区 */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  品牌承诺
                </h2>
                <p className="text-sm text-zinc-400 mt-2">
                  选择蓝辉轻改，享受专业保障与安心服务
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {contactData.brandPromises.map((promise) => (
                  <div
                    key={promise}
                    className="flex items-center justify-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800"
                  >
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                    <span className="text-base font-medium text-white">
                      {promise}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
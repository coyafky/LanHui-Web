import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Award } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CertCard } from "@/components/CertCard";
import { certifications, certCategories } from "@/lib/certifications";

export const metadata: Metadata = {
  title: "资质证书 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改资质证书概览，包括营业执照、行业认证、门店资质与品牌合作等。真实证书原件到店主动出示。",
};

export default function CertificationsPage() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
            <nav className="flex items-center justify-center text-sm text-zinc-500 mb-6">
              <Link href="/brand" className="hover:text-white transition-colors">
                品牌介绍
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">资质证书</span>
            </nav>
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              CERTIFICATIONS
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">资质证书</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              经营与服务的合规凭证，真实证书原件请到 {""}
              顺德大良店{""} 主动出示。
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {certCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-white">
                      {cat.label}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificates grid */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <CertCard key={cert.id} cert={cert} />
              ))}
            </div>
          </div>
        </section>

        {/* Notice */}
        <section className="py-12 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-white mb-3">关于证书核验</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              列表中展示的证书仅为品类与说明占位，具体证书编号、颁发日期与有效期信息
              {""}
              以 {""}
              <span className="text-orange-400 font-medium">
                顺德大良店现场出示
              </span>
              {""}
              为准。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

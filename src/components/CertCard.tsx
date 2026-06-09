import { Calendar, Award } from "lucide-react";
import type { Certification } from "@/lib/certifications";

type CertCardProps = {
  cert: Certification;
};

const CATEGORY_COLOR: Record<Certification["category"], string> = {
  营业执照: "border-blue-800/50 text-blue-300 bg-blue-950/40",
  行业认证: "border-orange-800/50 text-orange-300 bg-orange-950/40",
  门店资质: "border-yellow-800/50 text-yellow-300 bg-yellow-950/40",
  品牌合作: "border-zinc-700 text-zinc-300 bg-zinc-800",
};

export function CertCard({ cert }: CertCardProps) {
  const colorClass = CATEGORY_COLOR[cert.category];
  return (
    <article className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all flex flex-col">
      {/* Certificate visual placeholder */}
      <div className="relative h-56 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 10px, transparent 10px 20px)",
          }}
        />
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
        >
          {cert.category}
        </div>
        <div
          className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-dashed border-orange-700/60 flex items-center justify-center text-2xl"
          aria-hidden
        >
          {cert.badge}
        </div>
        <div className="relative text-center px-6">
          <div className="text-3xl font-bold text-zinc-400 tracking-widest">
            LANHUI
          </div>
          <div className="mt-2 text-sm text-zinc-500">{cert.title}</div>
          <div className="mt-3 text-xs text-zinc-600 italic">
            证书图占位 · 真实证书将在到店展示
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2">{cert.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4 flex-1">
          {cert.description}
        </p>
        <dl className="space-y-2 text-xs text-zinc-500 border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <dt className="sr-only">颁发方</dt>
            <dd className="line-clamp-1">{cert.issuer}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <dt className="sr-only">颁发日期</dt>
            <dd>
              <span className="text-zinc-400">{cert.issuedAt}</span>
              <span className="mx-1.5 text-zinc-700">|</span>
              <span className="text-zinc-400">有效期 {cert.validUntil}</span>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

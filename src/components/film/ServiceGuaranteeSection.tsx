import { serviceGuarantee } from "@/lib/products";

export function ServiceGuaranteeSection({ className = "" }: { className?: string }) {
  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            专车专用施工保障
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Construction capability */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 mb-4">
              施工能力
            </h3>
            <div className="grid gap-3">
              {serviceGuarantee.construction.map((c) => (
                <div
                  key={c.title}
                  className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
                >
                  <p className="text-white font-medium text-sm mb-1">{c.title}</p>
                  <p className="text-xs text-zinc-400">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Acceptance standards */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 mb-4">
              验收标准
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-950/40 text-orange-300">
                    <th className="px-4 py-2 text-left font-semibold border border-zinc-800">项目</th>
                    <th className="px-4 py-2 text-left font-semibold border border-zinc-800">标准</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceGuarantee.acceptance.map((a) => (
                    <tr key={a.item} className="border-b border-zinc-800">
                      <td className="px-4 py-2 border-x border-zinc-800 text-zinc-300">{a.item}</td>
                      <td className="px-4 py-2 border-x border-zinc-800 text-zinc-300">{a.standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
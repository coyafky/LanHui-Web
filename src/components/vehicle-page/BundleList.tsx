import type { BundleConfig, VehicleTheme } from "./vehicle-page.schema";

interface Props {
  bundles: BundleConfig[];
  theme: VehicleTheme;
}

export function BundleList({ bundles, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">套餐选择</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((b) => (
            <div key={b.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">{b.name}</h3>
              {b.description && <p className="text-sm text-zinc-400 mb-4">{b.description}</p>}
              {b.items && b.items.length > 0 && (
                <ul className="space-y-1.5">
                  {b.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

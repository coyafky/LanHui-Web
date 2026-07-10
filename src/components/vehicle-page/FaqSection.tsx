import { FaqItem, VehicleTheme } from "./vehicle-page.schema";

const THEME_ACCENT: Record<VehicleTheme, string> = {
  orange: "text-orange-400",
  cyan: "text-cyan-400",
  amber: "text-amber-400",
  blue: "text-blue-400",
  green: "text-emerald-400",
  red: "text-red-400",
  neutral: "text-zinc-400",
};

interface Props {
  items: FaqItem[];
  theme: VehicleTheme;
}

export function FaqSection({ items, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">常见问题</h2>
        <div className="space-y-4">
          {items.map((item, i) => (
            <details key={i} className="group rounded-xl border border-zinc-800 bg-zinc-900">
              <summary className={`cursor-pointer px-6 py-4 text-white font-medium ${THEME_ACCENT[theme]} group-open:${THEME_ACCENT[theme]}`}>
                {item.question}
              </summary>
              <p className="px-6 pb-4 text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

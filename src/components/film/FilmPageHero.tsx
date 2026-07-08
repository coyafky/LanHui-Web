import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

export function FilmPageHero({
  title,
  description,
  breadcrumbItems,
}: {
  title: string;
  description: string;
  breadcrumbItems?: readonly BreadcrumbItem[];
}) {
  return (
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 -z-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 bg-orange-500" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} align="center" className="mb-6" />}
          <p className="inline-block text-xs tracking-widest mb-3 text-orange-400">
            汽车膜系
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </section>
  );
}
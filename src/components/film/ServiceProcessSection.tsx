type ProcessStep = { step: string; title: string; description: string };

export function ServiceProcessSection({ process }: { process: ProcessStep[] }) {
  return (
    <section className="py-16 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">服务流程</h2>
          <p className="text-zinc-400 mt-3">到店交付，统一规范</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {process.map((p) => (
            <div
              key={p.step}
              className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
            >
              <p className="text-3xl font-bold text-orange-400 mb-3 tracking-wider">
                {p.step}
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
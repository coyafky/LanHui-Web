type ServiceStep = {
  step: number;
  title: string;
  description: string;
};

const STEPS: readonly ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认智界 V9 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据保护、外观、座舱、底盘、屏幕显示等分类选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示",
  },
  {
    step: 4,
    title: "方案确认",
    description: "确认项目组合、施工时间和注意事项",
  },
  {
    step: 5,
    title: "施工安装",
    description: "按项目标准施工，并做好车身和内饰保护",
  },
  {
    step: 6,
    title: "验收交付",
    description: "检查外观、功能和安装细节",
  },
  {
    step: 7,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const;

const STEP_LENGTH = 7;

function assertStepLength(steps: readonly ServiceStep[]): void {
  if (steps.length !== STEP_LENGTH) {
    throw new Error(
      `ZhijieBrandServiceFlow expects ${STEP_LENGTH} steps, got ${steps.length}`,
    );
  }
}

/**
 * 7 步到店服务流程（Server Component）
 * Amber 主题，与智界品牌配色一致
 * 4 列 / md:3 / sm:2 / mobile:1
 */
export function ZhijieBrandServiceFlow() {
  assertStepLength(STEPS);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="zhijie-service-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="zhijie-service-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            7 步到店服务流程
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {STEPS.map((s) => (
            <li
              key={s.step}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-amber-400 mb-2">
                {s.step.toString().padStart(2, "0")}
              </p>
              <p className="text-sm font-bold text-white mb-1">{s.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

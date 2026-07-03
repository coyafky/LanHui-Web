import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { electricStepFitmentTags } from "@/lib/electric-step-products";

type CloudItem = {
  label: string;
  note: string;
  desktopClassName: string;
  mobileClassName: string;
};

const MOBILE_WEIGHT_CLASS: Record<
  (typeof electricStepFitmentTags)[number]["weight"],
  string
> = {
  hero: "text-3xl text-teal-300",
  strong: "text-2xl text-amber-300",
  normal: "text-lg text-sky-200",
  subtle: "text-sm text-zinc-400",
};

const CLOUD_ITEMS: readonly CloudItem[] = [
  {
    label: "理想 L9",
    note: "老人小孩上下车",
    desktopClassName:
      "left-[34%] top-[35%] text-[4.8rem] text-teal-300 font-black",
    mobileClassName: "text-4xl text-teal-300 font-black",
  },
  {
    label: "问界 M8",
    note: "大六座家庭场景",
    desktopClassName:
      "left-[28%] top-[14%] text-[3.7rem] text-sky-300 font-black",
    mobileClassName: "text-3xl text-sky-300 font-black",
  },
  {
    label: "高山 8",
    note: "MPV 商务/家庭",
    desktopClassName:
      "left-[56%] top-[17%] text-[3.7rem] text-amber-300 font-black",
    mobileClassName: "text-3xl text-amber-300 font-black",
  },
  {
    label: "腾势 D9",
    note: "商务 MPV 高频上下车",
    desktopClassName:
      "left-[53%] top-[55%] text-[4rem] text-orange-300 font-black",
    mobileClassName: "text-3xl text-orange-300 font-black",
  },
  {
    label: "大六座",
    note: "家庭高频上下车",
    desktopClassName:
      "left-[47%] top-[41%] text-[3rem] text-zinc-100 font-black",
    mobileClassName: "text-2xl text-zinc-100 font-black",
  },
  {
    label: "MPV",
    note: "商务接待和后排便利",
    desktopClassName:
      "left-[18%] top-[36%] text-[3.4rem] text-teal-400 font-black [writing-mode:vertical-rl]",
    mobileClassName: "text-3xl text-teal-400 font-black",
  },
  {
    label: "SUV",
    note: "高底盘车型常见咨询",
    desktopClassName:
      "left-[12%] top-[15%] text-[3rem] text-sky-400 font-black",
    mobileClassName: "text-3xl text-sky-400 font-black",
  },
  {
    label: "上下车便利",
    note: "电动踏板核心场景",
    desktopClassName:
      "left-[68%] top-[36%] text-[2.5rem] text-amber-400 font-black rotate-90",
    mobileClassName: "text-2xl text-amber-400 font-black",
  },
  {
    label: "家庭用车",
    note: "老人小孩上下车",
    desktopClassName:
      "left-[23%] top-[62%] text-[2.5rem] text-teal-200 font-black",
    mobileClassName: "text-2xl text-teal-200 font-black",
  },
  {
    label: "商务接待",
    note: "MPV 接待场景",
    desktopClassName:
      "left-[72%] top-[64%] text-[2.35rem] text-orange-400 font-black",
    mobileClassName: "text-2xl text-orange-400 font-black",
  },
  {
    label: "岚图梦想家",
    note: "MPV 后排便利",
    desktopClassName:
      "left-[58%] top-[4%] text-[1.65rem] text-sky-200 font-bold",
    mobileClassName: "text-lg text-sky-200 font-bold",
  },
  {
    label: "极氪 009",
    note: "MPV 接待场景",
    desktopClassName:
      "left-[73%] top-[22%] text-[1.75rem] text-amber-200 font-bold",
    mobileClassName: "text-lg text-amber-200 font-bold",
  },
  {
    label: "问界 M7",
    note: "家庭 SUV 高频上下车",
    desktopClassName:
      "left-[9%] top-[68%] text-[1.9rem] text-sky-200 font-bold -rotate-6",
    mobileClassName: "text-xl text-sky-200 font-bold",
  },
  {
    label: "理想 MEGA",
    note: "MPV 后排接待",
    desktopClassName:
      "left-[34%] top-[76%] text-[1.9rem] text-amber-200 font-bold",
    mobileClassName: "text-xl text-amber-200 font-bold",
  },
  {
    label: "蔚来 ES8",
    note: "大六座 SUV",
    desktopClassName:
      "left-[8%] top-[49%] text-[1.45rem] text-zinc-300 font-semibold",
    mobileClassName: "text-base text-zinc-300 font-semibold",
  },
  {
    label: "乐道 L90",
    note: "大车身 SUV",
    desktopClassName:
      "left-[76%] top-[10%] text-[1.35rem] text-zinc-300 font-semibold",
    mobileClassName: "text-base text-zinc-300 font-semibold",
  },
  {
    label: "极氪 9X",
    note: "大型 SUV 方案确认",
    desktopClassName:
      "left-[43%] top-[7%] text-[1.4rem] text-teal-200 font-semibold",
    mobileClassName: "text-base text-teal-200 font-semibold",
  },
  {
    label: "传祺 M8",
    note: "MPV 上下车便利",
    desktopClassName:
      "left-[83%] top-[51%] text-[1.25rem] text-zinc-400 font-semibold rotate-90",
    mobileClassName: "text-sm text-zinc-400 font-semibold",
  },
  {
    label: "别克 GL8",
    note: "商务 MPV 常见咨询",
    desktopClassName:
      "left-[68%] top-[80%] text-[1.25rem] text-zinc-400 font-semibold",
    mobileClassName: "text-sm text-zinc-400 font-semibold",
  },
  {
    label: "奔驰 V 级",
    note: "商务接待车型",
    desktopClassName:
      "left-[19%] top-[5%] text-[1.15rem] text-zinc-400 font-semibold -rotate-6",
    mobileClassName: "text-sm text-zinc-400 font-semibold",
  },
  {
    label: "小鹏 GX",
    note: "到店确认安装位",
    desktopClassName:
      "left-[52%] top-[84%] text-[1.15rem] text-zinc-500 font-semibold",
    mobileClassName: "text-sm text-zinc-500 font-semibold",
  },
];

export function ElectricStepFitmentCloud() {
  const mobileItems = electricStepFitmentTags.map((tag) => ({
    label: tag.name,
    note: tag.note,
    className: MOBILE_WEIGHT_CLASS[tag.weight],
  }));

  return (
    <section
      id="electric-step-fitment"
      className="bg-zinc-950 py-14 md:py-18 border-y border-zinc-900"
      aria-labelledby="electric-step-fitment-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 text-zinc-100">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(249,115,22,0.16),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.10),transparent_30%)]"
          />
          <CardHeader className="relative z-10">
            <p className="text-xs tracking-widest text-orange-400">
              FITMENT CLOUD · 车型词云
            </p>
            <CardTitle
              id="electric-step-fitment-title"
              className="text-2xl md:text-3xl font-bold text-white"
            >
              常见到店确认车型
            </CardTitle>
            <p className="max-w-3xl text-sm md:text-base leading-relaxed text-zinc-400">
              电动踏板适配面广，尤其集中在 SUV、MPV、大六座和高底盘车型。以下车型用于表达常见咨询方向，最终以实车底盘结构、安装位和电气接口确认结果为准。
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:hidden">
              {mobileItems.map((tag) => (
                <Badge
                  key={tag.label}
                  variant="ghost"
                  title={tag.note}
                  className={`h-auto border-0 bg-transparent px-0 py-0 leading-none tracking-normal ${tag.className}`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>

            <div
              className="relative hidden h-[430px] overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/70 md:block"
              aria-label="电动踏板常见车型词云"
            >
              {CLOUD_ITEMS.map((item) => (
                <Badge
                  key={item.label}
                  variant="ghost"
                  title={item.note}
                  className={`absolute h-auto border-0 bg-transparent px-0 py-0 leading-none tracking-normal transition-transform hover:scale-105 ${item.desktopClassName}`}
                >
                  {item.label}
                </Badge>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-zinc-500">
              * 词云越醒目表示越常作为电动踏板沟通场景出现，不代表无需确认即可安装。
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

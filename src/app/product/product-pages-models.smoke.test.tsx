import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ALL_MODELS } from "@/lib/product-routes";

// ---------- Mock 基础设施 ----------
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/product/test",
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, placeholder, blurDataURL, ...rest } =
      props as Record<string, unknown>;
    return <img {...rest} />;
  },
}));

// ---------- Mock lucide-react (透传真实实现) ----------
vi.mock("lucide-react", async (importOriginal) => {
  return await importOriginal();
});

// ---------- Mock xiaomi-su7 组件 ----------
vi.mock("@/components/xiaomi-su7/XiaomiSu7TopicViewTrack", () => ({
  XiaomiSu7TopicViewTrack: () => <div data-testid="XiaomiSu7TopicViewTrack" />,
}));
vi.mock("@/components/xiaomi-su7/XiaomiSu7Hero", () => ({
  XiaomiSu7Hero: () => <div data-testid="XiaomiSu7Hero" />,
}));
vi.mock("@/components/xiaomi-su7/XiaomiSu7ScenarioMatrix", () => ({
  XiaomiSu7ScenarioMatrix: () => <div data-testid="XiaomiSu7ScenarioMatrix" />,
}));
vi.mock("@/components/xiaomi-su7/XiaomiSu7ProjectGrid", () => ({
  XiaomiSu7ProjectGrid: () => <div data-testid="XiaomiSu7ProjectGrid" />,
}));
vi.mock("@/components/xiaomi-su7/XiaomiSu7ServiceFlow", () => ({
  XiaomiSu7ServiceFlow: () => <div data-testid="XiaomiSu7ServiceFlow" />,
}));
vi.mock("@/components/xiaomi-su7/XiaomiSu7Faq", () => ({
  XiaomiSu7Faq: () => <div data-testid="XiaomiSu7Faq" />,
}));

// ---------- Mock xiaomi-yu7 组件 ----------
vi.mock("@/components/xiaomi-yu7/XiaomiYu7TopicViewTrack", () => ({
  XiaomiYu7TopicViewTrack: () => <div data-testid="XiaomiYu7TopicViewTrack" />,
}));
vi.mock("@/components/xiaomi-yu7/XiaomiYu7Hero", () => ({
  XiaomiYu7Hero: () => <div data-testid="XiaomiYu7Hero" />,
}));
vi.mock("@/components/xiaomi-yu7/XiaomiYu7ScenarioMatrix", () => ({
  XiaomiYu7ScenarioMatrix: () => <div data-testid="XiaomiYu7ScenarioMatrix" />,
}));
vi.mock("@/components/xiaomi-yu7/XiaomiYu7ProjectGrid", () => ({
  XiaomiYu7ProjectGrid: () => <div data-testid="XiaomiYu7ProjectGrid" />,
}));
vi.mock("@/components/xiaomi-yu7/XiaomiYu7ServiceFlow", () => ({
  XiaomiYu7ServiceFlow: () => <div data-testid="XiaomiYu7ServiceFlow" />,
}));
vi.mock("@/components/xiaomi-yu7/XiaomiYu7Faq", () => ({
  XiaomiYu7Faq: () => <div data-testid="XiaomiYu7Faq" />,
}));

// ---------- Mock zeekr-9x 组件 ----------
vi.mock("@/components/zeekr-9x/Zeekr9xHero", () => ({
  Zeekr9xHero: () => <div data-testid="Zeekr9xHero" />,
}));
vi.mock("@/components/zeekr-9x/Zeekr9xScenarioMatrix", () => ({
  Zeekr9xScenarioMatrix: () => <div data-testid="Zeekr9xScenarioMatrix" />,
}));
vi.mock("@/components/zeekr-9x/Zeekr9xProjectGrid", () => ({
  Zeekr9xProjectGrid: () => <div data-testid="Zeekr9xProjectGrid" />,
}));
vi.mock("@/components/zeekr-9x/Zeekr9xServiceFlow", () => ({
  Zeekr9xServiceFlow: () => <div data-testid="Zeekr9xServiceFlow" />,
}));
vi.mock("@/components/zeekr-9x/Zeekr9xFaq", () => ({
  Zeekr9xFaq: () => <div data-testid="Zeekr9xFaq" />,
}));
vi.mock("@/components/zeekr-9x/Zeekr9xTopicViewTrack", () => ({
  Zeekr9xTopicViewTrack: () => <div data-testid="Zeekr9xTopicViewTrack" />,
}));

// ---------- Mock zeekr-8x 组件 ----------
vi.mock("@/components/zeekr-8x/Zeekr8xHero", () => ({
  Zeekr8xHero: () => <div data-testid="Zeekr8xHero" />,
}));
vi.mock("@/components/zeekr-8x/Zeekr8xTopicViewTrack", () => ({
  Zeekr8xTopicViewTrack: () => <div data-testid="Zeekr8xTopicViewTrack" />,
}));
vi.mock("@/components/zeekr-8x/Zeekr8xScenarioMatrix", () => ({
  Zeekr8xScenarioMatrix: () => <div data-testid="Zeekr8xScenarioMatrix" />,
}));
vi.mock("@/components/zeekr-8x/Zeekr8xProjectGrid", () => ({
  Zeekr8xProjectGrid: () => <div data-testid="Zeekr8xProjectGrid" />,
}));
vi.mock("@/components/zeekr-8x/Zeekr8xServiceFlow", () => ({
  Zeekr8xServiceFlow: () => <div data-testid="Zeekr8xServiceFlow" />,
}));
vi.mock("@/components/zeekr-8x/Zeekr8xFaq", () => ({
  Zeekr8xFaq: () => <div data-testid="Zeekr8xFaq" />,
}));

// ---------- Mock li-auto 组件 (one, i6, i8, l9, mega) ----------
// LiAutoOne
vi.mock("@/components/li-auto/LiAutoOneHero", () => ({
  LiAutoOneHero: () => <div data-testid="LiAutoOneHero" />,
}));
vi.mock("@/components/li-auto/LiAutoOneProjectGrid", () => ({
  LiAutoOneProjectGrid: () => <div data-testid="LiAutoOneProjectGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoOneBundles", () => ({
  LiAutoOneBundles: () => <div data-testid="LiAutoOneBundles" />,
}));
vi.mock("@/components/li-auto/LiAutoOneServiceFlow", () => ({
  LiAutoOneServiceFlow: () => <div data-testid="LiAutoOneServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoOneFaq", () => ({
  LiAutoOneFaq: () => <div data-testid="LiAutoOneFaq" />,
}));
vi.mock("@/components/li-auto/LiAutoOneTopicViewTrack", () => ({
  LiAutoOneTopicViewTrack: () => <div data-testid="LiAutoOneTopicViewTrack" />,
}));

// LiAutoI6
vi.mock("@/components/li-auto/LiAutoI6Hero", () => ({
  LiAutoI6Hero: () => <div data-testid="LiAutoI6Hero" />,
}));
vi.mock("@/components/li-auto/LiAutoI6ScenarioMatrix", () => ({
  LiAutoI6ScenarioMatrix: () => <div data-testid="LiAutoI6ScenarioMatrix" />,
}));
vi.mock("@/components/li-auto/LiAutoI6ProjectGrid", () => ({
  LiAutoI6ProjectGrid: () => <div data-testid="LiAutoI6ProjectGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoI6ServiceFlow", () => ({
  LiAutoI6ServiceFlow: () => <div data-testid="LiAutoI6ServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoI6Faq", () => ({
  LiAutoI6Faq: () => <div data-testid="LiAutoI6Faq" />,
}));
vi.mock("@/components/li-auto/LiAutoI6TopicViewTrack", () => ({
  LiAutoI6TopicViewTrack: () => <div data-testid="LiAutoI6TopicViewTrack" />,
}));

// LiAutoI8
vi.mock("@/components/li-auto/LiAutoI8Hero", () => ({
  LiAutoI8Hero: () => <div data-testid="LiAutoI8Hero" />,
}));
vi.mock("@/components/li-auto/LiAutoI8ProjectGrid", () => ({
  LiAutoI8ProjectGrid: () => <div data-testid="LiAutoI8ProjectGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoI8Bundles", () => ({
  LiAutoI8Bundles: () => <div data-testid="LiAutoI8Bundles" />,
}));
vi.mock("@/components/li-auto/LiAutoI8ServiceFlow", () => ({
  LiAutoI8ServiceFlow: () => <div data-testid="LiAutoI8ServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoI8Faq", () => ({
  LiAutoI8Faq: () => <div data-testid="LiAutoI8Faq" />,
}));
vi.mock("@/components/li-auto/LiAutoI8TopicViewTrack", () => ({
  LiAutoI8TopicViewTrack: () => <div data-testid="LiAutoI8TopicViewTrack" />,
}));

// LiAutoL9
vi.mock("@/components/li-auto/LiAutoL9Hero", () => ({
  LiAutoL9Hero: () => <div data-testid="LiAutoL9Hero" />,
}));
vi.mock("@/components/li-auto/LiAutoL9ProjectGrid", () => ({
  LiAutoL9ProjectGrid: () => <div data-testid="LiAutoL9ProjectGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoL9Bundles", () => ({
  LiAutoL9Bundles: () => <div data-testid="LiAutoL9Bundles" />,
}));
vi.mock("@/components/li-auto/LiAutoL9ServiceFlow", () => ({
  LiAutoL9ServiceFlow: () => <div data-testid="LiAutoL9ServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoL9Faq", () => ({
  LiAutoL9Faq: () => <div data-testid="LiAutoL9Faq" />,
}));
vi.mock("@/components/li-auto/LiAutoL9TopicViewTrack", () => ({
  LiAutoL9TopicViewTrack: () => <div data-testid="LiAutoL9TopicViewTrack" />,
}));

// LiAutoMega
vi.mock("@/components/li-auto/LiAutoMegaHero", () => ({
  LiAutoMegaHero: () => <div data-testid="LiAutoMegaHero" />,
}));
vi.mock("@/components/li-auto/LiAutoMegaProjectGrid", () => ({
  LiAutoMegaProjectGrid: () => <div data-testid="LiAutoMegaProjectGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoMegaBundles", () => ({
  LiAutoMegaBundles: () => <div data-testid="LiAutoMegaBundles" />,
}));
vi.mock("@/components/li-auto/LiAutoMegaServiceFlow", () => ({
  LiAutoMegaServiceFlow: () => <div data-testid="LiAutoMegaServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoMegaFaq", () => ({
  LiAutoMegaFaq: () => <div data-testid="LiAutoMegaFaq" />,
}));
vi.mock("@/components/li-auto/LiAutoMegaTopicViewTrack", () => ({
  LiAutoMegaTopicViewTrack: () => <div data-testid="LiAutoMegaTopicViewTrack" />,
}));

// ---------- Mock denza 组件 ----------
vi.mock("@/components/denza/DenzaD9TopicViewTrack", () => ({
  DenzaD9TopicViewTrack: () => <div data-testid="DenzaD9TopicViewTrack" />,
}));
vi.mock("@/components/denza/DenzaD9TopicHero", () => ({
  DenzaD9TopicHero: () => <div data-testid="DenzaD9TopicHero" />,
}));
vi.mock("@/components/denza/DenzaD9ProjectGrid", () => ({
  DenzaD9ProjectGrid: () => <div data-testid="DenzaD9ProjectGrid" />,
}));
vi.mock("@/components/denza/DenzaD9ScenarioMatrix", () => ({
  DenzaD9ScenarioMatrix: () => <div data-testid="DenzaD9ScenarioMatrix" />,
}));
vi.mock("@/components/denza/DenzaD9ServiceFlow", () => ({
  DenzaD9ServiceFlow: () => <div data-testid="DenzaD9ServiceFlow" />,
}));
vi.mock("@/components/denza/DenzaD9Faq", () => ({
  DenzaD9Faq: () => <div data-testid="DenzaD9Faq" />,
}));

// ---------- Mock voyah 组件 ----------
vi.mock("@/components/voyah/VoyahDreamerTopicViewTrack", () => ({
  VoyahDreamerTopicViewTrack: () => <div data-testid="VoyahDreamerTopicViewTrack" />,
}));
vi.mock("@/components/voyah/VoyahDreamerHero", () => ({
  VoyahDreamerHero: () => <div data-testid="VoyahDreamerHero" />,
}));
vi.mock("@/components/voyah/VoyahDreamerProjectGrid", () => ({
  VoyahDreamerProjectGrid: () => <div data-testid="VoyahDreamerProjectGrid" />,
}));
vi.mock("@/components/voyah/VoyahDreamerScenarioMatrix", () => ({
  VoyahDreamerScenarioMatrix: () => <div data-testid="VoyahDreamerScenarioMatrix" />,
}));
vi.mock("@/components/voyah/VoyahDreamerServiceFlow", () => ({
  VoyahDreamerServiceFlow: () => <div data-testid="VoyahDreamerServiceFlow" />,
}));
vi.mock("@/components/voyah/VoyahDreamerFaq", () => ({
  VoyahDreamerFaq: () => <div data-testid="VoyahDreamerFaq" />,
}));

// ---------- Mock xpeng 组件 ----------
vi.mock("@/components/xpeng/XpengGxTopicHero", () => ({
  XpengGxTopicHero: () => <div data-testid="XpengGxTopicHero" />,
}));
vi.mock("@/components/xpeng/XpengGxScenarioMatrix", () => ({
  XpengGxScenarioMatrix: () => <div data-testid="XpengGxScenarioMatrix" />,
}));
vi.mock("@/components/xpeng/XpengGxProjectGrid", () => ({
  XpengGxProjectGrid: () => <div data-testid="XpengGxProjectGrid" />,
}));
vi.mock("@/components/xpeng/XpengGxServiceFlow", () => ({
  XpengGxServiceFlow: () => <div data-testid="XpengGxServiceFlow" />,
}));
vi.mock("@/components/xpeng/XpengGxFaq", () => ({
  XpengGxFaq: () => <div data-testid="XpengGxFaq" />,
}));
vi.mock("@/components/xpeng/XpengGxTopicViewTrack", () => ({
  XpengGxTopicViewTrack: () => <div data-testid="XpengGxTopicViewTrack" />,
}));

// ---------- Mock ledao 组件 ----------
vi.mock("@/components/ledao/LedaoL90TopicViewTrack", () => ({
  LedaoL90TopicViewTrack: () => <div data-testid="LedaoL90TopicViewTrack" />,
}));
vi.mock("@/components/ledao/LedaoL90Hero", () => ({
  LedaoL90Hero: () => <div data-testid="LedaoL90Hero" />,
}));
vi.mock("@/components/ledao/LedaoL90ProjectGrid", () => ({
  LedaoL90ProjectGrid: () => <div data-testid="LedaoL90ProjectGrid" />,
}));
vi.mock("@/components/ledao/LedaoL90ScenarioMatrix", () => ({
  LedaoL90ScenarioMatrix: () => <div data-testid="LedaoL90ScenarioMatrix" />,
}));
vi.mock("@/components/ledao/LedaoL90ServiceFlow", () => ({
  LedaoL90ServiceFlow: () => <div data-testid="LedaoL90ServiceFlow" />,
}));
vi.mock("@/components/ledao/LedaoL90Faq", () => ({
  LedaoL90Faq: () => <div data-testid="LedaoL90Faq" />,
}));

// ---------- Mock gaoshan 组件 ----------
vi.mock("@/components/gaoshan/Gaoshan8TopicViewTrack", () => ({
  Gaoshan8TopicViewTrack: () => <div data-testid="Gaoshan8TopicViewTrack" />,
}));
vi.mock("@/components/gaoshan/Gaoshan8Hero", () => ({
  Gaoshan8Hero: () => <div data-testid="Gaoshan8Hero" />,
}));
vi.mock("@/components/gaoshan/Gaoshan8ProjectGrid", () => ({
  Gaoshan8ProjectGrid: () => <div data-testid="Gaoshan8ProjectGrid" />,
}));
vi.mock("@/components/gaoshan/Gaoshan8ScenarioMatrix", () => ({
  Gaoshan8ScenarioMatrix: () => <div data-testid="Gaoshan8ScenarioMatrix" />,
}));
vi.mock("@/components/gaoshan/Gaoshan8ServiceFlow", () => ({
  Gaoshan8ServiceFlow: () => <div data-testid="Gaoshan8ServiceFlow" />,
}));
vi.mock("@/components/gaoshan/Gaoshan8Faq", () => ({
  Gaoshan8Faq: () => <div data-testid="Gaoshan8Faq" />,
}));

// ---------- Mock zhijie 组件 ----------
vi.mock("@/components/zhijie/ZhijieV9TopicHero", () => ({
  ZhijieV9TopicHero: () => <div data-testid="ZhijieV9TopicHero" />,
}));
vi.mock("@/components/zhijie/ZhijieV9ScenarioMatrix", () => ({
  ZhijieV9ScenarioMatrix: () => <div data-testid="ZhijieV9ScenarioMatrix" />,
}));
vi.mock("@/components/zhijie/ZhijieV9ProjectGrid", () => ({
  ZhijieV9ProjectGrid: () => <div data-testid="ZhijieV9ProjectGrid" />,
}));
vi.mock("@/components/zhijie/ZhijieV9ServiceFlow", () => ({
  ZhijieV9ServiceFlow: () => <div data-testid="ZhijieV9ServiceFlow" />,
}));
vi.mock("@/components/zhijie/ZhijieV9Faq", () => ({
  ZhijieV9Faq: () => <div data-testid="ZhijieV9Faq" />,
}));
vi.mock("@/components/zhijie/ZhijieV9TopicViewTrack", () => ({
  ZhijieV9TopicViewTrack: () => <div data-testid="ZhijieV9TopicViewTrack" />,
}));

// ---------- Mock nio 组件 ----------
vi.mock("@/components/nio/NioEs8Hero", () => ({
  NioEs8Hero: () => <div data-testid="NioEs8Hero" />,
}));
vi.mock("@/components/nio/NioEs8ProjectGrid", () => ({
  NioEs8ProjectGrid: () => <div data-testid="NioEs8ProjectGrid" />,
}));
vi.mock("@/components/nio/NioEs8Bundles", () => ({
  NioEs8Bundles: () => <div data-testid="NioEs8Bundles" />,
}));
vi.mock("@/components/nio/NioEs8ServiceFlow", () => ({
  NioEs8ServiceFlow: () => <div data-testid="NioEs8ServiceFlow" />,
}));
vi.mock("@/components/nio/NioEs8Faq", () => ({
  NioEs8Faq: () => <div data-testid="NioEs8Faq" />,
}));
vi.mock("@/components/nio/NioEs8TopicViewTrack", () => ({
  NioEs8TopicViewTrack: () => <div data-testid="NioEs8TopicViewTrack" />,
}));

// ---------- 数据 ----------
const LIVE_MODELS = ALL_MODELS.filter((m) => m.status === "live");

const modelPageModuleMap: Record<string, () => Promise<unknown>> = {
  "xiaomi/su7": () => import("@/app/product/xiaomi/su7/page"),
  "xiaomi/yu7": () => import("@/app/product/xiaomi/yu7/page"),
  "zeekr/9x": () => import("@/app/product/zeekr/9x/page"),
  "zeekr/8x": () => import("@/app/product/zeekr/8x/page"),
  "li-auto/one": () => import("@/app/product/li-auto/one/page"),
  "li-auto/i6": () => import("@/app/product/li-auto/i6/page"),
  "li-auto/i8": () => import("@/app/product/li-auto/i8/page"),
  "li-auto/l9": () => import("@/app/product/li-auto/l9/page"),
  "li-auto/mega": () => import("@/app/product/li-auto/mega/page"),
  "denza/d9": () => import("@/app/product/denza/d9/page"),
  "voyah/dreamer": () => import("@/app/product/voyah/dreamer/page"),
  "xpeng/gx": () => import("@/app/product/xpeng/gx/page"),
  "ledao/l90": () => import("@/app/product/ledao/l90/page"),
  "gaoshan/8": () => import("@/app/product/gaoshan/8/page"),
  "zhijie/v9": () => import("@/app/product/zhijie/v9/page"),
  "nio/es8": () => import("@/app/product/nio/es8/page"),
};

// ---------- 工具函数 ----------
async function renderModelPage(importFn: () => Promise<unknown>) {
  const mod = await importFn();
  const Page = (mod as { default: () => unknown }).default;
  const result = Page();
  if (result instanceof Promise) {
    return render(await result);
  }
  return render(result);
}

// ---------- 车型页 smoke tests ----------
describe("model pages smoke tests", () => {
  it.each(LIVE_MODELS)(
    "$modelName ($brandSlug/$modelSlug) renders without crashing",
    async ({ brandSlug, modelSlug }) => {
      const key = `${brandSlug}/${modelSlug}`;
      const importFn = modelPageModuleMap[key];
      await renderModelPage(importFn);
    },
    30000
  );

  it.each(LIVE_MODELS)(
    "$modelName ($brandSlug/$modelSlug) renders content with model name",
    async ({ brandSlug, modelSlug, modelName }) => {
      const key = `${brandSlug}/${modelSlug}`;
      const importFn = modelPageModuleMap[key];
      await renderModelPage(importFn);
      const body = document.body.textContent ?? "";
      expect(body).toContain(modelName);
    },
    30000
  );
});

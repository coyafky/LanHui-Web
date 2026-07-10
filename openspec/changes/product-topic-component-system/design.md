## Context

车型专题页组件已经出现系统性复制：`ProjectGrid`、`ScenarioMatrix`、`Hero`、`Faq`、`ServiceFlow`、`TopicViewTrack` 在多个车型目录中高度相似。当前可见目录包括 `xiaomi-su7`、`xiaomi-yu7`、`xiaomi-series`、`zeekr-9x`、`zeekr-8x`、`li-auto`、`denza`、`voyah`、`ledao`、`gaoshan`、`nio`、`xpeng`、`zhijie`。这些组件的主要差异集中在：

- 车型名称、品牌名称、页面标题和 CTA 文案
- 主题色和 badge 样式
- category 类型、标签、排序
- project 类型字段命名和数量校验
- scenario 的 key 与 hash anchor 映射
- 埋点事件 key
- 图片状态文案和图片占位状态

项目约束：

- Next.js App Router，车型页面以 RSC 组合为主，复杂交互组件使用 Client Component。
- TypeScript strict，禁止用 `any` 逃避类型。
- Tailwind v4，继续使用现有暗色官网视觉。
- 不改变公开路由、SEO、图片资产路径和现有数据文件的 source-of-truth。
- 现有 `npm run typecheck` 有已知测试文件错误，不能把这些作为本 change 的回归。

## Goals / Non-Goals

**Goals:**

- 建立 `src/components/product-topic/` 共享组件库，覆盖车型专题页通用模块。
- 建立 `src/lib/product-topic/` 类型和适配器层，把各车型现有数据映射为共享组件输入。
- 先完成 2 个试点页面迁移，验证复杂交互和同系列复用都能成立。
- 让新增车型页从复制整套组件目录，变为定义数据配置并组合共享组件。
- 保持试点页面视觉、内容、链接、hash 行为、埋点语义和可访问性不倒退。
- 增加测试与检查脚本，防止继续新增克隆组件。

**Non-Goals:**

- 不在首个 change 中删除所有旧品牌组件目录。
- 不重写所有车型数据文件。
- 不合并服务类产品页组件，例如窗口膜、地板、车衣等非车型专题页面。
- 不改变图片资产生成策略。
- 不引入新的 UI 依赖。
- 不把所有车型页面强制改成单一页面模板；允许少量页面保留专属 section。

## Decisions

### Decision 1: 使用共享组件 + 适配器，而不是一次性统一所有原始数据类型

共享组件只依赖稳定的 `ProductTopicProject`、`ProductTopicScenario`、`ProductTopicFaqItem`、`ProductTopicServiceStep` 等通用输入。各品牌现有数据类型通过适配函数转换：

```ts
export type ProductTopicProject<Category extends string = string> = {
  id: string;
  order: number;
  name: string;
  summary: string;
  category: Category;
  image: {
    publicPath?: string;
    alt: string;
  };
  imageStatus: ProductTopicImageStatus;
  saleStatus?: string;
  suitableFor?: readonly string[];
  caution?: string;
};
```

理由：

- 保留现有数据文件 ownership，降低迁移风险。
- 共享组件可被不同品牌逐步接入。
- 避免为了抽象而大规模改动 12+ 个数据模块。

替代方案：

- 直接重写所有产品数据为统一 schema。收益更彻底，但风险过高，容易引发页面内容和类型回归。

### Decision 2: `ProjectGrid` 作为第一优先级抽象

`ProjectGrid` 是重复最高、交互最多、收益最大的模块。共享组件应覆盖：

- category tab 筛选
- scenario hash 筛选
- 单项目展开/收起
- 图片状态 badge
- 空状态
- 点击埋点
- 项目数量校验
- theme accent class 注入

理由：

- 该模块每个克隆约 300+ 行，净减代码最明显。
- 交互复杂，最适合通过试点证明抽象可行。

替代方案：

- 先抽 Hero/Faq 等简单组件。风险低，但 ROI 不足，无法验证最难的交互逻辑。

### Decision 3: 主题色使用受控 token map，不允许任意 class 字符串拼接

新增 `ProductTopicAccent` 和 class map，例如：

```ts
export type ProductTopicAccent = "orange" | "cyan" | "amber" | "emerald" | "violet" | "blue" | "teal" | "red" | "sky" | "pink";
```

组件内部通过 map 输出 Tailwind class，避免动态 class 无法被 Tailwind 收集。

理由：

- 项目已经使用多品牌主题色。
- Tailwind v4 下任意动态 class 字符串容易导致样式缺失。
- 受控 token 让设计一致性更好。

### Decision 4: 试点迁移分两类

试点 A：复杂交互型，例如 `src/app/product/xpeng/gx/page.tsx`。它包含分类筛选、场景筛选、hash 解析、项目展开和埋点。

试点 B：同系列复用型，例如 `src/app/product/li-auto/i6/page.tsx`。理想系列存在多个类似页面，适合证明后续批量迁移价值。

理由：

- 一个试点验证复杂能力。
- 一个试点验证复制目录减少价值。

### Decision 5: 旧组件迁移期保留，但新增检查阻止继续复制

首个 change 不强制删除所有旧组件，避免大规模回归。新增检查脚本识别新增车型目录是否继续创建完整 `Hero/Faq/ServiceFlow/ScenarioMatrix/ProjectGrid` 克隆组合，并要求使用共享组件或在脚本白名单中说明原因。

理由：

- 防止技术债继续增长。
- 允许历史页面逐步迁移。

### Decision 6: 共享组件必须保留页面专属插槽

`ProductTopicLayout` 或页面组合应允许插入页面专属 section，例如品牌独有卖点、套餐表、更多选择、视频/案例模块。共享组件不应变成不可扩展的“大一统页面模板”。

理由：

- 车型专题存在真实差异。
- 好的抽象应该减少重复，而不是消灭差异。

## Proposed Structure

```txt
src/components/product-topic/
  ProductTopicHero.tsx
  ProductTopicFaq.tsx
  ProductTopicServiceFlow.tsx
  ProductTopicScenarioMatrix.tsx
  ProductTopicProjectGrid.tsx
  ProductTopicViewTrack.tsx
  ProductTopicSectionHeader.tsx
  ProductTopicTheme.ts
  index.ts

src/lib/product-topic/
  types.ts
  adapters.ts
  image-status.ts
  assertions.ts
  hash.ts
```

试点页面可采用：

```tsx
import {
  ProductTopicHero,
  ProductTopicScenarioMatrix,
  ProductTopicProjectGrid,
  ProductTopicServiceFlow,
  ProductTopicFaq,
  ProductTopicViewTrack,
} from "@/components/product-topic";
import { createXpengGxTopicConfig } from "@/lib/product-topic/adapters";

const topic = createXpengGxTopicConfig();

export default function Page() {
  return (
    <>
      <ProductTopicViewTrack config={topic.tracking} />
      <ProductTopicHero hero={topic.hero} accent={topic.accent} />
      <ProductTopicScenarioMatrix scenarios={topic.scenarios} accent={topic.accent} />
      <ProductTopicProjectGrid
        projects={topic.projects}
        scenarios={topic.scenarios}
        categories={topic.categories}
        grid={topic.grid}
        tracking={topic.tracking}
        accent={topic.accent}
      />
      <ProductTopicServiceFlow steps={topic.serviceFlow} accent={topic.accent} />
      <ProductTopicFaq items={topic.faq} accent={topic.accent} />
    </>
  );
}
```

## Risks / Trade-offs

- [Risk] 抽象过度导致品牌差异难以表达  
  → Mitigation: 共享组件只覆盖重复模块，保留页面专属 section 和 render slot。

- [Risk] Tailwind 动态 class 丢失样式  
  → Mitigation: 使用受控 accent token 和静态 class map。

- [Risk] 试点页面视觉或交互回归  
  → Mitigation: 为试点页面增加 Playwright smoke checks，覆盖 390px、768px、1440px。

- [Risk] hash 场景筛选行为不一致  
  → Mitigation: 抽 `src/lib/product-topic/hash.ts` 并为 hash parser 添加 vitest。

- [Risk] 埋点 key 改变导致历史数据断层  
  → Mitigation: 配置层显式传入旧页面使用的 tracking event key，不自动生成。

- [Risk] 项目数量校验在共享组件中过于僵硬  
  → Mitigation: 数量校验作为可选 config；缺省只做非空和唯一 id 校验。

## Migration Plan

1. 新建类型、主题、hash、assertion 工具，不接入页面。
2. 新建共享组件，保持独立测试通过。
3. 为试点 A 写适配器，并替换页面组件组合。
4. 验证试点 A 的视觉、hash、分类、展开、埋点。
5. 为试点 B 写适配器，并替换页面组件组合。
6. 新增复制防回归脚本。
7. 记录后续迁移清单，不在本 change 中删除全部旧组件。

Rollback：

- 试点页面保留旧组件 imports 的 git 历史，可单页回退。
- 共享组件新增文件可独立移除。
- 防回归脚本可从 `package.json` 临时解绑，但必须保留 TODO 说明。

## Open Questions

- 试点 A 最终选择 `xpeng/gx` 还是 `zeekr/9x`，由实施时根据页面当前测试稳定性决定。
- 是否在首个 change 中删除试点页面对应旧组件文件，建议先不删除，等后续迁移稳定后统一清理。
- `ProductTopicProjectGrid` 是否支持 masonry/横向滚动等未来布局，首版不支持，避免过度设计。

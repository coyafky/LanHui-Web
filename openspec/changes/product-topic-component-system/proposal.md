## Why

产品专题页已经形成大量复制粘贴组件：`Hero`、`Faq`、`ServiceFlow`、`ScenarioMatrix`、`ProjectGrid`、`TopicViewTrack` 在小米、极氪、理想、腾势、岚图、乐道、高山、蔚来、小鹏、智界等车型目录中重复实现。当前重复规模已超过单页维护成本，新增车型往往需要复制整套目录，后续视觉、可访问性、埋点、图片状态、筛选逻辑任一调整都会被放大成多目录重复修改。

现在需要建立一个车型专题共享组件体系，让品牌差异通过类型化配置和数据注入表达，逐步把新增车型从“复制组件文件”迁移为“定义数据配置 + 组合共享组件”。

## What Changes

- 新增 `product-topic` 共享组件库，用于车型专题页的通用渲染：
  - `ProductTopicHero`
  - `ProductTopicFaq`
  - `ProductTopicServiceFlow`
  - `ProductTopicScenarioMatrix`
  - `ProductTopicProjectGrid`
  - `ProductTopicViewTrack`
- 新增类型化配置契约，统一表达车型名称、主题色、分类标签、分类顺序、项目数据、场景数据、FAQ、服务流程、埋点 key、hash anchor 前缀等差异。
- 先迁移 2 个代表性试点页面：
  - 一个结构较完整、交互复杂的车型页，例如 `xpeng/gx` 或 `zeekr/9x`
  - 一个同系列复制明显的车型页，例如 `li-auto/i6`、`li-auto/i8`、`li-auto/l9`、`li-auto/mega` 中的一页
- 保留旧组件作为迁移期兼容，不在首个 change 中强制删除所有品牌目录。
- 新增测试和防回归检查，确保共享组件输出与旧组件关键行为一致，并防止新增车型继续复制整套专题组件。
- 不改变公开路由、SEO metadata、产品数据源、图片资产路径和现有页面视觉基调。

## Capabilities

### New Capabilities
- `product-topic-components`: 车型专题共享组件体系，定义车型专题页如何通过共享组件和类型化配置渲染 Hero、FAQ、服务流程、场景矩阵、项目网格和埋点。

### Modified Capabilities
（无 — 本次建立新的组件体系能力，不改变已有业务能力的对外行为。）

## Impact

- 新增目录：
  - `src/components/product-topic/`
  - `src/lib/product-topic/`
- 试点修改：
  - `src/app/product/xpeng/gx/page.tsx` 或同等复杂车型页
  - `src/app/product/li-auto/i6/page.tsx` 或同系列代表车型页
- 后续迁移候选目录：
  - `src/components/xiaomi-su7/`
  - `src/components/xiaomi-yu7/`
  - `src/components/xiaomi-series/`
  - `src/components/zeekr-9x/`
  - `src/components/zeekr-8x/`
  - `src/components/li-auto/`
  - `src/components/denza/`
  - `src/components/voyah/`
  - `src/components/ledao/`
  - `src/components/gaoshan/`
  - `src/components/nio/`
  - `src/components/xpeng/`
  - `src/components/zhijie/`
- 测试影响：
  - 新增共享组件单元测试
  - 新增试点页面 smoke tests
  - 新增复制组件防回归检查脚本
- 风险：
  - 组件抽象过度可能遮蔽品牌差异
  - 交互行为（hash 场景筛选、分类 tab、展开卡片）必须在试点页严格回归
  - 图片状态文案、埋点 key、anchor id 需要保持兼容

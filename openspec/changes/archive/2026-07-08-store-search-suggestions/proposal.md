## Why

当前 `/agent` 门店搜索仅支持输入关键词后按 Enter 跳转到 `/agent?q=xxx` 进行全页搜索，缺少输入过程中的实时建议反馈。用户输入城市名（如"南京"）或门店名时无法快速定位到具体门店，必须进入搜索结果列表页再逐条浏览。需要升级为带下拉建议的搜索体验，让用户输入时即时看到匹配门店并一键跳转详情页。

## What Changes

- StoreSearch 组件新增 debounce API 请求驱动的下拉建议列表
- 下拉项展示门店名称 + 省市区地址，点击直接跳转 `/agent/store/{id}`
- 支持键盘导航（ArrowDown/Up/Enter/Escape）和 combobox 无障碍语义
- `/api/stores` GET 搜索字段扩展为覆盖 provinceLabel、cityLabel、district
- 保留 Enter 跳转搜索列表页的原有行为（无高亮建议时）
- 视觉升级：更大输入框、橙色聚焦边框、深色下拉面板

## Capabilities

### New Capabilities
- `store-search-suggestions`: 门店搜索实时下拉建议，含 debounce API 请求、键盘导航、combobox 无障碍语义

### Modified Capabilities
<!-- 本次不修改已有 spec 级需求 -->

## Impact

- `src/components/agent/StoreSearch.tsx` — 核心改造
- `src/components/agent/StoreSearch.test.tsx` — 新增交互测试
- `src/app/api/stores/route.ts` — search 字段扩展（provinceLabel/cityLabel/district）
- `src/app/api/stores/route.test.ts` — 搜索字段覆盖验证
- `src/app/agent/page.tsx` — 无需改动（接口不变）

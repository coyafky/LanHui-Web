# Comet Design Handoff

- Change: store-search-suggestions
- Phase: design
- Mode: compact
- Context hash: 0f54cf2a81e3b5b7ff05caa40e744ea34e38c374649abf7a1be3725fac3845ed

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/store-search-suggestions/proposal.md

- Source: openspec/changes/store-search-suggestions/proposal.md
- Lines: 1-28
- SHA256: c1222392090ef43e73b941c4ba2722834cca459358508d061789e10f48e9e9d1

```md
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
```

## openspec/changes/store-search-suggestions/design.md

- Source: openspec/changes/store-search-suggestions/design.md
- Lines: 1-56
- SHA256: 601ffc7b263d3975b6ee499e582732c56d7aa16d42e35e0715ed68036816b767

```md
## Context

当前 StoreSearch 是纯客户端组件，仅支持 onChange 更新本地 state + Enter 跳转。门店搜索 API (`/api/stores`) 已支持 `search` 参数的 `contains` + `insensitive` 匹配，但仅覆盖 name/address/phone/slug 四字段，缺少 provinceLabel/cityLabel/district 中文名称搜索。

Store 模型已有 `district` (String?)、`provinceLabel`、`cityLabel` 字段，可直接用于搜索扩展。

## Goals / Non-Goals

**Goals:**
- StoreSearch 输入时 debounce 200ms 请求 `/api/stores?search=<keyword>&limit=6&sort=public_featured`
- 下拉面板展示最多 6 条建议，含门店名称 + 省市区地址
- 点击建议跳转 `/agent/store/{id}`
- 键盘导航（ArrowDown/Up/Enter/Escape）+ combobox 无障碍语义
- API search 扩展 provinceLabel/cityLabel/district
- 保留 Enter 无高亮时跳转 `/agent?q=keyword` 的原有行为

**Non-Goals:**
- 不修改门店详情页路由
- 不改变后台门店管理逻辑
- 不引入新依赖（debounce 用 setTimeout 实现）
- 不暴露非 active 门店
- 不大规模重构 `/agent` 页面

## Decisions

### 1. 数据来源：API 请求而非静态数组过滤

**选择**：客户端 debounce 请求 `/api/stores?search=xxx&limit=6&sort=public_featured`

**理由**：用户明确要求"适合未来超级多门店"，本地静态数组过滤不可扩展。现有 API 已支持 search/limit/sort 参数，无需新增端点。

**替代方案**：新建 `/api/stores/suggestions` 专用端点 → 过度设计，当前 API 完全能满足需求。

### 2. Debounce 实现：原生 setTimeout

**选择**：useEffect + setTimeout 清理，200ms 延迟。

**理由**：不引入 lodash.debounce 等依赖。200ms 是搜索建议的标准延迟，用户体验流畅。

### 3. 键盘导航：受控 highlightIndex

**选择**：用 `useState(number)` 追踪高亮索引，ArrowDown/Up 循环移动，Enter 时检查是否有高亮项。

**理由**：简单可控，无需引入第三方 combobox 库。

### 4. API search 字段扩展

**选择**：在现有 OR 条件中追加 provinceLabel/cityLabel/district 的 contains 匹配。

**理由**：Prisma schema 已有这些字段，无需 DB 迁移。district 为可选字段，搜索时同样用 contains+insensitive。

## Risks / Trade-offs

- **[低] API 请求频率**：每次输入变化触发 debounce 后的 API 请求 → 200ms debounce + limit 6 足够轻量
- **[低] 中文输入法兼容**：中文 IME 输入过程中可能触发多次 onChange → 用 `compositionstart/compositionend` 事件处理
- **[低] 点击建议后下拉未关闭**：在 `router.push` 前清空 suggestions 状态即可
```

## openspec/changes/store-search-suggestions/tasks.md

- Source: openspec/changes/store-search-suggestions/tasks.md
- Lines: 1-22
- SHA256: aa4a220128f292bbe8d2c7e56d7dd3edc7d6e31db644b027ef310e05e20c853c

```md
## 1. API 搜索字段扩展

- [ ] 1.1 在 `/api/stores` GET 的 search OR 条件中追加 provinceLabel、cityLabel、district 的 contains+insensitive 匹配
- [ ] 1.2 更新 `src/app/api/stores/route.test.ts` 测试，验证 city/province/address/name 搜索覆盖

## 2. StoreSearch 组件改造

- [ ] 2.1 添加 debounce hooks（useState + useEffect + setTimeout 200ms）和 suggestions fetching 逻辑
- [ ] 2.2 实现下拉面板 UI（深色背景、圆角、分隔线、hover 态）
- [ ] 2.3 实现建议项渲染（门店名称 + 省市区地址副标题）
- [ ] 2.4 实现键盘导航（ArrowDown/Up 循环、Enter 选择高亮/搜索、Escape 关闭）
- [ ] 2.5 实现 combobox 无障碍语义（role/aria-expanded/aria-controls/aria-activedescendant/listbox/option）
- [ ] 2.6 处理中文 IME 输入（compositionstart/compositionend）、loading 状态、空结果、点击外部关闭

## 3. StoreSearch 测试更新

- [ ] 3.1 更新 `src/components/agent/StoreSearch.test.tsx`：mock fetch、debounce（fake timers）、下拉建议渲染、键盘交互、清空行为

## 4. 最终验证

- [ ] 4.1 运行 `npx vitest run` + `npm run lint` + `npm run typecheck` + `npm run build`，确保全部通过
- [ ] 4.2 浏览器验证：390px/768px/1440px 下拉不溢出、橙色 focus 边框、点击跳转
```

## openspec/changes/store-search-suggestions/specs/store-search-suggestions/spec.md

- Source: openspec/changes/store-search-suggestions/specs/store-search-suggestions/spec.md
- Lines: 1-127
- SHA256: c5e240831d3916277b5343db0a2dd0876707a86a1a0c56d090857d137fc99894

[TRUNCATED]

```md
## ADDED Requirements

### Requirement: Search input triggers debounced API suggestions

The StoreSearch component SHALL debounce user input by 200ms and fetch up to 6 store suggestions from `/api/stores?search=<keyword>&limit=6&sort=public_featured` when the trimmed keyword length is >= 1.

#### Scenario: Keyword triggers API request after debounce

- **WHEN** user types "南京" in the search input
- **THEN** after 200ms of no further input, a GET request SHALL be sent to `/api/stores?search=%E5%8D%97%E4%BA%AC&limit=6&sort=public_featured`
- **AND** matching active stores SHALL appear in a dropdown list

#### Scenario: Empty keyword does not trigger request

- **WHEN** user clears the input to an empty string
- **THEN** no API request SHALL be sent
- **AND** the dropdown SHALL close

#### Scenario: Keyword shorter than 1 char after trim does not trigger request

- **WHEN** user types only whitespace characters
- **THEN** no API request SHALL be sent

### Requirement: Dropdown displays store name and location

Each suggestion item SHALL display the store name as primary text and province/city/district as secondary text.

#### Scenario: Suggestion item renders store info

- **WHEN** API returns a store with name "蓝辉轻改南京店", provinceLabel "江苏省", cityLabel "南京市", district "江宁区"
- **THEN** the suggestion SHALL show "蓝辉轻改南京店" as the title
- **AND** SHALL show "江苏省 · 南京市 · 江宁区" as the subtitle

#### Scenario: Suggestion without district omits district from subtitle

- **WHEN** API returns a store with district=null
- **THEN** the subtitle SHALL show "省份 · 城市" without trailing separator

### Requirement: Clicking a suggestion navigates to store detail page

Clicking a suggestion item SHALL navigate to `/agent/store/{store.id}` and close the dropdown.

#### Scenario: Click navigates to store detail

- **WHEN** user clicks a suggestion with store id "abc123"
- **THEN** router navigates to `/agent/store/abc123`
- **AND** the dropdown SHALL close

### Requirement: Keyboard navigation with ArrowDown, ArrowUp, Enter, Escape

The combobox SHALL support ArrowDown to move highlight down, ArrowUp to move highlight up, Enter to select the highlighted item or perform keyword search, and Escape to close the dropdown.

#### Scenario: ArrowDown highlights next suggestion

- **WHEN** dropdown is open with suggestions and no item is highlighted
- **THEN** pressing ArrowDown SHALL highlight the first suggestion

#### Scenario: ArrowDown wraps to first after last

- **WHEN** the last suggestion is highlighted
- **THEN** pressing ArrowDown SHALL highlight the first suggestion

#### Scenario: ArrowUp wraps to last from first

- **WHEN** the first suggestion is highlighted
- **THEN** pressing ArrowUp SHALL highlight the last suggestion

#### Scenario: Enter with highlighted suggestion navigates to store

- **WHEN** a suggestion is highlighted
- **THEN** pressing Enter SHALL navigate to `/agent/store/{id}` for the highlighted store
- **AND** SHALL close the dropdown

#### Scenario: Enter without highlighted suggestion performs keyword search

- **WHEN** dropdown is open but no suggestion is highlighted
- **THEN** pressing Enter SHALL navigate to `/agent?q=<keyword>`

#### Scenario: Escape closes dropdown

```

Full source: openspec/changes/store-search-suggestions/specs/store-search-suggestions/spec.md


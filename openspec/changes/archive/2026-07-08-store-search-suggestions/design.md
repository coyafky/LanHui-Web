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

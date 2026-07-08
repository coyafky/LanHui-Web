# Brainstorm Summary

- Change: store-search-suggestions
- Date: 2026-07-08

## 确认的技术方案

方案 A：复用现有 `/api/stores` 端点 + 扩展 search OR 条件（追加 provinceLabel/cityLabel/district）。
StoreSearch Client Component 内部实现 debounce（setTimeout 200ms）+ 受控 highlightIndex 键盘导航 + combobox ARIA 无障碍语义。

## 关键取舍与风险

- 不新建专用端点，复用现有 API
- 不引入新依赖（lodash.debounce / downshift）
- 中文 IME 用 compositionstart/end 事件防止拼音中间态触发请求
- 点击外部关闭用 document click listener

## 测试策略

- StoreSearch 单元测试：mock fetch + fake timers + mock router
- API route 测试：验证新增 provinceLabel/cityLabel/district 搜索覆盖
- 浏览器验证：390px/768px/1440px 三断点

## Spec Patch

无

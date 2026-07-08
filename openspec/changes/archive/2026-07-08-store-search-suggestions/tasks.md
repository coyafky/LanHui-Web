## 1. API 搜索字段扩展

- [x] 1.1 在 `/api/stores` GET 的 search OR 条件中追加 provinceLabel、cityLabel、district 的 contains+insensitive 匹配
- [x] 1.2 更新 `src/app/api/stores/route.test.ts` 测试，验证 city/province/address/name 搜索覆盖

## 2. StoreSearch 组件改造

- [x] 2.1 添加 debounce hooks（useState + useEffect + setTimeout 200ms）和 suggestions fetching 逻辑
- [x] 2.2 实现下拉面板 UI（深色背景、圆角、分隔线、hover 态）
- [x] 2.3 实现建议项渲染（门店名称 + 省市区地址副标题）
- [x] 2.4 实现键盘导航（ArrowDown/Up 循环、Enter 选择高亮/搜索、Escape 关闭）
- [x] 2.5 实现 combobox 无障碍语义（role/aria-expanded/aria-controls/aria-activedescendant/listbox/option）
- [x] 2.6 处理中文 IME 输入（compositionstart/compositionend）、loading 状态、空结果、点击外部关闭

## 3. StoreSearch 测试更新

- [x] 3.1 更新 `src/components/agent/StoreSearch.test.tsx`：mock fetch、debounce（fake timers）、下拉建议渲染、键盘交互、清空行为

## 4. 最终验证

- [x] 4.1 运行 `npx vitest run` + `npm run lint` + `npm run typecheck` + `npm run build`，确保全部通过
- [x] 4.2 浏览器验证：390px/768px/1440px 下拉不溢出、橙色 focus 边框、点击跳转

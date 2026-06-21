# 改版建议清单 — PROPOSALS

> 配套 [VISUAL_AUDIT_2026-06-20.md](./VISUAL_AUDIT_2026-06-20.md)。每条含:所属页面 / 维度 / 当前问题 / 建议改法 / 估时 / 优先级。
>
> 总计: **2 个 P0 + 6 个 P1 + 18 个 P2**,总估时 ~30h(可分 3 个 sprint)。

---

## 1. P0 — 立即修(2 个,估时 5-13h)

### P0-1 · wenjie 主题页车型图全 pending 占位

- **所属页面**: `/product/wenjie`
- **维度**: D2 Visual(8/20,严重)
- **当前问题**: 30+ 车型图全为深灰色 pending 占位框(`publicPath: null`),视觉感受"半成品",与 home/product 等已完善页对比明显,严重损害品牌专业感
- **建议改法**:
  - **短期(必做)**: 占位图增加视觉提示
    - alt 文本: `alt="问界 M7 图片即将上线"`
    - 视觉: 占位中央加 icon + 文字"图片即将上线"
    - Tailwind: 在 `ProductCard` 三态 UI 中,`imageStatus: "pending-review"` 状态明确显示
  - **长期(待业务)**: 业务补 30+ 张真实车型图(资源拍摄 / 厂商授权图)
- **估时**: 短期 2h + 长期 4-8h(待业务资源)
- **优先级**: P0
- **关联 06-19**: 已有 P1 记录,本次升级为 P0

### P0-2 · 测试门店数据污染公开站

- **所属页面**: `/admin/stores` + `/agent`(公开)
- **维度**: D2 Visual(admin/stores 12/20)
- **当前问题**: 22 条门店 21 条是 ASCII 噪声测试数据(`TC A1-phonetic` / `ssdd` / `ES Test 7` 等),公开 `/agent` 列表展示噪声
- **建议改法**:
  ```bash
  # 清理脚本(基于店名匹配)
  docker exec lanhui-postgres psql -U lanhui -d lanhui -c \
    "DELETE FROM \"Store\" WHERE name ~ '^(TC |ssdd|ES Test|Test |Demo )';"
  ```
  - 或写 `scripts/cleanup-test-stores.mjs`,按名称模式匹配删除
- **估时**: 1h(脚本+人工验证)
- **优先级**: P0(继承 06-19 P0-6)
- **关联 06-19**: P0-6

---

## 2. P1 — 2 周内修(6 个,估时 13h)

### P1-1 · zeekr mobile 大量空白 section

- **所属页面**: `/product/zeekr`
- **维度**: D1 Layout
- **当前问题**: mobile 6+ 车型 section,每个未填时一个空白区,显眼且滚动长
- **建议改法**:
  - 方案 A(mobile 折叠): 默认收起,点击展开
  - 方案 B(mobile tab): 顶部 tab 一键切换车型,内容区只显示 1 个
- **估时**: 2-3h
- **优先级**: P1

### P1-2 · flooring mobile LCP 6.6s + 表格横滚

- **所属页面**: `/product/flooring`
- **维度**: D1 Layout
- **当前问题**: LCP 6.6s(继承 06-19),长滚动 + 表格 mobile 横滚体验差
- **建议改法**:
  - 性能: 关键图加 `priority`,非关键图 `loading="lazy"`
  - 表格: mobile 改卡片式(免横滚),桌面保留表格
- **估时**: 3h
- **优先级**: P1(继承 06-19 P1-1)

### P1-3 · admin/login 失败无用户提示

- **所属页面**: `/admin/login`
- **维度**: D5 A11y
- **当前问题**: 登录失败仅 console,无 toast/内联提示
- **建议改法**:
  - 在 NextAuth `signIn` 回调增加 `redirect: false` + 错误捕获
  - 在表单底部加红色错误提示(icon + 文字)
  - `aria-describedby` 关联输入框
- **估时**: 1h
- **优先级**: P1(继承 06-19)

### P1-4 · /news/[slug] 详情页全 404

- **所属页面**: `/news/[slug]`
- **维度**: D2 Visual
- **当前问题**: 8 条已发布文章,详情页全 404(`item.content` missing)
- **建议改法**:
  - 补 `NewsItem.content` 字段(查 prisma schema,可能缺字段或迁移漏)
  - 或回退到 `excerpt` 字段做兜底渲染
- **估时**: 2h
- **优先级**: P0(继承 06-19 P0-7,本次维持 P0,严格说应优先于 P1-1/2)

### P1-5 · admin/analytics 图表键盘不可达

- **所属页面**: `/admin/analytics`
- **维度**: D5 A11y
- **当前问题**: hover 显示数据点,键盘 Tab 不到,屏幕阅读器读不到图表数据
- **建议改法**:
  - 图表组件加 `<figcaption>` 文字版数据
  - Tab 键可达 + 焦点状态显示当前数据点
  - 提供"切换到表格视图"按钮
- **估时**: 2h
- **优先级**: P1

### P1-6 · admin/stores 批量删除无确认 modal

- **所属页面**: `/admin/stores`
- **维度**: D5 A11y
- **当前问题**: 删除按钮直击,误操作无法 undo
- **建议改法**:
  - 加 shadcn/ui `AlertDialog` 确认 modal
  - 增加"批量操作"(多选 + 批量删除)
  - 增加回收站(soft delete)
- **估时**: 3h
- **优先级**: P1

---

## 3. P2 — 月内优化(18 个,估时 12h)

| ID | 页面 | 维度 | 改版建议 | 估时 |
|---|---|---|---|---|
| P2-1 | / | D5 A11y | Hero 2 CTA 增加 `aria-label="立即预约咨询方案"` | 0.5h |
| P2-2 | / | D5 A11y | 全站增加"返回顶部"按钮(mobile 优先) | 1h |
| P2-3 | / | D5 A11y | Header 汉堡菜单增加 `aria-expanded` 状态 | 0.5h |
| P2-4 | / | D2 Visual | Hero 增加 1 张代表性车型图(右侧 50% 区域) | 2h |
| P2-5 | /product | D2 Visual | 4 主题专题卡片增加主题色边/标(wenjie=cyan 等) | 1.5h |
| P2-6 | /product | D1 Layout | 统一 4 主题专题卡片图片比例 4:3 | 1h |
| P2-7 | /product | D5 A11y | 增加 sticky 锚点导航(快速跳到"轻改装备"/"汽车膜系") | 1h |
| P2-8 | /product/wenjie | D3 Color | cyan 主色加粗字重(font-medium → font-semibold)提升对比度 | 0.5h |
| P2-9 | /product/wenjie | D5 A11y | 锚点导航增加 `aria-current="location"` | 0.5h |
| P2-10 | /product/wenjie | D4 Typography | 表格列宽统一,中文字符不截断 | 1h |
| P2-11 | /product/xiaomi | D3 Color | xiaomi 主题色与 zeekr 区分(小米橙偏暖黄) | 1h |
| P2-12 | /product/zeekr | D3 Color | zeekr 主题色与 xiaomi 区分(极氪橙偏暖红) | 1h |
| P2-13 | /product/flooring | D3 Color | amber 主题色加深区分于 orange | 0.5h |
| P2-14 | /product/window-film | D5 A11y | 价格对比加 `<del>` + `aria-label="原价 X 元,现价 Y 元"` | 0.5h |
| P2-15 | /agent | D2 Visual | 增加空状态视觉("暂无可访问门店") | 1h |
| P2-16 | /agent | D1 Layout | mobile 卡片改 2 列(免滚动过长) | 1h |
| P2-17 | /news | D4 Typography | 卡片增加 hover 时图片轻放大 | 0.5h |
| P2-18 | /brand | D5 A11y | 时间线语义化为 `<ol>` + `aria-label="品牌历程"` | 0.5h |

**注**: 部分 P2 与 06-19 已知问题关联(如 P1-12 click 埋点失效),可合并到数据卫生任务。

---

## 4. 优先级矩阵

```
高优先级(P0)
├─ P0-1 wenjie 车型图 pending 占位(2h + 待业务补图)
└─ P0-2 测试门店数据清理(1h)

中优先级(P1)
├─ P1-1 zeekr mobile 折叠(2-3h)
├─ P1-2 flooring 性能优化(3h)
├─ P1-3 login 失败提示(1h)
├─ P1-4 /news/[slug] 404 修复(2h) ← 实际 P0
├─ P1-5 analytics 键盘可达(2h)
└─ P1-6 admin/stores 批量删除 modal(3h)

低优先级(P2) - 18 条,见 §3
```

---

## 5. 关联 06-19 全站审计的 P0/P1

| 06-19 ID | 本次 ID | 处理 |
|---|---|---|
| P0-1 (5 路由 404) | (跳过本次范围) | 已在 06-19 PRD 处理 |
| P0-6 (测试门店) | **P0-2** | 本次重提 |
| P0-7 (/news/[slug] 404) | **P1-4** | 本次维持(建议升级 P0) |
| P1-1 (flooring perf) | **P1-2** | 本次重提 |
| P1-2 (/brand/certifications) | (跳过本次范围) | 已在 06-19 PRD |
| P1-3 (/agent 列表 perf) | (跳过本次范围) | 已在 06-19 PRD |
| P1-4 (wenjie 占位) | **P0-1** | 本次升级为 P0 |
| P1-5 (/product LCP) | (跳过) | 已在 06-19 PRD |
| P1-7~13 (数据卫生) | 部分合并到 P2 | 已知 |

---

## 6. 改版节奏建议

| Sprint | 时长 | 包含 |
|---|---|---|
| **Sprint 1** | 本周 | P0-1(短期) + P0-2 |
| **Sprint 2** | 下周 | P1-3 + P1-4 + P1-5 |
| **Sprint 3** | 第 3 周 | P1-1 + P1-2 + P1-6 |
| **Sprint 4-5** | 月内 | P2 全量(可分批) |
| **季度** | 3 月 | 系统级(设计 tokens / a11y 自动化 / 视觉回归) |

---

## 7. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿(本次审计) | Coya |
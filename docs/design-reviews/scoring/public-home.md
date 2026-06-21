# / — 首页评分卡

**路由**: `/`
**评分日期**: 2026-06-20
**视口**: Desktop 1440 + Mobile 390
**截图**: [desktop](../screenshots/desktop/public-home.png) · [mobile](../screenshots/mobile/public-home.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 18 | 20 | 层级清晰,Hero→卖点→服务→产品→Footer 节奏好;hero 上下 padding 可加大 |
| D2 Visual | 17 | 20 | Hero 蓝渐变光晕 + 6 大图卡片有质感,但 hero 缺实际车型展示图(纯文字+渐变) |
| D3 Color | 19 | 20 | orange-500 + 蓝渐变 + zinc-950 严格遵循 CLAUDE.md dark theme |
| D4 Typography | 18 | 20 | 字阶清晰,H1/描述/小字层级分明,中英文混排得当 |
| D5 Accessibility | 16 | 20 | 语义化好;mobile 缺统一"返回顶部";hero CTA 缺 aria-label |
| **总分** | **88** | **100** | **B 良好** |

---

## 5 维度详细

### D1 Layout 布局 (18/20)
- ✅ Hero 区有清晰的视觉焦点(渐变光晕 + H1)
- ✅ 6 个核心卖点分 2 段(section) 呈现,避免信息过载
- ✅ 产品快速入口 3×2 网格,移动端自动堆叠为单列
- ⚠️ Hero CTA 按钮紧贴描述下方,上下 padding 偏小,视觉紧迫

### D2 Visual 视觉 (17/20)
- ✅ Hero 蓝→橙渐变光晕营造高端感(oklch 渐变)
- ✅ 产品卡片用真实图(非占位),6 大主题各异,视觉丰富
- ⚠️ Hero 区缺 1 张代表性车型图(纯文字+渐变,转化力受限)
- ⚠️ 无视频/动效(06-19 后未补)

### D3 Color 色彩 (19/20)
- ✅ 背景 zinc-950/900/800 三层渐变,层次清晰
- ✅ 主色 orange-500 + blue-400 严格遵循 design token
- ✅ Hover 状态色过渡自然
- ⚠️ hero 蓝渐变光晕明度略高,长时间注视略疲劳

### D4 Typography 排版 (18/20)
- ✅ H1 (4xl/5xl) + 描述 (lg) + 小字 (sm) 字阶系统完整
- ✅ 行高 leading-relaxed 适合中文阅读
- ✅ 字距 tracking-normal 默认值适合中文
- ⚠️ 中文数字与英文字符间距偶尔粘连(可加 letter-spacing 微调)

### D5 Accessibility 可访问性 (16/20)
- ✅ 语义化: `<header>` / `<main>` / `<section>` / `<footer>`
- ✅ 所有图片有 alt 文本
- ⚠️ Hero 2 CTA 按钮缺 `aria-label="立即预约咨询方案"` 等明确描述
- ⚠️ 缺统一"返回顶部"按钮(mobile 滚到底部时无快捷返回)
- ⚠️ Header 移动端汉堡菜单缺 `aria-expanded` 状态

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P2** | Hero 增加 1 张代表性车型图(右侧 50% 区域) | 2h |
| **P2** | Hero CTA 增加 `aria-label` 描述 | 0.5h |
| **P2** | 全站增加"返回顶部"按钮(mobile 优先) | 1h |
| **P2** | Header 汉堡菜单增加 `aria-expanded` | 0.5h |
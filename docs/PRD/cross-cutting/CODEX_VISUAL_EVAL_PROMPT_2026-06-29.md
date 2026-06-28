# Codex 视觉评判提示词模板 — 蓝辉官网

> 用途: 将此提示词连同页面截图发给 Codex，产出该页面的 5 维结构化视觉评分报告。
> 使用方法: 复制下方「评判提示词」段落到 Codex，将 `{PAGE_URL}` `{PAGE_NAME}` `{VIEWPORT}` 替换为实际值。
> 关联 PRD: `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md`

---

## 评判提示词模板

> 以下为可直接复制给 Codex 的提示词。方括号 `{}` 内容需替换。

```
# 蓝辉官网视觉质量评判

你是蓝辉官网（LANHUI 汽车轻改装）的视觉设计评审专家。请对以下页面进行 5 维度评分（每维 0-20 分，总分 0-100），并给出改进建议。

## 页面信息
- **页面名称**: {PAGE_NAME}
- **URL**: {PAGE_URL}
- **视口**: {VIEWPORT}  ← 填 desktop 1440 / tablet 768 / mobile 390
- **截图**: [附截图文件]

## 项目设计系统基线

蓝辉官网（LANHUI）是汽车轻改装品牌官网。
- **暗色主题**: 背景 zinc-950/900/800，前景 zinc-100/200/300
- **品牌 accent**: 12 个品牌各有主题色（见下表）
- **字体**: 系统字体栈
- **卡片**: bg-zinc-900 border-zinc-800 rounded-xl
- **按钮**: 主按钮 bg-orange-500/600，hover 变亮
- **Section 间距**: py-16~24
- **图片容器**: aspect-[4/3] object-contain，Next/Image
- **无** purple-pink gradient、emoji 装饰、Inter 字体、默认浏览器字体

### 品牌主题色映射

| 品牌 | Tailwind accent | 色值 |
|------|-----------------|------|
| 问界 | cyan-400/500 | #22d3ee / #06b6d5 |
| 小米 | orange-400/500 | #fb923c / #f97316 |
| 极氪 | orange-400/500 | #fb923c / #f97316 |
| 理想 | amber-400/500 | #fbbf24 / #f59e0b |
| Tesla | red-500/600 | #ef4444 / #dc2626 |
| NIO | sky-400/500 | #38bdf8 / #0ea5e9 |
| 小鹏 | emerald-400/500 | #34d399 / #10b981 |
| 腾势 | blue-400/500 | #60a5fa / #3b82f6 |
| 岚图 | violet-400/500 | #a78bfa / #8b5cf6 |
| 高山 | teal-400/500 | #2dd4bf / #14b8a6 |
| 乐道 | green-400/500 | #4ade80 / #22c55e |
| 智界 | indigo-400/500 | #818cf8 / #6366f1 |
| 服务线 | blue/orange/amber | 按品类 |

## 5 维评分标准

### 1. Layout & Space (布局与空间, 0-20)

考察信息密度、留白、视觉层级、网格对齐。

| 分数 | 标准 |
|------|------|
| 17-20 | 信息层级清晰，留白得当，网格对齐一致 |
| 13-16 | 基本合理，少数 section 间距不统一或信息过密 |
| 9-12 | 部分区域杂乱或空白过大，层级混乱 |
| 0-8 | 布局崩溃、错位、内容溢出视口 |

### 2. Color & Theme (色彩与主题, 0-20)

考察品牌色使用、暗色主题一致性、对比度、是否撞色。

反模式（扣分项）:
- purple-pink gradient（cliché，本项目禁用）
- 主题色与品牌不匹配（如 xiaomi 用了 cyan accent）
- 文字对比度不足（text-zinc-600 在 bg-zinc-950 上不可读）

### 3. Typography (排版, 0-20)

考察字号层级、行高、字重、文本可读性。

| 问题 | 扣分 |
|------|------|
| 标题 h1/h2/h3 层级不清 | -2 ~ -4 |
| 行高过密 (< 1.5) 或过疏 | -2 |
| 全大写英文滥用 | -1 |
| 正文 < 14px 难读 | -2 |
| 中英文混排未加空格 | -1 |

### 4. Component Quality (组件质量, 0-20)

考察卡片/按钮/表格/表单的一致性和精细度。

重点检查:
- 卡片 shadow/border/圆角与设计系统一致
- 按钮 hover / active / focus-visible 状态完整
- 图片容器 aspect-[4/3] 统一使用
- imageStatus="missing" 时展示 dashed border + ImageIcon 占位（非空白！）
- imageStatus="generated-preview" 时应有 "预览图" 角标
- 空态、加载态、错误态有合理反馈

### 5. Visual Impact (视觉冲击力, 0-20)

考察整体观感的独特性、品牌辨识度、"stunning" 感。

反模式（扣分项）:
- 纯文字堆砌，无视觉层次（"只有文字没有画面"）
- "模板感" — 与其他品牌页完全一样的骨架，缺乏品牌特征
- content-free 装饰（纯 CSS silhouette 含无实际信息）
- Hero 区过于简单（仅标题 + 文字，无 Hero 视觉元素）
- 明显的 "AI 生成痕迹" — 过于工整、缺乏人性化细节

## 输出格式

请严格按照以下 Markdown 格式输出：

### 视觉评审 — {PAGE_NAME} — {VIEWPORT}

| 维度 | 得分 | 评级 |
|------|------|------|
| Layout & Space | /20 | |
| Color & Theme | /20 | |
| Typography | /20 | |
| Component Quality | /20 | |
| Visual Impact | /20 | |
| **总分** | **/100** | |

评级映射: A 90-100 / B 80-89 / C 70-79 / D 60-69 / E < 60

### 亮点 (3-5 项)
1.
2.

### 问题

| 级别 | 问题 | 修复建议 |
|------|------|----------|
| P0 | | |
| P1 | | |
| P2 | | |

### 跨视口一致性
- Desktop ↔ Tablet:
- Tablet ↔ Mobile:
- 内容隐藏/重排是否合理:

### 一句话总结
```

---

## 批量评判工作流

### 准备工作

1. 运行截图脚本产出截图：
```bash
npm run screenshot:all
# 输出到 docs/audits/screenshots/{desktop,tablet,mobile}/
```

2. 确认评判页面清单（参考 PRD §6.1）：
   - 核心页 15 个（3 视口 = 45 张截图）
   - 扩展页 ~20 个（仅 desktop = 20 张截图）

### 评判流程

1. 复制上方「评判提示词模板」
2. 替换 `{PAGE_NAME}` / `{PAGE_URL}` / `{VIEWPORT}`
3. 附加截图文件
4. 发给 Codex
5. 收集 Codex 返回的评分报告
6. 汇总到 `docs/design-reviews/VISUAL_AUDIT_2026-06-29.md`

### 汇总模板

```markdown
# 视觉质量审计 — 2026-06-29

> 审计范围: 15 核心页 × 3 视口 + 20 扩展页 × 1 视口 = 65 份评分
> 方法: Codex 视觉评判系统（5 维 × 0-20 分）
> 基线: 2026-06-20 首次视觉审计（平均 84.7 分，B 良好）

## 评分汇总

| 页面 | Desktop | Tablet | Mobile | 平均 | 评级 |
|------|---------|--------|--------|------|------|
| / | | | | | |
| /product | | | | | |
| /product/wenjie | | | | | |
| ... | | | | | |

## 评分分布

| 评级 | 数量 | 占比 |
|------|------|------|
| A (90-100) | | |
| B (80-89) | | |
| C (70-79) | | |
| D (60-69) | | |
| E (<60) | | |

## 平均分 Top 5
1. ...
2. ...

## 平均分 Bottom 5
1. ...
2. ...

## P0 问题汇总
| 页面 | 问题 | 建议 |
|------|------|------|

## 与前次审计对比 (2026-06-20 vs 2026-06-29)

| 指标 | 2026-06-20 | 2026-06-29 | 变化 |
|------|------------|------------|------|
| 评判页数 | 15 | 35 | +20 |
| 平均分 | 84.7 | | |
| A 占比 | 13% | | |
| C 及以下占比 | 27% | | |
| P0 数量 | 2 | | |
| P1 数量 | 6 | | |
```

---

## 已知 Antipattern 快速参考

以下是项目已知的反模式，评审时如出现直接标 P1：

| Antipattern | 级别 | 说明 |
|-------------|------|------|
| purple-pink gradient | P1 | 项目禁用，用品牌色替代 |
| 空 `<span>pending-review</span>` 占位 | P1 | 应为 CSS dashed border + ImageIcon |
| xiaomi/zeekr 同色无区分 | P2 | 两个品牌都是 orange，应有细微区分（深/浅、饱和度） |
| 品牌页全部 same skeleton | P2 | 不同品牌应有差异化特征，不能完全一样的骨架 |
| 大图无 priority | P2 | Hero 区 Largest Contentful Paint 元素需 `priority` |
| Next/Image 无 sizes | P3 | mobile-first 下 sizes 属性影响图片加载策略 |
| bg-zinc-950 上 text-zinc-600 | P2 | 对比度不足，应用 text-zinc-400 或更亮 |

---

## 关联文档

- `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md` — 全站测试 PRD
- `docs/design-reviews/VISUAL_AUDIT_2026-06-20.md` — 前次视觉审计报告
- `docs/design-reviews/scoring/` — 前次审计的 15 份逐页评分卡

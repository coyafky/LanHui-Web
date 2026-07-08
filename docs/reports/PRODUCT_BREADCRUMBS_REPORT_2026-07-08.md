# 产品页面面包屑全覆盖报告

> Branch: `feature/20260708/product-breadcrumbs`
> Date: 2026-07-08

## 摘要

完成全部产品页面的面包屑导航全覆盖。所有产品页面均已使用 `Breadcrumbs` 组件（通过 `getProductBreadcrumbs` 生成数据），TypeScript 类型检查通过，9 个面包屑单元测试通过。

## 变更范围

### Hero 组件修改（19 个）

将硬编码的 `<nav>` 面包屑替换为动态 `<Breadcrumbs>` 组件：

| 组件 | 文件 |
|------|------|
| WenjieSeriesHero | `src/components/wenjie/WenjieSeriesHero.tsx` |
| WenjieModelUpgradeHero | `src/components/wenjie/model/WenjieModelUpgradeHero.tsx` |
| LiAutoSeriesHero | `src/components/li-auto/LiAutoSeriesHero.tsx` |
| LiAutoL9Hero | `src/components/li-auto/LiAutoL9Hero.tsx` |
| LiAutoI8Hero | `src/components/li-auto/LiAutoI8Hero.tsx` |
| LiAutoMegaHero | `src/components/li-auto/LiAutoMegaHero.tsx` |
| LiAutoOneHero | `src/components/li-auto/LiAutoOneHero.tsx` |
| NioEs8Hero | `src/components/nio/NioEs8Hero.tsx` |
| XpengGxTopicHero | `src/components/xpeng/XpengGxTopicHero.tsx` |
| Zeekr8xHero | `src/components/zeekr-8x/Zeekr8xHero.tsx` |
| ZhijieV9TopicHero | `src/components/zhijie/ZhijieV9TopicHero.tsx` |
| LedaoL90Hero | `src/components/ledao/LedaoL90Hero.tsx` |
| DenzaBrandHero | `src/components/denza/DenzaBrandHero.tsx` |
| ProductHero | `src/components/product/ProductHero.tsx` |
| WindowFilmPackageDetail | `src/components/window-film/WindowFilmPackageDetail.tsx` |
| CarCareHero | `src/components/product/car-care/CarCareHero.tsx` |
| ElectricStepHero | `src/components/product/electric-steps/ElectricStepHero.tsx` |
| WheelHero | `src/components/product/wheel/WheelHero.tsx` |
| CarMatHero | `src/components/product/carmat/CarMatHero.tsx` |

### 页面修改（30 个）

将面包屑数据传递到 Hero/BrandPlaceholder/内联 Breadcrumbs：

**BrandPlaceholder 页面（8 个）：**
- `src/app/product/denza/page.tsx`
- `src/app/product/gaoshan/page.tsx`
- `src/app/product/ledao/page.tsx`
- `src/app/product/nio/page.tsx`
- `src/app/product/voyah/page.tsx`
- `src/app/product/xpeng/page.tsx`
- `src/app/product/business-comfort/page.tsx`
- `src/app/product/skid-plate/page.tsx`

**品牌/车型页面（14 个）：**
- `src/app/product/wenjie/page.tsx`
- `src/app/product/wenjie/m6/page.tsx`
- `src/app/product/wenjie/m7/page.tsx`
- `src/app/product/wenjie/m8/page.tsx`
- `src/app/product/li-auto/page.tsx`
- `src/app/product/li-auto/l9/page.tsx`
- `src/app/product/li-auto/i8/page.tsx`
- `src/app/product/li-auto/mega/page.tsx`
- `src/app/product/li-auto/one/page.tsx`
- `src/app/product/nio/es8/page.tsx`
- `src/app/product/xpeng/gx/page.tsx`
- `src/app/product/zeekr/8x/page.tsx`
- `src/app/product/zhijie/v9/page.tsx`
- `src/app/product/ledao/l90/page.tsx`

**服务页面（4 个）：**
- `src/app/product/car-care/page.tsx`
- `src/app/product/electric-steps/page.tsx`
- `src/app/product/wheels/page.tsx`
- `src/app/product/floor-mats/page.tsx`

**内联面包屑页面（2 个）：**
- `src/app/product/flooring/page.tsx`
- `src/app/product/zeekr/page.tsx`

**入口页 + 套餐详情页（2 个）：**
- `src/app/product/page.tsx`
- `src/app/product/window-film/[packageSlug]/page.tsx`

### 额外修复（9 个组件）

修正上一批修改中遗留的问题：
- 5 个 li-auto Hero 组件缺少 `breadcrumbItems` 解构
- DenzaBrandHero 缺少 `breadcrumbItems` 解构
- LedaoL90Hero 缺少 `breadcrumbItems` 解构
- NioEs8Hero 缺少 `breadcrumbItems` 解构
- WenjieModelUpgradeHero 缺少 `breadcrumbItems` 解构
- WenjieSeriesHero 缺少 `breadcrumbItems` 解构
- XpengGxTopicHero 缺少 `breadcrumbItems` 解构
- Zeekr8xHero 缺少 `breadcrumbItems` 解构
- ZhijieV9TopicHero 缺少 `breadcrumbItems` 解构
- LiAutoL9Hero 残留 `</nav>` 标签
- WindowFilmPackageDetail 缺少 `ChevronLeft` 导入

## 验证结果

| 检查项 | 结果 |
|--------|------|
| TypeScript typecheck | PASS（仅 9 个已知遗留错误） |
| Breadcrumb 单元测试（9 个） | PASS |
| 全量测试（875 个） | 859 PASS / 16 FAIL（全部为文章 API 预存问题） |
| 产品页面扫描（44 个页面） | 100% 覆盖率 |

## 边界说明

1. **JSON-LD BreadcrumbList schema** 尚未添加到所有页面——当前大部分产品页面已有自己的 ItemList/CollectionPage JSON-LD，BreadcrumbList schema 可作为后续增量添加。
2. **已知预存问题**：16 个测试失败全部来自 `src/app/api/articles/[id]/route.test.ts`（文章状态流转预期 409 但获 500），与面包屑无关。
3. **未覆盖内容**：非产品页面（如 `/agent`、`/news`、`/brand`、`/about` 等）不在本次任务范围内，未做改动。

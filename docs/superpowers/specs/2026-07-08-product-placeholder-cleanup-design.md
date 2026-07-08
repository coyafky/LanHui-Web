---
comet_change: product-placeholder-cleanup
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-08-product-placeholder-cleanup
status: final
---

# 技术设计：产品占位页清理

## 架构概览

```
product-routes.ts (数据层)
    │
    ├── getLiveBrands() ──→ Header / 产品中心入口
    ├── getLiveServices() ──→ Header / 产品中心入口
    │
    └── BrandPlaceholder.tsx (展示层)
              │
              ├── status=live + intro → 正常品牌页
              ├── status=live + models → 车型卡片网格
              └── status=planned → "方案整理中"
```

## 组件设计

### BrandPlaceholder 更新

```
Props 变更：
+ intro?: string  // live 状态品牌介绍，2-3 句

渲染逻辑：
- status === "live"  + intro → 渲染 intro 段落 (text-zinc-400 text-sm)
- status === "live"  + models → 渲染车型卡片网格（现有逻辑不变）
- status === "planned" → 渲染 wrench 图标 + "方案整理中"（现有逻辑不变）
```

### 底盘护板页面结构

```
src/app/product/skid-plate/page.tsx (RSC)
├── Breadcrumbs
├── H1: 底盘护板
├── 简介段落 (text-zinc-300)
├── 价值点 Grid (3-4 cards, accent border)
├── 服务流程 (3 steps)
├── 到店咨询 CTA (WeChat modal trigger)
└── JSON-LD schema (Service)
```

### 商务舒适页面

```
src/app/product/business-comfort/page.tsx
→ import { notFound } from "next/navigation"
→ export default function() { notFound() }
```

## 数据流

```
product-routes.ts:
  skid-plate: planned → live
  business-comfort: 保持 planned

getLiveServices():
  skid-plate ✅ 进入公开入口
  business-comfort ❌ 不进入公开入口

getLiveBrands():
  denza/voyah/xpeng/nio/ledao/gaoshan ✅ 已 live（无变更）
```

## 品牌文案映射

| 品牌 | subtitle | intro |
|------|----------|-------|
| 腾势 | 蓝辉轻改为腾势 D9 等车型提供轻改与膜系方案 | 腾势是比亚迪旗下高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |
| 岚图 | 蓝辉轻改为岚图梦想家等车型提供轻改与膜系方案 | 岚图是东风集团高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |
| 小鹏 | 蓝辉轻改为小鹏 GX 等车型提供轻改与膜系方案 | 小鹏是智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |
| 蔚来 | 蓝辉轻改为蔚来 ES8 等车型提供轻改与膜系方案 | 蔚来是高端智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |
| 乐道 | 蓝辉轻改为乐道 L90 等车型提供轻改与膜系方案 | 乐道是蔚来旗下家庭车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |
| 高山 | 蓝辉轻改为高山 8 等车型提供轻改与膜系方案 | 高山是魏牌旗下高端 MPV 品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。 |

## 检查脚本设计

```
scripts/check-product-placeholders.mjs:
  输入: 7 个页面文件路径
  检查:
    1. grep "方案整理中" / "内容由团队完善中"
    2. 如有命中 → 输出文件路径 + 行号, exit 1
    3. import { getLiveServices } from product-routes
    4. 确认 getLiveServices() 中无 business-comfort
  输出: PASS (0 命中) 或 FAIL (列出命中文件)
```

`package.json` 变更：
```json
"check:product-placeholders": "node scripts/check-product-placeholders.mjs"
```
`npm run check` 链入顺序：lint → typecheck → verify:zeekr-images → check:product-placeholders → build

## 测试策略

- **单元测试**: BrandPlaceholder 组件无现有测试，本次不新增（纯文案变更）
- **检查脚本自验证**: `node scripts/check-product-placeholders.mjs` 返回 0
- **构建验证**: `npm run build` 确认 7 页面编译无错误
- **浏览器验证**: 手动检查 7 页面无"方案整理中"，/product/business-comfort 返回 404

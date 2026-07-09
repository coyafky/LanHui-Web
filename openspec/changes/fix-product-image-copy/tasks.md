# Tasks: fix-product-image-copy

## 1. 新增检查脚本

- [x] 1.1 创建 `scripts/check-product-image-copy.mjs`，扫描 `src/lib` `src/components` `src/app/product` `scripts` 目录，禁止 `generated-preview` `功能预览图` `生成预览图` `AI 生成`（用拼接字符串规避自检误报）
- [x] 1.2 `package.json` 新增 `check:product-image-copy` 命令，接入 `npm run check` 链（放在 build 之前）

## 2. 核心 lib 改动

- [x] 2.1 `src/lib/wenjie-preview-images.ts`：类型 `"generated-preview"` → `"product-preview"`，函数 `buildWenjieGeneratedPreviewImage` → `buildWenjieProductPreviewImage`，alt "功能预览图" → "商品预览效果图"
- [x] 2.2 同步更新 4 个 wenjie upgrade-project 文件的 import 和调用（m6/m7/m8/series）

## 3. 产品数据文件 — 类型 + 数据批量替换

- [x] 3.1 `src/lib/li-auto-*-products.ts`（i6/i8/l9/one/mega）— imageStatus 类型 + 数据值替换
- [x] 3.2 `src/lib/li-auto-series-upgrade-projects.ts` — imageStatus 类型 + 数据值替换
- [x] 3.3 `src/lib/nio-products.ts` — imageStatus 类型 + 数据值替换 + disclaimer 文案更新
- [x] 3.4 `src/lib/zeekr-9x-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.5 `src/lib/zeekr-8x-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.6 `src/lib/denza-d9-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.7 `src/lib/voyah-products.ts` — imageStatus 类型 + 数据值替换 + validate 函数更新
- [x] 3.8 `src/lib/gaoshan-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.9 `src/lib/zhijie-v9-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.10 `src/lib/ledao-l90-products.ts` — imageStatus 类型 + 数据值替换
- [x] 3.11 `src/lib/xpeng-gx-products.ts` — imageStatus 类型 + 数据值替换 + alt 文案更新
- [x] 3.12 `src/lib/xiaomi-yu7-upgrade-projects.ts` — imageStatus 类型 + 数据值替换

## 4. 组件 — imageStatus 判断 + alt 文案更新

- [x] 4.1 `src/components/wenjie/model/WenjieModelProjectGrid.tsx` — 类型 "generated-preview" → "product-preview"，删除 badge，statusLabel 更新
- [x] 4.2 `src/components/wenjie/WenjieSeriesHero.tsx` — 删除免责声明 "功能预览图用于说明升级方向，不代表实车案例"
- [x] 4.3 `src/components/wenjie/WenjieSeriesSubModelsGrid.tsx` — alt "升级款式功能预览图" → "升级款式商品预览效果图"
- [x] 4.4 `src/components/xiaomi-series/XiaomiSeriesHero.tsx` — 删除免责声明 + alt "功能预览图" → "商品预览效果图"
- [x] 4.5 `src/components/xiaomi-series/XiaomiSeriesFeaturedGrid.tsx` — alt "升级项目功能预览图" → "升级项目商品预览效果图"
- [x] 4.6 `src/components/denza/DenzaBrandHero.tsx` — 删除 "功能预览图 · 后续补充"
- [x] 4.7 `src/components/li-auto/LiAutoSeriesHero.tsx` — 删除 "功能预览图 · 后续补充"
- [x] 4.8 `src/components/li-auto/LiAutoSeriesSubModelsGrid.tsx` — aria-label "升级款式功能预览图" → "升级款式商品预览效果图"
- [x] 4.9 批量更新所有 ProjectGrid 组件（~14 个）— `"generated-preview"` → `"product-preview"` + 删除 product-preview badge + alt 文案修正

## 5. 产品页面文案修正

- [x] 5.1 `src/app/product/zhijie/page.tsx` — "功能预览图 · 后续补充" 删除或替换

## 6. 测试文件更新

- [x] 6.1 更新 wenjie 测试（m6/m7/m8/series）— 断言 `"generated-preview"` → `"product-preview"`
- [x] 6.2 更新 li-auto 测试 — 断言 + 测试描述 "AI 生成预览图" → "商品预览效果图"
- [x] 6.3 更新 `scripts/test/image-status-audit.mjs` — 计数器 `"generated-preview"` → `"product-preview"`

## 7. 验证

- [x] 7.1 `npm run check:product-image-copy` 通过
- [x] 7.2 `npm run typecheck` 无新增错误
- [x] 7.3 `npm run build` 通过
- [x] 7.4 浏览器抽查 8 个产品页面，确认无禁用文案

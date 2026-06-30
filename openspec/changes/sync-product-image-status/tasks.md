## 1. li-auto 系列升级项目

- [x] 1.1 读取 `public/images/products/li-auto/i6/generated/items.json`，获取 20 个条目的 key→name 映射
- [x] 1.2 逐项匹配 `src/lib/li-auto-series-upgrade-projects.ts` 中的 21 个升级项目，按中文名对应
- [x] 1.3 为匹配成功的条目设置 `imageStatus: "generated-preview"`、`publicPath`、`width: 1448`、`height: 1086`、`aspectRatio: "4/3"`
- [x] 1.4 保留未匹配条目的现有状态不变

## 2. li-auto i6

- [x] 2.1 读取 `public/images/products/li-auto/i6/generated/items.json`（20 个条目，key 格式 `i6-<slug>`）
- [x] 2.2 逐项匹配 `src/lib/li-auto-i6-products.ts` 中的 20 个项目（key 格式 `<slug>`，去掉 `i6-` 前缀后匹配）
- [x] 2.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段
- [x] 2.4 处理 items.json 中 key 名为 `i6-sway-bar`（对应产品 lib 的 `stabilizer-bar`）、`i6-wheels`（对应 `wheel-rims`）等特殊映射

## 3. li-auto l9

- [x] 3.1 读取 `public/images/products/li-auto/l9/generated/manifest.json`，获取图片文件列表
- [x] 3.2 逐项匹配 `src/lib/li-auto-l9-products.ts` 中的产品条目，按中文名或文件名关键词对应
- [x] 3.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 4. li-auto mega

- [x] 4.1 读取 `public/images/products/li-auto/mega/generated/items.json`（key 格式 `mega-<slug>`）
- [x] 4.2 逐项匹配 `src/lib/li-auto-mega-products.ts` 中的产品条目（去掉 `mega-` 前缀后匹配）
- [x] 4.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 5. li-auto one

- [x] 5.1 读取 `public/images/products/li-auto/one/generated/manifest.json`，获取图片文件列表
- [x] 5.2 逐项匹配 `src/lib/li-auto-one-products.ts` 中的产品条目，按中文名或文件名关键词对应
- [x] 5.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 6. tesla

- [x] 6.1 读取 `public/images/products/tesla/generated/manifest.json`（12 个条目含 publicPath）
- [x] 6.2 逐项匹配 `src/lib/tesla-products.ts` 中的产品条目，按中文名对应（manifest 用简短 key，产品 lib 用 `tesla-featured-<slug>` 格式）
- [x] 6.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 7. xiaomi SU7

- [x] 7.1 读取 `public/images/products/xiaomi/manifest.json` 中 `vehicleModel: "SU7"` 的 12 张图片
- [x] 7.2 逐项匹配 `src/lib/xiaomi-su7-upgrade-projects.ts` 中的产品条目，按 manifest 中的 `productName` 中文名对应
- [x] 7.3 为匹配成功的条目设置 `imageStatus: "matched"`、`publicPath`、实际 width/height（不使用 4:3 预设）

## 8. xiaomi YU7

- [x] 8.1 读取 `public/images/products/xiaomi/manifest.json` 中 `vehicleModel: "YU7"` 的 6 张图片
- [x] 8.2 逐项匹配 `src/lib/xiaomi-yu7-upgrade-projects.ts` 中的产品条目，按中文名对应
- [x] 8.3 为匹配成功的条目设置 `imageStatus: "matched"` 和图片字段

## 9. xiaomi 系列升级项目

- [x] 9.1 检查 `public/images/products/xiaomi/manifest.json` 是否有系列级产品图（非车型图）
- [x] 9.2 如有匹配项，更新 `src/lib/xiaomi-series-upgrade-projects.ts`；如无系列图，标记为 `pending-review` 保持不变

## 10. 组件渲染适配（额外的 wenjie + 跨品牌工作）

- [x] 10a.1 创建 `src/lib/wenjie-preview-images.ts`：model-aware `buildWenjieGeneratedPreviewImage(key, name, modelCategory?)`
- [x] 10a.2 更新 M6/M7/M8 数据文件：传入对应 modelCategory 参数
- [x] 10a.3 更新 wenjie series 数据文件：无 model → publicPath=null
- [x] 10a.4 更新 wenjie 4 个测试文件：匹配新路径结构
- [x] 10a.5 更新 wenjie 组件：conditionally render `<Image>` when publicPath exists
- [x] 10a.6 更新 li-auto/tesla/xiaomi 组件：conditionally render `<Image>` when publicPath exists
- [x] 10a.7 删除 PosterStub 组件（遵循无海报政策）
- [x] 10a.8 修复 xiaomi-yu7 接口：添加 publicPath/width/height/aspectRatio 可选字段

## 11. 验证

- [x] 11.1 运行 `npm run typecheck`：0 个新错误（仅 9 个 pre-existing）
- [x] 11.2 运行 `npm test -- --run`：wenjie 86/86、li-auto/tesla/xiaomi 157/157 全部通过（39/43 文件通过，4 个 pre-existing failures）
- [x] 11.3 运行 `npm run build`：516/516 页编译成功
- [x] 11.4 imageStatus 分布（最终）：

| 文件 | 总数 | generated-preview | matched | pending-review | missing |
|------|------|------------------|---------|---------------|---------|
| wenjie-m6 | 18 | 18 | 0 | 0 | 0 |
| wenjie-m7 | 31 | 31 | 0 | 0 | 0 |
| wenjie-m8 | 31 | 31 | 0 | 0 | 0 |
| wenjie-series | 35 | 35 | 0 | 0 | 0 |
| li-auto-series | 45 | 41 | 1 | 2 | 1 |
| li-auto-i6 | 26 | 21 | 1 | 3 | 1 |
| li-auto-l9 | 20 | 15 | 1 | 3 | 1 |
| li-auto-mega | 24 | 19 | 1 | 3 | 1 |
| li-auto-one | 13 | 9 | 1 | 2 | 1 |
| tesla | 47 | 11 | 1 | 34 | 1 |
| xiaomi-su7 | 15 | 0 | 13 | 1 | 1 |
| xiaomi-yu7 | 13 | 0 | 1 | 1 | 11 |
| xiaomi-series | 23 | 0 | 1 | 0 | 22 |
| **合计** | **~341** | **~231** | **~21** | **~52** | **~37** |

### 遗留说明
- Tesla 34 个 optional 项目保持 `pending-review`（无对应 generated 图片）
- Xiaomi YU7 11 个 missing（无图片文件存在）
- Xiaomi series 22 个 missing（无系列级图片）
- 各 li-auto 文件约 1-3 个 pending/missing（需后续人工补图）

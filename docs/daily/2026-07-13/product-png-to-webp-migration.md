---
title: 产品图片 PNG 转 WebP 执行记录
date: 2026-07-13
status: completed
scope: public/images/products
---

# 产品图片 PNG 转 WebP 执行记录

## 1. 执行结果

- 产品 PNG：586 张。
- WebP 转换成功：586 张。
- 转换失败：0 张。
- PNG 原始体积：1,109,703,279 bytes。
- WebP 体积：65,812,194 bytes。
- 节省：1,043,891,085 bytes。
- 压缩率：94.07%。
- 转换质量：85。
- WebP 编码 method：6。
- 原始尺寸保持不变。
- 透明通道已校验。

`public/images` 最终约 88MB，产品图片目录约 81MB。产品目录除 586 张 WebP 外还包含原有 JPG 等资源。

## 2. 备份

完整备份位于仓库外：

```text
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-backups/2026-07-13/public-images-before-product-webp.tar
```

SHA-256 清单：

```text
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-backups/2026-07-13/public-images-before-product-webp.tar.sha256
```

备份大小约 1.1GB，已执行 `shasum -a 256 -c` 并通过。归档中确认包含全部 586 张产品 PNG。

恢复前应先停止开发服务器，并在仓库根目录执行：

```bash
shasum -a 256 -c /Users/fkycoya/Documents/WebsiteClone/lanhui-website-backups/2026-07-13/public-images-before-product-webp.tar.sha256
tar -xf /Users/fkycoya/Documents/WebsiteClone/lanhui-website-backups/2026-07-13/public-images-before-product-webp.tar
```

## 3. 转换脚本

脚本位置：

```text
scripts/convert-product-images-to-webp.py
```

常规执行：

```bash
python3 scripts/convert-product-images-to-webp.py \
  --quality 85 \
  --method 6 \
  --report docs/daily/2026-07-13/product-webp-conversion.json
```

只查看待转换内容：

```bash
python3 scripts/convert-product-images-to-webp.py --dry-run
```

脚本特性：

- 只扫描 `public/images/products/**/*.png`。
- WebP 与原图使用相同目录和文件名主体。
- 支持增量转换。
- 使用临时文件和 `os.replace` 原子写入。
- 转换后重新读取 WebP。
- 校验格式、宽高和透明通道。
- 默认保留原 PNG，由发布流程在验证后删除。

实现参考了用户提供的 [Pillow 批量转换教程](https://blog.kejilion.pro/jpg-png-to-webp/)，并增加了目录递归、原子写入、透明通道校验、增量执行和 JSON 报告。

## 4. 代码与契约同步

已完成：

- 产品运行时图片引用从 `.png` 切换为 `.webp`。
- 车型、轮毂、汽车垫等由文件名动态拼接的路径已同步。
- 极氪迁移脚本已改为 WebP 契约。
- 极氪 CI 图片验证已改为 WebP。
- 相关测试中的扩展名约束已同步。
- 产品 PNG 已从 `public/images/products` 移除。
- Logo、二维码、首页与品牌非产品 PNG 保持不变。

转换前已经存在 50 个没有对应 PNG 的产品占位路径。本次没有生成虚构图片，这些路径仍属于后续内容治理范围，不计入转换失败。

## 5. 验证结果

通过：

```text
npm run typecheck
npm test
npm run verify:zeekr-images
npm run verify:static-images
npm run check:static-boundary
NEXT_PUBLIC_SITE_URL=https://www.lanhui.com npm run build:static
NEXT_PUBLIC_SITE_URL=https://www.lanhui.com npm run check:static-output
```

结果：

- TypeScript 通过。
- 56 个测试文件通过。
- 861 个测试通过。
- 极氪 21 张 WebP 规格验证通过。
- 静态图片引用验证通过。
- 静态边界验证通过。
- Next.js 生成 426 个静态页面。
- 424 个 HTML 文件和 sitemap URL 全部通过。

浏览器抽查：

- 小米 YU7：12/12 图片加载，0 破图。
- 极氪 9X：21/21 图片加载，0 破图。
- 问界 M7：32/32 图片加载，0 破图。
- 汽车垫页面：0 破图。
- 轮毂页面：0 破图。

## 6. 已知非本次问题

完整 `npm run check:static` 仍会在 ESLint 阶段被三个既有 React Effect 规则错误拦截：

- `src/components/agent/StoreSearch.tsx`
- `src/components/gaoshan/Gaoshan8ProjectGrid.tsx`
- `src/components/xiaomi-series/XiaomiSeriesProjectGrid.tsx`

这些错误与图片格式转换无关，本次没有扩大范围修改业务交互逻辑。其余图片、测试和静态构建门禁已分别执行并通过。

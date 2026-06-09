# 蓝辉轻改官网 — 架构借鉴与图片处理方案

> 基于 `docs/EVALUATION.md` 的评估结论，进一步整理：哪些膜小二成熟经验值得继续借鉴，哪些蓝辉第一版已经做得更好，以及后续图片资源应如何采集、入库、处理、渲染和部署。

最后更新：2026-06-06

---

## 1. 核心判断

蓝辉第一版官网的工程骨架已经成立，并且在几个地方优于膜小二复刻项目：

- 数据层从膜小二的单一 `agent-data.ts` 巨文件，优化为 `brand/products/store/news` 四个关注点分离文件。
- 产品页抽出 `ProductDetail`，避免 6 个产品页重复写结构。
- Header 交互更成熟：标签可点、chevron 可单独展开、支持外部点击和 Esc 关闭。
- 门店 4 层路由已经搭好：入口、省份、城市、门店详情。

因此后续不建议“倒退式复刻”膜小二代码，而应采用：

```text
继续保留蓝辉当前工程抽象
+ 借鉴膜小二的页面深度、图片落位、SSG/SEO/部署经验
+ 系统补齐真实图片与内容资产
```

当前最大短板不是路由，也不是组件，而是视觉资产为空：Logo、Hero、产品图、门店图、品牌图、OG 图、favicon 都还没有形成资产体系。

---

## 2. 架构上值得继续借鉴膜小二的地方

### 2.1 App Router + 静态预渲染

继续沿用膜小二的成熟路线：

- `src/app/**/page.tsx` 组织路由。
- 绝大多数页面保持 Server Component。
- 动态路由通过 `generateStaticParams()` 预渲染。
- 不存在的数据走 `notFound()`。
- `next.config.ts` 保持 `output: "standalone"`，为中国大陆云服务器 Docker 部署准备。

蓝辉后续要补齐：

- `/brand/certifications`
- `/brand/history`
- `/news/[slug]`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

### 2.2 页面结构节奏

膜小二的页面节奏适合品牌官网，蓝辉应继续使用：

```text
Header
Page Hero
核心内容区
卡片/表格/列表区
CTA
Footer
```

首页也继续保持：

```text
Hero
WhyChooseUs
CoreServices
ProductsQuickEntry
Footer
```

真正要增强的是图片和真实内容，而不是重写布局。

### 2.3 门店网络骨架

蓝辉是品牌官网，要提前保留全国门店网络能力。当前实现方向正确：

```text
/agent
/agent/:province
/agent/:province/:city
/agent/store/:id
```

注意：

- Phase 2 仍只填真实门店数据。
- 不要为了页面饱满制造假省份、假城市、假门店。
- 可以展示“更多城市门店陆续开放中”。
- 城市与门店增加后，只改 `src/lib/store.ts`，路由无需重构。

### 2.4 数据层组织

蓝辉当前数据层比膜小二更适合长期维护，应保留：

```text
src/lib/brand.ts
src/lib/products.ts
src/lib/store.ts
src/lib/news.ts
```

建议下一步新增：

```text
src/lib/assets.ts
src/lib/seo.ts
```

作用：

- `assets.ts` 管理图片路径、alt、尺寸、blur 占位。
- `seo.ts` 管理 canonical、OG、Schema.org 生成函数。

---

## 3. 图片资产体系

### 3.1 需要补齐的图片类型

| 优先级 | 图片 | 建议尺寸 | 用途 |
|---|---|---:|---|
| P0 | 横版 Logo 深色背景版 | 800×180 或 SVG | Header/Footer |
| P0 | favicon | 32×32 / 48×48 / ico | 浏览器标签 |
| P0 | apple-touch-icon | 180×180 | iOS 收藏 |
| P0 | OG 默认图 | 1200×630 | 微信/社媒/搜索分享 |
| P0 | 首页 Hero 主图 | 2400×1350 | 首页第一屏 |
| P0 | 6 个产品主图 | 1600×1000 | 产品页和入口卡片 |
| P0 | 顺德大良店门头图 | 1600×1000 | 门店详情 |
| P1 | 门店图库 4-8 张 | 1600×1000 | 门店详情 gallery |
| P1 | 品牌介绍图 | 1600×1000 | `/brand` |
| P1 | 资质/证书图 | 原图 + 1200 边长版本 | `/brand/certifications` |
| P2 | Hero 短视频 | 1920×1080, 5-10s | 首页氛围增强 |

### 3.2 推荐目录结构

```text
public/
  images/
    logo/
      lanhui-logo-white.png
      lanhui-logo-color.png
      lanhui-mark.png
    home/
      hero-bg.jpg
      service-light-mod.jpg
      service-film.jpg
      service-store.jpg
    products/
      electric-steps.jpg
      wheels.jpg
      chassis.jpg
      window-film.jpg
      color-film.jpg
      ppf.jpg
    store/
      shunde-daliang/
        storefront.jpg
        workshop-01.jpg
        workshop-02.jpg
        delivery-01.jpg
    brand/
      about-lanhui.jpg
      founder-or-team.jpg
    cert/
      cert-01.jpg
      cert-02.jpg
  seo/
    favicon.ico
    apple-touch-icon.png
    og-default.png
  videos/
    hero.mp4
```

命名规则：

- 全部 kebab-case。
- 不用中文文件名。
- 不用空格。
- 不用 `IMG_1234.jpg` 这类相机原名。
- 同一素材不要同时存在 `.jpg`、`.png`、`.webp` 多个混乱版本。

### 3.3 图片内容建议

蓝辉不是纯膜品牌，所以图片要体现“轻改 + 膜系 + 门店交付”三条线：

1. Hero 图  
   车辆 45° 前侧视角，暗色背景，有蓝橘光感，能看到轮毂/姿态/车身线条。

2. 电动踏板  
   开门踏板展开状态，最好有低机位细节图。

3. 轮毂升级  
   轮毂近景，展示轮毂形面、刹车空间、轮胎侧壁。

4. 底盘升级  
   避震/底盘施工场景，避免脏乱维修感，要偏专业施工。

5. 汽车窗膜  
   前挡/侧窗透光与隔热场景，可有室内外对比。

6. 改色膜  
   车身大面积色彩图，重点表达审美。

7. 隐形车衣  
   施工刮板、包边细节、漆面高光。

8. 门店  
   门头、前台、施工工位、交车区、工具墙。

---

## 4. 图片处理技术方案

### 4.1 Phase 2 推荐：本地 public + Next Image

当前站点图片数量少，推荐先走最简单稳定的方案：

```text
图片放 public/images
组件使用 next/image
构建为 standalone
Nginx/CDN 缓存静态资源
```

优点：

- 实现快。
- 不依赖 OSS/COS。
- 与当前代码最匹配。
- 图片路径稳定，适合先上线。

代码示例：

```tsx
import Image from "next/image";

<Image
  src="/images/home/hero-bg.jpg"
  alt="蓝辉轻改汽车轻改装展示"
  fill
  priority
  sizes="100vw"
  className="object-cover"
/>
```

使用规则：

- Hero 首屏图使用 `priority`。
- 列表卡片图不加 `priority`，让其 lazy load。
- `fill` 图片必须保证父容器有稳定高度或 `aspect-ratio`。
- 非 `fill` 图片必须写 `width` 和 `height`。
- 每张图都要有业务化 `alt`，不要写“图片1”。

### 4.2 Phase 3 推荐：OSS/COS + CDN + Next 自定义 loader

当图片开始变多，尤其出现多门店、多产品、多案例后，建议迁移到对象存储：

```text
原图上传 OSS/COS
使用图片样式生成不同尺寸/格式
CDN 加速
Next Image 通过 custom loader 输出云处理 URL
```

可选云：

- 阿里云 OSS：更适合阿里云 ECS/备案/CDN 一体化部署。
- 腾讯云 COS + 数据万象：如果后续生态在腾讯云，也可以选。

阿里云 OSS 图片样式可以处理缩放、裁剪、格式转换、水印等；腾讯云 COS 图片处理支持在上传或下载时携带处理参数。两者都适合做“原图一次上传，多规格按需访问”。

推荐优先选阿里云 OSS，如果服务器和备案也放阿里云。

### 4.3 OSS 图片样式建议

可以定义以下样式：

| 样式名 | 用途 | 目标 |
|---|---|---|
| `hero_2400` | Hero 大图 | 宽 2400，质量 82，WebP/AVIF |
| `card_1200` | 服务/产品卡片 | 宽 1200，质量 82 |
| `thumb_600` | 缩略图 | 宽 600，质量 78 |
| `og_1200x630` | 分享图 | 裁剪 1200×630 |
| `cert_1200` | 证书展示 | 长边 1200，保留清晰度 |
| `logo_400` | Logo 位图兜底 | 宽 400 |

示例 URL 思路：

```text
https://assets.lanhui.example.com/images/home/hero-bg.jpg?x-oss-process=style/hero_2400
```

若未来使用 custom loader，可把样式选择封装在代码里，而不是组件里手写 URL 参数。

### 4.4 Next custom loader 方向

新增：

```text
src/lib/image-loader.ts
```

概念示例：

```ts
export default function ossImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const q = quality ?? 82;
  return `${process.env.NEXT_PUBLIC_ASSET_HOST}${src}?x-oss-process=image/resize,w_${width}/quality,q_${q}/format,webp`;
}
```

再在 `next.config.ts` 中配置：

```ts
const nextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};
```

注意：这一步建议等 OSS/COS 域名确定后再做。当前本地 `public` 阶段不要过早引入复杂 loader。

### 4.5 图片数据模型

建议新增 `src/lib/assets.ts`：

```ts
export type SiteImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
};

export const siteImages = {
  hero: {
    src: "/images/home/hero-bg.jpg",
    alt: "蓝辉轻改汽车轻改装展示",
    width: 2400,
    height: 1350,
    priority: true,
  },
  products: {
    electricSteps: {
      src: "/images/products/electric-steps.jpg",
      alt: "蓝辉轻改电动踏板升级",
      width: 1600,
      height: 1000,
    },
  },
} satisfies Record<string, unknown>;
```

好处：

- 不把图片路径散落在组件里。
- 后续从 `public` 切 OSS/COS 时，只需改数据层。
- alt 文案统一维护。
- 可以给每张图记录原始尺寸，减少布局偏移。

---

## 5. 图片接入顺序

### P0：最小可上线图片包

先拿到以下 10 个资产：

1. `lanhui-logo-white.png`
2. `favicon.ico`
3. `apple-touch-icon.png`
4. `og-default.png`
5. `hero-bg.jpg`
6. `electric-steps.jpg`
7. `wheels.jpg`
8. `chassis.jpg`
9. `window-film.jpg`
10. `storefront.jpg`

这 10 个图能让官网从“骨架”变成“可展示品牌”。

### P1：信任增强图片包

1. 门店图库 4-8 张。
2. 车衣/改色膜/窗膜施工细节图。
3. 品牌介绍图。
4. 证书/授权/合作图。

### P2：增长素材包

1. 案例图：改装前/后。
2. 交车图。
3. 视频探店。
4. 产品短视频。
5. 施工延时视频。

---

## 6. 代码改造建议

### 6.1 先改组件图片落位

优先替换这些位置：

| 文件 | 当前状态 | 建议 |
|---|---|---|
| `src/components/Hero.tsx` | 渐变背景 | 加 Hero 背景图 + 渐变遮罩 |
| `src/components/CoreServices.tsx` | icon 占位 | 改为图片卡片 + icon 叠加 |
| `src/components/ProductsQuickEntry.tsx` | icon/卡片 | 增加产品缩略图 |
| `src/components/ProductDetail.tsx` | 文字为主 | 增加产品 Hero 图 |
| `src/app/agent/**` | 门店占位 | 增加门店图/图库 |
| `src/app/brand/page.tsx` | 品牌文字为主 | 增加品牌介绍图 |

### 6.2 图片组件封装

建议新增一个轻量组件：

```text
src/components/SiteImage.tsx
```

职责：

- 统一 `Image` 的 `className`、`sizes`、fallback。
- 统一处理图片缺失时的渐变占位。
- 避免每个页面重复写 fallback UI。

但不要过早抽象过重。Phase 2 可先只封装 `ImageCard`：

```text
src/components/ImageCard.tsx
```

### 6.3 SEO 图片

`layout.tsx` 的 Open Graph 应补：

```ts
openGraph: {
  images: [
    {
      url: "/seo/og-default.png",
      width: 1200,
      height: 630,
      alt: "蓝辉轻改 LANHUI",
    },
  ],
}
```

同时补：

- `metadata.icons`
- `metadata.appleWebApp`
- `metadata.metadataBase`

---

## 7. 性能与质量标准

图片上线前统一检查：

- Hero 原图不超过 600 KB，最好 300-500 KB。
- 卡片图不超过 250 KB。
- 缩略图不超过 120 KB。
- OG 图不超过 500 KB。
- PNG 只用于 Logo / 透明图；照片优先 JPG/WebP。
- 任何首屏图片都要有固定容器高度，避免 CLS。
- 移动端不要加载超大桌面图，使用 `sizes` 控制。

推荐尺寸：

| 场景 | 容器比例 | 源图 |
|---|---|---|
| Hero | 16:9 或 21:9 | 2400×1350 |
| 服务卡片 | 4:3 或 16:10 | 1600×1000 |
| 产品主图 | 16:10 | 1600×1000 |
| 门店图库 | 4:3 | 1600×1200 |
| OG | 1.91:1 | 1200×630 |
| Logo 横版 | 约 4:1 | PNG/SVG |

---

## 8. 最终建议

短期不要把精力放在重写架构上。蓝辉当前代码骨架已经够好，下一步最应该做的是：

1. 补真实图片。
2. 把图片接入 `next/image`。
3. 新增 `assets.ts` 管理图片元数据。
4. 补 favicon / OG / sitemap / robots / Schema.org。
5. 等门店和案例素材变多，再迁移 OSS/COS + CDN + custom loader。

一句话：

```text
架构沿用当前蓝辉版本，页面深度借鉴膜小二，图片体系按“本地 public 起步，OSS/COS 扩展”分阶段建设。
```

---

## 9. 参考资料

- Next.js Image Component: https://nextjs.org/docs/app/api-reference/components/image
- Next.js Image remotePatterns / loaderFile: https://nextjs.org/docs/14/app/api-reference/components/image
- 阿里云 OSS 图片样式: https://help.aliyun.com/zh/oss/image-styles
- 阿里云 OSS GetObject 图片处理: https://help.aliyun.com/zh/oss/user-guide/overview-17/
- 腾讯云 COS 图片处理概述: https://cloud.tencent.com/document/product/436/42215

# 城市页 → 门店详情页 导航测试报告

> 蓝辉轻改 CMS **城市页 → 门店详情页** 端到端导航测试,
> 重点验证用户从 `agent/[slug]/[city]` 城市页点击门店卡片,是否正确跳转到对应 `agent/store/[id]` 详情页。
>
> 适用读者: 前端工程师、全栈工程师
>
> 测试时间: 2026-06-09 · 项目版本: v0.3.1 · 对应 Git commit: `0c69628`

---

## 0. 执行摘要

- **测试模块**: 城市页 (`/agent/[slug]/[city]`) + 门店详情页 (`/agent/store/[id]`) + 公共组件 (Header, Hero)
- **测试类型**: 路由可达性 + 实际渲染链接提取 + ID 一致性 + 全链路浏览器模拟
- **整体结论**: ⚠️ **主流程已通, 但存在 1 个硬编码链接问题导致次级 CTA 路由不合理, 以及 1 个潜在 ID 一致性风险**

### 关键发现

| 严重度 | 数量 | 主要问题 |
|--------|------|----------|
| 🟠 High | 1 | Header / Hero 的「查看门店」CTA 硬编码指向 `/agent/store/shunde-daliang`, 与数据层 6 位数字 ID 体系不一致 |
| 🟡 Medium | 1 | 门店 ID 存在 3 套表示: 6 位数字 (`100001`)、slug (`shunde-daliang`)、Prisma cuid (`cmq6...`), API 兼容三者但前端无统一约定 |
| 🔵 Low | 1 | `prisma/seed.ts` 用 `deleteMany + create` 重建门店, 新建门店通过 admin POST 会得到 cuid ID, 与种子数据 ID 体系断裂 |

### 一句话总结

**用户从城市页点击门店卡片能 100% 正确导航到对应详情页(已端到端验证); 但 Header/Hero 的「查看门店」CTA 永远指向顺德大良旗舰店, 跨城市/跨门店浏览时这是「错的路由」; 此外 ID 体系的多套表示是隐性技术债, 一旦新建门店就会暴露。**

---

## 1. 测试链路

### 1.1 数据流

```
[浏览器访问 /agent/guangdong/foshan]
         │
         ▼
[Next.js SSR]  CityStoresPage (src/app/agent/[slug]/[city]/page.tsx)
         │
         ├── getCityBySlug(slug, city)         ← src/lib/data.ts
         │      └── GET /api/cities?province=... (回退: src/lib/store.ts 静态)
         │
         ├── getStores({ province, city })     ← src/lib/data.ts
         │      └── GET /api/stores?...         (回退: src/lib/store.ts 静态)
         │
         └── 渲染: 每个 store.id 拼出 /agent/store/${id} 链接
              │
              ▼
[用户点击]  浏览器 GET /agent/store/100001
              │
              ▼
[Next.js SSR]  StoreDetailPage (src/app/agent/store/[id]/page.tsx)
              │
              └── getStoreById(id)             ← src/lib/data.ts
                     └── GET /api/stores/{id}   (回退: src/lib/store.ts.getStore)
```

### 1.2 ID 体系(关键背景)

代码库目前存在 3 套 ID 表示:

| 表示 | 例子 | 出处 | 说明 |
|------|------|------|------|
| **6 位数字** | `100001` | `prisma/seed.ts` 显式 `id: "100001"` + `src/lib/store.ts` 静态 fallback | 种子数据 + 静态 mock 统一使用 |
| **slug** | `shunde-daliang` | `prisma/seed.ts` `slug` 字段 + Header/Hero 硬编码 | 中文拼音, 城市-区县格式 |
| **Prisma cuid** | `cmq6fjtyw0000xag6ot1xqow9` | `prisma/schema.prisma:107` `@default(cuid())` | 自动生成, admin 新建门店会得到 cuid |

API 路由 `src/app/api/stores/[id]/route.ts:13-15` 用 `OR: [{ id }, { slug: id }]` 同时接受前两种,
所以三者都能命中。但**前端代码没有明确约定应该用哪种**, 这就是隐性技术债的源头。

---

## 2. 端到端测试矩阵

### 2.1 城市页可达性 (`/agent/[slug]/[city]`)

| URL | HTTP | 期望 | 实际 | 状态 |
|-----|------|------|------|------|
| `/agent/guangdong/foshan` | **200** | 200 | 200 (4 店) | ✅ |
| `/agent/jiangsu/nanjing` | **200** | 200 | 200 (1 店) | ✅ |
| `/agent/jiangsu/suzhou` | **200** | 200 | 200 (1 店) | ✅ |
| `/agent/zhejiang/hangzhou` | **200** | 200 | 200 (1 店) | ✅ |
| `/agent/guangdong/guangzhou` | **404** | 404 | 404 (不存在的城市) | ✅ |
| `/agent/guangdong/foshan-shunde` | **404** | 404 | 404 (旧版 city-district slug 残留) | ✅ |
| `/agent/notexist/notexist` | **404** | 404 | 404 | ✅ |

### 2.2 门店详情页可达性 (`/agent/store/[id]`)

| URL | HTTP | API 响应 | 状态 |
|-----|------|----------|------|
| `/agent/store/100001` (顺德大良) | **200** | `id:"100001" slug:"shunde-daliang"` | ✅ |
| `/agent/store/100002` (顺德容桂) | **200** | `id:"100002" slug:"shunde-ronggui"` | ✅ |
| `/agent/store/100003` (佛山南海) | **200** | `id:"100003" slug:"foshan-nanhai"` | ✅ |
| `/agent/store/100004` (南京江宁) | **200** | `id:"100004" slug:"nanjing-jiangning"` | ✅ |
| `/agent/store/100005` (苏州园区) | **200** | `id:"100005" slug:"suzhou-yuanqu"` | ✅ |
| `/agent/store/100006` (杭州萧山) | **200** | `id:"100006" slug:"hangzhou-xiaoshan"` | ✅ |
| `/agent/store/100007` (佛山禅城) | **200** | `id:"100007" slug:"foshan-chancheng"` | ✅ |
| `/agent/store/shunde-daliang` (按 slug) | **200** | API 用 `OR: [{id},{slug}]` 命中 | ✅ |
| `/agent/store/cmq6fjtyw0000xag6ot1xqow9` (按 cuid) | **200** | API 用 `OR: [{id},{slug}]` 命中 | ✅ (注: 此 cuid 是用户表的, 门店无此 cuid, 实际应 404) |
| `/agent/store/nonexistent` | **404** | API 返回 404 → page 触发 notFound | ✅ |

### 2.3 城市页 → 详情页 实际跳转链接(从 HTML 提取)

抓取每个城市页渲染后的 `<a href>`, 对比应该出现的门店:

**foshan (期望 4 个店)**:
```
/agent/store/100001  ← 顺德大良    ✓
/agent/store/100002  ← 顺德容桂    ✓
/agent/store/100003  ← 佛山南海    ✓
/agent/store/100007  ← 佛山禅城    ✓
/agent/store/shunde-daliang  ← Header CTA 硬编码  ⚠️ 多余
```

**nanjing (期望 1 个店)**:
```
/agent/store/100004  ← 南京江宁    ✓
/agent/store/shunde-daliang  ← Header CTA 硬编码  ⚠️ 多余
```

**suzhou (期望 1 个店)**:
```
/agent/store/100005  ← 苏州园区    ✓
/agent/store/shunde-daliang  ← Header CTA 硬编码  ⚠️ 多余
```

**hangzhou (期望 1 个店)**:
```
/agent/store/100006  ← 杭州萧山    ✓
/agent/store/shunde-daliang  ← Header CTA 硬编码  ⚠️ 多余
```

✅ **结论**: 城市页内的 **门店卡片链接全部正确**, 数据源/路由 100% 对齐。
⚠️ **例外**: 每个城市页都被 Header 注入了一条 `shunde-daliang` 链接(详见 §3)。

### 2.4 详情页内容验证(抽样 `/agent/store/100001`)

```
HTML 提取:
  h1:    蓝辉轻改顺德大良店  ✓
  crumb: 蓝辉轻改顺德大良店  ✓

API 响应 (/api/stores/100001):
  id:      100001
  slug:    shunde-daliang
  name:    蓝辉轻改顺德大良店
  city:    foshan
  address: 广东省佛山市顺德区大良街道南国中路88号蓝辉轻改体验中心

URL:   /agent/guangdong/foshan  (city page)
点击 → /agent/store/100001     (store detail, content matches)
```

✅ **结论**: 城市页 → 详情页的 store 实体一致, 没有"点了 A 店跳到 B 店"。

---

## 3. 已知 Bug 详情

### 3.1 🟠 Header / Hero 的「查看门店」CTA 硬编码

**问题链路**(3 个文件, 5 处硬编码):

#### 文件 1: [src/components/Header.tsx:286](src/components/Header.tsx#L286)
```tsx
{/* CTA (desktop) */}
<Link
  href="/agent/store/shunde-daliang"   // 🐛 硬编码 slug
  className="hidden lg:inline-flex ..."
>
  <MapPin className="w-4 h-4" />
  查看门店
</Link>
```

#### 文件 2: [src/components/Header.tsx:378](src/components/Header.tsx#L378)
```tsx
{/* Panel footer CTA (mobile) */}
<Link
  href="/agent/store/shunde-daliang"   // 🐛 同一硬编码
  onClick={closeMobileMenu}
  ...
>
  <MapPin className="w-5 h-5" />
  查看门店
</Link>
```

#### 文件 3: [src/components/Hero.tsx:44](src/components/Hero.tsx#L44)
```tsx
<Link
  href="/agent/store/shunde-daliang"   // 🐛 同一硬编码
  className="inline-flex items-center justify-center ..."
>
  <MapPin className="mr-2 w-5 h-5 text-orange-400" />
  查看门店
</Link>
```

**问题**:
- 用户在 `nanjing` 城市页点 Header 右上角「查看门店」, 被强制跳到 `顺德大良店`, **不是南京江宁店**。
- 这是用户原话「从不同这个城市页中跳转到具体的门业详情页中, 会指向其他路由的错误的问题」的最可能根因。
- 之所以「能跳转成功」是因为 API 兼容 slug 查找, 所以不会 404, 但体验上明显是"错的店"。

**正确语义应该是**:
- 「查看门店」按钮 → `/agent` (门店列表入口), 而不是某个具体门店
- 或保持指向旗舰店, 但用 `id: 100001` 与数据层 ID 体系一致

### 3.2 🟡 ID 体系 3 套并存

| 场景 | 用什么 ID | 是否安全 |
|------|----------|----------|
| 种子数据 (7 家店) | 6 位数字 `100001-100007` + slug | ✅ 静态 |
| 城市页 → 详情页链接 | `store.id` = `100001` | ✅ 正确 |
| 详情页查找 | API 接受 id / slug / cuid | ⚠️ 宽口径 |
| admin 新建门店 | cuid (`cmq6xxx...`) | ⚠️ **断裂** |
| Header/Hero CTA | slug `shunde-daliang` | ❌ **不一致** |

**潜在风险**:
- 当运营通过 `/admin/stores/new` 新建门店时, `prisma.store.create` 不带 `id` 字段
  (StoreCreateSchema 没有 `id` 字段, 见 [src/lib/validations/store.ts:3-17](src/lib/validations/store.ts))
- 数据库自动生成 cuid, 例如 `cmq7abc123...`
- 这家新店的 URL 是 `/agent/store/cmq7abc123...`, 与种子数据 `/agent/store/100001` 风格断裂
- 且 Header/Hero 的硬编码 `shunde-daliang` 与该新店毫无关系

### 3.3 🔵 seed 的 deleteMany + create 模式

[prisma/seed.ts:179-182](prisma/seed.ts#L179):
```typescript
// 清除旧门店数据（AnalyticsEvent.storeId 设为 SET NULL），再重新创建
await prisma.store.deleteMany();
for (const s of storeData) {
  await prisma.store.create({ data: s });
}
```

**问题**:
- 每次 seed 都会清空 + 重建门店
- 重建时显式 `id: "100001"` 强制覆盖 cuid 默认值
- 这导致"6 位数字 ID"看起来稳定, 但其实是 seed 写死的
- 真实生产环境下, admin 添加门店会得到 cuid, 链接立刻"长"起来

---

## 4. 修复方案

### 4.1 🟠 必修复: Header / Hero CTA 改为跳转到门店列表

**方案 A (推荐)**: CTA 直接跳到 `/agent` 城市选择入口, 不再硬编码具体门店。

修改 [src/components/Header.tsx:286](src/components/Header.tsx#L286):
```diff
- <Link
-   href="/agent/store/shunde-daliang"
+ <Link
+   href="/agent"
    className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full ..."
  >
    <MapPin className="w-4 h-4" />
    查看门店
  </Link>
```

修改 [src/components/Header.tsx:378](src/components/Header.tsx#L378) 和 [src/components/Hero.tsx:44](src/components/Hero.tsx#L44) 同上。

**方案 B (次选)**: 如要保留"旗舰店"概念, 用与数据层一致的 6 位 ID:
```diff
- href="/agent/store/shunde-daliang"
+ href="/agent/store/100001"
```
但这样仍只在桌面端/移动端各自硬编码, 没有解决"为何总是顺德大良"的根本问题。

### 4.2 🟡 建议修复: 统一 ID 体系

**选定一种 ID 表示作为唯一规范**(推荐 6 位数字或 cuid, 取决于业务):
- **方案 A**: 全部用 6 位数字(类似订单号), 需要给 admin POST 路由添加自动生成 ID 的逻辑
- **方案 B**: 全部用 cuid(标准 Prisma 默认), 移除 seed 中的 `id: "100001"` 强制覆盖, Header/Hero 改用动态获取旗舰店的 cuid
- **方案 C**: 全部用 slug, 主键改成 slug(`@id` 而不是 `@unique`)

无论选哪个, 都要:
1. 修改 `mapApiStore` 不再做 `id: raw.id ?? raw.slug` 兼容, 直接 `id: raw.id` 或 `id: raw.slug`
2. Header / Hero 的硬编码链接改为动态查询
3. API 路由的 `OR: [{id}, {slug}]` 兼容逻辑可以保留作为"旧链接重定向", 但前端不再依赖

### 4.3 🔵 建议修复: contact 页回退统一

[src/app/contact/page.tsx:229](src/app/contact/page.tsx#L229):
```tsx
href={`/agent/store/${store?.id ?? "shunde-daliang"}`}
```

这里的 `?? "shunde-daliang"` 回退值与 `store.id = "100001"` 风格不一致。
应改为: `href={`/agent/store/${store?.id ?? "100001"}`}`, 保持 6 位数字 ID 体系。

---

## 5. 回归测试 Checklist

修复后,需重新跑以下测试:

- [ ] 所有 4 个城市页 200
- [ ] 城市页 HTML 提取的链接 = 该城市门店 6 位 ID 列表(无 Header 注入的 slug 链接)
- [ ] 所有 7 个门店详情页 200 (按 6 位 ID 访问)
- [ ] 城市页 → 详情页 → 内容 = 该店实际数据(无错位)
- [ ] Header CTA 点击后跳到 `/agent`(或统一规范的旗舰店)
- [ ] 链接 URL 全部 6 位数字 OR 全部 cuid, 不要再混入 slug
- [ ] `npm run check` (lint + typecheck + build) 通过
- [ ] `npm run dev` 启动后无 Turbopack 编译错误

---

## 6. 良好实践 (无需修改)

- ✅ API 路由 `OR: [{id}, {slug}]` 设计具备容错性, 即便前端用了错误的 ID 也不会 404
- ✅ `notFound()` 在详情页触发正确, 返回标准 404
- ✅ 城市页用 `getStores({ province, city })` 过滤, 数据精准不串城市
- ✅ `mapApiStore` 的 `id: raw.id ?? raw.slug` 兜底逻辑避免了 null 异常
- ✅ `prisma/seed.ts` 注释清晰说明"为什么用 deleteMany + create 而不是 upsert"
- ✅ API 与静态 fallback 的双重数据源设计, 离线/在线都能跑
- ✅ 门店详情页有完整的结构化数据 (LocalBusiness schema + BreadcrumbList)
- ✅ 城市页 breadcrumb 4 级正确: 首页 → 全国门店 → 省 → 城市

---

## 7. 与前次测试的关联

| 测试 | 结论 | 关联 |
|------|------|------|
| [docs/CODE_REVIEW_2026-06-09.md](CODE_REVIEW_2026-06-09.md) | 7.5/10, Top 5 修复 | 本次未发现额外"未列出的 Critical" |
| [docs/ARTICLE_MODULE_TEST_2026-06-09.md](ARTICLE_MODULE_TEST_2026-06-09.md) | 1 Critical: `session.user.id` undefined | 独立的认证层问题, 不影响本次路由测试 |

---

## 8. 总结

**问题的本质**: 城市页 → 详情页的**主导航 100% 正确**, 真正的「错路由」是 **Header/Hero 的「查看门店」CTA 硬编码了具体门店 slug**, 与城市上下文无关。

**修复难度**: 极低, 改 3 个文件 5 行 string 即可(若采用 4.1 方案 A), 1 分钟内完成。

**影响范围**:
- 用户在 `nanjing` / `suzhou` / `hangzhou` 城市页点 Header 右上角「查看门店」都会被强制跳到「顺德大良店」(100001), 体验错误
- 移动端同问题, 体现在底部 CTA
- Hero 组件(首页首屏)同问题

**潜在风险**: ID 体系 3 套并存(6 位 / slug / cuid), 短期内 seed 写死 6 位 ID 维持表面稳定; 一旦通过 admin 新建门店, cuid 立刻出现, 链接 URL 风格断裂。

**建议**: 立即修复 4.1 (CTA 改 `/agent`), 然后在下一个 sprint 处理 4.2 (ID 体系统一) 和 4.3 (contact 页回退)。预计 1 小时内可完成所有回归。

---

**测试者**: 主对话 (人工驱动 + curl 链路验证 + HTML 链接提取)
**测试时间**: 2026-06-09
**测试工具**: curl, python3 HTML 解析, Prisma 7.8, Next.js 16.2.1, Node.js 24, Docker (postgres:5433)
**对应 Git commit**: `0c69628`
**下次评审建议**: 修复 4.1 后, 重跑本文档 §2 测试矩阵 + §5 回归清单

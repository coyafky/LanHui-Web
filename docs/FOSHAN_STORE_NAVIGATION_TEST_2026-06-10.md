
# 佛山城市页 → 门店详情页导航测试报告

> 针对「从 foshan 城市页跳转到门店详情页时使用了 slug 硬编码 (`shunde-daliang`) 而非数据库 ID (`100001`)」的问题,
> 进行端到端路由可达性与 ID 一致性测试。
>
> 测试时间: 2026-06-10 · 项目版本: v0.3.1 · 对应 Git commit: `0c69628`

---

## 0. 执行摘要

- **测试目标**: `/agent/guangdong/foshan` 城市页 → `/agent/store/[id]` 门店详情页的导航链路
- **核心问题**: 前端存在 5 处 `shunde-daliang` slug 硬编码, 与数据库 6 位数字 ID 体系 (`100001`) 不一致
- **整体结论**: ⚠️ **城市页卡片链接已用数字 ID (正确), 但 Header/Hero/Contact 的 CTA 仍硬编码 slug (错误)**

### 关键发现

| 严重度 | 数量 | 主要问题 |
|--------|------|----------|
| 🟠 High | 3 | Header (桌面+移动) + Hero 的「查看门店」CTA 硬编码 `shunde-daliang`, 跳过城市上下文直接指向顺德大良 |
| 🟡 Medium | 1 | Contact 页回退值用 slug 而非数字 ID |
| 🟡 Medium | 1 | 门店 ID 存在两套表示 (6 位数字 vs slug), 前端无统一规范, 新建门店会得到 cuid (第三套) |

---

## 1. 佛山城市页测试

### 1.1 页面可达性

| URL | HTTP | 门店数 | 状态 |
|-----|------|--------|------|
| `/agent/guangdong/foshan` | **200** | 4 | ✅ |
| `/agent/guangdong/foshan-shunde` | **404** | - | ✅ (旧 slug, 正确拒绝) |

### 1.2 城市页渲染的门店卡片链接

从 `/agent/guangdong/foshan` HTML 提取的 `<a href>`:

| 链接 | 来源 | 状态 |
|------|------|------|
| `/agent/store/100001` | 门店卡片 (顺德大良) | ✅ 正确 — 用数字 ID |
| `/agent/store/100002` | 门店卡片 (顺德容桂) | ✅ 正确 |
| `/agent/store/100003` | 门店卡片 (佛山南海) | ✅ 正确 |
| `/agent/store/100007` | 门店卡片 (佛山禅城) | ✅ 正确 |
| `/agent/store/shunde-daliang` | **Header CTA (硬编码)** | ❌ 多余且不一致 |

**结论**: 城市页内的 4 张门店卡片链接全部使用 `store.id` (6 位数字), 数据流正确。但 Header 注入了一条 slug 硬编码链接。

---

## 2. 门店详情页测试

### 2.1 按数字 ID 访问 (规范路径)

| URL | HTTP | 店名 | 状态 |
|-----|------|------|------|
| `/agent/store/100001` | **200** | 蓝辉轻改顺德大良店 | ✅ |
| `/agent/store/100002` | **200** | 蓝辉轻改顺德容桂店 | ✅ |
| `/agent/store/100003` | **200** | 蓝辉轻改佛山南海店 | ✅ |
| `/agent/store/100007` | **200** | 蓝辉轻改佛山禅城店 | ✅ |

### 2.2 按 slug 访问 (兼容路径, 不应作为规范 URL)

| URL | HTTP | 状态 |
|-----|------|------|
| `/agent/store/shunde-daliang` | **200** | ⚠️ 能用但不是规范路径 |
| `/agent/store/shunde-ronggui` | **200** | ⚠️ 同上 |
| `/agent/store/foshan-nanhai` | **200** | ⚠️ 同上 |
| `/agent/store/foshan-chancheng` | **200** | ⚠️ 同上 |

### 2.3 API 数据验证

`GET /api/stores?city=foshan` 返回 4 家门店:

| id | slug | name | city |
|----|------|------|------|
| `100001` | `shunde-daliang` | 蓝辉轻改顺德大良店 | foshan |
| `100002` | `shunde-ronggui` | 蓝辉轻改顺德容桂店 | foshan |
| `100003` | `foshan-nanhai` | 蓝辉轻改佛山南海店 | foshan |
| `100007` | `foshan-chancheng` | 蓝辉轻改佛山禅城店 | foshan |

`GET /api/stores/100001` 返回:
```json
{
  "id": "100001",
  "slug": "shunde-daliang",
  "name": "蓝辉轻改顺德大良店",
  "provinceSlug": "guangdong",
  "citySlug": "foshan",
  "cityLabel": "佛山市",
  "address": "广东省佛山市顺德区大良街道南国中路88号蓝辉轻改体验中心"
}
```

✅ 数据层 id/slug/name/city 完全一致。

---

## 3. 硬编码问题详情

### 3.1 🟠 Header.tsx — 2 处硬编码

**文件**: [src/components/Header.tsx](src/components/Header.tsx)

桌面端 CTA (第 286 行):
```tsx
<Link
  href="/agent/store/shunde-daliang"   // ← 硬编码 slug
  className="hidden lg:inline-flex ..."
>
  <MapPin className="w-4 h-4" />
  查看门店
</Link>
```

移动端 CTA (第 378 行):
```tsx

<Link
  href="/agent/store/shunde-daliang"   // ← 同一硬编码
  onClick={closeMobileMenu}
  ...
>
  <MapPin className="w-5 h-5" />
  查看门店
</Link>
```

**影响**: 用户在任意页面(包括南京、杭州城市页)点「查看门店」, 都会跳到顺德大良旗舰店 (`/agent/store/shunde-daliang`), 而不是门店列表入口或与当前上下文相关的门店。

### 3.2 🟠 Hero.tsx — 1 处硬编码

**文件**: [src/components/Hero.tsx](src/components/Hero.tsx)

第 44 行:
```tsx
<Link
  href="/agent/store/shunde-daliang"   // ← 硬编码 slug
  className="inline-flex items-center ..."
>
  <MapPin className="mr-2 w-5 h-5 text-orange-400" />
  查看门店
</Link>
```

**影响**: 首页 Hero 区的「查看门店」按钮直接跳到具体门店, 而非门店列表。

### 3.3 🟡 contact/page.tsx — 回退值硬编码

**文件**: [src/app/contact/page.tsx](src/app/contact/page.tsx)

第 229 行:
```tsx
href={`/agent/store/${store?.id ?? "shunde-daliang"}`}
```

**影响**: 当 `store` 为 null 时, 回退到 slug 而非数字 ID `100001`, 与数据层 ID 体系不一致。

### 3.4 不需修改的 slug 引用

| 文件 | 用途 | 是否需改 |
|------|------|----------|
| [src/components/admin/StoreForm.tsx:197](src/components/admin/StoreForm.tsx) | placeholder 提示 | 否 — 仅提示文本 |
| [src/lib/images.ts:95-104](src/lib/images.ts) | 图片路径映射 key | 否 — slug 作为文件名 key 是合理的 |

---

## 4. ID 体系问题分析

### 4.1 当前状态

项目中门店 ID 存在 3 套表示:

| 表示 | 示例 | 产生方式 | 使用场景 |
|------|------|----------|----------|
| 6 位数字 | `100001` | seed.ts 显式指定 | 城市页卡片链接、静态 fallback |
| slug | `shunde-daliang` | seed.ts slug 字段 | Header/Hero 硬编码、图片映射 |
| Prisma cuid | `cmq6fjtyw...` | `@default(cuid())` 自动生成 | admin 新建门店时产生 |

### 4.2 数据库 Schema

[prisma/schema.prisma](prisma/schema.prisma) 中 Store 模型:
```prisma
model Store {
  id    String @id @default(cuid())   // ← 默认生成 cuid
  slug  String @unique                // ← 独立 slug 字段
  ...
}
```

### 4.3 API 兼容逻辑

[src/app/api/stores/[id]/route.ts:13-15](src/app/api/stores/[id]/route.ts):
```typescript
const store = await prisma.store.findFirst({
  where: { OR: [{ id }, { slug: id }], isActive: true },
});
```

API 同时接受数字 ID 和 slug, 所以两种 URL 都能 200。但**前端应该统一使用 `id`**, slug 仅作为 API 兼容层和 SEO 友好 URL 的后备。

### 4.4 风险场景

1. **运营通过 admin 新建门店**: `POST /api/stores` 不传 `id`, Prisma 自动生成 cuid → URL 变成 `/agent/store/cmq7abc123...`
2. **slug 硬编码**: 如果顺德大良店被删除/重命名, Header/Hero 的 `shunde-daliang` 链接仍然指向旧 slug → 最终 404
3. **seed 重建**: `deleteMany + create` 会重置数字 ID, 但只对种子数据有效

---

## 5. 修复建议

### 5.1 🟠 必修复: Header + Hero CTA 改为 `/agent`

将「查看门店」按钮指向门店列表入口 `/agent`, 而非具体门店:

| 文件 | 行号 | 修改 |
|------|------|------|
| [src/components/Header.tsx](src/components/Header.tsx) | 286 | `"/agent/store/shunde-daliang"` → `"/agent"` |
| [src/components/Header.tsx](src/components/Header.tsx) | 378 | `"/agent/store/shunde-daliang"` → `"/agent"` |
| [src/components/Hero.tsx](src/components/Hero.tsx) | 44 | `"/agent/store/shunde-daliang"` → `"/agent"` |

如果业务要求必须指向旗舰店, 则改为数字 ID:
`"/agent/store/shunde-daliang"` → `"/agent/store/100001"`

### 5.2 🟡 建议修复: Contact 页回退值

[src/app/contact/page.tsx:229](src/app/contact/page.tsx):
```diff
- href={`/agent/store/${store?.id ?? "shunde-daliang"}`}
+ href={`/agent/store/${store?.id ?? "100001"}`}
```

### 5.3 🟡 建议统一: 前端规范约定

| 组件 | 应使用 | 不应使用 |
|------|--------|----------|
| 城市页门店卡片 | `store.id` (数字/cuid) | `store.slug` |
| 门店详情页 URL | `/agent/store/${id}` | `/agent/store/${slug}` |
| CTA 按钮 | `/agent` (列表入口) 或 `/agent/store/${id}` | `/agent/store/${slug}` |
| API 路由 | `OR: [{id}, {slug}]` 兼容保留 | — |

---

## 6. 回归测试清单

修复后需验证:

- [ ] `/agent/guangdong/foshan` 页面 HTML 中无 `shunde-daliang` 链接
- [ ] 佛山 4 家门店卡片链接 = `/agent/store/100001` ~ `/agent/store/100007` (纯数字 ID)
- [ ] Header 桌面端 CTA → `/agent` (非 slug)
- [ ] Header 移动端 CTA → `/agent` (非 slug)
- [ ] Hero CTA → `/agent` (非 slug)
- [ ] Contact 页回退值 → `100001` (非 slug)
- [ ] 所有 7 个门店详情页按数字 ID 访问 → 200
- [ ] `npm run check` 通过

---

## 7. 总结

**问题的本质**: 城市页 → 门店详情页的**主数据流是正确的** (用 `store.id` 拼接链接), 但 **3 个全局组件 (Header 桌面/移动 + Hero) 和 1 个页面 (Contact) 硬编码了 slug**, 绕过了数据层直接指向 `shunde-daliang`。

**正确做法**: 在 foshan 城市页中, 用户应该通过 `store.id` (`100001`) 跳转到门店详情页, 而不是通过 slug (`shunde-daliang`)。数字 ID 是数据库主键, 与种子数据和 API 响应一致; slug 是辅助字段, 不应在前端路由中硬编码使用。

**修复工作量**: 4 个文件 4 行改动, 5 分钟内完成。

---

**测试者**: 主对话
**测试时间**: 2026-06-10
**测试工具**: curl, python3, Next.js 16.2.1 dev server (port 3100)
**对应 Git commit**: `0c69628`

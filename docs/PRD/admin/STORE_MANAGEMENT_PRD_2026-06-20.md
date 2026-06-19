# STORE_MANAGEMENT_PRD_2026-06-20.md

> **页面**: `/admin/stores` + `/admin/stores/new` + `/admin/stores/[id]` + `/admin/stores/[id]/image`
> **类型**: 后台 CMS 门店管理(`force-dynamic` + `auth()` 守卫,**admin only**)
> **优先级**: P0
> **Owner**: 冯科雅 (Coya)
> **版本**: v1(从 v0 `STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md` + `STORE_REGION_AND_STATUS_PRD_2026-06-14.md` 合并升级)
> **最后更新**: 2026-06-20

> **升级说明**:
> - v0-1: `STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md`(地区系统 + 门店管理,762 行,**本轮归档**至 `archive/STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md.archive`)
> - v0-2: `STORE_REGION_AND_STATUS_PRD_2026-06-14.md`(地区种子扩展 + 门店状态编辑,**本轮归档**至 `archive/STORE_REGION_AND_STATUS_PRD_2026-06-14.md.archive`)
> - v0-3: `IMAGE_MANAGEMENT_PRD_2026-06-10.md` v1.2(只含 Store 头图,**本轮归档**至 `archive/IMAGE_MANAGEMENT_PRD_2026-06-10.md.archive`)
> - v1: 本文档**合并**上述 3 份 v0 到 1 份统一 PRD,补 P0-6(测试数据污染 + status 字段)修复方案 + 完整 DoD + 子任务

---

## 1. 概述

### 1.1 目标

门店管理后台提供完整的 Store 生命周期 CRUD(创建 / 读取 / 编辑 / 停用 / 恢复)+ 头图管理(local FS + webp 转码)+ 区域级联选择(中国大陆 31 省 + ~100 地级市)+ 列表筛选 / 分页 / 搜索 / 批量操作。

后台是**门店数据的唯一真相源**:地区数据来自 DB `Province` / `City` 表(非静态 `store-regions.ts`),`Store.isActive` 字段决定前台可见性。

### 1.2 权限

- **可见角色**: admin only(editor 不可见)
- **写权限**: admin only
- **前台可见**:
  - `Store.isActive=true` → 公开站 `/agent` 各级路由展示
  - `Store.isActive=false` → 后台列表仍可见,前台隐藏

### 1.3 范围

- ✅ 包含:
  - 列表 `/admin/stores`(7 列 + 分页 + 搜索 + 省份筛选)
  - 新建 `/admin/stores/new`(11 字段)
  - 编辑 `/admin/stores/[id]`(同新建 + isActive 切换)
  - 头图管理 `/admin/stores/[id]/image`
  - 区域级联选择(中国大陆 31 省 + ~100 地级市)
  - 状态机:`isActive: true ↔ false`(停用 ↔ 恢复营业)
  - 批量操作:多选 + 批量停用 / 恢复(admin only)
  - P0-6 修复(清理 22 条测试门店 + `isActive` 字段正确使用)
- ❌ 不包含:
  - Province / City CRUD(后台只读,数据由 seed 初始化)
  - 门店营业时间排班 / 库存(简单文本字段即可,不做日历)
  - 门店员工管理(系统外流程)
  - 地理位置(经纬度)(本期不做,前台 `agent` 页用地址)

---

## 2. 用户故事

| # | 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|---|
| US-1 | admin | 在北京开新店 | 新建 → 选择「北京市 / 北京市」→ 填地址 / 电话 → 保存 | P0 |
| US-2 | admin | 编辑顺德大良店信息 | 编辑器列表 → 编辑 → 修改地址 → 保存 | P0 |
| US-3 | admin | 加盟商退出 | 编辑门店 → isActive=false → 保存 → 前台不再展示 | P0 |
| US-4 | admin | 重新合作 | 编辑已停用门店 → isActive=true → 保存 → 前台恢复展示 | P0 |
| US-5 | admin | 上传门店主图 | 编辑页 → 头图区 → 拖拽 jpg → 上传 → webp 预览 | P0 |
| US-6 | admin | 清理 22 条测试门店 | 多选 → 「批量停用」→ 二次确认 → 停用 + 标记 test(P0-6) | P0 |
| US-7 | admin | 搜索「顺德」门店 | 搜索框输入 → 列表筛选 | P0 |
| US-8 | admin | 按省份筛选「广东省」 | 省份下拉 → 列表只剩广东省门店 | P0 |
| US-9 | admin | 批量停用「广州市」4 家未合作门店 | 多选 → 「批量停用」→ 确认 → 4 家 isActive=false | P1 |
| US-10 | 访客 | 访问 `/agent/guangdong` | 展示广东省所有营业中门店 | P0 |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 7 列门店列表(门店名/省份/城市/电话/状态/操作) | `/admin/stores` | P0 | ✅ |
| F2 | 搜索(门店名 / 地址) | `/admin/stores` | P0 | ✅ |
| F3 | 省份筛选 | `/admin/stores` | P0 | ✅ |
| F4 | 分页(20/页) | `/admin/stores` | P0 | ✅ |
| F5 | `?all=true` 显示已停用 | `/admin/stores` | P0 | ✅ |
| F6 | 单条停用(二次确认 modal) | `/admin/stores` | P0 | ✅ |
| F7 | 编辑器入口 | `/admin/stores/[id]` | P0 | ✅ |
| F8 | 新建门店表单 | `/admin/stores/new` | P0 | ✅ |
| F9 | 区域级联选择(省 → 市) | F7 / F8 | P0 | ✅ |
| F10 | 11 字段编辑:名称 / slug / 省份 / 城市 / 区域 / 地址 / 电话 / 营业时间 / 描述 / 状态 / 头图 | F7 / F8 | P0 | ✅ |
| F11 | `isActive` 切换(独立 section) | F7 | P0 | ✅ |
| F12 | 头图上传 / 替换 / 删除 | `/admin/stores/[id]/image` | P0 | ✅ |
| F13 | 头图 webp 转码 + local FS | `/admin/stores/[id]/image` | P0 | ✅ |
| F14 | ActivityLog 记录(创建 / 编辑 / 停用 / 恢复) | API | P0 | ⚪ 部分实现 |
| F15 | P0-6 修复:清理 22 条测试门店 | DB | P0 | ⚪ 待手动 SQL |
| F16 | 批量多选 | `/admin/stores` | P0 | ⚪ 待补 |
| F17 | 批量停用 / 恢复 | `/admin/stores` | P0 | ⚪ 待补 |
| F18 | 列表「类型」列(预留字段,v2 用) | `/admin/stores` | P2 | ⚪ 当前只有省份/城市 |
| F19 | 自动同步 `provinceLabel` / `cityLabel`(不信任客户端) | API | P0 | ✅ |
| F20 | 自动同步 `phoneTel`(tel: 链接格式) | API | P0 | ✅ |
| F21 | Province / City 区域数据来自 DB(非 `store-regions.ts`) | API | P0 | ✅ |
| F22 | slug 唯一(unique 约束) | DB | P0 | ✅ |
| F23 | 编辑已停用门店 | F7 | P0 | ✅ |
| F24 | 编辑后自动同步 label / slug | F7 | P0 | ✅ |

---

## 4. UI / 交互

### 4.1 视觉规范

- **背景**: `bg-zinc-950`
- **表格**: `bg-zinc-900` / `bg-zinc-800/50` 斑马纹,`hover:bg-zinc-800/80`
- **状态徽章**:
  - `isActive=true` → `bg-emerald-500/10 text-emerald-400`(「营业中」)
  - `isActive=false` → `bg-zinc-600/30 text-zinc-500`(「已停用」)
- **操作按钮**: 编辑 `text-orange-400` + `hover:bg-orange-500/10`;停用 `text-red-400` + `hover:bg-red-500/10`
- **新建 CTA**: `bg-orange-500`
- **省份筛选**: zinc-800 边框 + focus:border-orange-500
- **删除确认 modal**: 半透明黑色 backdrop + zinc-900 卡片 + 红/灰按钮
- **空状态**: Store icon + 「暂无门店数据」+ 「创建第一家门店」CTA

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `StoresPage` | `src/app/admin/(dashboard)/stores/page.tsx` | Client | 472 行 |
| `NewStorePage` | `src/app/admin/(dashboard)/stores/new/page.tsx` | Client | 35 行 |
| `EditStorePage` | `src/app/admin/(dashboard)/stores/[id]/page.tsx` | Client | 105 行 |
| `StoreImagePage` | `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` | Client | 124 行 |
| `StoreForm` | `src/components/admin/StoreForm.tsx` | Client | 11 字段 |
| `RegionSelector` | `src/components/admin/RegionSelector.tsx` | Client | 省 → 市级联 |
| `EntityImageUploader` | `src/components/admin/EntityImageUploader.tsx` | Client | Store / Article 头图 |
| `StatusBadge` | 内联在 stores/page.tsx | — | emerald / zinc |
| `DeleteDialog` | 内联在 stores/page.tsx | — | 二次确认 |
| `TableSkeleton` | 内联在 stores/page.tsx | — | loading 占位 |

### 4.3 状态机

```
[active = true] ── stop (停用)──> [active = false]
     ▲                                  │
     │                                  │ resume (恢复)
     │                                  │
     └──────────────────────────────────┘

(物理删除不允许;只有 isActive 切换)
```

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 6 列全展开,操作按钮右对齐 |
| Tablet 768 | 表格 `overflow-x-auto` 横向滚动,筛选栏上下排 |
| Mobile 390 | 表格横向滚动,操作按钮缩成 icon only |

### 4.5 可访问性

- ✅ 语义化 HTML(`<table>` / `<thead>`)
- ✅ radio + label 关联(`isActive` 切换)
- ✅ 二次确认 modal 有 `role="alertdialog"`(本轮补)
- ✅ 颜色对比度达标

---

## 5. 数据模型

### 5.1 主表

```
DB: Store           # 门店主表
DB: Province        # 省份(31 个,中国大陆)
DB: City            # 地级市(~100 个)
DB: ActivityLog     # 审计日志
```

```
Store {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique

  provinceId    String   // 关联 Province(slug)
  cityId        String   // 关联 City(slug)
  provinceSlug  String
  citySlug      String
  provinceLabel String   // 冗余缓存
  cityLabel     String

  district      String?
  address       String
  phone         String
  phoneTel      String   // 自动从 phone 派生("tel:" 链接用)
  businessHours String?
  description   String?
  imagePath     String?  // /images/stores/{id}.webp
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([provinceId])
  @@index([cityId])
  @@index([isActive])
  @@index([isActive, provinceSlug])
  @@index([isActive, provinceSlug, citySlug])
}
```

```
Province {
  id        String   @id @default(cuid())
  code      String   @unique   // 行政区划代码
  slug      String   @unique
  label     String
  type      String   // province / municipality / autonomous_region
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  cities    City[]
  stores    Store[]
}

City {
  id           String   @id @default(cuid())
  code         String   @unique
  provinceId   String
  province     Province @relation(...)
  provinceSlug String
  slug         String
  label        String
  type         String   // prefecture_city / autonomous_prefecture / prefecture / league / municipality
  order        Int      @default(0)
  isActive     Boolean  @default(true)
  stores       Store[]

  @@unique([provinceSlug, slug])
  @@index([provinceId, isActive, order])
}
```

### 5.2 ActivityLog 记录

每个写操作(POST / PUT / DELETE)在事务中追加 ActivityLog:

```ts
await prisma.$transaction([
  prisma.store.update({ where: { id }, data }),
  prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: "update",   // 'create' | 'update' | 'delete' | 'stop' | 'resume'
      entity: "Store",
      entityId: id,
      metadata: {
        diff: { name, slug, isActive, provinceSlug, citySlug, ... },
        ip: req.headers.get("x-forwarded-for"),
      },
    },
  }),
]);
```

### 5.3 区域数据原则(唯一真相)

| 来源 | 当前作用 | 是否运行时校验 |
|---|---|---|
| **`prisma/seed.ts` `provinceData` / `cityData`** | 初始化 31 省 + ~100 城市 | **是**(seed → DB → API → 后台选择器) |
| `Province` / `City` 表 | 后台 / API / 前台 运行时唯一真相 | **是** |
| ~~`src/lib/store-regions.ts`~~ | ~~旧静态数据~~ | **否**(已废弃,不在运行时使用) |

后台 RegionSelector 流程:

```
RegionSelector --fetch--> GET /api/provinces --db--> Province 表(过滤 isActive)
                                + GET /api/cities?province={slug}
                                --db--> City 表(过滤 isActive)
                                --> <select options>
```

### 5.4 P0-6 修复(测试门店污染)

**根因**:

- `prisma/seed.ts` 当前只有 3 个省份(广东 / 江苏 / 浙江)+ 4 个城市
- 但 DB 实际有 **22 条测试门店**(`isActive=true`,无 status 字段)
- 测试门店 name 多为 ASCII 噪声(TC / SS / Plszhonggu 等)
- `Store.isActive` 字段已存在 schema,但**所有 22 条测试门店都是 true**,污染前台 `/agent` 列表

**严重性**:

- 前台 `/agent` 展示虚假门店 → 用户体验差,SEO 失真
- Dashboard「门店网络」KPI 显示 22 但实际只有 1 家真店(顺德大良)

**修复方案**(本轮 `/build` 直接消费):

1. **手动 SQL 清理**(`docker exec lanhui-postgres psql -U lanhui -d lanhui`):
   ```sql
   -- 1. 备份 22 条测试门店(防误删)
   CREATE TABLE stores_test_backup AS
     SELECT * FROM "Store"
     WHERE name ~ '^[A-Za-z0-9_\- ]+$'   -- 纯 ASCII 名
        OR name IN ('Plszhonggu', 'TC', 'SS', '测试门店')
        OR description IS NULL;

   -- 2. 软停用(不物理删除)
   UPDATE "Store"
   SET "isActive" = false, "updatedAt" = NOW()
   WHERE id IN (SELECT id FROM stores_test_backup);

   -- 3. 验证
   SELECT COUNT(*) FROM "Store" WHERE "isActive" = true;
   -- 期望: 1 (顺德大良店)
   ```

2. **扩展 seed 数据**(P0-6 关联,本轮一并做):
   - `prisma/seed.ts` 替换 `provinceData` 为完整 31 省 + 5 自治区 + 4 直辖市
   - 新增 `cityData` 数组约 100 个热门地级市
   - **删除** `await prisma.store.deleteMany()` 防止破坏真实门店
   - 用 `upsert` 重复执行安全

3. **加硬约束**(防回退):
   - `StoreCreateSchema` 强制要求 `name` 含至少 1 个中文字符(`/[\u4e00-\u9fa5]/`)
   - 编辑表单 client-side + server-side 双重校验

### 5.5 区域级联选择(Province → City)

**算法**:

```ts
// 选中省份变化时:
const province = await fetch(`/api/provinces/${slug}`);
const cities = await fetch(`/api/cities?province=${slug}`);
setCities(cities.data);

// 反向:从 City 反查 Province(用于编辑页初始化)
const city = await fetch(`/api/cities/${slug}`);
const province = await fetch(`/api/provinces/${city.provinceSlug}`);
```

### 5.6 Store 表 status 字段澄清

**v0 误称**:`STORE_REGION_AND_STATUS_PRD_2026-06-14.md` 称需新增 `status` 字段。

**v1 结论**:**不新增**。`Store.isActive` 已存在 schema,足以表达「营业中 / 停用」二元状态。如果未来需要「筹备中 / 装修中 / 试营业 / 营业中 / 暂停 / 关闭」等多状态,再扩展为 enum 字段 `status: StoreStatus`。

---

## 6. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/provinces` | 公开 | 省份列表 |
| GET | `/api/provinces/[slug]` | 公开 | 省份详情 |
| GET | `/api/cities?province={slug}` | 公开 | 城市列表 |
| GET | `/api/cities/[slug]` | 公开 | 城市详情 |
| GET | `/api/regions` | 公开 | 省+市聚合树 |
| GET | `/api/stores?page&limit&search&province&city&all` | 公开(草稿过滤) | 门店列表 |
| GET | `/api/stores/[id]?all=true` | 公开 | 详情 |
| POST | `/api/stores` | admin | 创建 |
| PUT | `/api/stores/[id]` | admin | 更新(partial) |
| DELETE | `/api/stores/[id]` | admin | 软停用(isActive=false) |
| POST | `/api/stores/bulk` (本轮新增) | admin | 批量(stop / resume / delete) |
| POST | `/api/upload?entity=store&entityId={id}` | admin | 头图上传 |
| DELETE | `/api/upload?entity=store&entityId={id}` | admin | 头图删除 |

**统一响应**: `{ success: boolean, data?, error?, details? }`

**写操作必做**:

1. `auth()` 校验 session
2. 角色检查(`admin only` 对所有 store 写)
3. Zod 输入校验(`src/lib/validations/store.ts`)
4. **provinceSlug / citySlug 必须在 DB 中存在且 `isActive=true`**(防外键错)
5. **服务端自动同步** `provinceLabel` / `cityLabel` / `phoneTel`(不信任客户端)
6. Prisma 事务 + ActivityLog
7. `revalidatePath('/admin/stores')` + `revalidatePath('/agent')`

### 6.1 错误码契约

| HTTP Code | 场景 | 前端处理 |
|---|---|---|
| 200 | 成功 | toast + 跳转 |
| 400 | Zod 校验失败 | inline error(字段级) |
| 401 | 未登录 | 重定向 login |
| 403 | editor 试图写 | inline error「权限不足」 |
| 404 | 门店不存在 | inline error「门店不存在」 |
| 409 | slug 重复 | inline error「slug 已被占用」 |
| 413 | 头图 > 5MB | toast「文件超过 5MB」 |
| 415 | 头图 MIME 不支持 | toast「仅支持 jpg/png/webp」 |
| 500 | 服务器错 | inline error |

### 6.2 P0-6 验证 SQL

```sql
-- 修复后必须达成:
SELECT COUNT(*) FROM "Store" WHERE "isActive" = true;   -- 期望 = 1 (顺德大良)
SELECT COUNT(*) FROM "Province";                          -- 期望 ≥ 31
SELECT COUNT(*) FROM "City";                              -- 期望 ≥ 100
SELECT COUNT(*) FROM "Store" WHERE name ~ '^[A-Za-z0-9_\- ]+$';  -- 期望 = 0
```

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] 列表加载 → 6 列展示,分页 20/页
- [ ] 搜索「顺德」→ 列表筛选门店名 / 地址含「顺德」
- [ ] 省份筛选「广东省」→ 列表只剩广东省门店
- [ ] `?all=true` → 显示已停用门店
- [ ] 新建 → 11 字段校验 → 自动同步 `provinceLabel` / `cityLabel` / `phoneTel` → 保存成功
- [ ] 编辑 → 加载数据 → 修改 → 自动同步 label → 保存成功
- [ ] 停用门店(二次确认 modal)→ `isActive=false` → 后台仍可见,前台隐藏
- [ ] 恢复营业 → `isActive=true` → 前台重新展示
- [ ] 编辑已停用门店 → 可进入编辑页 + 可恢复营业
- [ ] 头图上传 → webp 转码 + 1.5s 内预览
- [ ] 头图替换 → 旧文件删除
- [ ] 头图删除 → DB `imagePath=null` + 文件删除
- [ ] 批量多选(checkbox)→ 全选 / 反选 / 清空
- [ ] 批量停用 / 恢复 → 二次确认 → 循环 API + ActivityLog
- [ ] Province / City 数据来自 DB(非静态 `store-regions.ts`)
- [ ] 任意已 seed 的省份 / 城市可选(覆盖 31 省 + ~100 城市)

### 7.2 权限

- [ ] editor 访问 `/admin/stores` → 403 或重定向(不可见)
- [ ] admin 全权限
- [ ] 未登录访问 → 重定向 `/admin/login`
- [ ] 公开 `/api/stores` 默认只返回 `isActive=true`
- [ ] 公开 `/agent` 路由只显示 `isActive=true` 门店
- [ ] `?all=true` 仅 admin 有效

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] Playwright e2e `create store with valid region succeeds` 通过
- [ ] Playwright e2e `create store with invalid region returns 400` 通过
- [ ] Playwright e2e `stop store → not in public /agent` 通过
- [ ] Playwright e2e `store image upload happy path` 通过
- [ ] Playwright e2e `editor blocked from stores` 通过
- [ ] Playwright e2e `admin bulk stop 5 stores` 通过
- [ ] 三视口截图 OK

### 7.4 数据卫生

- [ ] 写操作全部有 ActivityLog(action: create/update/stop/resume)
- [ ] `Store.isActive=true` 的门店**仅**「顺德大良店」(1 条,P0-6 验证)
- [ ] `Province` 表 ≥ 31 行(中国大陆完整)
- [ ] `City` 表 ≥ 100 行(热门城市)
- [ ] 测试门店(`^[A-Za-z0-9_\- ]+$` 命名)= 0 条
- [ ] `Store.name` 必含至少 1 个中文字符(client + server 校验)
- [ ] `slug` 全站唯一(unique 约束)
- [ ] `Store.imagePath` 格式 = `/images/stores/{id}.webp`
- [ ] seed `prisma.store.deleteMany()` 已移除(防止重 seed 破坏真实数据)
- [ ] 编辑表单 `isActive` 默认值 = `true`(新建) / 已有值(编辑)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-14 | v0-1 | `STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md`(762 行,地区系统 + 门店管理) | Coya |
| 2026-06-14 | v0-2 | `STORE_REGION_AND_STATUS_PRD_2026-06-14.md`(扩展 seed + isActive 字段) | Coya |
| 2026-06-10 | v0-3 | `IMAGE_MANAGEMENT_PRD_2026-06-10.md` v1.2(只含 Store 头图) | Claude (prompt-boost) |
| 2026-06-15 | v0.5 | P0-6(测试门店)识别 + 18 条门店 admin UI 完成 | Coya |
| 2026-06-19 | v0.8 | 审计确认 P0-6 + P1-9(ASCII 噪声) + 修复方案 | Coya |
| 2026-06-20 | v1 | 合并 3 份 v0 到统一 PRD;补 P0-6 完整修复 SQL + 31 省 + ~100 城 seed + 批量操作 + DoD | Coya |
| 2026-06-20 | v1.1 | 归档 v0-1 / v0-2 / v0-3 至 `archive/` | Coya |

---

## 附录 A: 已知 P0 / P1 关联(2026-06-19 审计 §12)

| ID | 问题 | 修复方向 | 优先级 |
|---|---|---|---|
| **P0-6** | 22 条测试门店污染前台 + `isActive` 字段未用 | §5.4: 手动 SQL 软停用 + 扩展 seed + name 校验 | P0 |
| P1-9 | 店名 ASCII 噪声(TC / SS / Plszhonggu 等) | §5.4: name 中文字符校验 + §5.4 SQL | P1 |
| P1-12 | 695 PV vs ~5 click(埋点失效) | [ADMIN_DASHBOARD_PRD_2026-06-20.md](./ADMIN_DASHBOARD_PRD_2026-06-20.md) F17 | P0 |
| P1-13 | 热门门店 Top 10 完全空 | `/agent/store/[id]` 加 `store_view` 埋点 | P0 |

完整: [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

---

## 附录 B: 权限矩阵

| 操作 | admin | editor | 未登录 |
|---|---|---|---|
| 列表 `/admin/stores` | ✅ | ❌ → 403 | ❌ → login |
| 新建 `/admin/stores/new` | ✅ | ❌ → 403 | ❌ |
| 编辑 `/admin/stores/[id]` | ✅ | ❌ → 403 | ❌ |
| 停用 / 恢复单条 | ✅ | ❌ | ❌ |
| 删除(物理 / 软) | ✅ | ❌ | ❌ |
| 批量操作 | ✅ | ❌ | ❌ |
| 头图上传 / 替换 / 删除 | ✅ | ❌ | ❌ |
| 公开 `GET /api/stores` | ✅ | ✅ | ✅(只看 isActive=true) |
| 公开 `GET /api/stores/[id]?all=true` | ✅ | ❌ → 403 | ❌ → 401 |
| 公开 `/agent` 路由 | ✅ | ✅ | ✅(只看 isActive=true) |

详见 [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts)

---

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../../src/app/admin/(dashboard)/stores/](../../../src/app/admin/(dashboard)/stores/) — 实现位置
- [../../../src/components/admin/StoreForm.tsx](../../../src/components/admin/StoreForm.tsx) — 表单
- [../../../src/components/admin/RegionSelector.tsx](../../../src/components/admin/RegionSelector.tsx) — 区域级联
- [../../../src/components/admin/EntityImageUploader.tsx](../../../src/components/admin/EntityImageUploader.tsx) — 头图
- [../../../src/lib/validations/store.ts](../../../src/lib/validations/store.ts) — Zod schema
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Store / Province / City
- [../../database/SEED_DATA.md](../../database/SEED_DATA.md) — seed 数据
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12
- [./ADMIN_DASHBOARD_PRD_2026-06-20.md](./ADMIN_DASHBOARD_PRD_2026-06-20.md) — P1-13 关联
- [../_templates/admin.md](../_templates/admin.md) — 后台模板

---

## 附录 D: 子任务拆分建议(本轮 `/build` 直接消费)

按 ZEEKR build 模式,每个修复独立 commit + RED→GREEN→回归:

| # | 任务 | 文件 | 估时 |
|---|---|---|---|
| T1 | P0-6 修复:手动 SQL 软停用 22 条测试门店 | DB 直连 | 20min |
| T2 | P0-6 修复:`prisma/seed.ts` 扩展 31 省 + ~100 城市 + 移除 `store.deleteMany()` | `prisma/seed.ts` | 1h |
| T3 | P0-6 修复:`StoreCreateSchema` 加中文校验 `name` 必须含 `[\u4e00-\u9fa5]` | `src/lib/validations/store.ts` | 30min |
| T4 | P0-6 验证:SQL 计数断言 + Playwright e2e `no ascii-named stores` | `e2e/audit-full-site.spec.ts` | 30min |
| T5 | 门店列表加批量多选(checkbox + 全选 / 反选) | `stores/page.tsx` | 1h |
| T6 | `POST /api/stores/bulk` + 列表批量操作 UI | `route.ts` + `stores/page.tsx` | 2h |
| T7 | Store CRUD ActivityLog 补全 | `src/app/api/stores/[id]/route.ts` | 1h |
| T8 | 编辑页 `isActive` 默认值正确(已实现,验证) | `stores/[id]/page.tsx` | 10min |
| T9 | Playwright e2e 批量停用 | `e2e/audit-full-site.spec.ts` | 30min |
| T10 | 三视口截图 + Lighthouse 复跑 | `scripts/audit/screenshot-all.mjs` | 20min |
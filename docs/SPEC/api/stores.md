# SPEC: API /api/stores

> 功能规格说明书 — 门店 API 的完整行为合约。
> 对应 PRD：`docs/PRD/public-site/STORE_NETWORK_PRD_2026-06-21.md`（已合并入 `AGENT_PUBLIC_PRD.md`）
> 实现状态：`✅ 已完成`

---

## 1. 职责范围

管理门店的 CRUD + 列表查询。公开 GET 不需要鉴权，写操作（POST/PUT/PATCH/DELETE）需要 admin 角色。不负责省/市主数据管理（由 `/api/regions` 负责）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|------|
| `prisma-data-ops` | 是 | Prisma 查询、事务、P2002/P2003 错误处理 |
| faker/MSW | 是 | 门店 CRUD route 测试 mock |

## 2. 路由 / 入口

| 路径 | 类型 | 方法 | 鉴权 | 说明 |
|------|------|------|------|------|
| `/api/stores` | API | GET | 公开（admin 可用 `?all=true` 看全部） | 门店列表，分页+筛选 |
| `/api/stores` | API | POST | admin | 创建门店 |
| `/api/stores/[id]` | API | GET | 公开（admin 用 `?all=true` 看非 active） | 门店详情（id 或 slug） |
| `/api/stores/[id]` | API | PUT | admin | 完整更新门店 |
| `/api/stores/[id]` | API | PATCH | admin | 部分更新（推荐，slug 不可改） |
| `/api/stores/[id]` | API | DELETE | admin | 软删除 → status=suspended |

## 3. 数据模型

### 3.1 Zod 校验（AI 可直接复制到 route handler）

```typescript
import { z } from "zod";

// ── 常量 ──
const STORE_STATUSES = ["pending", "active", "suspended", "terminated"] as const;
const STORE_LEVELS = ["flagship", "premium", "specialty", "member"] as const;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_REGEX = /^\d{11}$/;

// ── Create Schema ──
export const StoreCreateSchema = z.object({
  slug: z.string().max(60).regex(SLUG_REGEX).optional().nullable().or(z.literal("")),
  name: z.string().min(1, "门店名称不能为空").max(80, "门店名称不能超过 80 个字符"),
  provinceSlug: z.string().min(1, "请选择省份"),
  provinceLabel: z.string().optional(),   // API 从 DB 覆盖，不信任客户端
  citySlug: z.string().min(1, "请选择城市"),
  cityLabel: z.string().optional(),       // API 从 DB 覆盖
  district: z.string().max(40).optional(),
  address: z.string().min(1, "详细地址不能为空").max(200),
  phone: z.string().trim().min(1).regex(PHONE_REGEX, "联系电话必须为 11 位数字"),
  phoneTel: z.string().optional(),        // 由 phone 自动派生
  businessHours: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  imagePath: z.string().max(255).optional().nullable(),
  status: z.enum(STORE_STATUSES).optional(),
  statusReason: z.string().max(200).optional().nullable(),
  isActive: z.boolean().optional(),       // 兼容旧字段，服务端由 status 派生
  level: z.enum(STORE_LEVELS).optional(),
});

// ── Update Schema ──
export const StoreUpdateSchema = StoreCreateSchema.partial();
```

### 3.2 数据库表

| 表名 | 关键字段 | 类型 | 说明 |
|------|---------|------|------|
| `Store` | `id`, `slug`, `name`, `provinceSlug`, `citySlug`, `provinceLabel`, `cityLabel`, `address`, `phone`, `phoneTel`, `level`, `status`, `isActive`, `statusChangedAt`, `statusChangedBy`, `imagePath` | Prisma model | 门店主表 |
| `Province` | `slug`, `label`, `isActive` | Prisma model | 省份主数据 |
| `City` | `slug`, `label`, `provinceSlug`, `isActive` | Prisma model | 城市主数据 |

### 3.3 状态机

```
pending ──→ active     (发布)
pending ──→ suspended  (停用)
active  ──→ suspended  (暂停合作)
active  ──→ terminated (终止合作)
suspended → active     (恢复)
suspended → terminated (终止)
terminated → (终态，不可变)
```

`isActive` 由 `status` 派生: `active → true`, 其他 → `false`。

## 4. API 合约

### 4.1 `GET /api/stores`

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `province` | string | — | 按 provinceSlug 过滤 |
| `city` | string | — | 按 citySlug 过滤 |
| `page` | number | 1 | 页码 |
| `limit` | number (max 100) | 20 | 每页条数 |
| `search` | string | — | 搜索 name/address/phone/slug（ILIKE） |
| `status` | string[] | — | 多值过滤（公开仅返回 active） |
| `level` | string[] | — | 多值过滤 |
| `sort` | enum | `created_desc` | 排序（见 SORT_MAP） |
| `image` | `has`/`missing` | — | 按有无图片过滤 |
| `all` | `true` | — | admin 查看全部状态（需鉴权） |
| `isActive` | boolean | — | 旧兼容参数，优先用 `status` |

**成功响应 (200)：**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "slug": "shunde-daliang",
      "name": "蓝辉轻改顺德大良店",
      "provinceSlug": "guangdong",
      "provinceLabel": "广东省",
      "citySlug": "foshan",
      "cityLabel": "佛山市",
      "district": "顺德区",
      "address": "广东省佛山市顺德区大良...",
      "phone": "13800138000",
      "phoneTel": "tel:13800138000",
      "businessHours": "09:00-18:00",
      "description": "...",
      "imagePath": "/images/stores/xxx.webp",
      "level": "flagship",
      "status": "active",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**SORT_MAP：**
| sort 值 | Prisma orderBy |
|---------|---------------|
| `updated_desc` (default) | `{ updatedAt: "desc" }` |
| `name_asc` | `{ name: "asc" }` |
| `level_desc` | `[{ level: "desc" }, { createdAt: "desc" }]` |
| `public_featured` | `[{ imagePath: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }]` |

### 4.2 `POST /api/stores`

**鉴权**: `auth()` → role === `"admin"`，否则 401/403。

**请求体（Zod：StoreCreateSchema）：**
```json
{
  "name": "蓝辉轻改顺德大良店",
  "provinceSlug": "guangdong",
  "citySlug": "foshan",
  "address": "广东省佛山市顺德区大良街道xxx",
  "phone": "13800138000",
  "level": "flagship",
  "slug": ""
}
```

**成功响应 (201)：**
```json
{ "success": true, "data": { "id": "cuid_xxx", "slug": "shunde-daliang", ... } }
```

### 4.3 `GET /api/stores/[id]`

`[id]` 接受 `id` 或 `slug`。`?all=true` 需 admin 权限。

**成功响应 (200)：** 同上 data 结构。
**门店不存在 (404)：** `{ "success": false, "error": "门店不存在" }`

### 4.4 `PUT /api/stores/[id]`

完整更新。鉴权 admin。保留向后兼容，推荐前端用 PATCH。

### 4.5 `PATCH /api/stores/[id]`

部分更新。鉴权 admin。`body.slug` 显式拒绝（400），slug 仅 POST 时自动生成或 PATCH 时联动 name 变化重生成。

### 4.6 `DELETE /api/stores/[id]`

**软删除** — 将 status 设为 `suspended`，不物理删除数据。

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 公开列表只返回 active 门店 | 无 `?all=true` 且无 `?status=` | `where.status = "active"` |
| BR2 | admin 可查看所有状态 | `?all=true` + admin 鉴权通过 | 不附加 status 过滤 |
| BR3 | province/city label 不信任客户端 | POST/PUT/PATCH 含 provinceSlug/citySlug | 从 DB 查询权威 label 覆盖客户端值 |
| BR4 | province/city 必须存在且 active | POST/PUT/PATCH 含 provinceSlug/citySlug | 查 DB 校验，不存在或未激活 → 400 |
| BR5 | city.provinceSlug 必须匹配 province.slug | city 校验 | 不匹配 → 400 "所选城市暂未开通或不属于所选省份" |
| BR6 | slug 自动生成 | POST 时 slug 为空/缺失 | `generateStoreSlug(name, existingSlugs)` 生成唯一 slug |
| BR7 | slug 不可手动修改 | PATCH body 含 `slug` | 400 "URL 标识不支持手动修改" |
| BR8 | PATCH 联动重生成 slug | PATCH 改 name 且 status === "pending" | 自动重算 slug（排除自身） |
| BR9 | status 变更记录审计 | status 字段变化 | 记录 `statusChangedAt` + `statusChangedBy` |
| BR10 | DELETE 语义为暂停合作 | DELETE 请求 admin | 设 status = "suspended"，不物理删除 |
| BR11 | isActive 由 status 派生 | 任何 status 变更 | `status === "active" → isActive = true`，否则 false |
| BR12 | 页面最大 100 条 | `limit` 参数 | `Math.min(100, Math.max(1, Number(limit)))` |

## 6. 错误处理矩阵

| 错误码/场景 | HTTP | 消息 | details |
|-------------|------|------|---------|
| 未登录 | 401 | "未认证" | — |
| 非 admin | 403 | "权限不足" | — |
| Zod 校验失败 | 400 | "参数验证失败" | `{ fieldName: ["错误信息"] }` 或 `flatten().fieldErrors` |
| provinceSlug 不存在/未激活 | 400 | "参数验证失败" | `{ provinceSlug: ["请选择已开通的省份"] }` |
| citySlug 不存在/未激活/跨省 | 400 | "参数验证失败" | `{ citySlug: ["所选城市暂未开通或不属于所选省份"] }` |
| PATCH 传 slug | 400 | "参数验证失败" | `{ slug: ["URL 标识不支持手动修改"] }` |
| 门店不存在 | 404 | "门店不存在" | — |
| P2002 (slug 重复) | 409 | "URL标识已存在" | `{ slug: ["该 URL 标识已被其他门店使用"] }` |
| P2002 (其他唯一键) | 409 | "数据已存在" | `{ _form: ["记录重复"] }` |
| P2003 (FK 约束) | 400 | "参数验证失败" | `{ _form: ["省市选择无效，请刷新页面后重试"] }` |
| 其他异常 | 500 | "服务器内部错误" | —（console.error 记录） |

## 7. 测试用例清单（TDD：实现前写出并看到失败）

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| STORE-AC-01 | 正常创建门店 | POST 合法 body | 201 + 返回完整 Store（含 id, slug, status="pending"） | happy |
| STORE-AC-02 | 创建时 slug 为空自动生成 | POST body 缺 slug | 201 + slug 非空，格式符合 SLUG_REGEX | happy |
| STORE-AC-03 | 公开列表只返回 active | GET /api/stores | data 中所有 status === "active" | happy |
| STORE-AC-04 | 按 province 筛选 | GET ?province=guangdong | data 中所有 provinceSlug === "guangdong" | happy |
| STORE-AC-05 | 分页正确 | GET ?page=2&limit=10 | pagination 中 page=2, limit=10, total 正确 | happy |
| STORE-AC-06 | 通过 slug 查门店 | GET /api/stores/shunde-daliang | 200 + data.slug === "shunde-daliang" | happy |
| STORE-AC-07 | 缺 name → 400 | POST body 无 name | 400 + error="参数验证失败" | error |
| STORE-AC-08 | phone 格式错误 → 400 | POST phone="abc" | 400 + details 含 phone 错误 | error |
| STORE-AC-09 | 无效 provinceSlug → 400 | POST provinceSlug="mars" | 400 + details.provinceSlug 含错误 | error |
| STORE-AC-10 | city 不属于 province → 400 | POST citySlug 跨省 | 400 + details.citySlug 含错误 | edge |
| STORE-AC-11 | slug 重复 → 409 | POST slug 与已有门店冲突 | 409 + error="URL标识已存在" | error |
| STORE-AC-12 | 非 admin → 401/403 | POST 不带 session | 401 | error |
| STORE-AC-13 | editor 角色 → 403 | POST editor session | 403 | error |
| STORE-AC-14 | 不存在的门店 → 404 | GET /api/stores/nonexistent | 404 + error="门店不存在" | error |
| STORE-AC-15 | PATCH 传 slug → 400 | PATCH body 含 slug | 400 + details.slug 含错误 | error |
| STORE-AC-16 | DELETE 软删除 → 200 | DELETE 合法 id | 200 + data.status === "suspended" | happy |
| STORE-AC-17 | name 超长 → 400 | POST name > 80 chars | 400 + details.name 含错误 | edge |
| STORE-AC-18 | search 模糊搜索 | GET ?search=大良 | data 过滤到匹配 name/address 的结果 | happy |

## 8. 已知问题

- [ ] Prisma 7 P2002 error shape 读取路径 `meta.driverAdapterError.cause.constraint.fields[]`（非 legacy `meta.target`），已在 POST/PATCH 中适配，但 PUT 中仍同时检测两种路径
- [ ] 无 CSRF 保护
- [ ] 无请求限流

## 9. 验收条件

- [ ] AC1: POST → 201 + 自动生成 slug
- [ ] AC2: POST 缺 name → 400 + fieldErrors
- [ ] AC3: POST 非 admin → 401
- [ ] AC4: GET 公开列表仅 active
- [ ] AC5: DELETE → status=suspended（非物理删除）
- [ ] AC6: PATCH 传 slug → 400 拒绝
- [ ] AC7: `npm run build` 成功（SSG fallback 到静态数据）

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | API 增强（地区/状态） | 完成 | — |
| 2026-06-15 | Claude Code | Prisma 7 错误修复 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 重写 | 完成 | — |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| STORE-AC-01 | §7 | `api/stores/route.test.ts` | "正常创建 → 201" | ✅ |
| STORE-AC-02 | §7 | `api/stores/route.test.ts` | "slug 为空自动生成" | ✅ |
| STORE-AC-03 | §7 | `api/stores/route.test.ts` | "公开列表仅 active" | ✅ |
| STORE-AC-07 | §7 | `api/stores/route.test.ts` | "缺 name → 400" | ✅ |
| STORE-AC-11 | §7 | `api/stores/route.test.ts` | "slug 重复 → 409" | ✅ |
| STORE-AC-12 | §7 | `api/stores/route.test.ts` | "非 admin → 401" | ✅ |

---

> 最后更新: 2026-07-07
> 旧版 SPEC 归档为 `api/stores-v1-post-hoc.md`

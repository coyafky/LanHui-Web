# 种子数据 — 规格与流程

> Prisma 7.8 + PostgreSQL 16。
>
> 涵盖 7 张表的所有种子数据:来源、字段、幂等策略、回填流程。

---

## 总览

| 表 | 来源 | 行数 | 写入工具 | 幂等 |
|---|---|---|---|---|
| User | `prisma/seed.ts:62-75` | 1 | bcrypt + upsert | ✅ |
| Province | `src/lib/regions/mainland-regions.ts` | 27 | upsert | ✅ |
| City | `src/lib/regions/mainland-regions.ts` | 75 | upsert | ✅ |
| Store | (无 seed) | 0 | — | — |
| Article | (无 seed) | 0 | — | — |
| AnalyticsEvent | (无 seed) | 0 | — | — |
| ActivityLog | (无 seed) | 0 | — | — |

**总种子: 1 用户 + 27 省 + 75 市 = 103 条**

---

## 1. User 种子(1 条)

**源文件**: `prisma/seed.ts:62-75`

```ts
const admin = await prisma.user.upsert({
  where: { email: "admin@lanhui.com" },
  update: {},
  create: {
    email: "admin@lanhui.com",
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    name: "系统管理员",
    role: "admin",
    status: "active",
  },
});
```

| 字段 | 值 | 说明 |
|---|---|---|
| email | `admin@lanhui.com` | 登录账号 |
| username | `admin` | 显示名 |
| password | bcrypt("admin123", rounds=10) | **开发默认密码,生产必须改** |
| name | `系统管理员` | 真实姓名占位 |
| role | `admin` | 完整权限 |
| status | `active` | 启用 |

**幂等**: `where.email` 唯一匹配,`update: {}` 重复运行不更新

**生产部署**: 通过 `scripts/create-admin.ts` CLI 创建新账号后,**必须**修改此默认密码或删除

**CLI 创建脚本**: `npx tsx scripts/create-admin.ts --username X --email Y --password Z --role admin|editor`

---

## 2. Province 种子(27 条)

**源文件**: `src/lib/regions/mainland-regions.ts` → `MAINLAND_PROVINCES`

**数据样例**:

| slug | code | type | label | order |
|---|---|---|---|---|
| beijing | 110000 | municipality | 北京市 | 1 |
| tianjin | 120000 | municipality | 天津市 | 2 |
| shanghai | 310000 | municipality | 上海市 | 3 |
| chongqing | 500000 | municipality | 重庆市 | 4 |
| guangdong | 440000 | province | 广东省 | 5 |
| ... | ... | ... | ... | ... |
| xinjiang | 650000 | autonomous | 新疆维吾尔自治区 | 27 |

**4 种 type 枚举**:
- `municipality` — 直辖市(4 个)
- `province` — 省(23 个)
- `autonomous` — 自治区(5 个)
- `special` — 特别行政区(2 个,本项目暂未包含)

**写入代码** (`prisma/seed.ts:14-31`):

```ts
for (const p of MAINLAND_PROVINCES) {
  await prisma.province.upsert({
    where: { slug: p.slug },
    update: { code: p.code, type: p.type, order: p.order },
    create: {
      slug: p.slug, code: p.code, type: p.type,
      label: p.label, order: p.order, isActive: true,
    },
  });
}
```

**幂等**: `where.slug` 匹配,`update` 只刷 `code/type/order` 不动 `label`/`isActive`(保留已存在门店的外键引用)

**回填说明**: 2026-06-15 之前用 `prisma db push` bootstrap 的 DB,`code/type` 列为 NULL,运行 seed 后自动回填

---

## 3. City 种子(75 条)

**源文件**: `src/lib/regions/mainland-regions.ts` → `MAINLAND_CITIES`

**数据样例**:

| slug | code | type | provinceSlug | label | order |
|---|---|---|---|---|---|
| beijing | 110100 | city | beijing | 北京市 | 1 |
| shanghai | 310100 | city | shanghai | 上海市 | 1 |
| guangzhou | 440100 | city | guangdong | 广州市 | 1 |
| shenzhen | 440300 | city | guangdong | 深圳市 | 2 |
| dongguan | 441900 | city | guangdong | 东莞市 | 3 |
| foshan | 440600 | city | guangdong | 佛山市 | 4 |
| ... | ... | ... | ... | ... | ... |

**4 种 type 枚举**:
- `city` — 地级市
- `prefecture` — 地区/盟
- `league` — 盟(内蒙古)
- `district` — 直辖市区

**写入代码** (`prisma/seed.ts:33-52`): 同 Province 的 upsert 模式

**覆盖**: 27 省 × 2-5 个主要城市,平均 2.8 个/省,共 75 条

**不在种子的城市**: 全国共 300+ 地级市,本项目只 seed 直辖市、省会、副省级、计划单列市,其他城市通过前端"附近门店"或手动添加

---

## 4-7. Store / Article / AnalyticsEvent / ActivityLog

**均无 seed**,通过 admin 后台创建。

**Store 现状**:
- DB 中有 22 条,但其中 21 条是 ASCII 噪声测试数据(如 `TC A1-phonetic 1` / `ssdd` / `ES Test 7`)
- 1 条疑似真实(`深圳前海汽车服务有限...`)
- **B5 任务**: 清理 + 加 `status` 字段过滤

**Article 现状**:
- 8 条已发布 + 1 草稿
- 含 3 条分页测试残留(`分页测试 #1/#2/#3`) + 1 条 Playwright 测试残留
- **B12 任务**: 清理测试文章

**AnalyticsEvent 现状**:
- ~695 条 pageview, ~5 click, 0 store_view
- 由客户端 `src/lib/analytics.ts` 自动写入
- **B7/B8 任务**: 补全 click 和 store_view 埋点

**ActivityLog 现状**:
- 仅 `articles` 和 `stores` 写操作时记录
- **B3 任务**: 7 个写 API 全部加日志

---

## 执行流程

### 本地首次 setup

```bash
# 1. 启动 DB(若未运行)
docker run -d --name lanhui-postgres -p 5433:5432 \
  -e POSTGRES_USER=lanhui -e POSTGRES_PASSWORD=lanhui_password \
  -e POSTGRES_DB=lanhui postgres:16

# 2. 应用 schema
npx prisma db push

# 3. 跑 seed
set -a && source .env && set +a
npx tsx prisma/seed.ts
# 输出: ✅ 用户创建 + ✅ 省份: 27 条；城市: 75 条
```

### 生产部署

```bash
# 1. 应用 migrations(从干净 DB 起步)
npx prisma migrate deploy

# 2. Seed
npx prisma db seed
# 或: npx tsx prisma/seed.ts
```

### 重置(⚠️ 删全部数据)

```bash
npx prisma migrate reset --force
# 自动重跑 seed
```

### 单跑 seed(幂等)

```bash
set -a && source .env && set +a
npx tsx prisma/seed.ts
# 可重复运行,只补缺失或更新 code/type/order
```

---

## 已知坑

### 1. `_prisma_migrations` 表不存在

DB 由 `prisma db push` bootstrap,无迁移跟踪表。`prisma migrate deploy` 报 P3005。

**修复** (一次性): 详见 [../../CLAUDE.md](../../CLAUDE.md) "环境陷阱" 第 4 条

### 2. `DATABASE_URL` 不在 shell env

`npx tsx scripts/*.ts` 不自动加载 `.env`,必须在前面加:

```bash
set -a && source .env && set +a
```

### 3. macOS APFS 大小写不敏感

`stat -f "%d:%i"` 同一目录,迁移脚本中 `mkdir lowercase && rm uppercase` 静默失败。改名用 `mv A _tmp && mv _tmp B`。

### 4. 默认 admin 密码不能用于生产

`admin123` 是开发用,生产部署**必须**改密码或删 admin 账号。

### 5. code/type 列首次 seed 前为 NULL

`db push` 时代的行无 code/type,需重跑 seed 回填。

---

## 相关文档

- [SCHEMA.md](./SCHEMA.md) — 表结构
- [ER_DIAGRAMS.md](./ER_DIAGRAMS.md) — 关系图
- [../../CLAUDE.md](../../CLAUDE.md) — 环境陷阱
- [../../prisma/seed.ts](../../prisma/seed.ts) — Seed 源

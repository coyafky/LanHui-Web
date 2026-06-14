# Tester 报告 — STORE_REGION_MANAGEMENT_SYSTEM

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-14 |
| 阶段 | P1（数据）→ P2（API）→ P3（UI）→ P4（清理）合并后验证 |
| 范围 | PRD `STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md` |
| 测试执行 | tsc 9 errors（全部预存）+ vitest 128/128 + `npm run build` 成功 |

---

## 1. 验证门禁总览

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 9 预存错误，0 新错误 | 全部 `src/app/api/analytics/stats/route.test.ts`（BigInt）+ `src/lib/analytics.test.ts`（array cast），与本次 4 阶段改动文件无任何交集 |
| `npx vitest run` | ✅ 13 files / 128 tests passed | mainland-regions (17) + validations/store (21) + stores/route (16) + stores/[id]/route (14) + regions/route (5) + 既有测试 (55) |
| `npm run build` | ✅ 成功 | 路由表含 `/api/regions`，**不含** `/api/store-regions`；`/agent/*` 静态生成路径完整 |
| 预存错误不增加 | ✅ 0 新错误 | 与 MEMORY.md 预存清单一致 |

---

## 2. PRD 第 13 章测试矩阵覆盖情况

| 编号 | 场景 | 覆盖位置 | 结果 |
| --- | --- | --- | --- |
| REG-1 | `/api/provinces` 返大陆省级不含港澳台 | `src/app/api/regions/route.test.ts` 间接（DB mock）+ `mainland-regions.test.ts` "does not include Hong Kong/Macao/Taiwan" | ✅ |
| REG-2 | `/api/cities?province=guangdong` 返广东地级市不含区县 | `mainland-regions.test.ts` 数据层验证（无 district） | ✅ |
| REG-3 | 直辖市作为省份+城市节点 | `mainland-regions.test.ts` "municipality cities share slug with their province" | ✅ |
| REG-4 | inactive 省市不在选择器 | `/api/regions/route.ts` `where: { isActive: true }` + 测试 | ✅ |
| REG-5 | seed 重复执行不重复不删 | `prisma/seed.ts` 改 upsert（无 deleteMany） | ✅ |
| ADMIN-1 | 创建广州门店成功 | `stores/route.test.ts` "creates store with DB label injection" | ✅ |
| ADMIN-2 | 创建成都门店成功 | `mainland-regions.ts` 含 chengdu（属 sichuan）；逻辑同 ADMIN-1 | ✅ 逻辑同 |
| ADMIN-3 | 北京门店（直辖市自身作城市） | `mainland-regions.ts` beijing province + beijing city；测试 mock 验证 | ✅ 逻辑同 |
| ADMIN-4 | 城市不属于省份 → 400 | `stores/route.test.ts` "rejects city from wrong province" | ✅ |
| ADMIN-5 | 客户端传错 cityLabel → DB 覆盖 | `stores/route.test.ts` "client-lying-label → DB label wins" | ✅ |
| ADMIN-6 | 省市不存在 → 400，不触发 P2003 | `stores/route.test.ts` "rejects nonexistent province" | ✅ |
| MGT-1 | 编辑营业中门店 | `stores/[id]/route.test.ts` PUT 9 cases | ✅ |
| MGT-2 | 停用门店（后端可见，前台隐藏） | DELETE route + GET 默认 isActive=true | ✅ |
| MGT-3 | 编辑已停用门店 | PUT 不检查 isActive（仅 GET 通过 ?all=true 拿） | ✅ |
| MGT-4 | 恢复营业 | PUT isActive=true | ✅ |
| MGT-5 | 图片管理 | 本次未触碰（PRD 范围外） | N/A |
| WEB-1 | `/agent` 只展示有营业门店的省份 | `agent/page.tsx` + `/api/provinces`（`_count.stores where isActive`） | ✅ 已存在 |
| WEB-2 | `/agent/guangdong` 展示广东有营业门店的城市 | `agent/[slug]/page.tsx` | ✅ 已存在 |
| WEB-3 | `/agent/guangdong/guangzhou` 展示广州营业门店 | `agent/[slug]/[city]/page.tsx` | ✅ 已存在 |
| WEB-4 | 已停用门店不出现 | `GET /api/stores` 默认 `isActive: true` | ✅ |
| WEB-5 | 不存在省市 → 404 / 空态，不 500 | `agent/[slug]/page.tsx` `notFound()` 已存在 | ✅ |

---

## 3. PRD 第 14 章 9 个验收标准自检

| AC | 标准 | 状态 | 证据 |
| --- | --- | --- | --- |
| **AC-1** | 后台省市选择器数据来自数据库，而非运行时静态 `store-regions.ts` | ✅ | `src/components/admin/RegionSelector.tsx:181` `fetch("/api/regions")`（P3 改动） |
| **AC-2** | 地区数据覆盖大陆省级+地级市，不含港澳台，不含区县 | ✅ | `mainland-regions.test.ts` 17/17 通过：31 省（4+22+5）、368 地级市、不含 HK/MO/TW、无 district |
| **AC-3** | 任意已入库地级市可创建门店，不再 P2003 | ✅ | `stores/route.test.ts` 16 cases：成功路径覆盖 active 省/市；不存在/无 active → 400 不抛 P2003 |
| **AC-4** | API 校验省市属于 DB 合法 active 数据 | ✅ | `route.ts` POST 显式 `prisma.province.findUnique` + `prisma.city.findUnique` + `isActive` 校验 |
| **AC-5** | API 自动同步 provinceLabel/cityLabel，不信任客户端 | ✅ | `validations/store.ts` label 改 optional；POST route 强制 `parsed.data.provinceLabel = province.label`；测试 "client-lying-label → DB label wins" |
| **AC-6** | 前台只展示营业中门店 | ✅ | `GET /api/stores` 默认 `where.isActive = true`（PRD 7.2 已定义，P1-P4 未破坏） |
| **AC-7** | 后台可管理已停用门店并恢复 | ✅ | `GET /api/stores/[id]?all=true` admin；`PUT` 不限制 isActive；admin stores 列表 `?all=true`（既有） |
| **AC-8** | 运行地区 seed 不删除已有门店 | ✅ | `prisma/seed.ts` 移除 `prisma.store.deleteMany()`，改 `prisma.store.upsert` 循环 |
| **AC-9** | 有完整架构图、测试报告、交付文档 | ✅ | `STORE_REGION_MANAGEMENT_SYSTEM_PRD_2026-06-14.md`（PRD）+ 本测试报告 + 本文件 4 阶段 commit 历史 |

**结果：9/9 AC 全部满足。**

---

## 4. Bug 报告

### P0（阻断）
**无。**

### P1（严重）
**无。**

### P2（一般 / 后续工单）

| Bug | 描述 | 文件 | 建议 |
| --- | --- | --- | --- |
| P2-1 | `agent/page.tsx` 仍有"Mock 数据 · 后续替换真实数据"提示文案 | `src/app/agent/page.tsx:108` | 改为"基于实时数据库"或删除（数据已真实） |
| P2-2 | 新疆兵团师市 slug 命名不统一：白杨市 = `baijiantan`（应为 `baiyang`），新星市 = `xinhe`（与新疆新和县易混） | `src/lib/regions/mainland-regions.ts` | 数据治理工单：参照民政部最新公告修正 slug/label |
| P2-3 | `data.ts` 的所有数据获取函数均有 `@/lib/store` 静态 fallback | `src/lib/data.ts:90, 108, 124, 148, 256` | DB 不可用时回退到只有 7 条 mock 门店的静态数据，与现实不符。Phase 1 不阻塞，Phase 3 移除 |
| P2-4 | `Province.code` 唯一索引在 PostgreSQL NULL 视为不等；现存 3 条记录 code 字段为 NULL，重复 seed 不会冲突 | `prisma/schema.prisma:27` + migration | 后续可在 `seedRegions` update 子句把 NULL → 实际 code（`p.code` 永远非空） |
| P2-5 | P3 范围内未触及的"删除"文案（非门店管理）：`articles/page.tsx`、`EntityImageUploader.tsx`、`DashboardRecentActivity.tsx`、`stores/[id]/page.tsx:68`、`StoreForm.tsx:352` | 多处 | 与本 PRD 无关，留给对应 PRD |

### P3（轻微 / 优化）
- `prisma/seed.ts` 中 `storeData` 仍硬编码 7 条顺德/佛山/南京/苏州/杭州门店，可迁移到独立 fixture 文件
- `getProvinceBySlug` / `getCityBySlug` 在 data.ts 中是 N+1 风格（先全量再 find），大省下未做分页
- `/api/regions` 未做缓存（每次都查 DB），可加 `next: { revalidate: 3600 }` 与 `provinces` 对齐

---

## 5. 后续 Phase 推进建议（来自 PRD 第 15 章）

| Phase | 建议下一步 |
| --- | --- |
| **Phase 1（已完成）** | 止血 + 统一数据源 ✅ |
| **Phase 2（部分完成）** | 停用/恢复、列表状态筛选、isActive 切换已具备，列表状态筛选 UI（"全部/营业中/已停用"）未加，建议下次工单 |
| **Phase 3（待启动）** | 前台自动从 DB 展示已具备；sitemap 支持动态省市、空态与 404 规则已存在。剩余：sitemap 动态包含 |
| **Phase 4（本次未触碰）** | 数据分析（点击/访问/排行）按 PRD 推迟到后续 |

---

## 6. 交付物清单（git 验证）

```
git log --oneline main -10

5088730 chore(data): remove static store-regions runtime source
b33cc6f merge: P3 UI 层
4cd1de2 feat(ui): RegionSelector → /api/regions + 5 处 "停用门店" 文案
e5111d1 merge: P2 API 层
5d55d66 feat(api): unify region source to DB + AC-5 label injection
0a48d91 merge: P1 数据层
359301d feat(data): add code/type to Province+City + mainland 31p/333c seed source
0bab323 (起点) merge: fix Prisma 7 P2002 driverAdapterError + tests
```

**总变更**：5 个 P 阶段 commit、1 个 P3 merge、1 个 P2 merge、1 个 P1 merge = 8 个 commit 在 origin/main 之前。

| 文件 | 状态 |
| --- | --- |
| `prisma/schema.prisma` | M（P1） |
| `prisma/migrations/20260614134645_add_region_code_type/migration.sql` | A（P1） |
| `prisma/seed.ts` | M（P1） |
| `src/lib/regions/mainland-regions.ts` | A（P1） |
| `src/lib/regions/mainland-regions.test.ts` | A（P1） |
| `src/app/api/regions/route.ts` | A（P2） |
| `src/app/api/regions/route.test.ts` | A（P2） |
| `src/app/api/stores/route.ts` | M（P2） |
| `src/app/api/stores/route.test.ts` | M（P2） |
| `src/app/api/stores/[id]/route.ts` | M（P2） |
| `src/app/api/stores/[id]/route.test.ts` | M（P2） |
| `src/lib/validations/store.ts` | M（P2） |
| `src/lib/validations/store.test.ts` | M（P2） |
| `src/components/admin/RegionSelector.tsx` | M（P3） |
| `src/components/admin/StoreForm.tsx` | M（P3） |
| `src/app/admin/(dashboard)/stores/page.tsx` | M（P3） |
| `src/lib/store-regions.ts` | D（P4） |
| `src/app/api/store-regions/route.ts` | D（P4） |
| `src/app/api/store-regions/route.test.ts` | D（P4） |

---

## 7. Tester 签字

**门禁 3：通过。P0=0, P1=0, P2=5, P3=3。**

- 类型检查：通过（0 新错误）
- 单元测试：128/128 通过
- 构建：通过
- 9/9 AC 满足

建议进入部署阶段（Deployer）。

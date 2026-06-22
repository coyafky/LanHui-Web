# 蓝辉门店管理系统 PRD

> **系统范围**：`/admin/stores`、`/admin/stores/new`、`/admin/stores/[id]`、`/admin/stores/[id]/image` 及官网 `/agent` 展示链路
> **用户**：总部 admin
> **版本**：v1（合并 2026-06-20 实现版 + 2026-06-21 规划版）
> **最后更新**：2026-06-22
>
> **来源**：从 `STORE_MANAGEMENT_PRD_2026-06-20.md`（v1 实现版）与 `STORE_MANAGEMENT_PRD_2026-06-21.md`（v0.3 规划版）合并
> **当前实现状态**：见 `docs/SPEC/admin/stores.md`

---

## 1. 系统目标

加盟商完成加盟后，由总部员工维护其官网门店资料，并准确控制门店从"准备上线"到"营业展示""暂停合作"和"终止合作"的生命周期。

系统必须保证：

- 从未上线的门店不会意外出现在官网。
- 暂停合作和永久终止合作有明确区别。
- 停止展示不会删除历史资料和操作记录。
- 门店恢复营业时能够恢复原资料。
- 每次状态变化都能追溯到操作者和原因。

后台是 **门店数据的唯一真相源**：地区数据来自 DB `Province` / `City` 表，`Store` 状态字段决定前台可见性。

---

## 2. 用户与权限

| 能力 | admin | editor | 未登录 |
|---|---|---|---|
| 查看门店列表和详情 | ✅ | ❌ | ❌ |
| 创建和编辑门店 | ✅ | ❌ | ❌ |
| 发布/暂停/恢复/终止门店 | ✅ | ❌ | ❌ |
| 查看历史状态和操作日志 | ✅ | ❌ | ❌ |
| 头图上传/替换/删除 | ✅ | ❌ | ❌ |
| 公开 `GET /api/stores` | ✅ | ✅ | ✅（只看 active） |
| 公开 `/agent` 路由 | ✅ | ✅ | ✅（只看 active） |

---

## 3. 门店状态机

### 3.1 状态定义

| 状态 | 含义 | 官网可见 | 是否可编辑 |
|---|---|---|---|
| `pending` 待发布 | 从未上线，资料准备中 | 否 | 是 |
| `active` 营业中 | 正常合作并对车主展示 | 是 | 是 |
| `suspended` 暂停合作 | 曾上线，当前暂时隐藏 | 否 | 是 |
| `terminated` 终止合作 | 永久结束或录入作废 | 否 | 默认只读 |

### 3.2 允许的状态转换

```
pending ──publish──> active ──suspend──> suspended
   │                   ▲                    │
   │                   └──── resume ────────┘
   │
   └──terminate──> terminated

suspended ──terminate──> terminated
```

### 3.3 状态动作规则

| 动作 | 前置状态 | 目标状态 | 前置条件 | 官网影响 |
|---|---|---|---|---|
| 保存待发布 | pending | pending | 最低保存字段（名称+省+市+地址+电话） | 无 |
| 发布门店 | pending | active | 展示必填字段和图片校验通过 | 立即展示 |
| 暂停合作 | active | suspended | 二次确认并记录原因 | 立即隐藏 |
| 恢复营业 | suspended | active | 重新核对联系方式和资料 | 恢复展示 |
| 终止合作 | pending/suspended | terminated | 高风险确认并记录原因 | 永久隐藏 |

### 3.4 禁止转换

- `active → terminated`：必须先经过 `suspended`，避免误操作
- `terminated → active`：禁止直接恢复。若重新加盟，必须新建门店记录
- 不物理删除有上线历史的门店

### 3.5 当前实现说明

当前（2026-06-20 实现版）仍使用 **`isActive: Boolean`** 二元状态（`true`=营业中, `false`=已停用），尚未迁移到 4 状态枚举。迁移计划见 §10 数据迁移。

---

## 4. 页面地图

| 页面 | 主要任务 | 必须覆盖的状态 |
|---|---|---|
| `/admin/stores` | 搜索、筛选、分组、排序、查看和执行状态动作 | 加载、空、筛选无结果、失败、批量操作 |
| `/admin/stores/new` | 新建待发布门店 | 未保存、保存中、校验失败、成功 |
| `/admin/stores/[id]` | 编辑、预览、发布、暂停、恢复、终止 | 4 种状态、冲突、只读 |
| `/admin/stores/[id]/image` | 门店主图管理（上传/替换/删除） | 空、上传中、上传失败、成功 |
| 官网预览 | 查看门店上线后的最终效果 | 仅授权后台人员访问 |

---

## 5. 门店字段规格

### 5.1 字段清单

| 字段 | 待发布保存必填 | 发布必填 | 说明 |
|---|---|---|---|
| 门店名称 | 是 | 是 | 需含至少 1 个中文字符，重复检查提醒 |
| slug | 否，系统自动生成 | 是且唯一 | 官网 URL；不在 admin 表单暴露 |
| 门店等级 | 否 | 是 | `flagship`/`premium`/`specialty`/`member` |
| 省份 | 否 | 是 | DB 权威地区，从 `Province` 表选择 |
| 城市 | 否 | 是 | 必须属于所选省份，从 `City` 表选择 |
| 详细地址 | 否 | 是 | 区县/街道/门牌统一写入此字段 |
| 联系电话 | 否 | 是 | 11 位数字，不接受空格/短横线/`+86`/`tel:` |
| 营业时间 | 否 | 是 | |
| 门店介绍 | 否 | 待确认 | |
| 封面图 | 否 | 待确认 | 一期单张主图，4:3 比例，最低 1200×900 |
| 展示排序 | 否 | 待确认 | 一期不做人工排序 |
| 状态原因 | 状态动作时 | 状态动作时 | 暂停/终止原因 |

### 5.2 明确不采集的字段

- 不采集经纬度
- 不设置独立区/县字段（细节写入详细地址）
- 不要求填写 `tel:` 格式（前台展示层按需生成拨号链接）

### 5.3 电话校验

- 只接受 11 位数字
- 不接受空格、短横线、括号、`+86` 或 `tel:` 前缀
- 保存前自动去除首尾空格，但不静默修改中间字符
- 不符合规则时阻止发布

### 5.4 等级枚举

| 等级 | key | 官网显示 |
|---|---|---|
| 星辉旗舰店 | `flagship` | 旗舰店徽章 |
| 星耀尊享店 | `premium` | 尊享店徽章 |
| 星辰专营店 | `specialty` | 专营店徽章 |
| 星光会员店 | `member` | 会员店徽章 |

等级用于列表筛选/分组和官网 `/agent` 列表展示 Badge。`flagship > premium > specialty > member` 排序。

---

## 6. 地区数据

### 6.1 数据关系

省份和城市是独立的地区主数据，不是随门店任意填写的普通文本字段：

```
Province 1 ── N City
Province 1 ── N Store
City     1 ── N Store
```

- `Province` 保存省份名称、编码、排序、启用状态和门店数量
- `City` 必须属于一个省份，保存城市名称、编码、排序、启用状态和门店数量
- `Store` 只能关联系统中已启用且关系正确的省份和城市
- 服务端根据省市主数据生成显示名称，不信任客户端自行提交的省市名称

### 6.2 地区维度能力

门店列表必须支持：
- 按省份筛选
- 选中省份后按城市筛选
- 按省份分组查看门店及数量
- 按城市分组查看门店及数量
- 省份或城市无门店时，区分"没有门店"和"地区数据未启用"

### 6.3 数据来源

| 来源 | 作用 | 是否运行时校验 |
|---|---|---|
| `prisma/seed.ts` | 初始化 31 省 + 75+ 城市 | 是 |
| `Province` / `City` 表 | 运行时唯一真相源 | 是 |

后台 RegionSelector 流程：
```
RegionSelector → GET /api/provinces → DB Province 表
               + GET /api/cities?province={slug} → DB City 表
               → <select options>
```

---

## 7. 门店列表：搜索、筛选、分组与排序

### 7.1 搜索

支持按门店名称、详细地址、联系电话、slug 模糊搜索。

### 7.2 筛选

| 筛选维度 | 选项 |
|---|---|
| 状态 | 全部、待发布、营业中、暂停合作、终止合作 |
| 省份 | 全部省份 + 已启用省份 |
| 城市 | 依赖所选省份；未选省份时默认不可用 |
| 门店等级 | 全部等级 + 等级枚举 |
| 图片完整度 | 全部、有封面图、缺封面图 |

多个筛选条件同时生效，筛选条件同步到 URL 查询参数。

### 7.3 分组视图

支持按以下维度分组：不分组、按省份、按城市、按门店等级、按合作状态。每个分组显示门店数量，支持展开/收起。

### 7.4 排序

一期至少支持：最近更新优先、最早更新优先、最新创建优先、门店名称正序/倒序、省份顺序后按城市顺序、门店等级顺序。

后台列表排序和官网展示排序是两个不同概念。

### 7.5 结果与空状态

- 无任何门店：提示创建第一家门店
- 有门店但筛选无结果：展示当前筛选摘要和"清除筛选"
- 地区加载失败：筛选器显示错误和重试
- 分组后某组无数据：不创建空分组

---

## 8. 门店封面图管理

### 8.1 当前实现

当前代码已具备：
- 点击选择或拖拽上传，接受 JPG/PNG/WebP，最大 5MB
- 服务端使用 Sharp 转换为 WebP q80
- 每家门店固定保存一张主图 `/public/images/stores/{id}.webp`
- 支持预览、替换和删除
- 替换图片会覆盖旧文件
- 当前使用本地存储，不使用 OSS

### 8.2 管理流程

1. 先创建门店获得门店 ID
2. 在门店编辑页上传一张封面图
3. 服务端校验类型和大小，统一转换为 WebP
4. 数据库保存当前封面图路径
5. 后台可预览、替换或删除
6. 替换时成功写入新图后再清理旧图
7. 删除前二次确认；删除后回到默认占位图
8. 上传、替换和删除均写入操作日志

### 8.3 规格

- 推荐宽高比 4:3，最低分辨率 1200×900
- 上传前客户端预览
- 格式错误/文件过大/图片损坏/服务端失败有明确提示
- 上传中显示进度，禁止重复提交

### 8.4 一期非目标

- 多图环境相册
- 跨门店复用图片
- 独立媒体素材库
- OSS 或第三方对象存储迁移

---

## 9. 官网展示规则

- 仅 `active` 门店进入公开 API 和 `/agent` 页面
- `pending/suspended/terminated` 对公众返回 404 或不进入列表
- 后台可查看所有状态
- 恢复营业前需重新校验电话、地址和营业信息

---

## 10. 数据迁移影响

### 10.1 当前与目标的差距

| 维度 | 当前（v1 实现） | 目标（v0.3 规划） |
|---|---|---|
| 状态字段 | `isActive: Boolean` | `status: pending/active/suspended/terminated` |
| 等级 | 已实现（flagship/premium/specialty/member） | 已实现 |
| slug 编辑 | 表单不暴露 slug | 表单不暴露 slug |
| 电话 | 11 位校验 + 展示层派生 tel: | 11 位校验 |
| 区县 | 字段已移除 | 不采集 |

### 10.2 状态迁移方案

```
isActive=true 的真实门店 → active
isActive=false 的真实门店 → 需人工清单区分 suspended/terminated
测试门店 → 单独识别，不得误归类为真实终止合作门店
```

---

## 11. 异常与恢复清单

| 场景 | 预期处理 |
|---|---|
| 门店名称疑似重复 | 提醒并允许核对，不静默创建 |
| slug 重复 | 阻止保存并定位字段 |
| 省市不匹配 | 阻止保存，要求重新选择 |
| 图片上传失败 | 保留其他表单内容，单独重试 |
| 发布/暂停/恢复/终止失败 | 保持原状态，不显示虚假成功 |
| 数据被其他人修改 | 阻止静默覆盖并提示刷新/合并 |
| 会话过期 | 重新登录后尽量恢复输入 |

---

## 12. 测试范围

- 四种状态的显示和筛选
- 所有允许和禁止的状态转换
- 待发布门店不会进入官网
- 暂停后官网立即隐藏，恢复后重新展示
- 终止门店无法直接恢复
- 公开 API 仅返回 active
- 字段校验、重复门店、slug 冲突和省市不匹配
- 状态动作失败时不产生虚假状态
- admin/editor 权限差异
- 状态变更 ActivityLog
- 省份/城市级联关系与错误关系拒绝
- 按省/城市/等级/状态筛选和分组
- 筛选条件 URL 持久化
- 11 位联系电话校验
- 封面图上传/替换/删除及失败时保留旧图
- 三视口和键盘操作

---

## 13. 代码实现位置

### 13.1 页面组件

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `StoresPage` | `src/app/admin/(dashboard)/stores/page.tsx` | Client | 门店列表（TanStack Table） |
| `NewStorePage` | `src/app/admin/(dashboard)/stores/new/page.tsx` | Client | 新建门店 |
| `EditStorePage` | `src/app/admin/(dashboard)/stores/[id]/page.tsx` | Client | 编辑门店 |
| `StoreImagePage` | `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` | Client | 门店主图 |
| `StoreForm` | `src/components/admin/StoreForm.tsx` | Client | 门店表单（react-hook-form+zod） |
| `RegionSelector` | `src/components/admin/RegionSelector.tsx` | Client | 省市联动选择 |
| `EntityImageUploader` | `src/components/admin/EntityImageUploader.tsx` | Client | 通用图片上传 |
| `Sidebar` | `src/components/admin/Sidebar.tsx` | Client | 侧边导航 |

### 13.2 API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/provinces` | 公开 | 省份列表（含门店计数） |
| GET | `/api/cities?province={slug}` | 公开 | 城市列表（含门店计数） |
| GET | `/api/regions` | 公开 | 省市树结构 |
| GET | `/api/stores` | 公开 | 门店列表（默认只返回 active） |
| GET | `/api/stores/[id]` | 公开 | 门店详情 |
| POST | `/api/stores` | admin | 创建门店（Zod 校验） |
| PUT | `/api/stores/[id]` | admin | 更新门店 |
| DELETE | `/api/stores/[id]` | admin | 软停用（→ suspended） |
| PATCH | `/api/stores/[id]` | admin | 部分更新 |
| POST | `/api/upload?entity=store&entityId={id}` | admin | 头图上传 |
| DELETE | `/api/upload?entity=store&entityId={id}` | admin | 头图删除 |

**统一响应**: `{ success: boolean, data?, error?, details? }`

### 13.3 错误码契约

| HTTP Code | 场景 | 前端处理 |
|---|---|---|
| 200 | 成功 | toast + 跳转 |
| 400 | Zod 校验失败 | 字段级 inline error |
| 401 | 未登录 | 重定向 login |
| 403 | editor 无权限 | inline error |
| 404 | 门店不存在 | inline error |
| 409 | slug 重复 | inline error |
| 413 | 文件 > 5MB | toast |
| 415 | MIME 不支持 | toast |
| 500 | 服务器错误 | inline error |

### 13.4 关键数据模型

```prisma
model Store {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  provinceSlug  String
  citySlug      String
  provinceLabel String
  cityLabel     String
  address       String
  phone         String
  businessHours String?
  description   String?
  level         StoreLevel @default("specialty")
  status        StoreStatus @default("pending")
  imagePath     String?
  tags          String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum StoreLevel { flagship premium specialty member }
enum StoreStatus { pending active suspended terminated }
```

---

## 14. 已知 P0/P1

| ID | 问题 | 说明 | 优先级 |
|---|---|---|---|
| P0-6 | 22 条测试门店污染前台 | 测试门店 `isActive=true` 出现在公开 /agent | P0 |
| P1-13 | 热门门店 Top 10 空 | store_view 埋点缺失 | P1 |

完整审计清单见 `docs/SPEC/INDEX.md`

---

## 15. 固化决策记录

| 日期 | 决策 | 来源 |
|---|---|---|
| 2026-06-21 | 门店等级进入一期（flagship/premium/specialty/member） | 规划评审 |
| 2026-06-21 | 人工排序不做，留后续 PRD | 规划评审 |
| 2026-06-21 | 封面图比例 4:3，最低 1200×900 | 规划评审 |
| 2026-06-21 | 独立地区管理页面不做 | 规划评审 |
| 2026-06-21 | `active → terminated` 必须先经过 `suspended` | 规划评审 |
| 2026-06-21 | 终止后重新加盟必须新建门店记录 | 规划评审 |
| 2026-06-21 | slug 不在 admin 表单暴露，系统自动生成 | 规划评审 |

---

> 最后更新: 2026-06-22

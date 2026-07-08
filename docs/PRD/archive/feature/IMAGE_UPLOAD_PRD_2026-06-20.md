# IMAGE_UPLOAD_PRD_2026-06-20 — 全站图片上传 v1

> 横切功能子 PRD — 图片存储 / 处理 / 安全

---

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 父 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4 |
| 审计依据 | [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12 |
| 数据表 | `Store.imagePath` 见 [../../database/SCHEMA.md §4](../../database/SCHEMA.md) |
| 维护者 | 冯科雅 (Coya) |
| 类型 | 横切功能 (无独立路由,API + 客户端上传 UI) |
| 状态 | 🟢 v1 |
| 优先级 | P0 |

---

## 1. 概述

### 1.1 目标

为蓝辉轻改 LANHUI 全站提供**统一的图片上传、转换、存储与分发能力**,支撑门店主图、文章头图、未来扩展(头像、产品图、证书图等)的上传需求。统一收敛「类型白名单 + 大小限制 + 路径穿越防护 + sharp 转码」四条安全基线,杜绝前端信任 + 字符串拼接导致的任意文件写入。

### 1.2 适用页面

| 路由 | 使用方式 | 当前状态 |
|---|---|---|
| `/admin/stores/[id]/image` | 拖拽 / 选择门店主图 | ✅ 已上线 |
| `/admin/articles/new` / `/admin/articles/[id]` | 文章头图(规划接入同一 API) | 🟡 v1 范围 |
| `/admin/avatars/[userId]` | 用户头像(规划) | ⚪ v2 |
| `/admin/brands/certifications/new` | 证书图(规划) | ⚪ v2 |
| `/admin/products/[topic]/[model]/image` | 主题车型图(规划,优先 wenjie) | ⚪ v2 |
| `src/lib/products.ts` 静态 fallback 图 | `public/images/placeholders/*` | ✅ |

### 1.3 范围与非目标

**本期(v1)范围**:
- ✅ 实体类型:`store` (已实现)
- ✅ 客户端上传 UI (表单 + 拖拽 + 实时预览)
- ✅ 服务端 sharp 转码 + 原子写入
- ✅ 安全四件套:MIME 白名单 / 5MB 上限 / 路径穿越防护 / sharp metadata 二次校验
- ✅ `ActivityLog` 写入(P0-1 修复铺垫)
- ✅ 单测覆盖(MIME 拒绝 / 大小超限 / sharp 解析失败 / 路径非法)

**本期不在范围**:
- ❌ 阿里云 OSS 迁入(`ali-oss` 已装但未启用,见 ARCHITECTURE §环境陷阱 3)
- ❌ 图片裁剪 / 滤镜 / 多尺寸缩略图(规划 v2)
- ❌ CDN 加速 / WebP/AVIF 自适应

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| admin | 给顺德大良店上传主图 | 拖拽 jpg → 实时预览 → 保存 → `/agent/store/[id]` 立即更新 | P0 |
| admin | 误传 exe 文件 | 服务端拒绝 + 返回 400 + 友好文案 | P0 |
| admin | 5MB+ 文件 | 服务端拒绝 + 返回 413 + UI 红字提示 | P0 |
| admin | 试图通过 `entityId=../../etc` 越权 | 服务端拒绝 + 返回 400 + 写日志 | P0 |
| editor | 想给文章换头图 | `/admin/articles/[id]` 出现「上传头图」入口,行为同 store | P1 |
| 站长 | 想看谁上传了图 | `/admin/audit-logs` 过滤 `action=upload.image` | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 说明 |
|---|---|---|---|---|
| F1 | 上传 jpg / png / webp(≤ 5MB) | P0 | ✅ | `src/app/api/upload/route.ts:18-26` |
| F2 | sharp 转 WebP(q=80) | P0 | ✅ | `route.ts:140` |
| F3 | 原子写入(临时文件 + rename) | P0 | ✅ | `route.ts:147-159` |
| F4 | 类型白名单(MIME + metadata 二次校验) | P0 | ✅ | `route.ts:19, 100-137` |
| F5 | 大小限制 5MB | P0 | ✅ | `route.ts:18, 92-98` |
| F6 | 路径穿越防护(entityId 过滤 `/\\..`) | P0 | ✅ | `route.ts:36-38` |
| F7 | 删除图片(物理 unlink + DB 置 null) | P0 | ✅ | `route.ts:191-251` |
| F8 | 实时预览(客户端 `URL.createObjectURL`) | P0 | ✅ | 客户端组件内 |
| F9 | 错误回显 + 重试 | P0 | ✅ | toast + 按钮 disabled 解除 |
| F10 | ActivityLog 写入 | P1 | 🟡 | **B3 修复任务**:在 POST / DELETE 成功后写 `action=upload.image` / `upload.delete` |
| F11 | 客户端 OSS 直传(免服务端中转) | P2 | ⚪ | v2 引入,需签发 STS |
| F12 | 缩略图自动生成(200×200 / 600×400) | P2 | ⚪ | v2,需 sharp pipeline 改造 |
| F13 | 图片裁剪 UI(react-image-crop) | P2 | ⚪ | v2,门店图常用 4:3 |

---

## 4. UI / 交互

### 4.1 视觉规范

- 拖拽区:虚线 `border-zinc-700` + 浅色 `bg-zinc-900`,hover 实线 `border-orange-500`
- 进度条:`bg-orange-500`(项目主色)
- 错误:红字 `text-red-500` + `<AlertCircle>` 图标
- 成功:绿字 `text-green-500` + `<Check>` 图标,3 秒后自动消失
- 已上传预览:`aspect-video` + `object-cover` + 删除按钮右上角悬浮

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `<StoreImageUploader>` | `src/components/admin/StoreImageUploader.tsx` | CC | 拖拽 + 预览 + 删除 |
| `<ArticleImageUploader>` | (规划) `src/components/admin/ArticleImageUploader.tsx` | CC | 复用 StoreImageUploader 内部逻辑 |
| `<TrackedImage>` | (规划) `src/components/shared/TrackedImage.tsx` | CC | 自动埋点 `image_view` |

### 4.3 上传流程时序

```
[用户]               [UI Client]                 [API /api/upload]             [sharp]      [FS]            [Prisma]
  │  选文件             │                              │                          │            │                │
  │ ──────────────────>│                              │                          │            │                │
  │                    │ 1. 校验 client 侧 (type/size) │                          │            │                │
  │                    │ 2. POST form-data            │                          │            │                │
  │                    │ ────────────────────────────>│                          │            │                │
  │                    │                              │ 3. auth() + role=admin  │            │                │
  │                    │                              │ 4. 参数校验              │            │                │
  │                    │                              │ 5. sharp().metadata()   │            │                │
  │                    │                              │ ───────────────────────>│            │                │
  │                    │                              │ 6. sharp().webp(q80)    │            │                │
  │                    │                              │ ───────────────────────>│            │                │
  │                    │                              │ 7. writeFile tmp        │            │                │
  │                    │                              │ ────────────────────────────────────>│                │
  │                    │                              │ 8. rename tmp → final  │            │                │
  │                    │                              │ ────────────────────────────────────>│                │
  │                    │                              │ 9. prisma.store.update  │            │                │
  │                    │                              │ ─────────────────────────────────────────────────────>│
  │                    │ 10. {success,data:{path}}    │                          │            │                │
  │                    │ <────────────────────────────│                          │            │                │
  │  预览更新           │                              │                          │            │                │
  │ <──────────────────│                              │                          │            │                │
```

---

## 5. 数据模型

### 5.1 涉及表 / 字段

```
DB: Store.imagePath          # 详见 ../../database/SCHEMA.md §4
DB: Store.imageUrl           # 过渡期字段(OSS 时代遗留),优先级低于 imagePath
```

字段语义:

- `imagePath`(本期主):本地存储相对路径,格式 `/images/<entityDir>/<id>.webp`,例:`/images/stores/clxxxabcde.webp`
- `imageUrl`(过渡):OSS 旧字段,读取时 `getStoreImage()` 优先取 `imagePath`,见 `src/lib/image.ts:21-30`

### 5.2 存储策略

| 实体 | 路径前缀 | 文件名 | 大小限制 | 转码 |
|---|---|---|---|---|
| `store` (本期) | `public/images/stores/` | `<storeId>.webp` | 5MB | WebP q=80 |
| `article` (v1) | `public/images/articles/` | `<articleId>.webp` | 5MB | WebP q=80 |
| `avatar` (v2) | `public/images/avatars/` | `<userId>.webp` | 2MB | WebP q=85,裁 256×256 |
| `certification` (v2) | `public/images/certifications/` | `<certId>.webp` | 3MB | WebP q=85 |
| `product` (v2) | `public/images/products/` | `<topic>/<model>/<n>.webp` | 5MB | WebP q=85 |

**当前实现**:本地存储(`public/images/<entity>/<id>.webp`) + sharp 处理
**规划迁移**:阿里云 OSS(`ali-oss` 已装入 `package.json`,但未在 `src/app/api/upload/route.ts` 调用;v2 通过 STS 直传实现,免服务端中转)

### 5.3 命名规则

- 文件名 = `entityId + .webp`(服务端拼接,绝不接受用户上传的文件名)
- `entityId` 防御性过滤:`/[\\\.]/` 或包含 `..` 抛 `Error("非法的 entityId")`
- 一个实体对应一张主图(覆盖写,旧文件先 unlink)

---

## 6. API 接口

### 6.1 `POST /api/upload`

| 项 | 值 |
|---|---|
| Method | `POST` |
| 权限 | `admin` (auth + role) |
| Content-Type | `multipart/form-data` |
| Body 字段 | `file: File`, `entity: "store"\|"article"`, `entityId: string` |
| 响应 201 | `{ success: true, data: { path, size, width, height, mime } }` |
| 响应 400 | MIME 不合法 / sharp 解析失败 / 实体不支持 / city 被拒 |
| 响应 401 | 未认证 |
| 响应 403 | 角色非 admin |
| 响应 404 | 实体不存在 |
| 响应 413 | 文件 > 5MB |
| 响应 500 | sharp 异常 / FS 异常 |

完整实现:`src/app/api/upload/route.ts:59-189`

### 6.2 `DELETE /api/upload?entity=store&entityId=<id>`

| 项 | 值 |
|---|---|
| Method | `DELETE` |
| 权限 | `admin` |
| Query | `entity: "store"`, `entityId: string` |
| 响应 200 | `{ success: true, data: { path: null } }` |
| 响应 404 | 实体或图片不存在 |

**防穿越**:删除前 `if (store.imagePath.startsWith("/images/"))` 检查,确保只删 public 下文件。

完整实现:`src/app/api/upload/route.ts:191-251`

### 6.3 安全矩阵

| 风险 | 防护 | 代码位置 |
|---|---|---|
| 文件类型伪造(MIME 欺骗) | MIME 白名单 + sharp metadata 二次验证 | `route.ts:19, 100-137` |
| 路径穿越 | `entityId` 字符黑名单 + 服务端独立拼路径 | `route.ts:36-44` |
| 任意实体写入 | `SUPPORTED_ENTITIES` 白名单 + `REJECTED_ENTITIES` 黑名单(city) | `route.ts:20-31` |
| 大文件 DoS | 5MB 硬上限 + 早返回 413 | `route.ts:18, 92-98` |
| 写半文件 | 临时文件 + `fs.rename` 原子替换 | `route.ts:147-159` |
| 越权(普通用户上传) | `auth()` + `role !== 'admin'` 拒绝 | `route.ts:46-55, 61-65` |

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [x] 拖拽 / 选择上传两种入口
- [x] 实时预览(上传前 + 上传后)
- [x] 删除(物理 + DB)
- [x] 错误回显 + 重试
- [ ] 客户端 abort(用户取消)时清理未完成请求
- [ ] F10 ActivityLog 写入(B3 任务,本期补齐)

### 7.2 性能

- [ ] 5MB jpg 转码 + 写入 < 3s(Lighthouse Throttled)
- [ ] 删除操作 < 200ms
- [ ] 上传期间 UI 不冻结(用 `URL.createObjectURL` 异步)

### 7.3 质量门

- [x] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [x] `npm run build` 通过
- [ ] vitest 单元测试覆盖:
  - [ ] MIME 拒绝(text/plain)
  - [ ] 大小超限(> 5MB)
  - [ ] sharp 解析失败(伪 jpg)
  - [ ] entityId 含 `../` 拒绝
  - [ ] DELETE 物理文件不存在不报错
- [ ] Playwright e2e:admin 上传 + 删除完整流程

### 7.4 安全

- [x] MIME 白名单(`image/jpeg|png|webp`)
- [x] 大小限制(5MB)
- [x] 路径穿越(`/[\\\.]/` + `..`)
- [x] 权限(auth + admin role)
- [ ] CSRF(NextAuth 自带)
- [ ] 输入 Zod 校验(目前 formData 解析,需 Zod schema 增强)
- [ ] F10 ActivityLog 写入审计

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 初版横切 PRD,从 `IMAGE_MANAGEMENT_PRD_2026-06-10.md` admin 版拆出;补 F10 ActivityLog 计划 + 安全矩阵 + 完整 8 节 | Coya |
| 2026-06-10 | v0 | (历史) `admin/IMAGE_MANAGEMENT_PRD_2026-06-10.md` 仅覆盖 store 实体 | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md §5.4](../00_MASTER_PRD.md) — 横切功能索引
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 审计源
- [../../database/SCHEMA.md §4](../../database/SCHEMA.md) — `Store` 表字段
- [../../src/lib/image.ts](../../src/lib/image.ts) — `getStoreImage()` 字段优先级
- [../../src/app/api/upload/route.ts](../../src/app/api/upload/route.ts) — 当前实现
- [../../../ARCHITECTURE.md §环境陷阱](../../../ARCHITECTURE.md) — `ali-oss` 未启用说明

## 附录 B: 迁移到 OSS 的规划(v2)

| 阶段 | 内容 | 触发条件 |
|---|---|---|
| Phase 1 | 维持本地 + 加 CDN(Cloudflare R2 / 七牛) | 单实例磁盘 ≥ 10GB |
| Phase 2 | OSS 私有桶 + 服务端代理(仍走 `/api/upload`) | 跨实例需求 |
| Phase 3 | OSS 公有桶 + STS 签名 + 客户端直传(免中转) | 日上传 > 1000 次 |
| Phase 4 | OSS + 图片处理样式(缩略/裁剪/水印) | 需要 v2 缩略图 |
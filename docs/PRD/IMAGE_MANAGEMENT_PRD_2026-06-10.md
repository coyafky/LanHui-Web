# PRD — 图片管理系统重构

| 字段 | 值 |
|---|---|
| **版本** | v1.2 |
| **日期** | 2026-06-10 |
| **作者** | Claude (prompt-boost) |
| **状态** | 待评审 |
| **变更说明** | v1.1 — 用户澄清：City 不需要图片（图片复用 Province），范围从"5 实体联动"缩为"仅 Store"<br>v1.2 — 用户补充业务背景：**门店数量少 + 图片少**，明确采用"最简单最容易"的本地存储方案；强调"完善新建门店的图片逻辑，必须是上传而非URL" |
| **关联 Bug 报告** | `docs/test-reports/STORE_SUBMIT_TEST_2026-06-10.md`（BUG-1 P0） |

---

## 0. 业务背景与设计原则

> 本节是本 PRD 的"为什么"——所有架构决策的根因。

### 0.1 业务背景（用户 2026-06-10 明确）

- **当前门店数量少**：蓝辉轻改仍处于线下扩张初期阶段，自营/合作门店总数有限（个位到十几家量级）
- **图片数量少**：每店仅 1 张主图，无图集、无视频、无富媒体
- **部署模式**：当前及可预见未来是单机部署（`output: "standalone"` + Docker + nginx 单节点）
- **核心痛点**：当前「新建门店」表单用 `<input type="url">` 让用户手动输入外链图片 URL，**违反用户真实使用习惯**（90%+ 场景是上传本地文件）

### 0.2 设计原则

| 原则 | 解读 |
|---|---|
| **最简单、最容易** | 任何架构决策都优先选"少依赖、少配置、少运维"的方案 |
| **本地存储优先** | 数据量小 → 走 `public/` 文件系统，零运维、零成本 |
| **上传优于 URL** | 用户体验上必须是"选文件 → 上传"而非"复制 URL → 粘贴" |
| **未来可调整** | 架构上预留抽象（`ImageEntity` / Storage interface），未来若门店扩到 100+ 或转分布式，可平滑切换存储方式 |
| **符合当前规模** | 不为"未来可能的规模"过度设计，不引入 OSS / S3 / CDN / 缩略图等当前不需要的能力 |

### 0.3 未来扩缩触发条件（信息性，非本期任务）

| 触发条件 | 应对方案 | 优先级 |
|---|---|---|
| 门店数量 > 50 张图片 | 考虑接入阿里云 OSS（项目已装 `ali-oss` 依赖） | v2 |
| 多节点部署 | 必须切 OSS / S3（local FS 无法跨节点共享） | v2 |
| 出现"图集/相册"需求 | 扩展 `StoreImage` 关联表，1:N 关系 | v3 |
| 视频内容 | 单独走视频存储方案 | v3 |

---

## 1. 背景与问题陈述

### 1.1 现状盘点

| 实体 | 当前图片字段 | 存储位置 | 写入路径 | 本期范围 |
|---|---|---|---|---|
| **Store** | `imageUrl: String?` (URL 字符串) | 远程 URL 或 public/images/store/* | 表单 `<input type="url">` 手动输入 | ✅ **核心实体**（需上传 + webp） |
| Province | `imageUrl: String?` | 同上 | 同上 | ⏭️ 暂不接入 |
| City | `imageUrl: String?` | 同上 | 同上 | ❌ **不需要图片**（前端复用 Province 图片） |
| Article | `featuredImage: String?` | 同上 | 表单 / 编辑器 | ⏭️ 暂不接入（schema 已有 `or(z.literal(""))` 修复） |
| Product | 静态数据，`productImageMap` | `public/images/products/*` | 静态映射 | ⏭️ 暂不接入（产品是写死数据） |

**核心结论**：
- 本期 **只做 Store** 的图片管理系统
- **City 不需要 webp、不需要图片字段**（城市列表/详情页将直接复用 Province 的图片）
- Province / Article / Product 暂不接入，但本期要预留可扩展的架构（抽象 ImageEntity 接口），后续可平滑扩展

所有实体的图片管理逻辑**完全分散且无统一抽象**：
- 图片是 URL 字符串（Zod 用 `z.string().url().optional()` 校验）
- 没有上传通道（用户必须先找图床，复制 URL，再粘贴）
- **新建门店时被强制要求填 URL**（与用户真实使用习惯冲突）
- 没有删除/替换流程
- 没有服务端的格式/大小校验
- 没有服务端转码压缩

### 1.2 已发现的关键问题

来自 `STORE_SUBMIT_TEST_2026-06-10.md` 端到端实测：

| Bug | 严重度 | 现象 |
|---|---|---|
| **BUG-1** | 🔴 P0 | `imageUrl` schema 为 `.url().optional()`，但表单默认 `""`（空串）触发 zod 拦截，导致"不填图片就无法提交门店"，**直接阻塞核心流程** |
| BUG-3 | 🟡 P2 | API 500 时前端无任何错误提示 |

**根因分析**：「图片」与「实体创建」在同一个表单中耦合：
- 表单含 `imageUrl` 必填校验节点（zod `.url()` 强校验）
- 但 URL 来源依赖用户**手动输入外链**（违反使用习惯）
- 实际场景中 90%+ 的图片是**上传本地文件**，不是 URL
- 结论：**产品方向错误**——应该"上传"而非"填 URL"

### 1.3 用户真实需求（来自原始输入 + 后续澄清）

**原话 1**：
> "重新修改我们的图片设置，比如说我们可以直接在 public 中存储图片，然后我们再执行，而且我们可以支持先建设店铺然后再上传图片到店铺中。"

**原话 2**（澄清）：
> "因为我们目前的店的话是比较少的，这个是背景……我们就先使用这个图片的话，使用本地存储的形式……如果等后续的话，我们再调整对应的图片的存储方式。目前的话，我们是使用最简单、最容易的方式来方案来执行这个图片的事情。而且你要完善我们创新店的图片逻辑，肯定是上传的，而不是说输入一个URL。"

**翻译**：
1. **业务背景**：门店少 + 图片少 + 单机部署 → **本地存储足够**
2. **存储介质**：直接存到 `public/` 目录（静态资源路径），不走图床/OSS
3. **存储可调整**：未来若规模扩大（门店 50+ 或多节点），可切到 OSS/S3（架构预留）
4. **流程解耦**：先创建门店（无图），再单独为门店上传/管理图片
5. **核心体验要求**：**新建门店的图片逻辑必须是「上传」而非「输入 URL」** ← 这是本 PRD 的核心修复点
6. **范围聚焦**：本期只做 **Store**（门店），其他实体（Province / City / Article / Product）暂不接入
7. **City 明确不要图片**：城市页/城市列表的封面图复用 Province 的图片

---

## 2. 目标与非目标

### 2.1 目标（In Scope）

| # | 目标 | 衡量指标 |
|---|---|---|
| **G0** | **新建门店的图片逻辑是「上传」而非「输入 URL」** | StoreForm 不再含 `<input type="url">`；改为「创建后上传」两段式工作流 |
| G1 | 提供"实体创建"与"图片上传"两段式工作流 | 新建门店表单不再含图片字段 |
| G2 | 图片以文件形式存储在 `public/images/stores/` | 数据库中存相对路径（`/images/stores/100008.webp`） |
| G3 | 支持服务端自动转码为 webp（降低带宽） | 上传 1MB jpg → 落盘 ~200KB webp |
| G4 | 文件类型 / 大小校验 | 仅 jpg/png/webp，最大 5MB |
| G5 | **仅 Store 一个实体接入**（本期范围） | City 复用 Province 图片，不参与 |
| G6 | 覆盖 Store 主图场景的 P0 Bug 修复 | BUG-1 关闭，回归测试通过 |
| G7 | 预留可扩展的架构（`ImageEntity` 抽象 + Storage interface），未来可平滑切换存储方式 | 上传组件支持 `entity` 参数；存储层预留接口，未来可切 OSS |

### 2.2 非目标（Out of Scope，本期不做）

- ❌ 多图 / 图集（每实体仅 1 张主图）
- ❌ **云端存储（OSS / S3 / CDN）**—— 走 `public/` 文件系统（当前规模不需要）
- ❌ 图片裁剪、滤镜
- ❌ 多尺寸缩略图自动生成（v1 仅原图 + webp 转码）
- ❌ 富文本内嵌上传（仅实体主图）
- ❌ 历史 URL 图片的批量迁移（仅支持新上传）
- ❌ 病毒扫描、CDN 加速

### 2.3 关键决策记录

| 决策 | 选择 | 理由 |
|---|---|---|
| 存储介质 | **`public/` 本地文件系统** | 用户明确："门店少 + 图片少 + 最简单最容易"；零依赖、零成本、与现有静态资源同构；当前规模足够 |
| 存储可调整性 | **架构预留 Storage interface** | 未来若门店 50+ 或多节点部署，可切 OSS（项目已装 `ali-oss`）；不在本期实施但代码层面预留 |
| 路径策略 | 按 ID 平铺 | `/public/images/stores/100008.webp`，简洁、迁移友好 |
| 转码格式 | webp（统一） | 体积比 jpg 小 25-35%，兼容性 >95% |
| **核心交互** | **「上传」而非「输入 URL」** | 用户 2026-06-10 明确要求：完善新建门店的图片逻辑必须是上传；这是本 PRD 的核心体验修复点 |
| **实体范围** | **仅 Store（本期）** | 用户明确：City 不需要图片，其他实体暂不接入；架构预留 `ImageEntity` 抽象，未来可扩 |
| 流程编排 | 创建后 → 进入图片管理 | 提交成功后跳转到"图片管理"页而非列表页 |
| **City 图片处理** | **复用 Province 图片** | 城市列表/详情页不单独维护图片；Province 有图用 Province 的，Province 无图用全国默认图 |

---

## 3. 用户故事

### US-1: 管理员新建门店（不带图）

> 作为**门店管理员**，我希望快速新建一家门店的基本信息，**不必立刻准备图片**。

**Acceptance**：
- 表单不再有"门店图片"输入框
- 提交成功后跳转至 `/admin/stores/{id}/image` 页面
- 该页面提示「请上传门店主图」+「稍后上传」按钮（回到列表）

### US-2: 管理员为门店上传图片

> 作为**门店管理员**，我希望上传一张门店主图，**无需去图床复制 URL**。

**Acceptance**：
- 在 `/admin/stores/{id}/image` 页面有拖拽 / 点击上传区
- 上传后立即显示预览 + 进度条
- 上传成功刷新页面，显示已上传图片
- 已有图时显示「替换」按钮

### US-3: 管理员替换/删除图片

> 作为**门店管理员**，我希望可以更换一张更好的图或删除当前图。

**Acceptance**：
- 「替换」按钮触发新上传（自动覆盖旧文件）
- 「删除」按钮二次确认后删除文件 + 清除数据库字段
- 删除后回到 US-2 的「待上传」状态

### US-4: 游客在前台看到正确图片

> 作为**访客**，我希望在前台看到门店主图，**无图片时显示占位图**。

**Acceptance**：
- Store `imagePath` 为空时使用统一占位图（如 `/images/placeholders/store.webp`）
- City 页面：复用 Province 的图片；若 Province 无图，用全国默认图 `/images/placeholders/province.webp`
- 有图时使用 Next.js `<Image>` 组件做响应式优化

### US-5: 未来扩展到其他实体（本期不做）

> 作为**架构师**，我希望当前实现支持未来平滑扩展到 Province / Article 等实体。

**Acceptance（架构层面，本期需满足）**：
- `EntityImageUploader` 组件支持 `entity` 枚举（类型预留 `'store' | 'province' | 'article' | 'product'`），但本期只实现 `entity="store"` 分支
- 上传 API 接受 `entity` 参数，本期只接受 `"store"`，其他值返回 400
- 路径生成逻辑函数化（`buildImagePath(entity, entityId)`），便于未来加新实体
- 文档明确列出"未来扩展清单"

---

## 4. 架构设计

### 4.1 存储布局

```
public/images/
├── stores/                  # Store 实体主图（本期唯一支持的目录）
│   ├── 100008.webp
│   ├── 100009.webp
│   └── ...
├── placeholders/            # 占位图（无主图时使用）
│   ├── store.webp
│   ├── province.webp
│   ├── city.webp
│   ├── article.webp
│   └── product.webp
└── brand/                   # 现有品牌资源（不动）
```

**数据库字段**：Store 从 `imageUrl: String?` 改为 `imagePath: String?`，值如 `/images/stores/100008.webp`

**路径规则（本期仅 Store）**：
- 单层目录：`/public/images/stores/{id}.webp`
- 统一后缀 `.webp`（强制转码后）
- 命名：Store 用数字 ID（`100008`），路径为 `/images/stores/100008.webp`

**未来扩展（架构预留）**：
| 实体 | 路径模板 | 命名 |
|---|---|---|
| Province | `/public/images/provinces/{slug}.webp` | 省份 slug（如 `guangdong`） |
| Article | `/public/images/articles/{id}.webp` | Article cuid |
| Product | `/public/images/products/{slug}.webp` | 产品 slug |

**City 明确无图片**（不创建 `cities/` 目录）。

### 4.2 服务端组件

#### 4.2.1 共享上传 API

**单端点设计**（未来扩展零成本）：

```
POST /api/upload
  Headers: Content-Type: multipart/form-data
  Body:
    file: File              ← 必填，<=5MB
    entity: "store" | "province" | "article" | "product"
            // 本期只接受 "store"，其他值返回 400
            // 显式不含 "city"——城市不需要图片
    entityId: string        ← 已存在的实体 ID（Store 是 6 位数字字符串）
  Auth: admin
  Response 201:
    { success: true, data: { path: "/images/stores/100008.webp", size: 184320, width: 1920, height: 1280 } }
  Response 400: { success: false, error: "文件类型不支持" | "文件超过 5MB" | "不支持的实体类型" | ... }
  Response 401/403: { success: false, error: "未认证" | "权限不足" }
  Response 404: { success: false, error: "实体不存在" }
```

**关键流程**：
1. 校验 auth + role
2. 校验 entity 类型 + entityId 存在
3. 校验 MIME（image/jpeg | image/png | image/webp）
4. 校验 size（≤ 5MB）
5. 用 `sharp` 转码为 webp，质量 80
6. 写入 `public/images/{entity}/{entityId}.webp`（**覆盖语义**）
7. 更新对应实体的 `imagePath` 字段
8. 清理旧的图片文件（如果存在且路径不同）
9. 返回新路径

**单端点 vs 多端点**：
- ✅ 单端点：逻辑集中（转码、限流、路径生成在一处）
- ✅ 客户端调用简单（`fetch('/api/upload', { formData })`）
- ✅ 未来增加新实体零成本

#### 4.2.2 删除 API

```
DELETE /api/upload?entity=store&entityId=100008
  Auth: admin
  Response 200: { success: true }
  Response 404: { success: false, error: "实体或图片不存在" }
```

**流程**：
1. 校验 auth + role
2. 查询实体，确认 `imagePath` 不为 null
3. 删除 `public/` 下对应文件
4. 实体 `imagePath = null`

#### 4.2.3 实体字段更新

| 实体 | 旧字段 | 新字段 | 本期处理 |
|---|---|---|---|
| **Store** | `imageUrl: String?` | `imagePath: String?` | ✅ **本期实施** |
| Province | `imageUrl: String?` | — | ⏭️ 暂不处理 |
| **City** | `imageUrl: String?` | — | ❌ **不处理**（城市无图片，保留字段但不参与新流程） |
| Article | `featuredImage: String?` | — | ⏭️ 暂不处理（schema 已有 `or(z.literal(""))` 修复 BUG-1） |
| Product | 静态 `productImageMap` | — | ⏭️ 暂不处理（产品是写死数据） |

**Store 字段策略（过渡期）**：
- 本期在 Store 表**新增** `imagePath: String?` 字段
- 旧字段 `imageUrl` 保留（标记 deprecated）
- 前台展示优先 `imagePath` → fallback `imageUrl` → fallback 占位图
- 下个大版本再删 `imageUrl`

### 4.3 客户端组件

#### 4.3.1 共享 `EntityImageUploader`

文件：`src/components/admin/EntityImageUploader.tsx`（**新建**）

```tsx
// 实体类型定义为预留扩展点（本期只实现 store）
export type ImageEntity = "store" | "province" | "article" | "product";
// 显式不含 "city"——城市不需要图片

interface EntityImageUploaderProps {
  entity: ImageEntity;     // 本期只接受 "store"
  entityId: string;
  currentPath: string | null;
  placeholderPath: string;
  onUploadSuccess: (newPath: string) => void;
  onDeleteSuccess: () => void;
}
```

**功能**：
- 拖拽上传（FileDropzone）
- 点击选择文件
- 上传进度条
- 当前图片预览（用 Next.js `<Image>`）
- 「替换」按钮
- 「删除」按钮 + 二次确认对话框
- 错误提示（toast）

#### 4.3.2 本期仅 1 个管理页面

| 路径 | 用途 | 本期 |
|---|---|---|
| `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` | Store 图片管理 | ✅ **本期实施** |
| `src/app/admin/(dashboard)/provinces/[slug]/image/page.tsx` | Province 图片管理 | ⏭️ 未来 |
| `src/app/admin/(dashboard)/articles/[id]/image/page.tsx` | Article 图片管理 | ⏭️ 未来 |
| `src/app/admin/(dashboard)/products/[slug]/image/page.tsx` | Product 图片管理 | ⏭️ 未来 |
| — | City 图片管理 | ❌ **不创建** |

**Store 图片管理页面薄壳**：
```tsx
export default function StoreImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <EntityImageUploader
      entity="store"
      entityId={id}
      placeholderPath="/images/placeholders/store.webp"
      ...
    />
  );
}
```

### 4.4 数据流（创建门店 → 上传图片）

```
┌────────────────────────────────────┐
│ 1. /admin/stores/new               │
│    填表（无图片字段）              │
│    点击「创建门店」                │
└──────────────┬─────────────────────┘
               │ POST /api/stores
               ▼
┌────────────────────────────────────┐
│ 2. API 验证 + 创建                 │
│    返回 data.id = "100008"         │
└──────────────┬─────────────────────┘
               │ router.push("/admin/stores/100008/image")
               ▼
┌────────────────────────────────────┐
│ 3. /admin/stores/100008/image      │
│    显示「请上传门店主图」+ 上传区   │
│    用户拖入 jpg 1.5MB              │
└──────────────┬─────────────────────┘
               │ POST /api/upload (multipart)
               ▼
┌────────────────────────────────────┐
│ 4. API: 校验 + 转码 + 落盘 + 改库 │
│    返回 path = "/images/stores/   │
│                100008.webp"        │
└──────────────┬─────────────────────┘
               │ onUploadSuccess
               ▼
┌────────────────────────────────────┐
│ 5. 页面显示已上传的图片预览        │
│    「替换」「删除」按钮可点        │
└────────────────────────────────────┘
```

---

## 5. 数据库迁移

### 5.1 Prisma Schema 变更

```prisma
// schema.prisma 增量（本期仅 Store）
model Store {
  // ... 现有字段保持不变
  imageUrl   String?  // 旧字段（保留过渡期，标记 deprecated）
  imagePath  String?  // 新字段：相对路径如 "/images/stores/100008.webp"
}

// Province / City / Article / Product 本期不动 schema
// 未来如需扩展，按以下模板补全：
//   model Province { imagePath String? }
//   model Article  { imagePath String? }
//   model Product  { imagePath String? }
// City 明确不补——城市不需要图片
```

### 5.2 迁移步骤

1. `prisma migrate dev --name add_image_path_fields`
2. 编写数据回填脚本（如有历史图片）：
   - 旧 `imageUrl = "/images/store/xxx.jpg"` → 新 `imagePath = imageUrl`（兼容相对路径）
   - 旧 `imageUrl = "https://example.com/xxx.jpg"` → 不迁移，保留外链
3. 不删除旧字段（标记 deprecated）

### 5.3 数据回填脚本（伪代码）

```ts
// scripts/migrate-image-paths.ts
const stores = await prisma.store.findMany({ where: { imagePath: null, imageUrl: { not: null } } });
for (const s of stores) {
  // 相对路径直接迁移；远程 URL 不动
  if (s.imageUrl?.startsWith("/images/")) {
    await prisma.store.update({ where: { id: s.id }, data: { imagePath: s.imageUrl } });
  }
}
```

---

## 6. API 详细规格

### 6.1 `POST /api/upload`

**Request**：
```
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----
Cookie: <admin session>

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="store-front.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary
Content-Disposition: form-data; name="entity"

store
------WebKitFormBoundary
Content-Disposition: form-data; name="entityId"

100008
------WebKitFormBoundary--
```

**Response 201**：
```json
{
  "success": true,
  "data": {
    "path": "/images/stores/100008.webp",
    "size": 184320,
    "width": 1920,
    "height": 1280,
    "mime": "image/webp"
  }
}
```

**Response 400**（文件类型错误）：
```json
{ "success": false, "error": "文件类型不支持，仅允许 jpg/png/webp" }
```

**Response 413**（文件过大）：
```json
{ "success": false, "error": "文件大小超过限制（最大 5MB）" }
```

**Response 404**（实体不存在）：
```json
{ "success": false, "error": "门店不存在" }
```

**Response 401/403**：同现有 API 模式

### 6.2 `DELETE /api/upload`

**Request**：
```
DELETE /api/upload?entity=store&entityId=100008 HTTP/1.1
Cookie: <admin session>
```

**Response 200**：
```json
{ "success": true, "data": { "path": null } }
```

**Response 404**：
```json
{ "success": false, "error": "图片不存在" }
```

### 6.3 受影响 API（图片字段语义）

| API | 旧行为 | 新行为 | 影响范围 |
|---|---|---|---|
| `POST /api/stores` | 接受 `imageUrl: string` | **移除** `imageUrl` 字段；`imagePath` 只能通过 `/api/upload` 写入 | ✅ 本期 |
| `PUT /api/stores/{id}` | 接受 `imageUrl: string` | **移除** `imageUrl` 字段（PUT 不再处理图片） | ✅ 本期 |
| `GET /api/stores` | 返回 `imageUrl` | 额外返回 `imagePath`（前端优先使用） | ✅ 本期 |
| `GET /api/stores/{id}` | 同上 | 同上 | ✅ 本期 |
| `GET /api/provinces` 等 | 返回 `imageUrl` | **不改** | ⏭️ 暂不处理 |
| `/api/articles` 系列 | 处理 `featuredImage` | **不改** | ⏭️ 暂不处理（schema 已有 BUG-1 修复） |

**关键点**：所有改动**只影响 Store 相关 API**，其他实体的 API 本期零改动。

---

## 7. UI/UX 详细设计

### 7.1 创建门店表单（变更后）

```
┌──────────────────────────────────────┐
│ ➕  新建门店                          │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 基本信息                         │ │
│ │ • 门店名称 *                     │ │
│ │ • URL标识 (slug) *               │ │
│ │ • 省份 * → 城市 *                │ │
│ │ • 区域                           │ │
│ │ • 详细地址 *                     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 联系方式                         │ │
│ │ • 联系电话 *                     │ │
│ │ • 营业时间                       │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 门店描述                         │ │
│ │ [textarea]                       │ │
│ └──────────────────────────────────┘ │
│                                      │
│  💡 创建后下一步：上传门店主图        │
│                                      │
│  [取消]              [创建门店]      │
└──────────────────────────────────────┘
```

**关键点**：
- 表单底部新增提示文字，引导用户下一步
- 无 imageUrl 字段
- 提示颜色：orange-500 强调

### 7.2 图片管理页面（新建）

```
┌──────────────────────────────────────┐
│ ← 返回列表     门店主图   顺德大良店  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │         [图片预览 / 上传区]       │ │
│ │                                  │ │
│ │   拖拽图片到此处，或点击选择       │ │
│ │   支持 jpg / png / webp，≤ 5MB   │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│  [已上传] 路径：/images/stores/      │
│             100008.webp              │
│             大小：180KB              │
│             尺寸：1920×1280          │
│                                      │
│  [替换图片]              [删除图片]   │
└──────────────────────────────────────┘
```

**状态机**：
- 无图：显示上传区（虚线框 + 引导文字）
- 上传中：显示进度条
- 已上传：显示图片预览 + 元信息 + 操作按钮
- 错误：显示错误 toast + 重试按钮

### 7.3 前台展示 fallback

```tsx
// src/lib/image.ts
export function getStoreImage(store: Store): string {
  return store.imagePath     // 新字段
      ?? store.imageUrl      // 旧字段（过渡期）
      ?? "/images/placeholders/store.webp";  // 占位
}

/**
 * 城市页/城市列表的图片：复用 Province 的图片
 * 城市本身没有自己的图片字段
 */
export function getCityImage(
  city: City,
  provinceImageUrl: string | null,
): string {
  return provinceImageUrl
      ?? "/images/placeholders/province.webp";
}
```

**本期仅实现** `getStoreImage`。`getCityImage` 显式声明 "复用 Province"，避免未来误给 City 加图片字段。

---

## 8. 安全与限制

| 维度 | 策略 |
|---|---|
| **认证** | 所有写操作需 admin role（与现有 API 一致） |
| **文件类型白名单** | `image/jpeg`, `image/png`, `image/webp`（服务端用 `sharp().metadata()` 二次验证，不仅看 MIME） |
| **文件大小** | ≤ 5MB（用 `request.formData()` 的 stream 边读边查，超过立即中断） |
| **路径安全** | 路径由服务端**根据 entity + entityId 拼接**，不接受用户输入的文件名；防 `../` 目录穿越 |
| **病毒扫描** | 不在 v1 范围（内网低风险环境） |
| **频率限制** | 每 IP 每分钟 10 次（v1 用简单内存计数器，v2 接入 Redis） |
| **存储上限** | 不限制总文件数（开发期）；生产期按需监控 `public/images/` 体积 |
| **Web 安全** | 设置 `Content-Security-Policy` 允许 `self` 来源图片 |

---

## 9. 验收标准（Acceptance Criteria）

### 9.1 核心功能

- [ ] Store 创建表单不再有 imageUrl 字段
- [ ] Store 创建成功后跳转到 `/admin/stores/{id}/image`
- [ ] 拖拽 jpg → 2 秒内显示 webp 预览
- [ ] 上传后数据库 `imagePath = "/images/stores/100008.webp"`
- [ ] 替换图片时旧文件被物理删除
- [ ] 删除图片时 `imagePath` 变 null + 文件删除
- [ ] 5MB 超限文件被拒绝（提示"文件超过 5MB"）
- [ ] txt/pdf 伪装成 jpg 的文件被服务端 `sharp().metadata()` 拒绝

### 9.2 实体覆盖（本期仅 Store）

- [ ] Store `/admin/stores/{id}/image` 页面可访问、可上传、可替换、可删除
- [ ] 4 个预留 entity 参数中：传 `"store"` 正常；传 `"province"` / `"article"` / `"product"` 返回 400（"本期暂不支持"）
- [ ] 传 `"city"` 返回 400（"City 不支持图片"）
- [ ] **不创建** `/admin/cities/...` 路径
- [ ] **不修改** Province / Article / Product 的任何代码
- [ ] City 前台展示复用 Province 图片（验收：城市列表卡片 src === 对应 Province 的 imagePath）

### 9.3 核心体验验收（"上传而非URL"专项）

- [ ] **新创建门店流程中，StoreForm 不再含任何 URL 输入框**（无 `<input type="url">`、无 `imageUrl` 字段）
- [ ] 创建门店成功 → 自动跳转到 `/admin/stores/{id}/image` 页面
- [ ] 图片管理页面有清晰的「拖拽 / 点击上传」交互
- [ ] 不需要「输入 URL」或「外链图床」即可完成主图上传
- [ ] 旧字段 `imageUrl` 在 storeForm DOM 中不渲染（仅在数据库 schema 保留以便过渡）

### 9.4 端到端测试

- [ ] TC-A1 / TC-A2 重新跑过（不填 imageUrl 也可成功创建）
- [ ] BUG-1 在新流程下不复现
- [ ] 新增 TC-F1（上传流程 happy path）
- [ ] 新增 TC-F2（替换图片）
- [ ] 新增 TC-F3（删除图片）
- [ ] 新增 TC-F4（错误类型文件被拒）
- [ ] 新增 TC-F5（超大文件被拒）

### 9.5 类型与构建

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] 新增依赖 `sharp`（图片处理）记录到 `package.json`

### 9.6 性能

- [ ] 1MB jpg 上传 + 转码 + 落盘 ≤ 2 秒（本地环境）
- [ ] 列表页加载 100 条门店的 placeholder 图不卡顿（Next/Image lazy + blur placeholder）

---

## 10. 子任务列表（Dispatch 拆解建议）

| Task | 标题 | 涉及文件 | 估时 |
|---|---|---|---|
| **T1** | 安装 sharp + 创建 `/api/upload` 路由 | `package.json`, `src/app/api/upload/route.ts` (new) | 1h |
| **T2** | 扩展 Prisma schema（仅 Store 加 imagePath） | `prisma/schema.prisma`, `prisma/migrations/...` | 20min |
| **T3** | 数据回填脚本（imageUrl → imagePath） | `scripts/migrate-image-paths.ts` (new) | 20min |
| **T4** | 新建 `<EntityImageUploader>` 共享组件（支持 entity 枚举，本期只实现 store 分支） | `src/components/admin/EntityImageUploader.tsx` (new) | 2h |
| **T5** | **1 个** Store 图片管理页面 `/admin/stores/[id]/image` | `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` (new) | 30min |
| ~~T6~~ | ~~StoreForm 移除 imageUrl 字段~~ | ~~`src/components/admin/StoreForm.tsx`~~ | **取消**（见 T6'） |
| **T6'** | StoreForm 改造：使用 Article 同样的 `or(z.literal(""))` 模式保留字段兼容，表单移除输入框但保留字段 | `src/components/admin/StoreForm.tsx`, `src/lib/validations/store.ts` | 30min |
| **T7** | Store 创建成功跳转到 image 页 | `src/app/admin/(dashboard)/stores/new/page.tsx` | 15min |
| **T8** | （已并入 T6'） | — | — |
| ~~T9~~ | ~~5 实体的 form 同步移除 imageUrl~~ | ~~ProvinceForm / CityForm / ArticleForm~~ | **取消**（本期不动其他实体） |
| **T10** | 前台 `getStoreImage` + `getCityImage`（City 复用 Province） | `src/lib/image.ts` (new) | 1h |
| **T11** | 占位图资源（store + province） | `public/images/placeholders/{store,province}.webp` (new) | 20min |
| **T12** | E2E 测试（playwright-cli） | `docs/test-reports/IMAGE_UPLOAD_TEST_*.md` | 2h |
| **T13** | 文档（API + 用户操作手册） | `docs/API.md`, `docs/USER_GUIDE.md` | 1h |

**变更点**：
- T2 从"5 实体"缩为"仅 Store"
- T5 从"5 页面"缩为"1 页面"
- T9 取消（其他实体不动）
- T6/T8 合并为 T6'，采用 Article 既有模式（`or(z.literal(""))`）保留字段兼容

---

## 11. 风险与缓解

| 风险 | 等级 | 缓解 |
|---|---|---|
| `public/images/` 写入需要进程有写权限 | 中 | Dockerfile 显式 `chmod -R 755 public/images`；本地 dev 已可写 |
| **Docker 重建后上传的图片丢失** | 中 | docker-compose.yml 加 volume 挂载 `/app/public/images`；让上传文件落到宿主机 |
| Sharp 安装在某些平台编译失败（Alpine） | 中 | 优先用 `sharp` prebuilt binary；失败时回退到 `next/image` + 客户端 Canvas 压缩 |
| 替换图片时旧文件被新上传覆盖前删除，竞态 | 低 | 写入用临时文件 + rename 原子替换 |
| 未来门店扩到 50+，本地存储成瓶颈 | 低 | v1 不处理（当前规模不需要）；v2 切 OSS（项目已装 `ali-oss`，架构预留 Storage interface） |
| 多节点部署时 local FS 不可共享 | 中（未来） | v1 不处理；v2 切 OSS |
| 删除文件后 Next.js 静态资源缓存未刷新 | 中 | 文件名带 hash（`100008-a1b2c3.webp`）强制 cache-busting |

---

## 12. 后续可扩展点（v2+ 候选）

按业务规模递增排序：

| 阶段 | 触发条件 | 扩展点 |
|---|---|---|
| **v1（本期）** | 门店 < 30 | 本地 FS + webp 转码 + 1 张主图 |
| **v2（中期）** | 门店 30-100 / 单节点变多节点 | 切阿里云 OSS（项目已装 `ali-oss`）；架构已预留 Storage interface |
| **v3（远期）** | 出现"图集/相册"需求 | 扩展 `StoreImage` 关联表（1:N）；支持多张图 + 拖拽排序主图 |
| **v3+** | 视频内容 / 富媒体 | 单独走视频存储方案；考虑 CDN |
| **v4** | 国际化 | 多语言 alt 文本；图片懒加载策略调整 |

v2 候选功能列表：
- 切阿里云 OSS（替换 public/）
- 多图 / 图集：每个实体 1~N 张图
- 缩略图自动生成（thumbnail / medium / large）
- 图片裁剪（前端 Cropper.js + 服务端 sharp crop）
- 病毒扫描（ClamAV）
- 拖拽排序主图优先级

---

## 13. 开放问题（需用户决策）

| # | 问题 | 默认建议 |
|---|---|---|
| Q1 | 范围确认：本期是否仅做 Store？Province/Article 后续再做？ | ✅ **仅做 Store**（用户已确认） |
| Q2 | City 是否真的不参与（不创建 images/cities/ 目录，不接受 entity="city"）？ | ✅ **City 不参与**（用户已确认：城市页不需要 webp，图片复用 Province） |
| Q3 | `imagePath` 字段名是否统一？（`imagePath` vs `image` vs `coverImage`） | **`imagePath`**，明确语义为"相对路径" |
| Q4 | 是否在重构期保留 `imageUrl` 字段（双轨）还是直接替换？ | **保留过渡期**，v1 双字段，v2 删除旧字段 |
| Q5 | Product 实体当前是静态数据 + `productImageMap`，是否也接入？ | **本期不做**，作为下一期专项 |

---

## 14. 评审清单

- [x] 需求方确认范围（**仅 Store / 1 张图 / 自动 webp**）✅
- [x] 需求方确认 City **不需要图片** ✅
- [ ] 架构师确认存储路径（按 ID 平铺 + Docker volume）
- [ ] 安全评审确认鉴权与限流
- [ ] UI 评审确认图片管理页面交互
- [ ] QA 确认验收标准可测

---

## 附录 A：相关文件清单

**新建**（本期）：
- `src/app/api/upload/route.ts`
- `src/components/admin/EntityImageUploader.tsx`
- `src/lib/image.ts`
- `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` ← **仅此一个管理页**
- `scripts/migrate-image-paths.ts`
- `public/images/placeholders/store.webp`
- `public/images/placeholders/province.webp`（用于 City 列表 fallback）

**修改**（本期）：
- `package.json`（加 `sharp` 依赖）
- `prisma/schema.prisma`（**仅 Store** 加 `imagePath: String?` 字段）
- `prisma/migrations/...`（新建 migration）
- `src/lib/validations/store.ts`（采用 Article 模式 `or(z.literal(""))` 修复 BUG-1）
- `src/components/admin/StoreForm.tsx`（移除 imageUrl 输入框，但保留字段以便过渡）
- `src/app/admin/(dashboard)/stores/new/page.tsx`（提交后跳转到 image 页）
- `src/app/api/stores/route.ts`（POST/PUT 移除 imageUrl 字段接收，改为只接受 imagePath）
- `src/app/admin/(dashboard)/stores/[id]/page.tsx`（编辑页同步移除 imageUrl 字段）
- `src/app/(frontend)/...` Store 展示页（用 `getStoreImage` 替代硬编码 imageUrl）
- `src/lib/data.ts`（`mapApiStore` 增加 `imagePath` 字段映射）
- `docker-compose.yml`（加 `/app/public/images` volume 挂载）

**本期不修改**（明确 out of scope）：
- ❌ Province / Article / Product 任何代码
- ❌ City 字段（保留 imageUrl 但不参与新流程）
- ❌ Article schema（已有 BUG-1 修复）

**未来扩展（v2 候选）**：
- ⏭️ `src/app/admin/(dashboard)/provinces/[slug]/image/page.tsx`
- ⏭️ `src/app/admin/(dashboard)/articles/[id]/image/page.tsx`
- ⏭️ `src/app/admin/(dashboard)/products/[slug]/image/page.tsx`

**关联**：
- `docs/test-reports/STORE_SUBMIT_TEST_2026-06-10.md`（BUG-1 触发本次重构）

---

**评审通过后**，按 §10 的子任务列表分配给 Coder 实施。Q3-Q5 需在评审会上确认。

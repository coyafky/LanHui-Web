# 蓝辉轻改 CMS 系统全面测试报告

**测试日期**: 2026-06-09  
**测试人员**: 自动化测试  
**系统版本**: Next.js 16.2.1 + Prisma 7.8.0 + PostgreSQL

---

## 1. 测试环境信息

| 项目 | 详情 |
|------|------|
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Next.js | 16.2.1 (Turbopack) |
| React | 19.2.4 |
| Prisma | 7.8.0 (@prisma/adapter-pg) |
| 数据库 | PostgreSQL (localhost:5433/lanhui) |
| 开发服务器 | http://localhost:3100 |
| 认证方案 | next-auth 5.0.0-beta.31 (Credentials) |
| Zod版本 | 4.4.3 |
| OS | macOS (darwin 15.2) |

---

## 2. 测试范围

| 模块 | 覆盖功能 |
|------|----------|
| 数据库 | 表结构、Seed数据、自定义ID |
| API接口 | 门店CRUD、省市查询、文章列表 |
| 前端页面 | 首页、门店列表、门店详情、Admin登录 |
| Admin后台 | Dashboard统计、门店管理、认证保护 |
| TypeScript | 全量类型检查 |
| ESLint | 代码规范检查 |
| 代码审查 | RegionSelector、StoreForm、china-regions、data.ts、Dashboard |

---

## 3. 测试结果汇总

### 3.1 数据库连通性

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 数据库连接 | ✅ PASS | PostgreSQL 连接正常 |
| 表结构创建 | ✅ PASS | 2 migrations 成功应用 |
| Seed数据填充 | ✅ PASS | 用户1条、省份3条、城市6条、门店7条 |
| 自定义ID | ✅ PASS | 门店使用100001-100007 |
| 管理员账号 | ✅ PASS | admin@lanhui.com (admin/admin123) |

**门店数据确认:**

| ID | 名称 | slug |
|----|------|------|
| 100001 | 蓝辉轻改顺德大良店 | shunde-daliang |
| 100002 | 蓝辉轻改顺德容桂店 | shunde-ronggui |
| 100003 | 蓝辉轻改佛山南海店 | foshan-nanhai |
| 100004 | 蓝辉轻改南京江宁店 | nanjing-jiangning |
| 100005 | 蓝辉轻改苏州园区店 | suzhou-yuanqu |
| 100006 | 蓝辉轻改杭州萧山店 | hangzhou-xiaoshan |
| 100007 | 蓝辉轻改佛山禅城店 | foshan-chancheng |

### 3.2 API接口测试

| 端点 | 方法 | 状态 | 说明 |
|------|------|------|------|
| `/api/stores` | GET | ✅ 200 | 返回7条门店，分页正常 |
| `/api/stores/100001` | GET | ✅ 200 | 通过ID查询正常 |
| `/api/stores/shunde-daliang` | GET | ✅ 200 | 通过slug查询正常 |
| `/api/provinces` | GET | ✅ 200 | 返回3个省份含storeCount |
| `/api/cities?province=guangdong` | GET | ✅ 200 | 返回3个城市含storeCount |
| `/api/articles` | GET | ✅ 200 | 返回空列表（seed未含文章数据） |
| `/api/stores` (POST) | POST | ✅ 401 | 未认证正确拒绝 |

### 3.3 前端页面测试

| 页面 | 路径 | HTTP状态码 | 状态 |
|------|------|-----------|------|
| 首页 | `/` | 200 | ✅ PASS |
| 门店列表 | `/agent` | 200 | ✅ PASS |
| 门店详情(ID) | `/agent/store/100001` | 200 | ✅ PASS |
| 门店详情(slug) | `/agent/store/shunde-daliang` | 200 | ✅ PASS |
| Admin登录 | `/admin/login` | 200 | ✅ PASS |
| Admin首页(未认证) | `/admin` | 307 | ✅ PASS (正确重定向) |

### 3.4 TypeScript 检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| `tsc --noEmit` | ✅ PASS | 0 errors |

### 3.5 ESLint 检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ESLint | ⚠️ 4 warnings | 0 errors, 4 warnings (unused vars) |

**Lint警告详情:**

1. `src/app/admin/(dashboard)/analytics/page.tsx`: `PieChart` 和 `Pie` 已定义但未使用
2. `src/app/admin/(dashboard)/articles/page.tsx`: `router` 已赋值但未使用
3. `src/components/admin/StoreForm.tsx`: `selectClasses` 已赋值但未使用

---

## 4. 发现的问题清单

### 问题 #1：省市数据体系不统一 — RegionSelector 与数据库 slug 不匹配

| 属性 | 详情 |
|------|------|
| **严重程度** | 🔴 High |
| **影响范围** | Admin门店编辑表单、新增门店时城市选择 |
| **描述** | `china-regions.ts` 使用简单城市slug（如 `foshan`），而数据库中的城市slug使用复合格式（如 `foshan-shunde`、`foshan-nanhai`）。当编辑现有门店时，RegionSelector无法正确回显当前城市选择。 |
| **复现步骤** | 1. 访问 `/admin/stores/shunde-daliang`<br>2. 观察城市下拉框为空/未选中<br>3. 因为 `foshan-shunde` 不在 `getCitiesByProvince("guangdong")` 的返回列表中 |
| **建议修复** | 方案A：修改 china-regions.ts 添加三级区域数据匹配数据库结构；方案B：RegionSelector 改为从 `/api/cities` 动态获取城市列表而非使用静态 china-regions 数据 |

### 问题 #2：图片上传功能缺失 — 仅有URL输入

| 属性 | 详情 |
|------|------|
| **严重程度** | 🟡 Medium |
| **影响范围** | Admin门店图片管理 |
| **描述** | package.json 中依赖了 `ali-oss`，但系统中无任何图片上传组件或API。StoreForm 中门店图片仅为一个 URL 文本输入框，没有文件选择、上传、预览功能。 |
| **复现步骤** | 1. 打开 `/admin/stores/new`<br>2. 定位"门店图片 URL"字段<br>3. 只能手动输入URL，无法上传文件 |
| **建议修复** | 实现 ImageUpload 组件，集成 ali-oss SDK 进行文件上传，添加文件类型和大小验证，支持图片预览和删除 |

### 问题 #3：服务器重启后首次请求可能500

| 属性 | 详情 |
|------|------|
| **严重程度** | 🟡 Medium |
| **影响范围** | API 路由 `/api/stores/[id]` |
| **描述** | 在数据库重置后如果不重启开发服务器，`/api/stores/[id]` 接口会返回500错误。这是因为 Prisma Client 缓存了旧的连接状态。重启服务器后恢复正常。 |
| **复现步骤** | 1. 在服务器运行时执行 `prisma migrate reset --force`<br>2. 请求 `/api/stores/100001`<br>3. 返回 500 错误<br>4. 重启服务器后恢复 |
| **建议修复** | 在 `src/lib/prisma.ts` 中添加连接错误重试逻辑，或在开发环境中检测到连接断开时自动重建客户端 |

### 问题 #4：未使用变量（ESLint警告）

| 属性 | 详情 |
|------|------|
| **严重程度** | 🟢 Low |
| **影响范围** | 代码质量 |
| **描述** | 4处未使用变量：analytics页面的PieChart/Pie、articles页面的router、StoreForm的selectClasses |
| **复现步骤** | 运行 `npx eslint src/` |
| **建议修复** | 移除未使用的 import 和变量声明 |

### 问题 #5：SITE_URL 硬编码为示例域名

| 属性 | 详情 |
|------|------|
| **严重程度** | 🟢 Low |
| **影响范围** | SEO JSON-LD 结构化数据 |
| **描述** | `src/lib/geo.ts` 中 `SITE_URL = "https://lanhui.example.com"` 使用了示例域名，生产环境需要替换 |
| **复现步骤** | 查看任何门店详情页的 JSON-LD 输出 |
| **建议修复** | 使用环境变量 `process.env.NEXT_PUBLIC_SITE_URL` 替代硬编码值 |

### 问题 #6：文章 seed 数据为空

| 属性 | 详情 |
|------|------|
| **严重程度** | 🟢 Low |
| **影响范围** | 新闻/文章展示页面 |
| **描述** | Seed 数据中不包含文章数据，`/api/articles` 返回空列表。新闻页面依赖 fallback 到静态 `news.ts` 数据。 |
| **复现步骤** | 请求 `/api/articles` 返回 `data: []` |
| **建议修复** | 在 seed.ts 中添加示例文章数据 |

---

## 5. 省市构建逻辑评估

### 整体架构

```
china-regions.ts (静态数据，34省/自治区/直辖市)
        ↓
RegionSelector.tsx (Admin表单级联选择)
        ↓
数据库 Province + City 表 (动态数据，目前3省6城)
        ↓
data.ts (ISR数据获取层，优先API→降级静态)
```

### 优点

1. **覆盖全面**：`china-regions.ts` 包含全部34个省级行政单位及主要地级市，总计约300+个城市
2. **搜索支持**：`SearchableSelect` 支持拼音/汉字搜索过滤
3. **双向映射**：RegionSelector 正确填充 slug 和 label 字段
4. **容错设计**：`data.ts` 采用 try-catch + fallback 到静态数据

### 问题

1. **⚠️ 关键问题**：数据库城市 slug 格式（如 `foshan-shunde`）与 china-regions 城市 slug 格式（如 `foshan`）不一致
2. **数据库省份仅3条**：虽然 china-regions 支持34省，但数据库当前只有广东、江苏、浙江。前端城市路由依赖数据库数据
3. **城市粒度差异**：数据库的"城市"实际是区级概念（顺德、南海、禅城），而 china-regions 的城市是地级市概念（佛山）

### 建议

最佳方案是将 RegionSelector 改为从 API 动态获取省市数据，而不是依赖静态 china-regions.ts。这样：
- 新增门店时选择的城市与数据库一致
- 编辑门店时能正确回显
- 添加新城市只需在数据库中操作，无需改代码

---

## 6. 图片上传机制评估

### 当前状态

| 项目 | 状态 |
|------|------|
| 上传组件 | ❌ 不存在 |
| 上传API | ❌ 不存在 |
| ali-oss集成 | ❌ 仅安装了依赖，未实现 |
| 文件类型验证 | ❌ 无 |
| 文件大小限制 | ❌ 无 |
| 图片预览 | ❌ 无 |
| CDN地址生成 | ❌ 无 |

### 当前实现

- `StoreForm.tsx` 中仅有一个 `<input type="url">` 让用户手动输入图片URL
- Prisma Schema 中 `imageUrl` 字段为 `String?`（可选）
- 验证 schema 中 `imageUrl: z.string().url().optional().nullable()`

### 建议实现方案

1. **创建上传API** (`/api/upload`)：
   - 接收 multipart/form-data
   - 验证文件类型（jpeg, png, webp）和大小（<5MB）
   - 使用 ali-oss SDK 上传至阿里云 OSS
   - 返回 CDN URL

2. **创建 ImageUpload 组件**：
   - 拖拽/点击上传
   - 实时预览
   - 上传进度条
   - 删除已上传图片

3. **集成到 StoreForm**：
   - 替换当前 URL 输入框
   - 上传成功后自动填充 imageUrl 字段

---

## 7. 修复建议优先级排序

| 优先级 | 问题 | 工作量 | 影响 |
|--------|------|--------|------|
| P0 | 省市数据slug不匹配（问题#1） | 中 | Admin编辑门店功能受损 |
| P1 | 图片上传功能实现（问题#2） | 大 | CMS核心功能缺失 |
| P2 | Prisma连接容错（问题#3） | 小 | 开发体验和稳定性 |
| P3 | 未使用变量清理（问题#4） | 小 | 代码整洁度 |
| P3 | SITE_URL环境变量化（问题#5） | 小 | 生产部署准备 |
| P3 | 文章seed数据（问题#6） | 小 | 测试和演示完整性 |

---

## 8. 总体评价

### 通过项

- ✅ 数据库结构设计合理，支持自定义ID
- ✅ API RESTful 设计规范，带认证保护和权限验证
- ✅ TypeScript 全量通过，类型安全
- ✅ Next.js 16 async params 正确使用
- ✅ ISR 数据层设计优良，有 fallback 容错
- ✅ Dashboard 数据库查询有 try-catch 容错
- ✅ 门店详情页 SEO 结构化数据完整
- ✅ 管理后台认证保护正常工作（307重定向）
- ✅ 门店支持 ID 和 slug 双重查询

### 需改进项

- ⚠️ 省市数据体系需要统一（最关键）
- ⚠️ 图片上传功能需要实现
- ⚠️ 4个ESLint警告需清理

### 结论

**系统整体状态：基本可用**

核心的数据模型、API接口、前端渲染和认证保护均工作正常。最关键的问题是省市数据slug格式不统一导致Admin编辑表单无法正确回显城市选择，建议作为P0优先修复。图片上传作为CMS核心功能也需要尽快补全。

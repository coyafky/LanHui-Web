# 后台门店管理：新建门店失败与 ImageURL 字段移除测试报告

> 目标读者：Claude Code 架构师、Coder、Tester。本文只描述问题、证据、修复范围和验收用例，供后续修复执行使用。

## 1. 测试背景

后台门店管理当前存在三个用户可感知问题：

1. 新建门店时浏览器控制台出现 `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`，请求地址为 `/api/stores`。
2. 新建/编辑门店表单仍展示 `门店图片 URL（兼容字段）`，业务已确认第一版不需要该兼容字段。
3. 后台应支持稳定创建门店：创建成功后要有明确提示，并且新门店能在后台门店列表中显示。

本报告基于当前代码与本地 Docker PostgreSQL 状态编写，测试日期为 2026-06-14。

## 2. 当前环境

| 项目 | 结果 |
| --- | --- |
| 项目路径 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website` |
| 前端服务 | `localhost:3000` |
| 数据库 | Docker PostgreSQL，`localhost:5433/lanhui` |
| 数据库连接 | 可连接 |
| `GET /api/stores?limit=1` | 200 |
| `GET /api/stores?page=1&limit=20&all=true` | 200 |
| `Store` 记录数 | 19 |
| `Province` 记录 | `guangdong`、`jiangsu`、`zhejiang` |
| `City` 记录 | `foshan`、`nanjing`、`suzhou`、`hangzhou` |
| `_prisma_migrations` | 缺失 |
| `activity_logs` | 缺失 |

## 3. 关键结论

当前 500 不是门店列表读取失败导致的。实测 `GET /api/stores` 返回 200。

真正的失败点在 `POST /api/stores`。开发日志显示：

```text
[POST /api/stores] PrismaClientKnownRequestError
Foreign key constraint violated on the constraint: `Store_citySlug_fkey`
```

根因判断：

- `RegionSelector` 使用 `src/lib/china-regions.ts` 的全国省市静态数据。
- 当前数据库 `Province` / `City` 表只 seed 了 3 个省和 4 个城市。
- 用户在后台选择了数据库中不存在的省/市时，前端 Zod 只校验非空，不校验该 slug 是否真实存在于数据库。
- API 直接执行 `prisma.store.create()`，最终被 PostgreSQL 外键 `Store_citySlug_fkey` 拦截。
- API 未捕获 Prisma 外键错误并转成业务错误，因此返回 500。

所以修复重点不是隐藏控制台错误，而是让“可选择区域”和“数据库区域表”保持一致，并让 API 对外键错误返回可理解的 400/409。

## 4. 相关文件

| 文件 | 当前问题 |
| --- | --- |
| `src/components/admin/StoreForm.tsx` | 表单仍包含 `imageUrl` 默认值和可见输入框；提交错误被 catch 后吞掉，用户看不到失败原因。 |
| `src/components/admin/RegionSelector.tsx` | 使用全国静态地区数据，和数据库 `City` 表不一致。 |
| `src/lib/china-regions.ts` | 包含大量未 seed 到数据库的省市。 |
| `src/lib/validations/store.ts` | `imageUrl` 仍作为兼容字段参与 schema；省市只校验非空，不校验存在性。 |
| `src/app/api/stores/route.ts` | `POST` 未预先校验 province/city 是否存在；外键错误会落入通用 500。 |
| `src/app/admin/(dashboard)/stores/new/page.tsx` | 抛出的错误被 `StoreForm` 吞掉，没有传回 UI。 |
| `src/app/admin/(dashboard)/stores/[id]/page.tsx` | 编辑页仍把 `imageUrl` 映射进表单。 |

## 5. 问题清单

### BUG-1：新建门店遇到不存在城市时返回 500

| 项目 | 内容 |
| --- | --- |
| 优先级 | P0 / Critical |
| 类型 | 后台核心功能阻塞 |
| 现象 | 点击创建门店后，浏览器控制台出现 `/api/stores 500`。 |
| 服务端证据 | `Foreign key constraint violated on the constraint: Store_citySlug_fkey` |
| 根因 | 前端可选城市来自全国静态表，数据库只存在少量城市，API 未提前校验外键。 |
| 影响 | 后台无法稳定创建门店；用户只看到 500，不知道该怎么修正。 |

#### 修复要求

推荐方案：

1. `RegionSelector` 改为从 `/api/provinces` 和 `/api/cities?province=...` 加载数据库已有区域，而不是使用 `china-regions.ts` 全国静态数据。
2. `POST /api/stores` 在创建前校验：
   - `provinceSlug` 是否存在且 active。
   - `citySlug` 是否存在、active，且属于该 `provinceSlug`。
3. 校验失败时返回 400：

```json
{
  "success": false,
  "error": "省市选择无效",
  "details": {
    "citySlug": ["请选择已开通的城市"]
  }
}
```

4. 兜底捕获 Prisma 外键错误，例如 `P2003`，不要再返回无解释的 500。

### BUG-2：后台表单仍展示 ImageURL 兼容字段

| 项目 | 内容 |
| --- | --- |
| 优先级 | P0 / Critical |
| 类型 | 产品需求变更 |
| 现象 | 新建/编辑门店页出现 `门店图片 URL（兼容字段）` 输入框。 |
| 业务要求 | 第一版不需要 `ImageURL` 兼容字段。门店图片应走门店图片管理模块。 |
| 影响 | 运营人员会误以为必须填外部图片 URL，也可能引发空字符串 URL 校验问题。 |

#### 修复要求

必须移除后台表单中的可见 `imageUrl` 字段：

- 从 `StoreForm.tsx` 的 `defaultValues` 移除 `imageUrl: ""`。
- 从 `StoreForm.tsx` UI 移除 `门店图片 URL（兼容字段）` 输入框。
- 从编辑页 `stores/[id]/page.tsx` 的表单映射中移除 `imageUrl: d.imageUrl ?? ""`。
- 新建/编辑提交 payload 不应包含 `imageUrl`。

数据库层面可以暂时保留 `Store.imageUrl` 字段用于旧数据兼容读取，但后台管理系统第一版不允许再让运营编辑该字段。

建议保留 `imagePath` 作为门店图片主字段，并通过 `/admin/stores/{id}/image` 管理图片。

### BUG-3：提交失败被吞掉，用户无错误提示

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | UX / 错误处理 |
| 现象 | `stores/new/page.tsx` 抛出错误后，`StoreForm.handleFormSubmit` 的 `catch {}` 直接吞掉，页面无提示。 |
| 影响 | 用户只看到按钮恢复，无法知道失败原因。 |

#### 修复要求

`StoreForm` 必须展示错误信息。可选实现：

- 使用项目现有 toast 组件。
- 如果没有 toast，先使用表单顶部 inline alert。

最低要求：

- API 返回 400/409 时，表单顶部显示具体中文错误。
- 网络失败或 500 时，显示 `创建失败，请稍后重试或联系管理员`。
- 错误信息不能只出现在 console。

### BUG-4：创建成功后缺少明确成功提示与列表可见性确认

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | 后台核心流程 |
| 现象 | 当前创建成功后的跳转逻辑不稳定，且没有明确成功提示。 |
| 期望 | 创建成功后用户看到成功提示，并能在后台门店列表看到新门店。 |

#### 推荐成功流程

第一版建议采用：

1. 用户提交 `/admin/stores/new`。
2. API 返回 201。
3. UI 显示 `门店创建成功`。
4. 跳转 `/admin/stores`。
5. 新门店出现在列表顶部或可通过搜索找到。
6. 列表中提供“图片管理/上传图片”入口，或在成功提示中提供“去上传门店图片”的次级操作。

如果团队仍希望创建后自动进入图片上传页，也必须满足：

- 进入 `/admin/stores/{id}/image` 前显示成功提示或在图片页显示 `门店创建成功，请上传门店图片`。
- 返回列表后，新门店必须可见。
- 不允许没有提示地跳转。

### BUG-5：迁移状态不干净，可能影响后台看板与活动日志

| 项目 | 内容 |
| --- | --- |
| 优先级 | P1 / High |
| 类型 | 数据库维护 |
| 现象 | Docker 数据库缺少 `_prisma_migrations` 和 `activity_logs`。 |
| 影响 | 后台 recent activity 相关功能无法可靠运行；迁移命令无法判断当前数据库状态。 |

#### 修复建议

本问题不阻塞门店创建的主修复，但必须列入后台系统修复队列：

1. 先备份 Docker 数据库。
2. 对齐 Prisma migration 记录。
3. 补建 `activity_logs` 表和相关索引。
4. 验证 `logActivity` 和后台 dashboard recent activity。

注意：不得使用 `migrate reset`，因为当前 Docker 数据库已有门店和文章数据。

## 6. 修复边界

### 必须做

- 移除后台表单可见 `ImageURL` 字段。
- 修复新建门店 500。
- 新建门店成功后有提示。
- 新建门店成功后能在后台列表显示。
- API 对省市无效、slug 重复、权限不足等情况返回明确状态码和中文错误。
- 补充自动化测试或手动测试记录。

### 本轮不做

- 不做招商模块。
- 不做完整 CRM。
- 不做门店图片上传重构，只确保新建门店后能进入后续图片管理流程。
- 不删除数据库 `imageUrl` 列，除非另开迁移 PRD。
- 不重置 Docker 数据库。

## 7. 建议测试用例

### 7.1 表单 UI 测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| UI-1 移除 ImageURL | 打开 `/admin/stores/new` | 页面不存在 `门店图片 URL（兼容字段）`，不存在 `input[name="imageUrl"]`。 |
| UI-2 编辑页移除 ImageURL | 打开 `/admin/stores/{id}` | 页面不存在 `门店图片 URL（兼容字段）`，不存在 `input[name="imageUrl"]`。 |
| UI-3 区域来源 | 打开新建页，展开省份/城市 | 只展示数据库中已开通的省市，或清晰标注未开通不可选。 |

### 7.2 API 测试

| 用例 | 请求 | 期望 |
| --- | --- | --- |
| API-1 创建成功 | `POST /api/stores`，使用 `guangdong/foshan` | 201，返回 `success: true` 和新门店 `id`。 |
| API-2 无效城市 | `POST /api/stores`，使用不存在的 `citySlug` | 400，返回中文 `details.citySlug`，不是 500。 |
| API-3 城市不属于省份 | `provinceSlug=guangdong`，`citySlug=nanjing` | 400，提示省市不匹配。 |
| API-4 重复 slug | 使用已有 slug | 409，提示 `URL标识已存在`。 |
| API-5 未登录 | 无 session 创建门店 | 401。 |
| API-6 非 admin | editor 创建门店 | 403。 |

### 7.3 端到端测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| E2E-1 最小字段创建 | 只填写必填字段：名称、slug、省份、城市、地址、电话 | 创建成功，有成功提示，新门店在列表可见。 |
| E2E-2 可选字段留空 | 区域、营业时间、描述、图片都不填 | 不被 Zod 拦截，提交成功。 |
| E2E-3 错误城市 | 尝试提交数据库不存在的城市 | 表单显示中文错误，不出现 500。 |
| E2E-4 重复 slug | 使用已存在 slug | 表单显示 `URL标识已存在`，页面不崩。 |
| E2E-5 成功后图片入口 | 创建成功后进入列表或图片页 | 能找到新门店，且有上传/管理门店图片的后续路径。 |

## 8. 验收标准

修复完成必须同时满足：

- `/admin/stores/new` 不再出现 `ImageURL` / `门店图片 URL（兼容字段）`。
- `/admin/stores/{id}` 不再出现 `ImageURL` / `门店图片 URL（兼容字段）`。
- 使用数据库已存在省市创建门店，`POST /api/stores` 返回 201。
- 创建成功后出现明确中文成功提示。
- 新门店在 `/admin/stores` 列表可见，或可通过搜索找到。
- 使用不存在城市创建门店时，API 返回 400，UI 显示中文错误，不再出现 500。
- 重复 slug 返回 409，UI 显示中文错误。
- 可选字段全部留空时仍可创建门店。
- 新建/编辑提交 payload 不包含 `imageUrl`。
- `npm run lint` 通过。
- `npm run typecheck` 通过。
- 相关单元测试通过，建议至少包含 `src/lib/validations/store.test.ts` 和 `src/app/api/stores/route.test.ts`。

## 9. 给 Claude Code 的修复建议顺序

1. 先修 `RegionSelector` 数据来源，使前端只能选择数据库已存在区域。
2. 再修 `POST /api/stores` 的 province/city 存在性校验和 `P2003` 错误处理。
3. 移除 `StoreForm` 和编辑页中的 `imageUrl` 可见字段与 payload。
4. 增加 `StoreForm` 表单级错误提示和成功提示。
5. 明确创建成功后的跳转策略，并保证列表显示新门店。
6. 补充单元测试与 E2E/手动截图验证。

## 10. 当前复测命令摘录

```bash
curl -i 'http://localhost:3000/api/stores?limit=1'
curl -i 'http://localhost:3000/api/stores?page=1&limit=20&all=true'
PGPASSWORD=lanhui_password psql 'postgresql://lanhui@localhost:5433/lanhui' \
  -c 'select slug,label,"isActive" from "Province";' \
  -c 'select slug,"provinceSlug",label,"isActive" from "City";'
tail -n 160 .next/dev/logs/next-development.log
```

关键日志：

```text
[POST /api/stores] PrismaClientKnownRequestError
Foreign key constraint violated on the constraint: `Store_citySlug_fkey`
```

# 门店软下架后无法编辑/恢复测试与修复报告

| 项目 | 内容 |
| --- | --- |
| 模块 | 后台门店管理 |
| 页面 | `/admin/stores`、`/admin/stores/[id]` |
| API | `/api/stores`、`/api/stores/[id]` |
| 日期 | 2026-06-14 |
| 问题类型 | 软删除/下架状态语义错误 + 后台详情查询过滤错误 |
| 优先级 | P0 |
| 目标使用者 | Claude Code 架构师 / Coder / Tester |

## 1. 问题结论

这是一个真实 bug，同时也暴露了后台产品语义设计不一致。

当前“删除门店”实际不是物理删除，而是软下架：

```ts
// DELETE /api/stores/[id]
data: { isActive: false }
```

也就是说门店记录仍然存在数据库中，只是 `isActive=false`。

正确业务语义应该是：

- 后台：可以看到已停用门店。
- 后台：可以继续编辑已停用门店。
- 后台：可以把已停用门店恢复为“营业中”。
- 前台：默认不展示已停用门店。
- API：公开访问默认只返回营业中门店，后台授权访问可以包含已停用门店。

当前 bug 的根因是：

```ts
// src/app/api/stores/[id]/route.ts
const store = await prisma.store.findFirst({
  where: { OR: [{ id }, { slug: id }], isActive: true },
});
```

`GET /api/stores/[id]` 强制过滤 `isActive: true`，所以当后台列表能看到“已停用”门店并点击编辑时，编辑页请求详情接口会返回 404：`门店不存在`。

这不是门店真的不存在，而是详情 API 把停用门店排除了。

## 2. 当前复现路径

### 2.1 复现步骤

1. 打开 `/admin/stores`。
2. 找到一个营业中门店。
3. 点击“删除”。
4. 弹窗提示“此操作将停用该门店，可后续恢复”。
5. 确认后，门店状态变为“已停用”。
6. 在列表中点击该门店的“编辑”。
7. 进入 `/admin/stores/{id}`。
8. 页面显示：`门店不存在`。

### 2.2 实际结果

- 后台列表能看到已停用门店。
- 但编辑页无法加载该门店。
- 用户无法通过编辑页把门店恢复为“营业中”。

### 2.3 预期结果

- 已停用门店点击编辑后，可以正常进入编辑页。
- 表单中“营业状态”显示为“下架/已停用”。
- 用户可以切换为“营业中”并保存。
- 保存后列表状态变为“营业中”。
- 前台接口和前台门店列表重新展示该门店。

## 3. 根因分析

### 3.1 列表接口逻辑

文件：`src/app/api/stores/route.ts`

当前逻辑：

```ts
const all = searchParams.get("all");

let showAll = false;
if (all === "true") {
  const session = await auth();
  if (session?.user.role === "admin") {
    showAll = true;
  }
}

const where: Record<string, unknown> = {};
if (!showAll) {
  where.isActive = true;
}
```

后台列表页会请求：

```ts
GET /api/stores?page=1&limit=20&all=true
```

所以 admin 可以看到已停用门店。

这一点是正确的。

### 3.2 详情接口逻辑

文件：`src/app/api/stores/[id]/route.ts`

当前逻辑：

```ts
const store = await prisma.store.findFirst({
  where: { OR: [{ id }, { slug: id }], isActive: true },
});
```

问题：

- 详情接口没有和列表接口一样支持后台查看已停用门店。
- 编辑页使用该详情接口加载表单数据。
- 停用门店被过滤掉后，后台误判为不存在。

### 3.3 更新接口逻辑

同文件 `PUT /api/stores/[id]`：

```ts
const existing = await prisma.store.findFirst({
  where: { OR: [{ id }, { slug: id }] },
});
```

PUT 没有过滤 `isActive`。

说明后端其实允许更新停用门店，只是 GET 详情加载阶段把门店挡住了。

### 3.4 UI 语义问题

当前 UI 同时出现：

- `删除`
- `删除门店`
- `确认删除`
- `此操作将停用该门店，可后续恢复`
- `营业状态：下架`
- `状态：已停用`

这会造成运营误解：

- 用户以为“删除”是永久删除。
- 实际系统执行的是“停用/下架”。
- 提示又说“可恢复”，但编辑页无法恢复。

正确语义应统一为：

- 列表操作：`停用` 或 `下架`
- 弹窗标题：`确认停用门店`
- 弹窗按钮：`确认停用`
- 状态文案：`营业中` / `已停用`
- 编辑页状态选项：`营业中` / `已停用`
- 如果需要永久删除，必须另设危险操作，不应复用当前 DELETE。

## 4. 正确产品逻辑

### 4.1 门店状态定义

| 状态 | 数据 | 后台列表 | 后台编辑 | 前台列表 | 门店详情页 |
| --- | --- | --- | --- | --- | --- |
| 营业中 | `isActive=true` | 显示 | 可编辑 | 显示 | 可访问 |
| 已停用/下架 | `isActive=false` | 显示 | 可编辑/可恢复 | 不显示 | 前台不可访问 |
| 物理删除 | 记录不存在 | 不显示 | 不可编辑 | 不显示 | 不可访问 |

本期只处理前两种状态，不做物理删除。

### 4.2 后台与前台的边界

公开 API 默认应该保护前台体验：

- `GET /api/stores` 默认只返回 `isActive=true`。
- `GET /api/stores/[id]` 默认只返回 `isActive=true`。

后台授权 API 可以看到停用门店：

- `GET /api/stores?all=true`：admin 可看到全部。
- `GET /api/stores/[id]?includeInactive=true`：admin 可看到停用门店。

注意：不要简单移除 `GET /api/stores/[id]` 的 `isActive:true` 过滤，否则公开访问者可能通过 id/slug 访问已停用门店。

## 5. 修复方案

### 5.1 API 修复

文件：

```text
src/app/api/stores/[id]/route.ts
```

建议将 GET 改为支持后台参数：

```ts
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
  const { id } = await ctx.params;
  const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true";

  let canIncludeInactive = false;
  if (includeInactive) {
    const session = await auth();
    canIncludeInactive = session?.user.role === "admin";
  }

  const where =
    canIncludeInactive
      ? { OR: [{ id }, { slug: id }] }
      : { OR: [{ id }, { slug: id }], isActive: true };

  const store = await prisma.store.findFirst({ where });
}
```

要求：

- 公开请求不带参数时，仍只返回营业中门店。
- 非 admin 请求 `includeInactive=true` 不得返回停用门店。
- admin 请求 `includeInactive=true` 可以返回停用门店。
- 返回数据中保留 `isActive` 字段，让表单显示当前状态。

如果项目角色后续支持 `editor` 管门店，可再扩展为 admin/editor 权限；本期按当前列表接口保持 admin。

### 5.2 编辑页修复

文件：

```text
src/app/admin/(dashboard)/stores/[id]/page.tsx
```

当前请求：

```ts
fetch(`/api/stores/${id}`)
```

建议改为：

```ts
fetch(`/api/stores/${id}?includeInactive=true`)
```

要求：

- 已停用门店进入编辑页后正常加载。
- `isActive=false` 映射到表单默认值。
- 修改为 `isActive=true` 后保存成功。

### 5.3 文案修复

文件：

```text
src/app/admin/(dashboard)/stores/page.tsx
src/components/admin/StoreForm.tsx
src/components/admin/DashboardRecentActivity.tsx
```

建议改名：

| 当前 | 建议 |
| --- | --- |
| 删除 | 停用 |
| 删除门店 | 停用门店 |
| 确认删除 | 确认停用门店 |
| 删除失败 | 停用失败 |
| `store.delete` | UI 展示为“停用门店” |

保留接口方法 `DELETE` 可以接受，因为 HTTP 语义上可表示资源从前台可用集合中移除。但 UI 不应叫“删除”。

### 5.4 恢复营业入口

第一版最小方案：

- 进入编辑页。
- 将“营业状态”从“已停用”改为“营业中”。
- 点击保存。

增强方案：

- 列表中已停用门店操作显示：
  - `编辑`
  - `恢复营业`
- 点击 `恢复营业` 直接调用 `PUT /api/stores/[id]`，body `{ isActive: true }`。

本期建议先做最小方案，保证修复可控；如果时间允许再加列表快捷恢复。

## 6. 测试用例

### 6.1 API 单元测试

建议新增或补充：

```text
src/app/api/stores/[id]/route.test.ts
```

测试用例：

| 编号 | 场景 | 预期 |
| --- | --- | --- |
| API-1 | GET 营业中门店，不带参数 | 200 |
| API-2 | GET 已停用门店，不带参数 | 404 |
| API-3 | GET 已停用门店，`includeInactive=true`，未登录 | 404 或 403，不得返回数据 |
| API-4 | GET 已停用门店，`includeInactive=true`，非 admin | 404 或 403，不得返回数据 |
| API-5 | GET 已停用门店，`includeInactive=true`，admin | 200，返回 `isActive=false` |
| API-6 | PUT 已停用门店 `{ isActive: true }`，admin | 200，返回 `isActive=true` |
| API-7 | DELETE 营业中门店，admin | 200，返回 `isActive=false` |

### 6.2 后台页面 E2E 测试

| 编号 | 步骤 | 预期 |
| --- | --- | --- |
| UI-1 | 在 `/admin/stores` 点击营业中门店的“停用” | 门店变为“已停用”，列表仍可见。 |
| UI-2 | 点击已停用门店的“编辑” | 进入编辑页，不显示“门店不存在”。 |
| UI-3 | 编辑页查看营业状态 | 默认选中“已停用”。 |
| UI-4 | 将状态改为“营业中”并保存 | 保存成功，返回列表后状态为“营业中”。 |
| UI-5 | 再次打开公开 `GET /api/stores` | 恢复后的门店出现在公开列表。 |
| UI-6 | 停用后公开 `GET /api/stores` | 已停用门店不出现在公开列表。 |

### 6.3 回归测试

| 编号 | 场景 | 预期 |
| --- | --- | --- |
| REG-1 | 新建门店 | 不受影响。 |
| REG-2 | 编辑营业中门店 | 不受影响。 |
| REG-3 | 省市筛选 | 不受影响。 |
| REG-4 | 搜索门店 | 可以搜索到营业中和已停用门店。 |
| REG-5 | 门店图片管理 | 对已停用门店也应可管理，或明确不允许并给出提示。 |
| REG-6 | 前台门店列表 | 不展示已停用门店。 |
| REG-7 | 前台门店详情 | 已停用门店不可访问或返回前台 404。 |

## 7. 验收标准

| 编号 | 标准 |
| --- | --- |
| AC-1 | 后台列表中的已停用门店可以点击编辑。 |
| AC-2 | 编辑页不再显示错误的“门店不存在”。 |
| AC-3 | 已停用门店可以恢复为“营业中”。 |
| AC-4 | 前台默认不展示已停用门店。 |
| AC-5 | 公开 API 不因修复而泄露已停用门店。 |
| AC-6 | 后台 UI 不再把软下架称为“删除”。 |
| AC-7 | 操作日志展示使用“停用门店”，不是“删除门店”。 |
| AC-8 | 单元测试覆盖 inactive store 的 GET/PUT/DELETE 行为。 |

## 8. 建议修复顺序

1. 新增 `/api/stores/[id]` 单元测试，先复现已停用门店 GET 404 的问题。
2. 修改 `GET /api/stores/[id]`，支持 admin `includeInactive=true`。
3. 修改后台编辑页请求，加 `?includeInactive=true`。
4. 修改 UI 文案：删除 -> 停用/下架。
5. 测试从停用到恢复营业的完整路径。
6. 回归前台门店列表，确认停用门店仍不展示。

## 9. 修复后验证命令

```bash
npm run typecheck
npm run lint
npm run build
```

建议针对测试：

```bash
npm test -- src/app/api/stores/route.test.ts
npm test -- src/app/api/stores/[id]/route.test.ts
```

如果项目测试命令不同，以 `package.json` 为准。

## 10. 给 Claude Code 的执行提示

请不要用“移除 `isActive:true` 过滤”作为唯一修复。

正确修复必须同时满足：

- 前台公开访问仍隐藏已停用门店。
- 后台 admin 可以读取已停用门店并恢复。
- UI 文案统一软下架语义。

最小代码改动应集中在：

```text
src/app/api/stores/[id]/route.ts
src/app/admin/(dashboard)/stores/[id]/page.tsx
src/app/admin/(dashboard)/stores/page.tsx
src/components/admin/StoreForm.tsx
src/components/admin/DashboardRecentActivity.tsx
```

不要顺手重构整个门店后台，也不要引入物理删除。

---
archived-with: 2026-07-10-consolidate-region-data-source
status: final
---
# 统一区域数据源 — 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。

**目标：** 删除死代码 `src/lib/china-regions.ts`（576 行，零运行时消费者），在 `mainland-regions.ts` 添加选择器，修复 audit 脚本引用，添加防重复守卫。

**架构：** `mainland-regions.ts` 已是 seed/fixtures/tests 的唯一规范数据源（16 个测试）。`china-regions.ts` 经全项目 grep 确认无任何 import 语句引用，唯一接触点是 `scripts/audit/lib/collect-routes.mjs` 读原始文本提取 sample slug。

**技术栈：** TypeScript strict + Vitest + Node `readFileSync`（守卫脚本）

---

**元数据：**
- change: `consolidate-region-data-source`
- design-doc: `openspec/changes/consolidate-region-data-source/design.md`
- base-ref: `2f6caf24b417d65912222922ff0d172a2376e7d0`

---

## 关键发现

- `china-regions.ts` **零运行时消费者** — 全项目 `grep` 确认无 `.ts/.tsx/.mjs/.js` import 它
- `RegionSelector` 组件自定 `Region`/`City` 类型，不依赖 `china-regions.ts`
- API 路由（`/api/regions`、`/api/provinces`、`/api/cities`）查 DB，不读静态文件
- 唯一引用：`scripts/audit/lib/collect-routes.mjs:102` — `safeReadText("china-regions.ts")` 正则提取 sample slug
- `mainland-regions.ts` 已被 seed + fixtures + 16 个测试消费，是事实上的唯一规范源

## 文件清单

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/lib/regions/mainland-regions.ts` | 添加 5 个派生选择器 |
| 修改 | `src/lib/regions/mainland-regions.test.ts` | 扩展测试覆盖选择器 |
| 删除 | `src/lib/china-regions.ts` | 576 行死代码，零消费者 |
| 修改 | `scripts/audit/lib/collect-routes.mjs` | `extractAgentRegion()` 改为从 `mainland-regions.ts` 提取 slug |
| 创建 | `scripts/check-region-duplication.mjs` | 防重复守卫 |
| 修改 | `package.json` | 链入 `check:region-duplication` |

---

## 全局约束

- 现有 store 中 `provinceSlug` / `citySlug` 不得改变
- 公开 API 响应格式保持不变
- `RegionSelector` 组件行为不变（它不依赖被删文件）
- 新代码必须从 `src/lib/regions/mainland-regions.ts` 导入规范类型
- 选择器返回的 label/value 必须与 `MAINLAND_PROVINCES` / `MAINLAND_CITIES` 中的 slug/label 一致

---

### Task 1: 添加规范选择器 + 测试

**文件：**
- 修改：`src/lib/regions/mainland-regions.ts`
- 修改：`src/lib/regions/mainland-regions.test.ts`

- [x] **步骤 1：在 `mainland-regions.ts` 末尾添加 5 个选择器**

```typescript
export function getMainlandProvinceOptions(): { label: string; value: string }[] {
  return MAINLAND_PROVINCES.map((p) => ({ label: p.label, value: p.slug }));
}

export function getMainlandCityOptions(provinceSlug?: string): { label: string; value: string }[] {
  const cities = provinceSlug
    ? MAINLAND_CITIES.filter((c) => c.provinceSlug === provinceSlug)
    : MAINLAND_CITIES;
  return cities.map((c) => ({ label: c.label, value: c.slug }));
}

export function findMainlandProvince(slug: string): ProvinceData | undefined {
  return MAINLAND_PROVINCES.find((p) => p.slug === slug);
}

export function findMainlandCity(slug: string): CityData | undefined {
  return MAINLAND_CITIES.find((c) => c.slug === slug);
}
```

注意：不添加 `buildRegionCascade()` — 原 `china-regions.ts` 的 `Region[]` 形状已无消费者，无需提供级联适配器。

- [x] **步骤 2：扩展 `mainland-regions.test.ts`**

新增 7 个测试：
- `getMainlandProvinceOptions` 返回 31 个条目，每个有非空 label/value
- `getMainlandCityOptions()` 无参数返回 333 个城市
- `getMainlandCityOptions(provinceSlug)` 筛选正确
- `findMainlandProvince` 已知 slug 找到、未知返回 undefined
- `findMainlandCity` 已知 slug 找到、未知返回 undefined
- 所有 province slug 唯一
- 所有 city slug 唯一

---

### Task 2: 删除 china-regions.ts + 修复 audit 脚本

**文件：**
- 删除：`src/lib/china-regions.ts`
- 修改：`scripts/audit/lib/collect-routes.mjs`

- [x] **步骤 1：删除 `src/lib/china-regions.ts`**

直接 `git rm src/lib/china-regions.ts`。该文件无任何 import 消费者，typecheck 不会因此新增错误。

- [x] **步骤 2：修复 `extractAgentRegion()` 改为从 `mainland-regions.ts` 提取**

当前实现（第 101-108 行）：
```js
function extractAgentRegion() {
  const src = safeReadText("china-regions.ts");
  if (!src) return { province: null, city: null };
  const re = /value:\s*["']([a-z0-9-]+)["']/g;
  const out = []; let m;
  while ((m = re.exec(src)) !== null && out.length < 2) out.push(m[1]);
  return { province: out[0] || "beijing", city: out[1] || "dongcheng" };
}
```

改为从 `src/lib/regions/mainland-regions.ts` 提取 `MAINLAND_PROVINCES` 数组第一个 `slug` 和 `MAINLAND_CITIES` 数组第一个 `slug`：

```js
function extractAgentRegion() {
  const src = safeReadText("regions/mainland-regions.ts");
  if (!src) return { province: null, city: null };
  // 从 MAINLAND_PROVINCES 数组提取第一个 slug
  const provRe = /slug:\s*["']([a-z0-9-]+)["']/g;
  const provMatch = provRe.exec(src);
  // 从 MAINLAND_CITIES 数组提取第一个 slug
  const cityRe = /slug:\s*["']([a-z0-9-]+)["']/g;
  const cityMatch = cityRe.exec(src);
  return {
    province: provMatch?.[1] || "beijing",
    city: cityMatch?.[1] || "dongcheng",
  };
}
```

注：`safeReadText` 的 base path 是 `src/lib/`，所以参数从 `"china-regions.ts"` 改为 `"regions/mainland-regions.ts"`。

---

### Task 3: 防重复守卫

**文件：**
- 创建：`scripts/check-region-duplication.mjs`
- 修改：`package.json`

- [x] **步骤 1：创建守卫脚本**

功能：
1. 扫描 `src/` 下所有 `.ts/.tsx` 文件
2. 检测包含大数组（>20 个条目）且同时出现 `label`/`value` 模式的对象字面量
3. 白名单：`src/lib/regions/mainland-regions.ts`
4. 命中非白名单文件 → 打印路径 + 指向 canonical module 的提示 → `process.exit(1)`
5. 未命中 → `process.exit(0)`

实现方式：`fs.readFileSync` + 正则匹配，不解析 AST（轻量、无依赖）。

- [x] **步骤 2：链入 `package.json`**

```json
"check:region-duplication": "node scripts/check-region-duplication.mjs"
```

并在 `check` 脚本中链入（在 `check:admin-csrf` 之后）。

---

### Task 4: 验证

- [x] **步骤 1：运行选择器测试**
  ```bash
  npx vitest run src/lib/regions/mainland-regions.test.ts
  ```

- [x] **步骤 2：运行 lint 和 typecheck（确认删除后无新错误）**
  ```bash
  npm run lint
  npm run typecheck
  ```

- [x] **步骤 3：运行守卫**
  ```bash
  node scripts/check-region-duplication.mjs
  ```

- [x] **步骤 4：运行完整 check 链**
  ```bash
  npm run check
  ```

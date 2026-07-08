# SPEC: CMS 门店管理页

> 功能规格说明书 — `/admin/stores` 门店管理页的行为合约。
> 对应 PRD：`docs/PRD/admin/README.md`、`docs/PRD/public-site/AGENT_PUBLIC_PRD.md`
> 实现状态：`✅ 已完成`

---

## 1. 职责范围

管理员在后台查看、筛选、搜索、管理门店列表。提供表格视图 + 分组模式 + 快捷操作。不负责门店创建/编辑表单（由 `src/components/admin/StoreForm.tsx` + `/admin/stores/new` / `/admin/stores/[id]` 负责）。不负责门店图片管理（由 `/admin/stores/[id]/image` 负责）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|------|
| `react-best-practices` | 是 | 表格性能、useMemo/useCallback、React 19 严格模式 |
| `web-design-engineer` | 是 | 后台表格 UI、按钮层级、空状态 |
| `prisma-data-ops` | 是 | 通过 `/api/stores` 读写 |
| faker/MSW | 是 | 组件测试中的 mock 数据 |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 鉴权 |
|------|------|------|------|
| `/admin/stores` | page (CC) | 门店列表主页 | admin（layout.tsx `auth()` 守卫） |
| `/admin/stores/new` | page | 新建门店（StoreForm） | admin |
| `/admin/stores/[id]` | page | 编辑门店（StoreForm） | admin |
| `/admin/stores/[id]/image` | page | 门店图片上传 | admin |

## 3. 数据模型

### 3.1 StoreRow（前端表格行）

```typescript
interface StoreRow {
  id: string;
  name: string;
  provinceLabel: string;
  cityLabel: string;
  phone: string;
  isActive: boolean;
  level: StoreLevel | null;   // "flagship" | "premium" | "specialty" | "member"
  status: StoreStatus;        // "pending" | "active" | "suspended" | "terminated"
}
```

### 3.2 状态/等级常量（来自 `src/lib/validations/store.ts`）

```typescript
const STORE_STATUSES = ["pending", "active", "suspended", "terminated"] as const;
const STORE_LEVELS = ["flagship", "premium", "specialty", "member"] as const;

const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  pending: "待发布", active: "营业中", suspended: "暂停合作", terminated: "终止合作",
};
const STORE_LEVEL_LABELS: Record<StoreLevel, string> = {
  flagship: "星辉旗舰店", premium: "星耀尊享店", specialty: "星辰专营店", member: "星光会员店",
};
```

### 3.3 Zustand Store（页面级状态管理）

```typescript
// 当前页面的筛选、分页、分组状态通过 URL searchParams + useSearchParams 管理
// 关键参数：province, city, level[], status[], search, sort, page, groupMode
```

### 3.4 API 数据源

- `GET /api/stores?page=X&limit=25&sort=level_desc&level=X&status=X&province=X&city=X&search=X&all=true&image=X`
- `GET /api/provinces` → 省份筛选下拉
- `GET /api/cities?province=X` → 城市筛选下拉（不缓存：每次 `?province` 变化立即刷新）

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `StoresPage` | `src/app/admin/(dashboard)/stores/page.tsx` | 是 | 整个页面（~1434 行，含 7 个内联子组件） |
| `StoreForm` | `src/components/admin/StoreForm.tsx` | 是 | 门店创建/编辑表单（568 行） |
| `ConfirmDialog` | `src/components/admin/ConfirmDialog.tsx` | 是 | 操作确认弹窗 |

**页面内联子组件（均在 page.tsx 内）：**
- `TableHeader` — 搜索框 + 筛选器 + 新建按钮
- `GroupBar` — 分组模式选择器
- `ProvinceFilterDropdown` — 省份下拉筛选
- `CityFilterDropdown` — 城市下拉筛选（随省份联动）
- `LevelFilterDropdown` — 门店等级多选
- `StatusFilterDropdown` — 门店状态多选
- `GroupedAccordion` — 分组表格（展开/折叠）

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 所有操作需 admin 权限 | 页面加载 | layout.tsx `auth()` 守卫 |
| BR2 | 分组模式下隐藏分页 | groupMode ≠ "none" | 显示折叠面板，page/pageSize 控件消失 |
| BR3 | 省份切换 → 城市下拉刷新 | province 筛选变化 | fetch `/api/cities?province=X`，重置已选城市 |
| BR4 | 表格排序默认 level_desc | 初始加载 | `sort=level_desc`（旗舰店优先，同等级按创建时间） |
| BR5 | 搜索防抖 | 用户输入 | 300ms debounce 后 fetch（避免每次击键请求） |
| BR6 | 状态操作确认 | 点击状态动作按钮 | `ConfirmDialog` 弹窗，确认后 POST /api/stores/bulk 或 PATCH |
| BR7 | URL 同步筛选状态 | 筛选/排序/分页变更 | `router.push` 更新 URL searchParams |
| BR8 | 等级 badge 颜色区分 | 渲染 StoreRow.level | flagship=orange, premium/specialty=zinc, member=zinc（见 LEVEL_BADGE_CLASS） |
| BR9 | 状态 badge 颜色区分 | 渲染 StoreRow.status | active=green, pending=yellow, suspended=red, terminated=gray |
| BR10 | 空状态展示 | stores 数组为空 | 显示空状态插图和引导文字 |

## 6. UI 状态

| 状态 | 触发条件 | UI 表现 |
|------|---------|---------|
| loading | 初始请求进行中 | Skeleton 行 / Spinner |
| empty | stores 返回 0 条 | "暂无门店" 空状态 + "创建第一家门店" CTA |
| error | API 请求失败 | 错误 toast / 重试按钮 |
| success | 数据返回正常 | 表格渲染 |
| 分组展开 | groupMode selected + 数据加载完成 | 折叠面板，点击展开行详情 |

## 7. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 表格水平可滚动；筛选器折叠为下拉；操作按钮压缩为图标 |
| 768px | 表格列数可多 2-3 列；筛选器部分展开 |
| 1440px | 完整表格视图；所有筛选器平铺可见 |

## 8. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| ADMIN-STORE-AC-01 | 页面加载显示门店列表 | 打开 /admin/stores (admin 登录) | 表格渲染门店数据 | happy |
| ADMIN-STORE-AC-02 | 搜索门店 | 输入 "大良" 搜索词 | 表格过滤到匹配门店 | happy |
| ADMIN-STORE-AC-03 | 分组模式切换 | 选择 "按省份分组" | 表格变为折叠面板，无分页 | happy |
| ADMIN-STORE-AC-04 | 省份筛选 → 城市联动 | 选择 "广东省" | 城市下拉刷新为广东省城市 | happy |
| ADMIN-STORE-AC-05 | 状态筛选 | 选择 "营业中" | 表格仅显示 active 门店 | happy |
| ADMIN-STORE-AC-06 | 进入新建页 | 点击 "新建门店" | 导航到 /admin/stores/new | happy |
| ADMIN-STORE-AC-07 | 进入编辑页 | 点击门店行编辑按钮 | 导航到 /admin/stores/[id] | happy |
| ADMIN-STORE-AC-08 | 未登录访问 | 打开 /admin/stores 无 session | 重定向到 /admin/login | edge |
| ADMIN-STORE-AC-09 | editor 角色可访问 | editor session 访问 | 正常渲染（但无新建/编辑权限操作按钮） | edge |
| ADMIN-STORE-AC-10 | 空列表 | admin 登录，DB 无门店 | 空状态 UI 显示 | edge |
| ADMIN-STORE-AC-11 | API 失败 | API /api/stores 返回 500 | 错误提示 + 重试按钮 | error |
| ADMIN-STORE-AC-12 | 分页导航 | 点击 "下一页" | 加载第 2 页数据，URL 更新 ?page=2 | happy |

## 9. 已知问题

- [ ] 页面文件过大（~1434 行），7 个内联子组件未拆分到独立文件
- [ ] 无虚拟滚动——大量门店时可能性能下降
- [ ] 分组模式下城市下拉缓存策略缺失（每次省份变化都重新 fetch）
- [ ] 排序仅支持固定选项，不支持表头点击排序
- [ ] 无批量操作（如批量发布、批量下架）

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | 分组模式 + 筛选器 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 重写 | 完成 | — |

---

> 最后更新: 2026-07-07
> 旧版 SPEC 归档为 `admin/stores-v1-post-hoc.md`

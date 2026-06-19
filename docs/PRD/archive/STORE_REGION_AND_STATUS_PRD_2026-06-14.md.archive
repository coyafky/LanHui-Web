# 需求：门店区域种子数据扩展 + 门店状态编辑

## 需求概述

1. **区域种子扩展**：把当前数据库中 3 个省份 + 4 个城市扩展为中国大陆 31 个省级行政区 + 各省热门城市（约 120 个），使后台创建门店时**任何已 seed 的省份/城市都可作为合法选项**。
2. **门店状态编辑**：在后台编辑门店页面增加一个**简单控件**（推荐 radio / segmented control），让运营能切换 `营业中` ↔ `下架`，用于处理加盟商不合作等场景。**不通过 DELETE 实现**（DELETE 是软删除，应保留为"删除"语义）。

## 项目上下文

### 技术栈
- Framework: Next.js 16.2.1 (App Router, React 19.2.4)
- UI: Tailwind CSS v4 + 自定义 zinc-900/orange-500/emerald-500 配色
- DB: Prisma 7.8 + PostgreSQL
- 测试: vitest 3.2 + happy-dom
- TS strict, 无 any, 2-space 缩进

### 相关数据模型

**`prisma/schema.prisma`**:
- `Province { slug, label, isActive, order, ... }` — 主键 slug
- `City { slug, provinceSlug, label, isActive, order, ... }` — 主键 slug，外键 provinceSlug → Province(slug)，onDelete: Cascade
- `Store { ..., isActive Boolean @default(true), ... }` — **isActive 字段已存在，可直接复用**

**字段语义**:
- `Province.isActive` / `City.isActive` — 控制 `GET /api/provinces` 和 `GET /api/cities` 是否返回（**已 active filter**，见 `src/app/api/provinces/route.ts:6`）
- `Store.isActive` — 前台 `/api/stores` 默认只返回 `isActive=true`（`route.ts:27-29`），admin 加 `?all=true` 可看全部

### 相关组件

| 组件 | 路径 | 性质 | 说明 |
|---|---|---|---|
| `StoresPage` | `src/app/admin/(dashboard)/stores/page.tsx` | Client | 列表页，含 `StatusBadge`（line 52-65）只读 |
| `StoreForm` | `src/components/admin/StoreForm.tsx` | Client | 编辑页表单，**不含 isActive** |
| `RegionSelector` | `src/components/admin/RegionSelector.tsx` | Client | 已修：读 `/api/provinces` + `/api/cities` |
| `StatusBadge` | `src/app/admin/(dashboard)/stores/page.tsx:52` | — | emerald-500/10 营业中 / zinc-500/30 已停用 |

### 相关 API

| 端点 | 方法 | 鉴权 | 说明 |
|---|---|---|---|
| `/api/provinces` | GET | 无 | 返回 `isActive: true` 的省份（`route.ts:6`） |
| `/api/cities?province=xxx` | GET | 无 | 返回该省下 `isActive: true` 的城市 |
| `/api/stores` | POST | admin | 创建门店（已含 province/city 预校验） |
| `/api/stores/[id]` | GET | 无 | 拉单个门店 |
| `/api/stores/[id]` | PUT | admin | 更新（**已支持 partial**：`StoreUpdateSchema.partial()`） |
| `/api/stores/[id]` | DELETE | admin | 软删除（`isActive=false`） |

**关键**: PUT 已支持 `partial()`，可直接传 `{ isActive: false }` 切换状态。**不需要新增 PATCH 端点**。

### 相关数据获取

- 列表页 `fetchStores()` → `GET /api/stores?page&limit&all&search&province`（line 186-205）
- 列表页拉省份选项 → `fetch('/api/provinces')`（line 208-221）
- 编辑页 `fetch('/api/stores/${id}')` 拉详情（`stores/[id]/page.tsx:18`）

## 实现规格

### 需要修改的文件

| 文件 | 改动 |
|---|---|
| `prisma/seed.ts` | 扩展 provinceData 到 31 个；新增 cityData 数组约 120 个；删 `prisma.store.deleteMany()` 改为只 insert 新省份/城市（**保留现有 19 家门店数据**） |
| `src/components/admin/StoreForm.tsx` | 新增 `isActive` 表单字段 + UI 控件；透传到 `onSubmit` payload |
| `src/app/admin/(dashboard)/stores/[id]/page.tsx` | 编辑页映射 `isActive: d.isActive ?? true` |
| `src/app/admin/(dashboard)/stores/new/page.tsx` | 创建时 `isActive` 默认 `true`（无需传） |
| `src/lib/validations/store.ts` | `StoreCreateSchema` 显式加 `isActive: z.boolean().optional().default(true)`；`StoreUpdateSchema` 已 partial 自动同步 |

**说明**: 不需要新建任何 `.tsx` 文件（除非 radio 控件想抽组件）。所有改动在已有文件内。

### 实现步骤

#### 步骤 1：扩展 seed 数据（不破坏现有门店）

**文件**: `prisma/seed.ts`

**改动**:
1. 替换 `provinceData` 数组为完整 31 个省级行政区（详见下方"种子数据清单"）
2. 新增 `cityData` 数组：每省 2-7 个热门城市（省会 + 经济强市/工业城市）
3. **删除** `await prisma.store.deleteMany();`（**重要**: 当前 19 家门店不能被清除）
4. province/city 用 `upsert`（已存在更新 label/order，新增则 insert）

**种子数据清单（31 省 + 热门城市）**:

```ts
const provinceData = [
  // 4 直辖市
  { slug: "beijing", label: "北京市", order: 1 },
  { slug: "tianjin", label: "天津市", order: 2 },
  { slug: "shanghai", label: "上海市", order: 3 },
  { slug: "chongqing", label: "重庆市", order: 4 },
  // 23 省
  { slug: "hebei", label: "河北省", order: 5 },
  { slug: "shanxi", label: "山西省", order: 6 },
  { slug: "liaoning", label: "辽宁省", order: 7 },
  { slug: "jilin", label: "吉林省", order: 8 },
  { slug: "heilongjiang", label: "黑龙江省", order: 9 },
  { slug: "jiangsu", label: "江苏省", order: 10 },
  { slug: "zhejiang", label: "浙江省", order: 11 },
  { slug: "anhui", label: "安徽省", order: 12 },
  { slug: "fujian", label: "福建省", order: 13 },
  { slug: "jiangxi", label: "江西省", order: 14 },
  { slug: "shandong", label: "山东省", order: 15 },
  { slug: "henan", label: "河南省", order: 16 },
  { slug: "hubei", label: "湖北省", order: 17 },
  { slug: "hunan", label: "湖南省", order: 18 },
  { slug: "guangdong", label: "广东省", order: 19 },
  { slug: "hainan", label: "海南省", order: 20 },
  { slug: "sichuan", label: "四川省", order: 21 },
  { slug: "guizhou", label: "贵州省", order: 22 },
  { slug: "yunnan", label: "云南省", order: 23 },
  { slug: "shaanxi", label: "陕西省", order: 24 },
  { slug: "gansu", label: "甘肃省", order: 25 },
  { slug: "qinghai", label: "青海省", order: 26 },
  // 5 自治区
  { slug: "neimenggu", label: "内蒙古自治区", order: 27 },
  { slug: "guangxi", label: "广西壮族自治区", order: 28 },
  { slug: "xizang", label: "西藏自治区", order: 29 },
  { slug: "ningxia", label: "宁夏回族自治区", order: 30 },
  { slug: "xinjiang", label: "新疆维吾尔自治区", order: 31 },
];

const cityData = [
  // 北京（直辖市 - 6 区）
  { slug: "dongcheng", provinceSlug: "beijing", label: "东城区", order: 1 },
  { slug: "xicheng", provinceSlug: "beijing", label: "西城区", order: 2 },
  { slug: "chaoyang", provinceSlug: "beijing", label: "朝阳区", order: 3 },
  { slug: "haidian", provinceSlug: "beijing", label: "海淀区", order: 4 },
  { slug: "fengtai", provinceSlug: "beijing", label: "丰台区", order: 5 },
  { slug: "tongzhou", provinceSlug: "beijing", label: "通州区", order: 6 },
  // 天津（直辖市 - 4 区）
  { slug: "heping", provinceSlug: "tianjin", label: "和平区", order: 1 },
  { slug: "hexiqu", provinceSlug: "tianjin", label: "河西区", order: 2 },
  { slug: "nankai", provinceSlug: "tianjin", label: "南开区", order: 3 },
  { slug: "binhaixinqu", provinceSlug: "tianjin", label: "滨海新区", order: 4 },
  // 上海（直辖市 - 5 区）
  { slug: "huangpu", provinceSlug: "shanghai", label: "黄浦区", order: 1 },
  { slug: "xuhui", provinceSlug: "shanghai", label: "徐汇区", order: 2 },
  { slug: "changning", provinceSlug: "shanghai", label: "长宁区", order: 3 },
  { slug: "pudongxinqu", provinceSlug: "shanghai", label: "浦东新区", order: 4 },
  { slug: "minhang", provinceSlug: "shanghai", label: "闵行区", order: 5 },
  // 重庆（直辖市 - 6 区）
  { slug: "yuzhong", provinceSlug: "chongqing", label: "渝中区", order: 1 },
  { slug: "jiangbei", provinceSlug: "chongqing", label: "江北区", order: 2 },
  { slug: "yubei", provinceSlug: "chongqing", label: "渝北区", order: 3 },
  { slug: "nanan", provinceSlug: "chongqing", label: "南岸区", order: 4 },
  { slug: "shapingba", provinceSlug: "chongqing", label: "沙坪坝区", order: 5 },
  { slug: "jiulongpo", provinceSlug: "chongqing", label: "九龙坡区", order: 6 },
  // 河北
  { slug: "shijiazhuang", provinceSlug: "hebei", label: "石家庄市", order: 1 },
  { slug: "tangshan", provinceSlug: "hebei", label: "唐山市", order: 2 },
  { slug: "baoding", provinceSlug: "hebei", label: "保定市", order: 3 },
  { slug: "handan", provinceSlug: "hebei", label: "邯郸市", order: 4 },
  // 山西
  { slug: "taiyuan", provinceSlug: "shanxi", label: "太原市", order: 1 },
  { slug: "datong", provinceSlug: "shanxi", label: "大同市", order: 2 },
  { slug: "linfen", provinceSlug: "shanxi", label: "临汾市", order: 3 },
  // 内蒙古
  { slug: "huhehaote", provinceSlug: "neimenggu", label: "呼和浩特市", order: 1 },
  { slug: "baotou", provinceSlug: "neimenggu", label: "包头市", order: 2 },
  { slug: "ordos", provinceSlug: "neimenggu", label: "鄂尔多斯市", order: 3 },
  // 辽宁
  { slug: "shenyang", provinceSlug: "liaoning", label: "沈阳市", order: 1 },
  { slug: "dalian", provinceSlug: "liaoning", label: "大连市", order: 2 },
  { slug: "anshan", provinceSlug: "liaoning", label: "鞍山市", order: 3 },
  // 吉林
  { slug: "changchun", provinceSlug: "jilin", label: "长春市", order: 1 },
  { slug: "jilin", provinceSlug: "jilin", label: "吉林市", order: 2 },
  // 黑龙江
  { slug: "haerbin", provinceSlug: "heilongjiang", label: "哈尔滨市", order: 1 },
  { slug: "daqing", provinceSlug: "heilongjiang", label: "大庆市", order: 2 },
  { slug: "qiqihaer", provinceSlug: "heilongjiang", label: "齐齐哈尔市", order: 3 },
  // 江苏
  { slug: "nanjing", provinceSlug: "jiangsu", label: "南京市", order: 1 },
  { slug: "suzhou", provinceSlug: "jiangsu", label: "苏州市", order: 2 },
  { slug: "wuxi", provinceSlug: "jiangsu", label: "无锡市", order: 3 },
  { slug: "changzhou", provinceSlug: "jiangsu", label: "常州市", order: 4 },
  // 浙江
  { slug: "hangzhou", provinceSlug: "zhejiang", label: "杭州市", order: 1 },
  { slug: "ningbo", provinceSlug: "zhejiang", label: "宁波市", order: 2 },
  { slug: "wenzhou", provinceSlug: "zhejiang", label: "温州市", order: 3 },
  { slug: "jiaxing", provinceSlug: "zhejiang", label: "嘉兴市", order: 4 },
  // 安徽
  { slug: "hefei", provinceSlug: "anhui", label: "合肥市", order: 1 },
  { slug: "wuhu", provinceSlug: "anhui", label: "芜湖市", order: 2 },
  { slug: "bengbu", provinceSlug: "anhui", label: "蚌埠市", order: 3 },
  // 福建
  { slug: "fuzhou", provinceSlug: "fujian", label: "福州市", order: 1 },
  { slug: "xiamen", provinceSlug: "fujian", label: "厦门市", order: 2 },
  { slug: "quanzhou", provinceSlug: "fujian", label: "泉州市", order: 3 },
  // 江西
  { slug: "nanchang", provinceSlug: "jiangxi", label: "南昌市", order: 1 },
  { slug: "jiujiang", provinceSlug: "jiangxi", label: "九江市", order: 2 },
  { slug: "ganzhou", provinceSlug: "jiangxi", label: "赣州市", order: 3 },
  // 山东
  { slug: "jinan", provinceSlug: "shandong", label: "济南市", order: 1 },
  { slug: "qingdao", provinceSlug: "shandong", label: "青岛市", order: 2 },
  { slug: "yantai", provinceSlug: "shandong", label: "烟台市", order: 3 },
  { slug: "weifang", provinceSlug: "shandong", label: "潍坊市", order: 4 },
  // 河南
  { slug: "zhengzhou", provinceSlug: "henan", label: "郑州市", order: 1 },
  { slug: "luoyang", provinceSlug: "henan", label: "洛阳市", order: 2 },
  { slug: "kaifeng", provinceSlug: "henan", label: "开封市", order: 3 },
  { slug: "xinxiang", provinceSlug: "henan", label: "新乡市", order: 4 },
  // 湖北
  { slug: "wuhan", provinceSlug: "hubei", label: "武汉市", order: 1 },
  { slug: "yichang", provinceSlug: "hubei", label: "宜昌市", order: 2 },
  { slug: "xiangyang", provinceSlug: "hubei", label: "襄阳市", order: 3 },
  // 湖南
  { slug: "changsha", provinceSlug: "hunan", label: "长沙市", order: 1 },
  { slug: "zhuzhou", provinceSlug: "hunan", label: "株洲市", order: 2 },
  { slug: "hengyang", provinceSlug: "hunan", label: "衡阳市", order: 3 },
  // 广东
  { slug: "guangzhou", provinceSlug: "guangdong", label: "广州市", order: 1 },
  { slug: "shenzhen", provinceSlug: "guangdong", label: "深圳市", order: 2 },
  { slug: "foshan", provinceSlug: "guangdong", label: "佛山市", order: 3 },
  { slug: "dongguan", provinceSlug: "guangdong", label: "东莞市", order: 4 },
  { slug: "zhuhai", provinceSlug: "guangdong", label: "珠海市", order: 5 },
  { slug: "zhongshan", provinceSlug: "guangdong", label: "中山市", order: 6 },
  // 广西
  { slug: "nanning", provinceSlug: "guangxi", label: "南宁市", order: 1 },
  { slug: "guilin", provinceSlug: "guangxi", label: "桂林市", order: 2 },
  { slug: "liuzhou", provinceSlug: "guangxi", label: "柳州市", order: 3 },
  // 海南
  { slug: "haikou", provinceSlug: "hainan", label: "海口市", order: 1 },
  { slug: "sanya", provinceSlug: "hainan", label: "三亚市", order: 2 },
  // 四川
  { slug: "chengdu", provinceSlug: "sichuan", label: "成都市", order: 1 },
  { slug: "mianyang", provinceSlug: "sichuan", label: "绵阳市", order: 2 },
  { slug: "yibin", provinceSlug: "sichuan", label: "宜宾市", order: 3 },
  // 贵州
  { slug: "guiyang", provinceSlug: "guizhou", label: "贵阳市", order: 1 },
  { slug: "zunyi", provinceSlug: "guizhou", label: "遵义市", order: 2 },
  // 云南
  { slug: "kunming", provinceSlug: "yunnan", label: "昆明市", order: 1 },
  { slug: "dali", provinceSlug: "yunnan", label: "大理市", order: 2 },
  { slug: "yuxi", provinceSlug: "yunnan", label: "玉溪市", order: 3 },
  // 西藏
  { slug: "lasa", provinceSlug: "xizang", label: "拉萨市", order: 1 },
  // 陕西
  { slug: "xian", provinceSlug: "shaanxi", label: "西安市", order: 1 },
  { slug: "xianyang", provinceSlug: "shaanxi", label: "咸阳市", order: 2 },
  { slug: "baoji", provinceSlug: "shaanxi", label: "宝鸡市", order: 3 },
  // 甘肃
  { slug: "lanzhou", provinceSlug: "gansu", label: "兰州市", order: 1 },
  { slug: "tianshui", provinceSlug: "gansu", label: "天水市", order: 2 },
  // 青海
  { slug: "xining", provinceSlug: "qinghai", label: "西宁市", order: 1 },
  // 宁夏
  { slug: "yinchuan", provinceSlug: "ningxia", label: "银川市", order: 1 },
  // 新疆
  { slug: "wulumuqi", provinceSlug: "xinjiang", label: "乌鲁木齐市", order: 1 },
  { slug: "kashi", provinceSlug: "xinjiang", label: "喀什市", order: 2 },
];
```

**总规模**: 31 省级 + ~100 城市（不含港澳台）。**slug 命名约束**: 小写字母 + 数字（`SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/`，见 `validations/store.ts:4`）。

#### 步骤 2：添加门店状态表单字段

**文件**: `src/lib/validations/store.ts`

**改动**: 在 `StoreCreateSchema` 末尾加：
```ts
isActive: z.boolean().optional().default(true),
```

**说明**: `StoreUpdateSchema` 已经是 `StoreCreateSchema.partial()`，自动同步。

#### 步骤 3：StoreForm 新增 isActive 控件

**文件**: `src/components/admin/StoreForm.tsx`

**改动**:
1. 在 `defaultValues` 加 `isActive: true`
2. 在 `描述与图片` section 后**新增** "门店状态" section（独立分组）
3. UI: **原生 `<select>` 下拉**（用户决策：简单、风格与列表页省份筛选一致）
4. 选项: `营业中` (value="true") / `下架` (value="false")
5. 用 `register("isActive", { setValueAs: (v) => v === "true" })` 把 string 转 boolean

**推荐 UI 结构**:
```tsx
<section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
  <h2 className="mb-4 text-lg font-semibold text-zinc-100">门店状态</h2>
  <p className="mb-3 text-sm text-zinc-400">
    选择"下架"后，前台 <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">/api/stores</code> 将不再返回该门店，但后台列表仍可见。
  </p>
  <FieldWrapper label="营业状态" icon={Eye} error={errors.isActive?.message}>
    <select
      {...register("isActive", { setValueAs: (v) => v === "true" })}
      defaultValue={String(defaultValues?.isActive ?? true)}
      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
    >
      <option value="true">营业中</option>
      <option value="false">下架</option>
    </select>
  </FieldWrapper>
</section>
```

**关键**:
- `setValueAs: (v) => v === "true"` 把 select 的 string 转为 boolean，让 Zod `z.boolean()` 通过
- `defaultValue={String(...)}` 配合 `setValueAs` 让 react-hook-form 正确初始化
- 编辑页传入 `defaultValues.isActive` 后，下拉默认选中对应项

**新增 import**: `import { Eye } from "lucide-react"`（状态图标；如 `Eye` 不合适可换 `Activity` 或 `Power`）

#### 步骤 4：编辑页映射 isActive

**文件**: `src/app/admin/(dashboard)/stores/[id]/page.tsx`

**改动**（line 24-37 的映射）: 加 `isActive: d.isActive ?? true,`

#### 步骤 5：测试

**文件**:
- `src/lib/validations/store.test.ts` — 加测试：`isActive` 缺省值 = `true`、显式 false 通过
- `src/app/api/stores/route.test.ts` — 加测试：创建时 `isActive=false` 成功

### 约束条件

- **不破坏现有数据**: seed 不能 `prisma.store.deleteMany()`；新增省份/城市用 `upsert`
- **不引入新依赖** (没有 Switch/Toggle 组件库 → 用 button + Controller)
- **不重置 DB**（仍有 19 家门店 + 若干文章）
- **不新增 PATCH 路由**（PUT partial 已够用）
- TypeScript strict, 禁止 `any`
- 命名风格延续：组件 PascalCase，方法 camelCase
- 2-space 缩进
- **遵循上一轮 fix 的模式**:
  - RegionSelector loading 错误时禁用 submit
  - StoreForm 错误/成功 alert 风格
  - API 错误码契约（400/401/403/409）

### 验收标准

- [ ] `npx prisma db seed` 后 `select count(*) from "Province"` = 31（不含港澳台）
- [ ] `select count(*) from "City"` ≥ 100
- [ ] `select count(*) from "Store"` = 19（**不变**）
- [ ] 旧门店 provinceSlug = 'guangdong' / 'foshan' 等仍然有效
- [ ] 新建门店可选任意省份/城市（北京/上海/广州/成都...）
- [ ] 编辑门店页有"门店状态"区
- [ ] 切换"下架"→ 保存 → `GET /api/stores`（无 `?all=true`）不再返回该门店
- [ ] `GET /api/stores?all=true`（admin）仍能看到下架门店
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] 单元测试 `store.test.ts` 和 `route.test.ts` 全部通过
- [ ] `npm run lint` 无新增 error

## 歧义与默认决策

| 歧义点 | 默认决策 | 理由 |
|---|---|---|
| 热门城市定义？ | 省会 + 经济强市 + 直辖市主城区（约 100 个） | 用户说"热门"未明确，按运营常识选 2-7 个/省 |
| 是否包含香港/澳门？ | **不包含** | 业务上暂无港澳门店需求 |
| 是否包含台湾？ | **不包含**（用户决策：只进大陆 31 个） | 业务不涉及台湾市场 |
| 状态切换控件类型？ | **原生 `<select>` 下拉**（用户决策） | 与列表页省份筛选风格一致；`setValueAs` 解决 boolean 转换；不引新依赖 |
| 状态字段位置？ | **StoreForm 独立 section "门店状态"** | 状态是重要操作，独立分组更清晰 |
| 状态切换是否要二次确认？ | **否** | radio 切换仅 UI 状态，需点"保存修改"才提交 |
| PUT 提交时全量还是 partial？ | **partial**（只发修改字段） | 当前 PUT 走 `StoreUpdateSchema.partial()`，按用户修改项发 |
| 列表页是否加 inline 切换？ | **否**（仅编辑页） | 用户说"编辑功能"，编辑页足够；inline 切换会引入更多 API 交互 |
| 下架后列表页 UI 变化？ | **保持 StatusBadge**（已存在样式） | 不引入新视觉元素 |
| 列表筛选是否加"仅显示下架"？ | **否**（本轮） | 不在用户明确要求内 |

## 后续建议（不在本轮范围）

- 列表页加 inline 状态切换（参考 `dashboard-quick-actions` 模式）
- 状态切换历史记录（ActivityLog 已有 `metadata`，可记录）
- 批量下架（管理多门店加盟商退出场景）
- 后台管理 Province / City 增删改（目前只 seed，运营不可改）

## 不在本轮范围

- 后台管理 Province / City 增删改
- 列表页 inline 状态切换
- 批量状态操作
- 状态切换审计日志
- 香港/澳门/海外区域

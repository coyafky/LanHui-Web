# SPEC: 轻改装备与 P1 项目服务 Product Accessories

> 对应 PRD：`docs/PRD/product/ELECTRIC_STEPS_PRD_2026-06-20.md`、`docs/PRD/product/WHEELS_PRD_2026-06-20.md`、`docs/PRD/product/CHASSIS_PRD_2026-06-20.md`、`docs/PRD/product/P1_SERVICE_PROJECTS_PRD_2026-06-25.md`  
> 实现状态：✅ **P0 v1 完成，P1 待规划实现**

---

## 1. 职责范围

本 SPEC 覆盖膜类以外的服务项目页：

- P0 轻改装备：电动踏板、轮毂升级、底盘升级。
- P1 项目服务：脚垫、地板、底盘护板、商务舒适升级、小配件等。

这些页面是“服务项目页”，不是车型专题页。它们需要解释项目价值、适合车型、施工边界和验收标准，并与车型页互相回链。

## 2. 设计基线

| 维度 | 规范 |
|---|---|
| 视觉方向 | 工业结构感 + 施工可信度，避免电商货架感 |
| 内容表达 | 用“痛点 → 价值 → 适配 → 施工 → 验收”组织，不堆参数 |
| 项目卡片 | P0 项目可进入详情页；P1 项目按 live / planned / content_only 展示 |
| 图像 | 优先使用真实施工细节、安装位、完成效果；缺图时用 3 态占位 |
| 交互 | 卡片、锚点、表格筛选必须可键盘访问；触控目标不小于 44px |
| 操作边界 | 不放置页面私有转化区；后续沟通由全站固定入口处理 |

## 3. 路由

### 3.1 P0 已有服务页

| 路径 | 类型 | 说明 | 状态 |
|---|---|---|---|
| `/product/electric-steps` | page (RSC) | 电动踏板 | ✅ |
| `/product/wheels` | page (RSC) | 轮毂升级 | ✅ |
| `/product/chassis` | page (RSC) | 底盘升级 | ✅ |

### 3.2 P1 建议路由

| 项目 | 建议 Route | 页面策略 | 状态 |
|---|---|---|---|
| 360 软包脚垫 / 三防脚垫 | `/product/floor-mats` | 独立服务页候选 | ⬜ |
| 铝地板 / 木地板 | `/product/flooring` | 从专题升级为服务项目页 | 🔧 |
| 底盘护板 | `/product/chassis#skid-plate`，成熟后 `/product/skid-plate` | 先并入底盘页 | ⬜ |
| 商务舒适升级 | `/product/business-comfort` | 聚合服务页 | ⬜ |
| 实用小配件清单 | `/product/practical-accessories` | 视内容储备决定 | ⬜ |

## 4. P0 页面模块标准

```text
P0 Service Page
├── Hero：服务项目名称 + 一句话价值
├── Use Cases：适合哪些车型/车主
├── Value Blocks：解决哪些痛点
├── Spec / Fit Table：规格、适配、注意事项
├── Process：施工流程
├── Acceptance：验收标准
├── Related Models：相关车型方案
└── FAQ：常见问题
```

## 5. P0 项目详细规格

### 5.1 电动踏板 `/product/electric-steps`

| 模块 | 要求 |
|---|---|
| 适合场景 | 高底盘 SUV、MPV、老人/小孩上下车、高频商务接待 |
| 项目价值 | 上下车便利、侧裙保护、车身视觉完整度 |
| 施工边界 | 电路、门体信号、底盘固定点必须说明需实车确认 |
| 验收标准 | 展开/收回顺畅、异响、灯带、防夹、离地间隙、固定点 |

### 5.2 轮毂升级 `/product/wheels`

| 模块 | 要求 |
|---|---|
| 适合场景 | 外观姿态升级、运动风格、原车轮毂替换 |
| 项目价值 | 视觉比例、风格统一、与轮胎/刹车/车身姿态匹配 |
| 施工边界 | 轮毂尺寸、ET、孔距、载重、胎压传感器和法规边界需说明 |
| 验收标准 | 动平衡、螺丝扭矩、胎压、剐蹭、方向盘抖动、轮胎适配 |

### 5.3 底盘升级 `/product/chassis`

| 模块 | 要求 |
|---|---|
| 适合场景 | 新能源车底盘防护、日常通勤、坑洼路况、轻度户外 |
| 项目价值 | 底盘保护、护板、防刮蹭、部分车型稳定性项目解释 |
| 施工边界 | 不影响散热、排水、检修、传感器和原车安全结构 |
| 验收标准 | 固定点、异响、离地间隙、护板边缘、螺丝复查 |

## 6. P1 项目分层

### 6.1 A 类：建议独立或重点页面

| 项目 | 页面定位 | 首批模块 |
|---|---|---|
| 360 软包脚垫 / 三防脚垫 | 新车基础保护 + 家用清洁便利 | 适合人群、适配车型、材质/区域、清洁维护、验收 |
| 铝地板 / 木地板 | MPV / SUV 后排空间质感升级 | 车型适配、座椅轨道、边缘收口、异响检查 |
| 底盘护板 | 新能源车底盘防护 | 材质、安装位、散热排水、检修边界 |
| 商务舒适升级 | MPV / 大六座后排舒适与质感 | 小桌板、腿托、后排娱乐、氛围灯、星空顶/膜 |

### 6.2 B 类：适合聚合展示

| 项目 | 建议归属 |
|---|---|
| 小桌板 | 商务舒适升级 |
| 后排娱乐电视 | 商务舒适升级 |
| 氛围灯 | 商务舒适升级 / 内饰氛围 |
| 腿托 | 商务舒适升级 |
| 智能头枕 | 商务舒适升级 |
| 流媒体后视镜 | 安全便利升级 |
| 星空顶 / 星空膜 | 内饰氛围升级 |

### 6.3 C 类：小配件，暂不独立成页

| 项目 | 页面策略 |
|---|---|
| 门槛条 | 车型页项目卡 |
| 牌照框 | 车型页项目卡 |
| 钢化膜 / 屏幕保护 | 车型页项目卡 |
| 防虫网 | 车型页项目卡 |
| 挡泥板 | 车型页项目卡 |
| 四门密封条 | 车型页项目卡 |
| 内饰硅胶件 | 车型页项目卡 |
| 尾箱垫 | 车型页项目卡 |

## 7. P1 独立服务页模块标准

```text
P1 Service Page
├── 适合哪些车主
├── 适合哪些车型
├── 项目价值：解决什么痛点
├── 方案类型：基础 / 进阶 / 高阶，不写固定价格
├── 施工边界：哪些情况必须到店确认
├── 施工流程：看车 → 方案 → 施工 → 验收
├── 验收标准：外观 / 功能 / 安全 / 清洁
├── 车型案例入口：回链到车型页
└── FAQ
```

## 8. 数据结构建议

```ts
type ServiceProjectPriority = "P0" | "P1" | "P2";
type ServiceProjectStatus = "live" | "planned" | "content_only";

type ServiceProject = {
  slug: string;
  name: string;
  route?: string;
  priority: ServiceProjectPriority;
  status: ServiceProjectStatus;
  category: "film" | "light_mod" | "business_comfort" | "practical_accessory";
  description: string;
  suitableModels: string[];
  acceptanceItems: string[];
  relatedVehicleRoutes: string[];
};
```

## 9. 关键组件

| 组件 | 建议路径 | Client? | 职责 |
|---|---|---:|---|
| ServiceProjectHero | `src/components/product/ServiceProjectHero.tsx` | 否 | 服务项目首屏 |
| SuitableModelList | `src/components/product/SuitableModelList.tsx` | 否 | 适合车型列表 |
| ProjectValueGrid | `src/components/product/ProjectValueGrid.tsx` | 否 | 痛点价值卡片 |
| FitSpecTable | `src/components/product/FitSpecTable.tsx` | 否 | 适配/参数表 |
| AcceptanceChecklist | `src/components/product/AcceptanceChecklist.tsx` | 否 | 验收清单 |
| RelatedVehicleLinks | `src/components/product/RelatedVehicleLinks.tsx` | 否 | 车型页内链 |

## 10. SSR/ISR 配置

P0/P1 服务页均以 SSG 为主。planned 项目不进入 sitemap；如页面尚未实现，入口页只展示规划状态，不产生 404 链接。

## 11. 验收条件

- [ ] P0 三个服务页仍可正常渲染各自内容分支。
- [ ] `/product` 中 P0 项目全部进入对应服务页。
- [ ] P1 项目在入口页有清晰状态，不强行全部建独立页。
- [ ] P1-A 页面一旦实现，必须包含适合人群、适合车型、施工边界、验收标准。
- [ ] 所有项目页在 390px 下无横向滚动；表格移动端可读。
- [ ] 图片缺失时有稳定占位，不能导致布局跳动。
- [ ] 不出现“所有车型通用”“绝对无损”“不影响质保”等高风险表达。

## 12. 已知问题

- 当前电动踏板、轮毂、底盘仍复用 `ProductDetail` 条件分支，后续可拆成更清晰的服务项目组件。
- Flooring 当前在旧专题模式下，后续应升级为地板服务项目页。
- P1 项目尚未有统一数据源，需要先在静态数据层注册。

---

> 最后更新: 2026-06-25

## 13. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-14 | Claude Code | 配件产品页初始实现（ProductDetail 组件） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-25 | Codex | 按 P0/P1 项目服务规划与新版前端设计基线更新 SPEC | 文档完成 | P1 待实现 |

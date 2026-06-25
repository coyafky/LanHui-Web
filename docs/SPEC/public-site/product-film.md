# SPEC: 膜类产品 Product Film

> 对应 PRD：`docs/PRD/product/WINDOW_FILM_TOPIC_PRD_2026-06-20.md`、`docs/PRD/product/PPF_PRD_2026-06-20.md`、`docs/PRD/product/COLOR_FILM_PRD_2026-06-20.md`  
> 实现状态：✅ **v1 完成，待适配新版产品路由设计基线**

---

## 1. 职责范围

膜类产品页承接三个 P0 核心服务：

- 隐形车衣 / 车衣：`/product/ppf`
- 汽车窗膜 / 隔热膜：`/product/window-film`
- 改色膜：`/product/color-film`

膜类页是服务项目页，不是车型专题页。页面重点回答“这个项目解决什么问题、适合谁、有哪些方案、怎么施工、怎么验收”，并回链相关车型页。

## 2. 设计基线

| 维度 | 规范 |
|---|---|
| 视觉方向 | 更偏“材料科技 + 透明防护 + 精细施工”，比车型页更克制 |
| 页面节奏 | 问题说明 → 方案类型 → 参数解释 → 场景选择 → 流程验收 → FAQ |
| 图像策略 | 使用真实施工/材质/车身局部图；避免只展示抽象卖点图 |
| 信息表达 | 参数要解释成用户能理解的价值，例如隔热、隐私、清晰度、质保 |
| 操作边界 | 不放置页面私有转化区；通过全站固定入口承接后续沟通 |
| 可访问性 | 表格必须有表头；星级/等级不能只靠颜色或图形表达 |

## 3. 路由

| 路径 | 类型 | 说明 | 状态 |
|---|---|---|---|
| `/product/window-film` | page (RSC) | 窗膜总页，7 套餐卡片 | ✅ |
| `/product/window-film/[packageSlug]` | page (RSC, generateStaticParams) | 窗膜套餐详情页 | ✅ |
| `/product/ppf` | page (RSC) | 隐形车衣 / 车衣 | ✅ |
| `/product/color-film` | page (RSC) | 改色膜 | ✅ |

## 4. 页面模块标准

```text
Film Service Page
├── Hero：服务项目名称 + 一句话价值
├── Pain Points：用户为什么需要这个项目
├── Scenario Guide：适合哪些车型/使用场景
├── Package or Series：套餐/系列/方案类型
├── Parameter Explainer：参数解释，不堆术语
├── Service Process：施工流程
├── Acceptance Standard：验收标准
├── Related Vehicle Topics：相关车型方案内链
└── FAQ：常见问题
```

## 5. 窗膜页面规格

### 5.1 窗膜总页

| 模块 | 要求 |
|---|---|
| 套餐卡片 | 展示春分 / 谷雨 / 小满 / 芒种 / 白露 / 网红 / 养生 7 套餐 |
| 参数解释 | VLT、IRR、UVR 等参数必须配用户语言解释 |
| 场景导购 | 家用通勤、强晒地区、隐私需求、长途驾驶等 |
| 详情入口 | 套餐卡片进入 `/product/window-film/[packageSlug]` |

### 5.2 套餐详情页

套餐详情页必须包含：

- 套餐定位；
- 前挡 / 侧后挡建议；
- 参数表；
- 适合人群；
- 安装注意事项；
- 质保和维护说明；
- 返回窗膜总页与相关车型页的内链。

## 6. PPF 页面规格

| 模块 | 要求 |
|---|---|
| 项目价值 | 新车漆面保护、防刮蹭、防老化、日常维护 |
| 适合用户 | 新车、深色车、常跑高速、重视保值与外观的车主 |
| 方案类型 | 基础保护型 / 高覆盖型 / 高质感型，不写死价格 |
| 施工边界 | 边缘包边、开孔、传感器、雷达区域需说明注意事项 |
| 验收标准 | 边缘、气泡、翘边、胶痕、裁切、漆面清洁 |

## 7. 改色膜页面规格

| 模块 | 要求 |
|---|---|
| 项目价值 | 外观风格表达、颜色统一、个性化但不夸张营销 |
| 适合用户 | 想改变车辆气质、车漆保护与风格升级兼顾的车主 |
| 方案类型 | 低调质感 / 运动风格 / 双拼改色 / 局部点缀 |
| 合规提醒 | 改色涉及备案/登记要求时只做提醒，不给法律承诺 |
| 验收标准 | 色差、拼接、边角、开门位、褶皱、气泡、清洁 |

## 8. 数据来源

| 数据 | 文件 | 说明 |
|---|---|---|
| 产品基础数据 | `src/lib/products.ts` | PPF、窗膜、改色膜的基础信息 |
| 窗膜详情 | `src/lib/window-film-details.ts` | 套餐详情文案与参数 |
| 静态聚合 | `src/lib/data.ts` | API-first + static fallback |

## 9. 关键组件

| 组件 | 路径 | Client? | 职责 |
|---|---|---:|---|
| ProductDetail | `src/components/ProductDetail.tsx` | 否 | PPF/改色膜/配件共用详情布局 |
| FilmPageHero | `src/components/film/FilmPageHero.tsx` | 否 | 产品页主视觉 + 面包屑 |
| SpecsTable | `src/components/film/SpecsTable.tsx` | 否 | 通用规格表格 |
| StarRating | `src/components/film/StarRating.tsx` | 否 | 星级评分，需要文本替代 |
| ServiceProcessSection | `src/components/film/ServiceProcessSection.tsx` | 否 | 服务流程 step 列表 |
| WindowFilmPackageCard | `src/components/window-film/WindowFilmPackageCard.tsx` | 否 | 套餐卡片 + 质保徽章 |
| WindowFilmPackageDetail | `src/components/window-film/WindowFilmPackageDetail.tsx` | 否 | 套餐详情完整布局 |

## 10. SSR/ISR 配置

SSG（静态生成）为主；套餐详情页使用 `generateStaticParams` 枚举 7 套餐。build 必须在无数据库环境下成功。

## 11. 性能与可访问性

| 项目 | 标准 |
|---|---|
| LCP | 服务页 < 2.5s；套餐详情页 < 2.5s |
| CLS | 图片和表格区域预留尺寸，CLS < 0.1 |
| 图片 | below-fold lazy load；Hero 图按需 priority |
| 表格 | 表头、caption 或明确标题；移动端可横向容器但页面不能整体横向滚动 |
| 键盘 | 套餐卡片、返回链接、锚点可键盘访问 |
| 文案 | 不承诺绝对隔热、绝对防刮、不影响质保等不可控结果 |

## 12. 验收条件

- [ ] 三个膜类服务页均可从 `/product` P0 项目区进入。
- [ ] 窗膜 7 套餐详情页 `generateStaticParams` 完整。
- [ ] 参数表对移动端友好，且不造成页面整体横向滚动。
- [ ] 服务流程、验收标准和 FAQ 完整。
- [ ] 相关车型页内链可配置，至少支持 planned 状态。
- [ ] 页面不新增私有转化区，避免产品页重复承接。

## 13. 已知问题

- v1 已可用，但与 2026-06-25 新版产品中心“双入口”结构尚未完全联动。
- 部分 PPF/改色膜内容仍依赖通用 `ProductDetail` 分支，后续可拆成更清晰的服务页组件。

---

> 最后更新: 2026-06-25

## 14. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-14 | Claude Code | 窗膜套餐详情页实现 | 完成 | — |
| 2026-06-20 | Claude Code | 窗膜/PPF/改色膜完整实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-25 | Codex | 按新版产品中心和前端设计基线更新膜类 SPEC | 文档完成 | 待实现联动 |

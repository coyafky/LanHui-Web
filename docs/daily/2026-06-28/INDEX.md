# 每日报告 — 2026-06-28

> AI 会话: Claude Code (continued from 2026-06-27 prior session)
> 维护: 冯科雅 (Coya)
> 主题: 小米 SU7 完整专题页 + 全部 42 项 imageStatus → missing
> 触发: 用户指出 SU7 页仍为 BrandPlaceholder 且全部图片状态为 pending-review，要求给 SU7 做完整专题页、图片先改成 missing

---

## 一、今日目标

1. **SU7 完整专题页** — 替换 BrandPlaceholder，实现 12 项目/5 场景/6 步流程/6 FAQ
2. **全品类 imageStatus → missing** — Series 21 项 + YU7 9 项 + SU7 12 项 = 42 项统一改为 `missing`
3. **ProjectGrid missing visual** — Series/YU7/SU7 三模块 ProjectGrid 统一加 dashed border + ImageIcon 占位

---

## 二、今日提交

| Commit | 消息 | 文件数 | 说明 |
|---|---|---|---|
| `f9b21ec` | `feat(xiaomi-su7)` | 19 | SU7 完整专题页 — 12 项目/5 场景/6 FAQ + 全部 42 项 imageStatus→missing |

---

## 三、SU7 数据层

### 关联文档
- PRD: `docs/PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md`（含 12 产品清单）
- 参考: `src/lib/xiaomi-yu7-upgrade-projects.ts`（YU7 数据层模式）

### `src/lib/xiaomi-su7-upgrade-projects.ts`

| 维度 | 数量 | 说明 |
|---|---|---|
| 项目 | 12 | 前包围/侧裙/机盖/尾翼/后视镜壳/刹车油门踏板/方向盘/座椅背板/迎宾踏板/中控面板/出风口/门饰条 |
| 场景 | 5 | 外观运动/外观细节/内饰质感/驾驶升级/新车保护 |
| 服务步骤 | 6 | 无「方案确认」（单车型 direct flow，同 YU7） |
| FAQ | 6 | SU7 专属问答 |
| 运行时断言 | — | order 1..12 单调性、id 唯一性、imageStatus="missing"、引用完整性 |

### 类别标签
```
cabin_protection, chassis_protection, exterior_parts, film_style,
cabin_comfort, electric_convenience, handling
```
与 YU7 共用 `XIAOMI_SERIES_CATEGORY_LABELS`，不重复定义。

### `src/lib/xiaomi-su7-upgrade-projects.test.ts`
- 20 测试：长度对齐、字段漂移（order 1..12、imageStatus="missing"、name/summary 非空、category 合法）、场景完整性、服务步骤结构、FAQ 非空

---

## 四、SU7 组件层

8 个文件（`src/components/xiaomi-su7/`），遵循 YU7 组件模式：

| 组件 | 类型 | 说明 |
|---|---|---|
| `XiaomiSu7TopicViewTrack.tsx` | CC | 埋点 `xiaomi_su7_topic_view` |
| `XiaomiSu7Hero.tsx` | RSC | 面包屑 + 总数 chips + orange hero gradient |
| `XiaomiSu7ProjectGrid.tsx` | CC | 12 卡片 responsive grid + missing visual (ImageIcon + dashed border) |
| `XiaomiSu7ScenarioMatrix.tsx` | RSC | 5 场景卡片带项目名 tags |
| `XiaomiSu7ModelFitNote.tsx` | RSC | Amber AlertTriangle 适配范围提示 |
| `XiaomiSu7ServiceFlow.tsx` | RSC | 6 步 `lg:grid-cols-6` |
| `XiaomiSu7Faq.tsx` | CC | 6 FAQ accordion + aria-expanded/aria-controls |
| `XiaomiSu7TopicBanner.tsx` | RSC | /product 入口卡片，链接 /product/xiaomi/su7 |

---

## 五、"missing" 视觉统一

### 变更范围

| 数据模块 | 项目数 | 旧状态 | 新状态 |
|---|---|---|---|
| `xiaomi-series-upgrade-projects.ts` | 21 | `pending-review` | `missing` |
| `xiaomi-yu7-upgrade-projects.ts` | 9 | `pending-review` | `missing` |
| `xiaomi-su7-upgrade-projects.ts` | 12 | —（新增） | `missing` |

### ProjectGrid 视觉更新

三个 ProjectGrid 组件（`XiaomiSeriesProjectGrid` / `XiaomiYu7ProjectGrid` / `XiaomiSu7ProjectGrid`）统一增加：

```tsx
// 当 imageStatus === "missing" 时渲染：
<div className="border-dashed border-zinc-700 flex items-center justify-center">
  <ImageIcon className="w-8 h-8" aria-hidden />
  <span className="text-xs text-zinc-600">图片待补充</span>
</div>
```

- 导入 `ImageIcon` from `lucide-react`
- 3 态通道保留：`matched | pending-review | missing`
- 后补图只需改数据字段值即可恢复图片渲染

---

## 六、页面 & 路由变更

### `src/app/product/xiaomi/su7/page.tsx`
- 替换原 `BrandPlaceholder`
- 完整布局：Hero → ScenarioMatrix → ProjectGrid → ModelFitNote → ServiceFlow → Faq → CTA → JSON-LD ItemList
- 使用 `getBrandRoute("xiaomi")` 和 `getModelRoute("xiaomi", "su7")` 校验路由

### `src/app/product/page.tsx`
- 新增 `import { XiaomiSu7TopicBanner }`
- 在 Planned Brands CollapsibleSection 内渲染 `<XiaomiSu7TopicBanner />`

### `src/lib/product-routes.ts`
- SU7 model 条目 `projectCount: 21` → `12`
- SU7 model 条目 `sourcePrd` → `XIAOMI_TOPIC_PRD_2026-06-20.md`

---

## 七、小米品类当前总览

| 页面 | 路由 | 状态 | 项目数 | 场景数 | 服务步骤 |
|---|---|---|---|---|---|
| 小米全系列 | `/product/xiaomi` | live | 21 | 7 | 7（含方案确认） |
| 小米 SU7 | `/product/xiaomi/su7` | live | 12 | 5 | 6 |
| 小米 YU7 | `/product/xiaomi/yu7` | live | 9 | 5 | 6 |

**总计**: 42 个项目，全部 `imageStatus = "missing"`

---

## 八、验证结果

| 命令 | 结果 |
|---|---|
| `npx vitest run` | 63/63 passed（22 SU7 + 22 Series + 19 YU7） |
| `npx tsc --noEmit` | 9 pre-existing errors only，0 new |
| `npm run build` | passed（3 条小米路由均为 Static ○） |

---

## 九、未执行验证

- `npm run lint` — pre-existing 1227+ errors（`.claude/worktrees/` 误提交）
- 浏览器检查（390px/768px/1440px）— 全部 missing 占位，无需视觉审查

---

## 十、遗留问题

- 42 个项目图待补充（全部 current-gen 项目无真实施工照片）
- SU7 目前使用与 YU7 共享的类别标签（7 类），未来如需 SU7 独有分类需扩展
- 小米品牌页入口卡使用 CollapsibleSection「规划中品牌」折叠区，后续可提升到主列表

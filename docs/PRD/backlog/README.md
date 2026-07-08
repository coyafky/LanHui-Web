# PRD Backlog

> "规划中" 状态的 PRD，暂无对应 SPEC 和完整代码实现。
> 进入执行时移回 `docs/PRD/` 对应目录（`product/` 或 `public-site/`），
> 并按当前 SPEC 模板写出驱动型 SPEC 后再开始编码。

## 使用规则

1. 从 backlog 取出 PRD 时，先检查自原始规划以来是否有新代码/组件已实现
2. 写出驱动型 SPEC（遵循 `docs/SPEC/_TEMPLATE.md` 10 节格式）
3. SPEC 通过 review 后，将 PRD 移回 `docs/PRD/<area>/`，更新状态为 "canonical"
4. 切勿直接从 backlog PRD 跳到编码（跳过 SPEC 阶段）

## Product（21 个）

| PRD | 规划日期 | 原始状态 | SPEC | 备注 |
|-----|---------|---------|------|------|
| CARMAT_PAGE_PRD | 2026-07-03 | — | — | 脚垫页面（已从 backlog 移回实现） |
| DENZA_D9_TOPIC_PRD | 2026-06-24 | 规划中 | ✅ [models/denza-d9.md](../../SPEC/public-site/product/models/denza-d9.md) | 腾势 D9 专题 |
| GAOSHAN_8_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/gaoshan-8.md](../../SPEC/public-site/product/models/gaoshan-8.md) | 高山 8 专题 |
| LEDAO_L90_TOPIC_PRD | 2026-06-24 | 规划中 | ✅ [models/ledao-l90.md](../../SPEC/public-site/product/models/ledao-l90.md) | 乐道 L90 专题 |
| LI_AUTO_I6_TOPIC_PRD | 2026-06-27 | 规划中 | ✅ [models/li-auto-i6.md](../../SPEC/public-site/product/models/li-auto-i6.md) 🆕 | 理想 i6 专题（20 项目） |
| LI_AUTO_I8_TOPIC_PRD | 2026-06-24 | 规划中 | ✅ [models/li-auto-i8.md](../../SPEC/public-site/product/models/li-auto-i8.md) | 理想 i8 专题 |
| LI_AUTO_L9_TOPIC_PRD | 2026-06-27 | 规划中 | ✅ [models/li-auto-l9.md](../../SPEC/public-site/product/models/li-auto-l9.md) | 理想 L9 专题 |
| LI_AUTO_MEGA_TOPIC_PRD | 2026-06-27 | 规划中 | ✅ [models/li-auto-mega.md](../../SPEC/public-site/product/models/li-auto-mega.md) | 理想 MEGA 专题 |
| LI_AUTO_ONE_TOPIC_PRD | 2026-06-27 | 规划中 | ✅ [models/li-auto-one.md](../../SPEC/public-site/product/models/li-auto-one.md) 🆕 | 理想 ONE 专题（8 项目） |
| LI_AUTO_TOPIC_PRD | 2026-06-24 | 规划中 | ✅ [models/li-auto.md](../../SPEC/public-site/product/models/li-auto.md) 🆕 | 理想品牌专题总览（品牌总专题） |
| P1_SERVICE_PROJECTS_PRD | 2026-06-25 | 规划中 | — | P1 服务项目页（非车型专题） |
| TESLA_TOPIC_PRD | 2026-06-24 | 规划中 | ✅ [models/tesla.md](../../SPEC/public-site/product/models/tesla.md) 🆕 | 特斯拉专题（品牌总专题） |
| VOYAH_DREAMER_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/voyah-dreamer.md](../../SPEC/public-site/product/models/voyah-dreamer.md) | 岚图梦想家专题 |
| WENJIE_M6_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/wenjie-m6.md](../../SPEC/public-site/product/models/wenjie-m6.md) | 问界 M6 专题 |
| WENJIE_M7_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/wenjie-m7.md](../../SPEC/public-site/product/models/wenjie-m7.md) | 问界 M7 专题 |
| WENJIE_M8_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/wenjie-m8.md](../../SPEC/public-site/product/models/wenjie-m8.md) | 问界 M8 专题 |
| WENJIE_SERIES_UPGRADE_PRD | 2026-06-24 | 规划中 | — | 问界系列升级（架构 PRD，非单车型） |
| XIAOMI_SERIES_UPGRADE_PRD | 2026-06-24 | 规划中 | — | 小米系列升级（架构 PRD，非单车型） |
| XPENG_GX_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/xpeng-gx.md](../../SPEC/public-site/product/models/xpeng-gx.md) | 小鹏 GX 专题 |
| ZEEKR_8X_TOPIC_PRD | 2026-06-27 | 规划中 | ✅ [models/zeekr-8x.md](../../SPEC/public-site/product/models/zeekr-8x.md) 🆕 | 极氪 8X 专题（17 项目） |
| ZEEKR_9X_UPGRADE_PRD | 2026-06-24 | 规划中 | ✅ [models/zeekr-9x.md](../../SPEC/public-site/product/models/zeekr-9x.md) | 极氪 9X 升级 |
| ZHIJIE_V9_TOPIC_PRD | 2026-06-25 | 规划中 | ✅ [models/zhijie-v9.md](../../SPEC/public-site/product/models/zhijie-v9.md) | 智界 V9 专题 |

## Public Site（13 个）

| PRD | 规划日期 | 原始状态 | 备注 |
|-----|---------|---------|------|
| BRAND_VEHICLE_PAGES_PRD | 2026-06-22 | 规划中 | 品牌车型页面系统 |
| CONSULTATION_CHANNEL_SYSTEM_PRD | 2026-06-22 | 规划中 | 咨询渠道系统 |
| DETAILING_SERVICE_PAGE_PRD | 2026-06-22 | 规划中 | 美容服务页面 |
| FILM_PRODUCT_EXPERIENCE_PRD | 2026-06-22 | 规划中 | 膜产品体验 |
| FOOTER_SOCIAL_LINKS_PRD | 2026-06-22 | 规划中 | Footer 社交链接 |
| FOOTER_SYSTEM_PRD | 2026-06-22 | 规划中 | Footer 系统 |
| FRONTEND_PAGE_SYSTEM_PRD | 2026-06-22 | 规划中 | 前端页面系统 |
| LIGHT_MOD_PROJECT_PAGES_PRD | 2026-06-22 | 规划中 | 轻改项目页面 |
| PRODUCT_INFORMATION_ARCHITECTURE_PRD | 2026-06-22 | 规划中 | 产品信息架构 |
| PRODUCT_PAGE_SYSTEM_PRD | 2026-06-22 | 规划中 | 产品页面系统 |
| PUBLIC_SITE_SYSTEM_PRD | 2026-06-21 | 规划中 | 公开站系统 |
| STORE_NETWORK_PRD | 2026-06-21 | 规划中 | 门店网络 |
| VEHICLE_PROJECT_PAGE_PRD | 2026-06-22 | 规划中 | 车型项目页面 |

## 已知 PRD 漂移（已实现但 PRD 状态未更新）

以下 PRD 在 `docs/PRD/product/` 中，状态仍为 "规划中，未授权编码"，但代码已存在：

| PRD | 已有代码 | 应做 |
|-----|---------|------|
| NIO_ES8_TOPIC_PRD_2026-06-27.md | `src/app/product/nio/es8/page.tsx` + `src/lib/nio-products.ts` | 更新 PRD 状态为 "✅ 已完成" |
| XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md | `src/app/product/xiaomi/yu7/page.tsx` + `src/lib/xiaomi-yu7-upgrade-projects.ts` | 更新 PRD 状态为 "✅ 已完成" |

---

> 最后更新: 2026-07-07
> 从 `docs/PRD/product/` 和 `docs/PRD/public-site/` 移入 "规划中" PRD 共 34 个
> 🆕 本次新增 6 份驱动型 SPEC（nio-es8, zeekr-8x, tesla, li-auto, li-auto-one, li-auto-i6），Product backlog 中 18/21 已有 SPEC

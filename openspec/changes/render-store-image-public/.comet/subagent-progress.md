# Subagent Progress

- Change: render-store-image-public
- Plan: docs/superpowers/plans/2026-06-30-render-store-image-public.md
- Design Doc: docs/superpowers/specs/2026-06-30-render-store-image-public-design.md
- Branch: feature/20260630/render-store-image-public
- Build mode: subagent-driven-development
- TDD mode: tdd
- Review mode: thorough
- Base ref: b95e20743d27c83f8bb376d57f55e11756d1a995

## 任务清单（Plan）

1. **任务 1**: 扩展 `Store` 类型并修复 `mapApiStore` 映射 — 涉及 `src/lib/store.ts` + `src/lib/data.ts` + 新增 `src/lib/data.test.ts`
2. **任务 2**: 公开详情页替换 Building2 占位 — 涉及 `src/app/agent/store/[id]/page.tsx`
3. **任务 3**: 新增首页 `<FeaturedStores />` RSC + 首页挂载 — 新增 `src/components/FeaturedStores.tsx` + `src/app/page.tsx`
4. **任务 4**: Admin 详情页补「管理门店主图」跳转链接 — `src/app/admin/(dashboard)/stores/[id]/page.tsx`
5. **任务 5**: 验证收尾 — CI + 浏览器回归

## 当前任务

### Task 2: 详情页 Next/Image (next)
- 阶段: implementing (后台 agent a8b9326c0be078bab)
- review_mode 轮次: 0/2 (thorough: 批次审查待 Task 1-3 完成后)

## 进度

| Task | 阶段 | 提交 | 审查轮次 | 状态 |
|------|------|------|----------|------|
| 1 | done | 8c4e825 | 0/2 | ✅ DONE |
| 2 | implementing | — (in flight) | 0/2 | in_progress |
| 3 | pending | — | 0/2 | pending |
| 4 | pending | — | 0/2 | pending |
| 5 | pending | — | 0/2 | pending |

### Task 1 实施摘要（已归档）
- 提交：`8c4e825 feat(data): map store imagePath and isActive fields`
- 文件：`src/lib/store.ts` (+2) + `src/lib/data.ts` (+3/-1) + `src/lib/data.test.ts` (+72)
- RED：3/4 用例失败（imagePath 优先 / 双 null / isActive 缺失），符合预期
- GREEN：8/8 通过
- Typecheck：0 新错（已知 9 个 test 旧错）
- 顾虑：`mapApiStore` 中 `raw` 仍为 `any`，与项目其他字段处理风格一致

## 审查-修复轮次追踪

（review_mode: thorough → 批次审查 + 最终完整审查。任务 1-3 完成后第一次批次审查；任务 4-5 完成后第二次批次审查或最终审查）
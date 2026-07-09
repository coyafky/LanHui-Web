## 任务清单

- [ ] 1. 在 `src/lib/window-film-details.ts` 中新增 `WindowFilmPainPoint` 类型和 `windowFilmPainPoints` 数据（优化 6 个痛点文案）
- [ ] 2. 新建 `src/components/window-film/WindowFilmPainPoints.tsx` 组件
- [ ] 3. 修改 `src/app/product/window-film/page.tsx`：删除 `PAIN_POINTS`，替换为 `<WindowFilmPainPoints />`
- [ ] 4. 新建 `src/lib/window-film-details.test.ts` 测试文件
- [ ] 5. 新建 `scripts/check-window-film-content-boundary.mjs` 检查脚本
- [ ] 6. 在 `package.json` 新增 `check:window-film-content` 脚本
- [ ] 7. 运行 `npm run lint`、`npm run typecheck`、`npm run build` 验证

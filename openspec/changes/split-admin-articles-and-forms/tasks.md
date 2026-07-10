## 1. 共享组件（shared/）

- [ ] 1.1 创建 `src/components/admin/shared/PaginationBar.tsx` — 通用分页组件（page/totalPages/onPrev/onNext props，articles + stores 共用）
- [ ] 1.2 创建 `src/components/admin/shared/EmptyState.tsx` — 通用空状态组件（icon/title/description props）
- [ ] 1.3 创建 `src/components/admin/shared/types.ts` — 共享类型定义

## 2. 拆分 articles/page.tsx

- [ ] 2.1 创建 `src/components/admin/articles/ArticleFilterBar.tsx` — 搜索框 + 状态/分类筛选下拉框
- [ ] 2.2 创建 `src/components/admin/articles/ArticleRowMenu.tsx` — 行内操作菜单（发布/归档/删除/置顶 dropdown）
- [ ] 2.3 创建 `src/components/admin/articles/ArticleBulkToolbar.tsx` — 批量操作栏（已选计数 + 批量发布/归档/删除）
- [ ] 2.4 创建 `src/components/admin/articles/ArticleTable.tsx` — 表格 + 列定义 + 复选列 + 行菜单集成
- [ ] 2.5 重构 `articles/page.tsx` — 替换内联渲染为 ArticleFilterBar + ArticleTable + ArticleBulkToolbar + PaginationBar 组合
- [ ] 2.6 验证现有 12 tests 通过

## 3. 拆分 StoreForm.tsx

- [ ] 3.1 创建 `src/components/admin/stores/StoreBasicInfoFields.tsx` — 门店名称/地址/经纬度字段组
- [ ] 3.2 创建 `src/components/admin/stores/StoreContactFields.tsx` — 电话/微信/营业时间字段组
- [ ] 3.3 创建 `src/components/admin/stores/StoreLevelSelect.tsx` — 门店级别选择器（含 LEVEL_BADGE_CLASS）
- [ ] 3.4 创建 `src/components/admin/stores/StoreImageUploader.tsx` — 图片上传组件
- [ ] 3.5 重构 `StoreForm.tsx` — 改为薄容器组合四个字段组，保留 formId/onSubmit 接口
- [ ] 3.6 验证 stores/new 和 stores/[id] 页面正常渲染

## 4. 拆分 ArticleForm.tsx

- [ ] 4.1 创建 `src/components/admin/articles/ArticleTitleSlugFields.tsx` — 标题 + slug 联动输入
- [ ] 4.2 创建 `src/components/admin/articles/ArticleContentEditor.tsx` — 富文本编辑 + 预览切换
- [ ] 4.3 创建 `src/components/admin/articles/ArticleMetaFields.tsx` — 分类/状态/置顶选择
- [ ] 4.4 创建 `src/components/admin/articles/ArticleTagInput.tsx` — 标签输入 + 展示
- [ ] 4.5 重构 `ArticleForm.tsx` — 改为薄容器组合四个字段组，保留现有 props 接口
- [ ] 4.6 验证现有 `ArticleForm.test.tsx` 通过

## 5. 收尾

- [ ] 5.1 `npm run typecheck` — 确认无新类型错误
- [ ] 5.2 `npm run test` — 确认全部测试套件通过
- [ ] 5.3 更新 articles/page.test.tsx（如子组件映射变化需要调整）

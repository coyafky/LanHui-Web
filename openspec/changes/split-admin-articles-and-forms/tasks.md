## 1. 共享组件（shared/）

- [x] 1.1 创建 `src/components/admin/shared/PaginationBar.tsx` — 通用分页组件（page/totalPages/onPrev/onNext props，articles + stores 共用）
- [x] 1.2 创建 `src/components/admin/shared/EmptyState.tsx` — 通用空状态组件（icon/title/description props）
- [x] 1.3 创建 `src/components/admin/shared/types.ts` — 共享类型定义
- [x] 1.4 创建 `src/components/admin/shared/FieldWrapper.tsx` — 通用表单字段包装组件

## 2. 拆分 articles/page.tsx

- [x] 2.1 创建 `src/components/admin/articles/ArticleFilterBar.tsx` — 搜索框 + 状态/分类筛选下拉框
- [x] 2.2 创建 `src/components/admin/articles/ArticleRowMenu.tsx` — 行内操作菜单（发布/归档/删除/置顶 dropdown）
- [x] 2.3 创建 `src/components/admin/articles/ArticleBulkToolbar.tsx` — 批量操作栏（已选计数 + 批量发布/归档/删除）
- [x] 2.4 创建 `src/components/admin/articles/ArticleTable.tsx` — 表格 + 列定义 + 复选列 + 行菜单集成
- [x] 2.5 重构 `articles/page.tsx` — 替换内联渲染为 ArticleFilterBar + ArticleTable + ArticleBulkToolbar + PaginationBar 组合
- [x] 2.6 验证现有 12 tests 通过

## 3. 拆分 StoreForm.tsx

- [x] 3.1 创建 `src/components/admin/stores/BasicInfoFields.tsx` — 门店名称/地址/省市区字段组
- [x] 3.2 创建 `src/components/admin/stores/ContactFields.tsx` — 电话/营业时间字段组
- [x] 3.3 创建 `src/components/admin/stores/LevelStatusFields.tsx` — 门店级别选择器 + 状态选择器（含 LEVEL_BADGE_CLASS）
- [x] 3.4 创建 `src/components/admin/stores/DescriptionImageFields.tsx` — 描述 + 图片展示组件
- [x] 3.5 重构 `StoreForm.tsx` — 改为薄容器组合四个字段组，保留 formId/onSubmit 接口
- [x] 3.6 验证 stores/new 和 stores/[id] 页面正常渲染（props 接口不变，typecheck 通过）

## 4. 拆分 ArticleForm.tsx

- [x] 4.1 创建 `src/components/admin/articles/TitleSlugFields.tsx` — 标题 + slug 联动输入
- [x] 4.2 创建 `src/components/admin/articles/ContentEditor.tsx` — Markdown 编辑 + 预览双栏
- [x] 4.3 创建 `src/components/admin/articles/MetaFields.tsx` — 摘要/封面图/分类/状态/置顶
- [x] 4.4 创建 `src/components/admin/articles/TagInput.tsx` — 标签输入 + 展示
- [x] 4.5 重构 `ArticleForm.tsx` — 改为薄容器组合四个字段组，保留现有 props 接口
- [x] 4.6 验证现有 `ArticleForm.test.tsx` 15 tests 通过

## 5. 收尾

- [x] 5.1 `npm run typecheck` — 确认无新类型错误（19 预存）
- [x] 5.2 `npm run test` — 确认全部测试套件通过（73/77 pass，4 fail 预存）
- [x] 5.3 更新 articles/page.test.tsx（icon selector 适配 MoreVertical）

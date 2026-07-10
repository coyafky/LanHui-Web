# Brainstorm Summary

- Change: refactor-admin-page-shared-components
- Date: 2026-07-10

## 确认的技术方案

四个共享单元提取：

1. **useCategories** — 统一 `/api/articles/categories` 加载，使用 adminCsrfFetch，内聚 fallback
2. **EntityImagePage** — 配置化图片管理页，selectData 函数适配 article/store API 差异
3. **useStoreAction** — 单店状态操作 hook，onSuccess 回调适配详情页/列表页
4. **useArticleFormState** — 独立 value/onChange 对接口（匹配 ArticleForm props），create snapshot=null dirty，edit snapshot 比对 dirty

## 关键取舍与风险

- useArticleFormState 返回独立 value/onChange 对而非聚合对象 → 页面透传零适配层
- useStoreAction 首批只做单店，批量保留页面层 → 降低复杂度，下次抽 useStoreBulkAction
- EntityImagePage 用 selectData 函数而非泛型 → 更灵活，不依赖 API shape 标准化
- 风险：edit snapshot dirty 逻辑可能因字段差异失真 → hook 显式支持 mode 参数

## 测试策略

- 每个 hook 独立测试文件（vitest + @testing-library/react renderHook）
- EntityImagePage: article + store 两种配置的组件测试
- 现有 ArticleForm.test.tsx + page.test.tsx 回归验证
- check-admin-page-duplication.mjs 防回归脚本

## Spec Patch

无 — delta spec 验收场景已完整覆盖四个共享单元。

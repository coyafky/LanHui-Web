## Why

`src/app/admin/(dashboard)/` 中多个页面已经开始抽组件，但页面层仍重复维护相同的加载、表单状态、分类字典、图片管理和状态操作逻辑。重复逻辑让后台功能变得难维护：文章 new/edit 的字段 state 和提交逻辑容易漂移，articles/stores 图片页几乎相同，分类加载复制三处，门店状态动作在列表和详情页重复实现。

现在需要把这些重复收敛成共享 hooks 和配置化组件，让页面只负责路由参数、页面标题和少量布局。

## What Changes

- 保留并强化已有 `src/components/admin/ArticleForm.tsx`，不重复创建第二个 ArticleForm。
- 新增文章表单容器 hook 或状态 hook，例如 `useArticleFormState` / `useArticleEditor`：
  - create/edit 共用字段 state
  - 共用客户端校验
  - 共用 server fieldErrors 映射
  - 共用 dirty/snapshot 逻辑
  - 共用 submit payload 构造
- 新增 `useCategories()` hook：
  - 统一 `/api/articles/categories` 加载逻辑
  - 统一 fallback 分类
  - 供 articles 列表、新建、编辑三处使用
- 新增泛型 `EntityImagePage` 组件：
  - 支持 article/store 两类实体图片页
  - 接收 `entity`、`entityId`、`fetchEndpoint`、`backHref`、`title`、`subtitleLabel`、`imagePathSelector` 等配置
  - 复用 loading/error/refetch/EntityImageUploader UI
- 新增 `useStoreAction()` hook：
  - 统一门店状态操作 open/close、reason、acting、error
  - 统一调用 `/api/stores/{id}/{action}`
  - 统一 toast 成功/失败处理
  - 支持详情页单店操作和列表页行操作/批量操作适配
- 保持现有页面行为、API、CSRF 适配、toast、ConfirmDialog 视觉不变。
- 增加测试和检查脚本，防止四类重复逻辑重新出现在页面文件中。

## Capabilities

### New Capabilities
- `admin-shared-page-patterns`: 后台页面共享模式，定义文章表单状态、分类加载、实体图片管理页和门店状态操作如何复用。

### Modified Capabilities
（无 — 本次不改变后台业务能力，只重构页面层复用结构。）

## Impact

- 新增或修改：
  - `src/hooks/use-article-form-state.ts`
  - `src/hooks/use-categories.ts`
  - `src/hooks/use-store-action.ts`
  - `src/components/admin/EntityImagePage.tsx`
  - `src/components/admin/ArticleForm.tsx`
- 修改页面：
  - `src/app/admin/(dashboard)/articles/page.tsx`
  - `src/app/admin/(dashboard)/articles/new/page.tsx`
  - `src/app/admin/(dashboard)/articles/[id]/page.tsx`
  - `src/app/admin/(dashboard)/articles/[id]/image/page.tsx`
  - `src/app/admin/(dashboard)/stores/page.tsx`
  - `src/app/admin/(dashboard)/stores/[id]/page.tsx`
  - `src/app/admin/(dashboard)/stores/[id]/image/page.tsx`
- 测试：
  - hooks 单元测试
  - EntityImagePage 组件测试
  - 现有 article new/edit/page tests 更新
  - store action hook 测试
- 风险：
  - 文章 new/edit 的 dirty 判定不同，不能强行合并成同一种初始值逻辑
  - store 列表页和详情页状态操作上下文不同，hook 必须支持回调注入
  - 图片页的 article/store 字段名不同，必须通过 selector 或 mapper 配置处理

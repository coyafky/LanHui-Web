# SPEC: Error Boundaries & Loading States

> **P0-2**: 零 error.tsx / loading.tsx / global-error.tsx / not-found.tsx
> **类型**: 全站级横切关注点
> **实现状态**: ⬜ 未开始
> **创建日期**: 2026-07-07

---

## 1. 职责范围

为整个 `src/app/` 添加完整的错误边界、加载状态和 404 处理。覆盖公开站（home/product/agent/brand/news/contact）和管理后台（/admin/*）。所有 UI 与现有 dark theme（zinc-950 + orange-500）一致。

**不负责**: 修改现有页面逻辑、API route 错误处理（已有统一响应格式）。

---

## 2. 路由/入口

### 2.1 需要创建的错误/加载文件

| 文件 | 类型 | 捕获范围 |
|------|------|----------|
| `src/app/global-error.tsx` | CC | 根布局致命错误 |
| `src/app/error.tsx` | CC | 公开站所有页面错误（product/agent/brand/news/contact/home） |
| `src/app/not-found.tsx` | RSC | 公开站 404 |
| `src/app/loading.tsx` | RSC | 公开站页面切换加载态 |
| `src/app/admin/error.tsx` | CC | /admin/login 错误 |
| `src/app/admin/not-found.tsx` | RSC | /admin 区域 404 |
| `src/app/admin/loading.tsx` | RSC | /admin 页面加载态 |
| `src/app/admin/(dashboard)/error.tsx` | CC | 仪表盘所有页面错误 |
| `src/app/admin/(dashboard)/loading.tsx` | RSC | 仪表盘数据加载态 |

### 2.2 覆盖率矩阵

| 路由段 | error.tsx | loading.tsx | not-found.tsx | global-error.tsx |
|--------|:---------:|:-----------:|:-------------:|:----------------:|
| `/` (root) | ✅ (app/) | ✅ (app/) | ✅ (app/) | ✅ (app/) |
| `/product/*` | 继承 app/ | 继承 app/ | 继承 app/ | ✅ |
| `/agent/*` | 继承 app/ | 继承 app/ | 继承 app/ | ✅ |
| `/brand/*` | 继承 app/ | 继承 app/ | 继承 app/ | ✅ |
| `/news/*` | 继承 app/ | 继承 app/ | 继承 app/ | ✅ |
| `/contact` | 继承 app/ | 继承 app/ | 继承 app/ | ✅ |
| `/admin/login` | ✅ (admin/) | ✅ (admin/) | ✅ (admin/) | ✅ |
| `/admin/*` | ✅ (dashboard/) | ✅ (dashboard/) | 继承 admin/ | ✅ |

> 设计原则：公开站用一个 `app/error.tsx` 兜底（统一品牌风格），admin 用两级 error（admin/login 隔离 + dashboard 统一）。不逐路由段创建 54 个 error.tsx，过度碎片化。

---

## 3. 数据模型

### 3.1 ErrorFallback Props

```typescript
// src/components/shared/ErrorFallback.tsx
type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
  /** "admin" 时使用深色 sidebar 兼容背景 */
  variant?: "public" | "admin";
};
```

### 3.2 LoadingSpinner Props

```typescript
// src/components/shared/LoadingSpinner.tsx
type LoadingSpinnerProps = {
  /** 加载文案，默认 "加载中..." */
  message?: string;
  variant?: "public" | "admin";
};
```

### 3.3 NotFoundContent Props

```typescript
// src/components/shared/NotFoundContent.tsx
type NotFoundContentProps = {
  /** 当前区域，影响返回链接行为 */
  area?: "public" | "admin";
};
```

### 3.4 组件树

```text
src/components/shared/
├── ErrorFallback.tsx    ← 可复用错误 UI（"use client"）
├── LoadingSpinner.tsx   ← 可复用加载骨架/旋转器
└── NotFoundContent.tsx  ← 可复用 404 内容（无需 "use client"）

src/app/
├── global-error.tsx     ← 引用 ErrorFallback
├── error.tsx            ← 引用 ErrorFallback (variant="public")
├── loading.tsx          ← 引用 LoadingSpinner (variant="public")
├── not-found.tsx        ← 引用 NotFoundContent (area="public")
└── admin/
    ├── error.tsx        ← 引用 ErrorFallback (variant="admin")
    ├── loading.tsx      ← 引用 LoadingSpinner (variant="admin")
    ├── not-found.tsx    ← 引用 NotFoundContent (area="admin")
    └── (dashboard)/
        ├── error.tsx    ← 引用 ErrorFallback (variant="admin")
        └── loading.tsx  ← 引用 LoadingSpinner (variant="admin")
```

---

## 4. API 合约

此次变更不涉及 API route。各 error/loading/not-found 组件的行为合约如下：

### 4.1 global-error.tsx

```typescript
// interface（Next.js 内置）
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode;
```

**行为**：
- 展示 LANHUI logo/名称 + 错误标题
- 显示 "重试" 按钮调用 `reset()`
- 显示 "返回首页" 链接 → `/`
- 生产环境隐藏具体错误信息（显示 error.digest 供排查）

### 4.2 error.tsx

```typescript
// interface（Next.js 内置）
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode;
```

**行为**：
- 展示错误图标 + 标题 + 描述
- "重试" 按钮（调用 `reset()`）
- admin variant 保持 Sidebar + header 布局完整性
- 生产环境隐藏具体错误堆栈

### 4.3 loading.tsx

**行为**：
- public variant: 居中 spinner + "加载中..."
- admin variant: 保持 Sidebar + header 框架，内容区显示骨架屏
- 不使用品牌色闪烁动画（避免视觉污染）

### 4.4 not-found.tsx

```typescript
// interface（Next.js 内置）
export default function NotFound(): ReactNode;
```

**行为**：
- 展示 404 状态 + "页面未找到"
- public: 返回首页 + 常见链接（产品/门店/品牌）
- admin: 返回仪表盘链接

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 错误边界兜底 | 任何 RSC/CC 渲染抛出未捕获错误 | 显示品牌化 ErrorFallback，不白屏 |
| BR2 | 全局错误隔离 | 根布局自身出错 | global-error.tsx 接管整个 `<html>` |
| BR3 | Admin 视觉连续 | admin 区域出错 | 保持 Sidebar + header 框架可见 |
| BR4 | 生产环境信息隐藏 | `process.env.NODE_ENV === "production"` | 不展示 error.message/stack，只展示 digest |
| BR5 | 重试能力 | 用户点击"重试" | 调用 Next.js `reset()` 重新渲染出错段 |
| BR6 | 加载骨架 | 页面数据未就绪 | 显示 LoadingSpinner，不阻塞导航 |
| BR7 | 404 品牌化 | 访问不存在的路由 | 显示品牌 404 页面，提供导航建议 |
| BR8 | 夜间主题一致 | 所有状态 | bg-zinc-950 / text-white / orange-500 accent |
| BR9 | 不侵入现有页面 | 正常渲染 | error/loading/not-found 由 Next.js 自动注入，不修改现有 page.tsx |

---

## 6. 错误处理矩阵

| 场景 | 错误类型 | 捕获层 | UI 表现 |
|------|---------|--------|---------|
| 首页 RSC 渲染失败 | Server Error | `app/error.tsx` | 公开站 ErrorFallback |
| 产品页数据异常 | Data Fetch Error | `app/error.tsx` | 公开站 ErrorFallback |
| Admin 仪表盘查询失败 | DB Error | `(dashboard)/error.tsx` | Admin ErrorFallback + Sidebar |
| Admin 登录页 JS 错误 | Client Error | `admin/error.tsx` | Admin ErrorFallback |
| 根布局 auth() 失败 | Server Error | `app/global-error.tsx` | 全局错误页（全屏） |
| 不存在的路由 | 404 | `not-found.tsx` | 品牌 404 页面 |
| 动态路由参数无效 | notFound() | `not-found.tsx` | 品牌 404 页面 |

---

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| ERR-AC-01 | 公开站错误边界渲染 | 模拟页面抛出 Error | ErrorFallback 显示，含重试按钮 | happy |
| ERR-AC-02 | 点击重试 | ErrorFallback 点击"重试" | reset() 被调用，尝试重新渲染 | happy |
| ERR-AC-03 | Admin 错误保持布局 | Dashboard 页面出错 | Sidebar + header 仍可见，内容区显示 ErrorFallback | happy |
| ERR-AC-04 | 全局错误接管 | 根布局抛出错误 | global-error.tsx 渲染完整 HTML（含 `<html>` 标签） | edge |
| ERR-AC-05 | 生产环境隐藏错误详情 | NODE_ENV=production | 不显示 error.message，显示通用文案 + digest | edge |
| ERR-AC-06 | 加载骨架显示 | 页面数据加载中 | LoadingSpinner 可见，不白屏 | happy |
| ERR-AC-07 | 404 页面渲染 | 访问 /nonexistent | NotFoundContent 显示，含导航链接 | happy |
| ERR-AC-08 | Admin 404 | 访问 /admin/nonexistent | Admin 风格 NotFoundContent | happy |
| ERR-AC-09 | 夜间主题一致性 | 检查所有组件 | bg-zinc-950 + text-white + orange-500 | edge |
| ERR-AC-10 | build 不引入错误 | `npm run build` | 成功，所有 error/loading 组件正确编译 | happy |
| ERR-AC-11 | typecheck 通过 | `npx tsc --noEmit` | 无新增类型错误（9 个 pre-existing 除外） | happy |
| ERR-AC-12 | ErrorFallback 组件单元测试 | 渲染 ErrorFallback | DOM 含重试按钮 + 错误标题 | happy |
| ERR-AC-13 | LoadingSpinner 组件单元测试 | 渲染 LoadingSpinner | DOM 含加载文案 + spinner 元素 | happy |
| ERR-AC-14 | NotFoundContent 组件单元测试 | 渲染 NotFoundContent | DOM 含 404 状态 + 导航链接 | happy |

---

## 8. 实现拆解

### Task 1: 共享组件（3 个）
- 创建 `src/components/shared/ErrorFallback.tsx` ("use client")
- 创建 `src/components/shared/LoadingSpinner.tsx`
- 创建 `src/components/shared/NotFoundContent.tsx`

### Task 2: 根级别文件（4 个）
- 创建 `src/app/global-error.tsx`
- 创建 `src/app/error.tsx`
- 创建 `src/app/loading.tsx`
- 创建 `src/app/not-found.tsx`

### Task 3: Admin 级别文件（3 个）
- 创建 `src/app/admin/error.tsx`
- 创建 `src/app/admin/loading.tsx`
- 创建 `src/app/admin/not-found.tsx`

### Task 4: Dashboard 级别文件（2 个）
- 创建 `src/app/admin/(dashboard)/error.tsx`
- 创建 `src/app/admin/(dashboard)/loading.tsx`

### Task 5: 测试 + 验证
- 编写共享组件单元测试
- `npx tsc --noEmit` 验证
- `npm run build` 验证
- 浏览器验证（dev server 手动触发错误）

---

## 9. 已知限制

- error.tsx 无法捕获同段 layout.tsx 的错误（Next.js 设计限制），layout 错误需要父级 error.tsx 或 global-error.tsx
- loading.tsx 在 SSG 页面（product 专题）上不会触发，因为页面已预渲染
- global-error.tsx 在生产环境必须包含自己的 `<html>` 和 `<body>` 标签
- 共享组件需要同时适配公开站（无侧边栏）和管理后台（有侧边栏）两种布局

---

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-07-07 | Claude Code | 驱动型 SPEC 编写 | 完成 | 实现 + 测试 |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| ERR-AC-01 | §7 | TBD | "公开站错误边界渲染" | ⬜ |

---

> 最后更新: 2026-07-07

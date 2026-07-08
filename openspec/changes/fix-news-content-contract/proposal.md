# Proposal: 修复 NewsItem.content 类型契约

## 问题

`/news/[slug]` 详情页在静态 fallback 或 API 数据缺 `content` 时构建报错。

### 根因

`src/lib/data.ts` 的 `mapApiArticle()` 使用 `raw: any`，缺少对字段类型的运行时守卫：

```ts
// 当前 (data.ts:56-69)
function mapApiArticle(raw: any): NewsItem {
  return {
    content: raw.content ?? "",  // raw.content 可能为 object/number/undefined
    summary: raw.excerpt ?? raw.content?.slice(0, 120) ?? "",
    // ...
  };
}
```

- `raw: any` 绕过了 TypeScript 类型检查
- `raw.content` 可能是 `object`、`number`、`null` 等非 string 值
- `?? ""` 只在值为 `null`/`undefined` 时兜底，不处理类型错误
- 静态 fallback 的 `newsItems` 也被传入 `mapApiArticle`，双重映射引入噪音

### 影响范围

- `getArticleBySlug()` → `/news/[slug]` 页面渲染
- `getArticles()` → `/news` 列表页
- 构建时 `generateStaticParams` 枚举所有 slug 触发 `getArticleBySlug()`

## 修复目标

1. `NewsItem.content` 对消费方永远是 `string`
2. `mapApiArticle()` 有完整的类型守卫和 fallback 链
3. 静态 fallback 数据不再经过 API 映射函数
4. 页面不渲染 `"undefined"` 字符串
5. 测试覆盖 content 缺失回归场景

## 非目标

- 不改变 `NewsItem` 类型定义
- 不改变 `/news/[slug]` 路由或 SSG 策略
- 不修改 `ArticleContent` 组件接口
- 不做新闻模块 UI 重构

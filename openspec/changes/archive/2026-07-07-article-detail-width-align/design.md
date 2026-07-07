# Design: 文章详情页内容宽度对齐 Header

## 实现策略

外层 `max-w-4xl` → `max-w-7xl`，内层 prose 用 `max-w-4xl` 限制行宽。

L52 Hero: `max-w-4xl` → `max-w-7xl`
L87 Body: `max-w-4xl` → `max-w-7xl`
L93 prose: `max-w-none` → `max-w-4xl`（防止文字过宽）
L113 Related: `max-w-4xl` → `max-w-7xl`

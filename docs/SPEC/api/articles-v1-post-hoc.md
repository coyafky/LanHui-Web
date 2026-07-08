# SPEC: API 文章 Articles

> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

文章数据的 CRUD API。公开站只读 published，Admin 端全操作。

## 2. 路由

| 路径 | 方法 | 权限 | 说明 | 状态 |
|------|------|------|------|------|
| `/api/articles` | GET | 公开 | 文章列表（公开只返回 published） | ✅ |
| `/api/articles` | POST | admin/editor | 创建文章 | ✅ |
| `/api/articles/[id]` | GET | 公开 | 单篇（非 published 需认证） | ✅ |
| `/api/articles/[id]` | PUT | admin/editor | 更新文章 | ✅ |
| `/api/articles/[id]` | DELETE | admin | 删除文章 | ✅ |
| `/api/articles/categories` | GET | 公开 | DB 实际分类字典 | ✅ |

## 3. 核心逻辑

- **GET 列表**: admin/editor 可看全部状态；公开只返回 `published`
- **GET /categories**: 从 DB 所有文章的 `category` 字段 DISTINCT 聚合，返回实际使用的分类字典（非预定义枚举，反映真实内容分类）
- **POST**: Zod 校验 + slug 自动生成唯一性
- **PUT**: slug 唯一性检查 + `publishedAt` 首次发布时间自动设置
- **DELETE**: 仅 admin 可删除

## 4. 已知问题

- [P0-7] 消费端 `/news/[slug]` 的 `NewsItem` 类型缺少 `content` 字段 → 详情页 404

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 文章 API route handlers 初始实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

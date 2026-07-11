# 当前项目迁移清单

## 1. 迁移目标

把当前“公开官网 + Admin CMS + API + PostgreSQL”的单体 Next.js 项目收敛为只包含公开官网的静态构建。

目标不是让现有代码加一行 `output: "export"` 就结束。当前项目包含认证、数据库、上传、分析和运行时 Route Handlers，必须先拆除这些运行时依赖，否则静态导出会失败或产生行为错误。

## 2. 当前模块处理决策

| 当前模块 | 静态目标 | 操作 |
|---|---|---|
| `src/app/admin/**` | 不进入生产站 | 移除，或迁移到独立内部工具/独立仓库 |
| `src/app/api/**` | 不进入生产站 | 删除公开站依赖；必要的静态 GET 转成构建文件 |
| `src/lib/auth.ts`、NextAuth | 不需要 | 从静态站删除 |
| `src/lib/prisma.ts`、Prisma schema | 不需要 | 数据迁移到 content 文件后删除运行依赖 |
| `src/lib/data.ts` | 本地内容查询层 | 删除本站 API fetch 和数据库 fallback 语义 |
| `src/lib/news.ts` | 文章内容源 | 迁移到 `content/articles/*.md` |
| `src/lib/store.ts` | 门店内容源 | 迁移到 `content/stores/*.yaml` |
| `src/app/api/upload/route.ts` | 不需要在线上传 | 改为 PR 中提交优化图片 |
| `AnalyticsProvider`、`/api/analytics/*` | 外部分析或 CDN 日志 | 删除第一方写接口和 PostgreSQL 事件表依赖 |
| `revalidatePath/revalidateTag` | 不存在 | 内容变化触发全量构建 |
| `next.config.ts` standalone | static export | 改为 `output: "export"` |
| Docker/Compose/PM2 | 不需要 | 生产部署移除 |
| Nginx | 可选 | 只在必须使用 CVM 时服务静态目录 |

## 3. 页面逐类迁移

### 首页、品牌、产品、联系方式

- 保持 Server Components，但数据只能来自构建期可读取的本地文件。
- 清理 `cookies()`、`headers()`、请求时间和用户身份分支。
- 客户端交互可以保留，但不能依赖本站 API。

### 博客

- `getArticles()` 改为读取并校验 Markdown frontmatter。
- `getArticleBySlug()` 改为读取预构建内容索引。
- `/news/[slug]` 返回所有已发布文章 slug 的 `generateStaticParams()`。
- `dynamicParams = false`，新文章必须重新构建才能访问。

### 门店

- `getStores()`、`getStoreById()`、省市查询改为读取构建期数据。
- 为门店详情、省页、市页枚举完整参数。
- 地图定位和电话按钮保持客户端/外链行为。

### 图片

- 清点所有数据库 `imagePath/featuredImage` 并复制到版本化静态路径。
- 移除在线上传、文件系统写入和 COS SDK 运行时依赖。
- 所有页面使用已知宽高，静态发布前完成压缩。

## 4. 建议迁移阶段

### Phase 1：建立静态内容源

- [ ] 建立 `content/articles`、`content/stores` 和内容 schema。
- [ ] 编写数据库到 Markdown/YAML 的一次性导出脚本。
- [ ] 对导出结果做数量、slug、状态、区域和图片引用核对。
- [ ] 让公开页面从本地内容源读取，但暂不删除旧后台。

验收：无数据库也能生成与当前线上内容一致的公开页面。

### Phase 2：消除运行时能力

- [ ] 将 Admin、API、Auth、Prisma、上传和第一方分析从静态站构建边界移除。
- [ ] 为所有动态路由补全 `generateStaticParams()`。
- [ ] 移除 cookies、headers、Server Actions、ISR 和运行时 redirects。
- [ ] 配置静态图片策略和 CDN/Nginx 规则。

验收：`next build` 生成 `out/`，构建过程中没有静态导出不支持的功能错误。

### Phase 3：发布与回滚

- [ ] 建立 PR 预览、内容质量门和 `out/` 冒烟测试。
- [ ] 建立 COS/CDN 发布身份和最小权限。
- [ ] 实现资源先行、HTML 最后的发布顺序。
- [ ] 开启 COS 版本控制并演练 HTML 回滚。
- [ ] 配置 HTTPS、CDN 日志、外部探测和告警。

验收：从合并 PR 到公网更新全自动；任一失败不会破坏当前站点；可恢复上一版本。

## 5. 最终删除项

确认静态站稳定并完成备份后，才能从公开站项目删除：

```text
src/app/admin/
src/app/api/ 中的动态接口
src/lib/auth.ts
src/lib/prisma.ts
prisma/
数据库与上传相关脚本
生产 Dockerfile / docker-compose.yml
NextAuth、Prisma、pg 等运行依赖
```

删除前必须保留：数据库最终备份、内容导出报告、图片迁移清单和旧动态版本的 Git tag。静态迁移稳定至少一个发布周期后，再关闭托管数据库。

## 6. 完成定义

- [ ] `next.config.ts` 使用 `output: "export"`。
- [ ] `npm run build` 输出 `out/`。
- [ ] `out/` 可由任意纯静态 HTTP Server 正确访问。
- [ ] 所有动态路由均在构建时枚举。
- [ ] HTML 中不存在 `/api/`、`localhost`、数据库或 secret。
- [ ] 生产不运行 Node、Docker 应用、PostgreSQL、NextAuth 或 Admin。
- [ ] 博客、门店和图片只能通过审查过的内容提交进入生产。
- [ ] COS/CDN 或 Nginx 可发布并回滚到指定 Git SHA。


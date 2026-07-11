公开页面以 RSC/SSG/ISR 为主；后台为动态渲染；文章与门店由 PostgreSQL 管理；图片经 Sharp 转为 WebP 后写入 public/images；src/lib/data.ts 通过 NEXT_PUBLIC_API_BASE_URL 回环调用自身 API。

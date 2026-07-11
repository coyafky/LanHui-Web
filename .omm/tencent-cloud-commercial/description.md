面向腾讯云单地域商用部署的目标架构：动态 Next.js 请求经 HTTPS CLB 分发到至少两台跨可用区 CVM；关系数据、共享缓存和媒体文件分别交给托管 PostgreSQL、Redis 与 COS/CDN；构建在 CI 完成后以不可变镜像滚动发布。

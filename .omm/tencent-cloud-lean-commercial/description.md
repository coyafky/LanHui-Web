# 轻量商用部署

单台 CVM 承载 Nginx 与两个可切换的 Next.js Docker 运行槽；业务状态全部外置到托管 PostgreSQL 与 COS。目标是低复杂度、可观测、可回滚，而不是宣称单机高可用。
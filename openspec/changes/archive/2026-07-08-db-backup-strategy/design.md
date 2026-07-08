## Context

PostgreSQL + Prisma 7，7 个核心数据模型（User/Province/City/Store/Article/AnalyticsEvent/ActivityLog）。Docker Compose 管理本地 postgres:15-alpine（host:5433→容器:5432）。DATABASE_URL 是唯一连接源。

## Goals / Non-Goals

**Goals:**
- 提供可复用的 pg_dump 自动备份脚本
- 提供带安全确认的恢复脚本
- crontab 模板可直接用于生产
- 灾难恢复 Runbook 含 RPO/RTO/演练步骤
- 检查脚本确保备份策略文件完整

**Non-Goals:**
- 不做云对象存储上传（Runbook 中预留扩展说明）
- 不在 Web 后台执行备份
- 不做实时流复制/WAL 归档
- 不做增量备份

## Decisions

- **pg_dump | gzip** 作为备份方案 — 简单可靠，依赖最少
- **Node.js ESM** 脚本 — 与项目技术栈一致，无需额外依赖
- **DATABASE_URL 解析** — 使用 URL 类提取 host/db 信息，不暴露密码
- **默认保留 30 天** — BACKUP_RETENTION_DAYS 环境变量可配
- **恢复需 --yes** — 破坏性操作强制确认
- **备份文件命名**：`lanhui-db_YYYYMMDD_HHMMSS.sql.gz`

## Risks / Trade-offs

- pg_dump 期间数据库有短暂锁 — 对低流量站点影响可忽略
- 本地备份有单点风险 — Runbook 中推荐同步到对象存储
- 媒体文件（public/images/stores）不在数据库备份范围内 — Runbook 中说明需单独策略

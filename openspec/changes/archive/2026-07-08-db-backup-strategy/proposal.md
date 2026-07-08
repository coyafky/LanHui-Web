## Why

PostgreSQL 数据库无备份体系：仓库中只有 migrations + seed，无法恢复真实业务数据。数据库误删、磁盘损坏、迁移误操作后，门店/文章/用户/分析数据全部丢失。CMS_OPERATIONS.md 虽有零散 pg_dump 示例，但缺少可复用脚本、恢复流程、定时任务和灾难恢复 Runbook。

## What Changes

- 新增 `scripts/db-backup.mjs` — pg_dump 自动备份脚本（gzip 压缩、保留策略、dry-run）
- 新增 `scripts/db-restore.mjs` — 安全恢复脚本（需 `--yes` 确认）
- 新增 `scripts/check-backup-strategy.mjs` — 备份策略完整性检查
- 新增 `ops/cron/lanhui-db-backup.cron.example` — 生产 crontab 模板
- 新增 `docs/DATABASE_BACKUP_RUNBOOK.md` — 灾难恢复 Runbook（含 RPO/RTO、演练步骤）
- 更新 `package.json` new db:backup / db:restore / check:backup 脚本
- 更新 `.gitignore` 忽略 backups/ *.sql *.sql.gz *.dump
- 可optional：`/admin/settings` 展示备份策略状态模块

## Capabilities

### New Capabilities

- `db-backup`: pg_dump 自动备份，支持 gzip 压缩、保留策略、dry-run
- `db-restore`: 安全恢复脚本，需 --yes 确认，支持 .sql 和 .sql.gz
- `db-backup-policy-check`: 备份策略完整性检查脚本

### Modified Capabilities

<!-- None -->

## Impact

- `scripts/` — 3 个新脚本
- `ops/cron/` — 新目录，crontab 模板
- `docs/` — 新灾难恢复 Runbook
- `package.json` — 4 个新 npm scripts，check 脚本链路调整
- `.gitignore` — 4 行新增忽略规则
- `src/app/admin/(dashboard)/settings/page.tsx` — 可选备份策略状态模块

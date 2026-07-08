## 1. 备份脚本

- [x] 创建 `scripts/db-backup.mjs`
  - 环境变量：DATABASE_URL、BACKUP_DIR（默认 ./backups）、BACKUP_RETENTION_DAYS（默认 30）
  - 调用 pg_dump 输出 gzip 压缩文件 `lanhui-db_YYYYMMDD_HHMMSS.sql.gz`
  - 支持 --dry-run（只打印命令）、--no-retention（跳过旧备份清理）
  - 自动创建备份目录，清理超过保留期的旧备份
  - 不打印数据库密码；缺少 DATABASE_URL 或 pg_dump 时明确报错

## 2. 恢复脚本

- [x] 创建 `scripts/db-restore.mjs`
  - 从参数读取备份文件路径，支持 .sql 和 .sql.gz
  - 默认拒绝执行，需 --yes 确认
  - 恢复前打印强警告：目标 host/db、会覆盖数据、建议先备份
  - 缺少 DATABASE_URL、备份文件不存在、psql 不存在时明确报错
  - 恢复完成后提示迁移状态检查和验证步骤

## 3. 检查脚本

- [x] 创建 `scripts/check-backup-strategy.mjs`
  - 检查文件存在性：backup/restore/runbook/cron template
  - 检查 .gitignore 规则：backups/、*.sql、*.sql.gz、*.dump
  - 缺失时输出修复建议并退出 1

## 4. Crontab 模板

- [x] 创建 `ops/cron/lanhui-db-backup.cron.example`
  - 每日凌晨 3 点自动备份
  - 每周检查清理旧备份
  - 注释含生产环境注意事项

## 5. 灾难恢复 Runbook

- [x] 创建 `docs/DATABASE_BACKUP_RUNBOOK.md`
  - 备份目标、RPO（最多丢失 24h）/RTO（2h 内恢复）
  - 手动备份/恢复命令
  - crontab 安装方式
  - 恢复后校验清单
  - 常见错误排查
  - 恢复演练步骤
  - 说明 migrations ≠ 数据备份、媒体文件需单独备份

## 6. Package.json

- [x] 新增 scripts：db:backup、db:backup:dry-run、db:restore、check:backup
- [x] `check:backup` 接入 `npm run check`，放在 build 之前

## 7. .gitignore

- [x] 添加：backups/、*.sql、*.sql.gz、*.dump

## 8. Settings 页面（可选）

- [x] `/admin/settings` 添加"数据库备份策略"模块
  - 展示备份 Runbook 存在状态
  - 推荐命令：npm run db:backup / npm run db:restore
  - 不暴露 DATABASE_URL，不执行备份

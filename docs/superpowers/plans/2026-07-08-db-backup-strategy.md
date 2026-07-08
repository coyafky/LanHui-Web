---
change: db-backup-strategy
design-doc: docs/superpowers/specs/2026-07-08-db-backup-strategy-design.md
base-ref: 9bd8e6893b6af3510cd88aceb0494d19f7458bc8
archived-with: 2026-07-08-db-backup-strategy
---

# P0-5 数据库备份策略 — 实施计划

## 任务列表

### 1. 备份脚本 scripts/db-backup.mjs
- pg_dump + gzip 备份，DATABASE_URL 解析
- --dry-run / --no-retention 支持
- 旧备份清理（30 天保留）
- 错误处理：缺 DATABASE_URL、缺 pg_dump

### 2. 恢复脚本 scripts/db-restore.mjs
- --yes 确认机制
- 支持 .sql / .sql.gz
- 恢复前警告 + 恢复后提示

### 3. 检查脚本 scripts/check-backup-strategy.mjs
- 文件存在性检查
- .gitignore 规则检查
- 缺失时修复建议

### 4. Crontab 模板 ops/cron/lanhui-db-backup.cron.example
- 每日凌晨 3 点备份
- 每周清理旧备份
- 生产环境注释

### 5. 灾难恢复 Runbook docs/DATABASE_BACKUP_RUNBOOK.md
- RPO/RTO、备份目标
- 手动命令、crontab 安装
- 恢复步骤、校验清单、常见错误
- 演练步骤

### 6. 更新 package.json
- 4 个新 scripts
- check:backup 接入 npm run check

### 7. 更新 .gitignore
- backups/、*.sql、*.sql.gz、*.dump

### 8. Settings 页面备份策略模块
- 展示 Runbook 存在状态
- 推荐命令
- 不暴露 DATABASE_URL，不执行备份

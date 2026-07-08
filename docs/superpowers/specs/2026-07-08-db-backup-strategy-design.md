---
comet_change: db-backup-strategy
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-08-db-backup-strategy
status: final
---

# P0-5 数据库备份策略 — 技术设计

## 架构概览

```
scripts/
├── db-backup.mjs              ← DATABASE_URL → pg_dump | gzip → backups/
├── db-restore.mjs             ← backups/xxx.sql.gz → gunzip | psql
└── check-backup-strategy.mjs  ← 文件完整性 + .gitignore 规则检查

ops/cron/lanhui-db-backup.cron.example  ← 生产 crontab 模板
docs/DATABASE_BACKUP_RUNBOOK.md         ← 灾难恢复 Runbook
src/app/admin/(dashboard)/settings/     ← 备份策略状态模块（可选）
```

## 组件设计

### db-backup.mjs

- 用 `URL(DATABASE_URL)` 解析 { hostname, port, pathname, username, password }
- `execFileSync("pg_dump", [...args])` 执行备份，stdout pipe 到 gzip
- 密码通过 `PGPASSWORD` 环境变量传入（不出现命令行参数中）
- 备份文件命名：`lanhui-db_YYYYMMDD_HHMMSS.sql.gz`
- `--dry-run`：只打印命令，不执行
- 清理逻辑：`readdirSync` → filter `lanhui-db_*.sql.gz` → 按 mtime 判断 → `unlinkSync`

### db-restore.mjs

- 参数解析：`process.argv` 取文件路径，检查 `--yes` flag
- 文件格式判断：`.sql.gz` → `gunzip -c | psql`；`.sql` → 直接 `psql`
- 三重守卫：参数存在 → 文件存在 → `--yes` 确认
- 恢复前警告块（ASCII art box）显示目标 host/db，不含密码
- 恢复后输出后续检查步骤

### check-backup-strategy.mjs

- 硬编码文件列表 + `existsSync` 检查
- `.gitignore` 读取 + 规则匹配
- 缺失时输出具体修复建议，退出 1

## 约束

- 不提交真实备份文件、生产连接串、数据库密码
- 密码不出现在任何日志输出中
- 破坏性恢复操作强制 `--yes`
- DATABASE_URL 缺失时退出 1 + 明确错误信息
- pg_dump/psql 缺失时提示安装 PostgreSQL client

## 依赖

- 系统级：`pg_dump`、`psql`、`gunzip`（PostgreSQL client 包）
- 无 npm 依赖（使用 Node.js 内置 `child_process`、`fs`、`path`、`url`、`crypto`）

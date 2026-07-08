# db-backup-policy-check

备份策略完整性检查能力。

## ADDED Requirements

### Requirement: 备份文件存在性检查

系统 SHALL 提供 `scripts/check-backup-strategy.mjs`，检查所有备份策略相关文件是否存在。

#### Scenario: 所有文件存在时通过

- **GIVEN** 以下文件均存在：
  - `scripts/db-backup.mjs`
  - `scripts/db-restore.mjs`
  - `docs/DATABASE_BACKUP_RUNBOOK.md`
  - `ops/cron/lanhui-db-backup.cron.example`
- **WHEN** 运行 `npm run check:backup`
- **THEN** 退出 0，输出全部通过信息

#### Scenario: 文件缺失时报告

- **GIVEN** `scripts/db-backup.mjs` 不存在
- **WHEN** 运行 `npm run check:backup`
- **THEN** 退出 1，输出缺失文件列表和修复建议

### Requirement: .gitignore 规则检查

系统 SHALL 检查 .gitignore 是否包含备份文件忽略规则。

#### Scenario: .gitignore 规则完整

- **GIVEN** .gitignore 包含 `backups/`、`*.sql`、`*.sql.gz`、`*.dump`
- **WHEN** 运行 `npm run check:backup`
- **THEN** .gitignore 检查通过

#### Scenario: .gitignore 规则缺失

- **GIVEN** .gitignore 缺少 `backups/` 规则
- **WHEN** 运行 `npm run check:backup`
- **THEN** 退出 1，输出缺失的 gitignore 规则和修复建议

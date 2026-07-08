# db-restore Specification

## Purpose
TBD - created by archiving change db-backup-strategy. Update Purpose after archive.
## Requirements
### Requirement: 安全恢复确认

系统 SHALL 默认阻止恢复操作，除非用户显式传入 `--yes` 参数。

#### Scenario: 缺少 --yes 时拒绝执行

- **GIVEN** 用户运行 `npm run db:restore -- ./backups/xxx.sql.gz`
- **WHEN** 未传入 `--yes` 参数
- **THEN** 脚本输出错误信息并退出 1，不执行恢复

#### Scenario: 带 --yes 时执行恢复

- **GIVEN** 用户运行 `npm run db:restore -- ./backups/xxx.sql.gz --yes`
- **WHEN** 备份文件存在且 DATABASE_URL 正确
- **THEN** 执行恢复操作

### Requirement: 恢复前警告

系统 SHALL 在恢复前打印目标数据库信息及风险警告。

#### Scenario: 恢复前显示警告

- **GIVEN** 恢复操作即将执行
- **WHEN** 传入 --yes 确认
- **THEN** 打印目标 host/db（不含密码）、数据覆盖风险警告、建议先备份的提示

### Requirement: 支持多种备份格式

系统 SHALL 支持恢复 .sql 和 .sql.gz 两种格式的备份文件。

#### Scenario: 恢复 .sql.gz 文件

- **GIVEN** 备份文件为 `lanhui-db_xxx.sql.gz`
- **WHEN** 执行恢复
- **THEN** 使用 `gunzip -c` 管道到 `psql`

#### Scenario: 恢复 .sql 文件

- **GIVEN** 备份文件为 `lanhui-db_xxx.sql`
- **WHEN** 执行恢复
- **THEN** 直接管道到 `psql`

### Requirement: 恢复后提示校验

系统 SHALL 在恢复完成后提示用户执行迁移状态检查和业务数据抽查。

#### Scenario: 恢复完成提示

- **GIVEN** 恢复操作完成
- **WHEN** psql 返回成功
- **THEN** 提示运行 `npx prisma migrate status`、`npm run build`、登录后台抽查门店和文章数据


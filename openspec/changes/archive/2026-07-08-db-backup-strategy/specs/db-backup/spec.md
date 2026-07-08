# db-backup

pg_dump 自动备份能力。

## ADDED Requirements

### Requirement: 自动备份执行

系统 SHALL 提供 `scripts/db-backup.mjs`，从 `DATABASE_URL` 环境变量读取数据库连接信息，调用系统 `pg_dump` 生成 gzip 压缩备份文件。

#### Scenario: 正常备份成功

- **GIVEN** DATABASE_URL 指向可访问的 PostgreSQL 数据库
- **WHEN** 运行 `npm run db:backup`
- **THEN** 在 BACKUP_DIR（默认 ./backups）下生成 `lanhui-db_YYYYMMDD_HHMMSS.sql.gz` 文件
- **AND** 输出文件路径、文件大小、开始时间、结束时间、耗时

#### Scenario: 缺少 DATABASE_URL

- **GIVEN** 环境变量中没有 DATABASE_URL
- **WHEN** 运行备份脚本
- **THEN** 输出明确错误信息并退出 1

#### Scenario: 缺少 pg_dump

- **GIVEN** 系统未安装 PostgreSQL client
- **WHEN** 运行备份脚本
- **THEN** 输出安装 PostgreSQL client 的提示并退出 1

#### Scenario: Dry-run 模式

- **GIVEN** DATABASE_URL 正确配置
- **WHEN** 运行 `npm run db:backup:dry-run`
- **THEN** 打印将执行的 pg_dump 命令但不实际执行备份

### Requirement: 备份保留策略

系统 SHALL 自动清理超过 BACKUP_RETENTION_DAYS（默认 30 天）的旧备份文件。

#### Scenario: 清理过期备份

- **GIVEN** backups 目录存在 35 天前的备份文件
- **WHEN** 执行备份脚本（无 --no-retention 参数）
- **THEN** 删除超过 30 天的旧备份文件

#### Scenario: 跳过清理

- **GIVEN** backups 目录存在过期备份文件
- **WHEN** 执行备份脚本时传入 --no-retention 参数
- **THEN** 保留所有旧备份文件，不做清理

### Requirement: 密码安全

系统 SHALL 在日志和输出中屏蔽数据库密码。

#### Scenario: 日志不包含密码

- **GIVEN** DATABASE_URL 包含密码
- **WHEN** 备份脚本运行时输出信息
- **THEN** 输出不包含明文密码

# Comet Design Handoff

- Change: db-backup-strategy
- Phase: design
- Mode: compact
- Context hash: ca458051df48bd3d9da148d90c349a7b6a02ac3dd5f2597c170559aeb2a2b704

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/db-backup-strategy/proposal.md

- Source: openspec/changes/db-backup-strategy/proposal.md
- Lines: 1-35
- SHA256: 5c342e404220f3a2a96b2f1f48b5038adaccc0eb9af1f07ca693f56780c60338

```md
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
```

## openspec/changes/db-backup-strategy/design.md

- Source: openspec/changes/db-backup-strategy/design.md
- Lines: 1-33
- SHA256: 6095f1799bd01b720122745c824f5fc1799dc1477d8b08ea9db84aa9353ac2cf

```md
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
```

## openspec/changes/db-backup-strategy/tasks.md

- Source: openspec/changes/db-backup-strategy/tasks.md
- Lines: 1-58
- SHA256: 9e983f51c828c835183f73166ac637d5e4bab4839db818bbf34b170bcd3c5f2f

```md
## 1. 备份脚本

- [ ] 创建 `scripts/db-backup.mjs`
  - 环境变量：DATABASE_URL、BACKUP_DIR（默认 ./backups）、BACKUP_RETENTION_DAYS（默认 30）
  - 调用 pg_dump 输出 gzip 压缩文件 `lanhui-db_YYYYMMDD_HHMMSS.sql.gz`
  - 支持 --dry-run（只打印命令）、--no-retention（跳过旧备份清理）
  - 自动创建备份目录，清理超过保留期的旧备份
  - 不打印数据库密码；缺少 DATABASE_URL 或 pg_dump 时明确报错

## 2. 恢复脚本

- [ ] 创建 `scripts/db-restore.mjs`
  - 从参数读取备份文件路径，支持 .sql 和 .sql.gz
  - 默认拒绝执行，需 --yes 确认
  - 恢复前打印强警告：目标 host/db、会覆盖数据、建议先备份
  - 缺少 DATABASE_URL、备份文件不存在、psql 不存在时明确报错
  - 恢复完成后提示迁移状态检查和验证步骤

## 3. 检查脚本

- [ ] 创建 `scripts/check-backup-strategy.mjs`
  - 检查文件存在性：backup/restore/runbook/cron template
  - 检查 .gitignore 规则：backups/、*.sql、*.sql.gz、*.dump
  - 缺失时输出修复建议并退出 1

## 4. Crontab 模板

- [ ] 创建 `ops/cron/lanhui-db-backup.cron.example`
  - 每日凌晨 3 点自动备份
  - 每周检查清理旧备份
  - 注释含生产环境注意事项

## 5. 灾难恢复 Runbook

- [ ] 创建 `docs/DATABASE_BACKUP_RUNBOOK.md`
  - 备份目标、RPO（最多丢失 24h）/RTO（2h 内恢复）
  - 手动备份/恢复命令
  - crontab 安装方式
  - 恢复后校验清单
  - 常见错误排查
  - 恢复演练步骤
  - 说明 migrations ≠ 数据备份、媒体文件需单独备份

## 6. Package.json

- [ ] 新增 scripts：db:backup、db:backup:dry-run、db:restore、check:backup
- [ ] `check:backup` 接入 `npm run check`，放在 build 之前

## 7. .gitignore

- [ ] 添加：backups/、*.sql、*.sql.gz、*.dump

## 8. Settings 页面（可选）

- [ ] `/admin/settings` 添加"数据库备份策略"模块
  - 展示备份 Runbook 存在状态
  - 推荐命令：npm run db:backup / npm run db:restore
  - 不暴露 DATABASE_URL，不执行备份
```

## openspec/changes/db-backup-strategy/specs/db-backup-policy-check/spec.md

- Source: openspec/changes/db-backup-strategy/specs/db-backup-policy-check/spec.md
- Lines: 1-41
- SHA256: 97909237ba82d84b049710c80a0fe35b0c55f21ac63ade0cfaa321d63bb8e2e6

```md
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
```

## openspec/changes/db-backup-strategy/specs/db-backup/spec.md

- Source: openspec/changes/db-backup-strategy/specs/db-backup/spec.md
- Lines: 1-60
- SHA256: 5a35f9c63bd09058cb881fec18f892df4b38e3f2334ec69858c6299457944101

```md
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
```

## openspec/changes/db-backup-strategy/specs/db-restore/spec.md

- Source: openspec/changes/db-backup-strategy/specs/db-restore/spec.md
- Lines: 1-57
- SHA256: 44f3fa40371f6a58fc3dab902c09893318123360ff90e1afa26cfd79266a5dda

```md
# db-restore

数据库安全恢复能力。

## ADDED Requirements

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
```


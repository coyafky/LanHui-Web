# 数据库备份与灾难恢复 Runbook

## 备份目标

| 指标 | 值 | 说明 |
|------|-----|------|
| RPO（恢复点目标） | 最多丢失 24 小时数据 | 每日凌晨 3 点备份，两次备份间隔内的数据可能丢失 |
| RTO（恢复时间目标） | 2 小时内恢复后台可用 | 含备份下载、恢复、迁移校验、构建验证 |
| 备份内容 | 单数据库 `lanhui` | 不含全局角色（非 pg_dumpall） |
| 保留期 | 30 天 | 通过 `BACKUP_RETENTION_DAYS` 可配 |
| 备份格式 | gzip 压缩 SQL | `lanhui-db_YYYYMMDD_HHMMSS.sql.gz` |

### 不在备份范围

- **媒体文件**：`public/images/stores/` 本地存储的图片不在数据库备份中，需单独备份策略
- **Prisma migrations**：`prisma/migrations/` 通过 git 版本控制保留，可恢复表结构但无法恢复数据
- **全局数据库角色/权限**：pg_dump 仅备份单库，不含 `CREATE ROLE` 语句

> **重要**：migrations ≠ 数据备份。`prisma/seed.ts` 只能恢复初始种子数据（admin + 省市），不能恢复真实运营数据（门店、文章、用户、分析事件）。

---

## 手动备份

```bash
# 标准备份
npm run db:backup

# 预览命令（不执行）
npm run db:backup:dry-run

# 指定备份目录和保留天数
BACKUP_DIR=/mnt/backups/lanhui BACKUP_RETENTION_DAYS=60 npm run db:backup

# 跳过旧备份清理
npm run db:backup -- --no-retention
```

备份文件默认输出到项目根目录 `./backups/`。

---

## 自动备份配置（Crontab）

### 安装

```bash
crontab -e
```

将 `ops/cron/lanhui-db-backup.cron.example` 的内容粘贴进去，按实际情况修改路径。

### 验证 crontab 已生效

```bash
crontab -l | grep lanhui
```

### 日志检查

```bash
tail -f /var/log/lanhui-db-backup.log
```

---

## 恢复步骤

### 前提条件

- 目标机器已安装 PostgreSQL client（`psql`、`pg_dump`）
- 备份文件可访问（本地或从对象存储下载）
- `DATABASE_URL` 指向**正确的目标数据库**（确认不是生产库！）

### Step 1: 确认目标环境

```bash
echo $DATABASE_URL
# 确认 host/database 是你要恢复的目标
```

### Step 2: 恢复前先备份当前状态（强烈建议）

```bash
npm run db:backup
# 即使数据库是空的或有问题的，保留一份当前快照
```

### Step 3: 执行恢复

```bash
# 从 gzip 备份恢复
npm run db:restore -- ./backups/lanhui-db_20260707_030000.sql.gz --yes

# 从未压缩 SQL 恢复
npm run db:restore -- ./backups/lanhui-db_20260707_030000.sql --yes
```

### Step 4: 校验恢复结果

```bash
# 检查迁移状态
npx prisma migrate status

# 如有 pending migrations，执行
npx prisma migrate deploy

# 重建应用
npm run build

# 启动开发服务器抽查
npm run dev
```

### Step 5: 业务数据抽查

- [ ] 登录 `/admin` 后台
- [ ] 检查 Store 数量和内容是否完整
- [ ] 检查 Article 数量和内容是否完整
- [ ] 检查 User 列表
- [ ] 打开公开站 `/agent` 确认门店列表正常
- [ ] 打开 `/news` 确认文章列表正常
- [ ] 抽查一个门店详情页和一个文章详情页

---

## 恢复演练（建议每月一次）

### 使用临时数据库演练

```bash
# 1. 创建临时数据库
docker exec lanhui-postgres psql -U lanhui -d postgres -c "CREATE DATABASE lanhui_restore_test;"

# 2. 恢复到临时库
DATABASE_URL="postgresql://lanhui:lanhui_password@localhost:5433/lanhui_restore_test" \
  npm run db:restore -- ./backups/lanhui-db_20260707_030000.sql.gz --yes

# 3. 运行迁移
DATABASE_URL="postgresql://lanhui:lanhui_password@localhost:5433/lanhui_restore_test" \
  npx prisma migrate deploy

# 4. 抽查数据
DATABASE_URL="postgresql://lanhui:lanhui_password@localhost:5433/lanhui_restore_test" \
  npx prisma studio

# 5. 清理
docker exec lanhui-postgres psql -U lanhui -d postgres -c "DROP DATABASE lanhui_restore_test;"
```

### 演练检查项

- [ ] 备份文件可以成功解压
- [ ] psql 导入无错误
- [ ] Prisma migrate status 显示 up-to-date
- [ ] Store / Article / User 数量与预期一致
- [ ] 公开站首页可正常渲染

---

## 常见错误

### `pg_dump: command not found`

```bash
# macOS
brew install libpq

# Ubuntu/Debian
sudo apt install postgresql-client

# Alpine
apk add postgresql-client
```

### `psql: command not found`

同上，`psql` 和 `pg_dump` 属于同一个包。

### `DATABASE_URL` 指向错误环境

恢复前**务必**检查 `echo $DATABASE_URL`，确认 host 和 database 名称。常见错误：
- 把生产备份恢复到开发库（还好）
- 把开发备份恢复到生产库（灾难）
- 端口号错误（本地 5433，Docker 内部 5432）

### gzip 文件损坏

```bash
# 检查文件完整性
gunzip -t lanhui-db_20260707_030000.sql.gz

# 如果报错，备份文件可能不完整，尝试其他日期的备份
```

### Prisma migration 状态不一致

```bash
# 查看当前状态
npx prisma migrate status

# 如果显示有未应用的 migration
npx prisma migrate deploy

# 如果 migration 历史不匹配
npx prisma migrate resolve --applied <migration_name>
```

---

## 扩展建议（当前未实现）

- **对象存储同步**：将 `backups/` 目录同步到阿里云 OSS 或 S3，防止服务器磁盘故障导致备份丢失
- **WAL 连续归档**：配置 PostgreSQL WAL archiving 实现时间点恢复（PITR）
- **增量备份**：使用 `pg_basebackup` 或 `pgBackRest` 工具
- **备份监控告警**：监控备份脚本退出码，备份失败时发送飞书/钉钉通知
- **媒体文件备份**：`public/images/stores/` 需要独立的文件备份方案

# Brainstorm Summary

- Change: db-backup-strategy
- Date: 2026-07-08

## 确认的技术方案

- pg_dump | gzip 备份，Node.js ESM 脚本
- 3 脚本：db-backup.mjs / db-restore.mjs / check-backup-strategy.mjs
- DATABASE_URL 用 URL 类解析，密码不输出日志
- 默认保留 30 天，BACKUP_RETENTION_DAYS 可配
- 恢复需 --yes 确认，支持 .sql 和 .sql.gz
- cron 模板每日凌晨 3 点，每周清理旧备份
- Runbook 含 RPO(24h)/RTO(2h)、恢复步骤、演练、常见错误
- Settings 页面添加备份策略状态模块
- check:backup 接入 npm run check 链路

## 关键取舍与风险

- pg_dump 单库备份（非 pg_dumpall），不含全局角色
- 本地备份有单点风险，Runbook 推荐同步到对象存储
- 媒体文件（public/images/stores）不在数据库备份范围
- 不做云上传、WAL 归档、增量备份（Runbook 预留扩展说明）

## 测试策略

- --dry-run 验证命令生成
- check:backup 链入 CI（lint → typecheck → verify:zeekr → check:backup → build）
- 有 DB 环境下手动验证真实备份+恢复
- Settings 页面手动 UI 检查

## Spec Patch

无

# DEPLOYMENT_RUNBOOK_PRD_2026-06-20 — 部署 Runbook

> 目的:从代码 commit 到生产可用的全链路 SOP,防踩坑(P3005 / DATABASE_URL / 默认密钥)。
> 关联:`docs/CMS_OPERATIONS.md` §六 + `docs/ARCHITECTURE.md` §11 + `Dockerfile`(3 阶段)+ `docker-compose.yml`。
> 复用 ZEEKR build 模式:每步独立可验证(checklist + 自动命令)。

## 0. 元信息
| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 触发 | Coya 反映"部署文档散落、缺统一 Runbook;新成员上手 1 周" |
| 范围 | 代码 / DB / 环境变量 / 备份 / 镜像 / 上线后 smoke / 回滚 |
| 方法 | 模板化 Runbook + 关键陷阱(P3005 / DATABASE_URL)显式标注 + smoke test 脚本 |
| 输出 | 本 PRD + `scripts/deploy-smoke.mjs` + `docs/runbooks/` 子目录 |
| 目标读者 | 全栈工程师 / 运维 / 应急响应人员 |
| 预计耗时 | 首版编写 2h;实际部署 1 次约 30 分钟(代码层)+ 15 分钟(DB 层) |

## 1. 背景与目标

蓝辉轻改当前部署涉及 3 个易踩坑:
1. **P3005**:`prisma migrate deploy` 在已用 `db push` bootstrap 的 DB 上失败(`_prisma_migrations` 表不存在)
2. **DATABASE_URL 端口**:本地 `5433`,容器内 `5432`;`.env.example` 写错为 5432
3. **NEXTAUTH_SECRET 默认占位**:`your-secret-here-change-in-production` 在生产直接被使用 → JWT 可伪造

部署 Runbook 的目标:
- 提供 1 份"按顺序执行即可成功"的清单,每步带验证命令
- 显式标注 5+ 已知陷阱(避免二次踩坑)
- 包含回滚 SOP(镜像 tag + DB 备份恢复)
- 包含上线后 smoke test(关键路径 5 路由 + 1 后台登录)

## 2. 范围与边界

### 2.1 包含
- ✅ 部署前 checklist(代码 / DB / 环境变量 / 备份)
- ✅ 部署流程(本地构建 → 镜像 push → ECS / 阿里云服务器)
- ✅ 数据库迁移(`prisma migrate deploy` + P3005 陷阱)
- ✅ 部署后 smoke test(关键路径 5 路由 + 后台登录)
- ✅ 回滚方案(镜像 tag / DB 备份恢复)
- ✅ 监控告警(服务器 / DB / 错误率)
- ✅ 应急响应(密码泄露 / 容器故障 / DB 损坏)

### 2.2 不包含
- ❌ 初次环境搭建(见 `docs/CMS_OPERATIONS.md` §一/§二)
- ❌ 阿里云 ECS 选型 / 备案 / SSL 申请(由运维 Ops 负责)
- ❌ CDN / OSS 配置(待 OSS 迁移时另起 Runbook)

## 3. 当前状态 (Status)

### 3.1 数据看板

| 指标 | 当前 | 目标 |
|---|---|---|
| 部署 SOP 文档化 | ❌ 散落在 CMS_OPERATIONS §六 | ✅ 本 PRD + `docs/runbooks/` |
| 部署 checklist 项数 | 0 标准化 | ≥ 20 项 |
| Smoke test 自动覆盖 | 0 路由 | 5 公开路由 + 1 后台登录 |
| 回滚演练次数 | 0 | ≥ 1/季度 |
| 监控告警 | ❌ 无 | ✅ 服务器 / DB / 错误率 3 类 |
| 部署后平均故障定位时间 | N/A | < 15 分钟 |

### 3.2 已知问题 / 陷阱

| ID | 问题 | 优先级 | 状态 |
|---|---|---|---|
| P3005 | `prisma migrate deploy` 在 `db push` bootstrap 的 DB 上 P3005 失败 | P0 | 🟡 本 PRD §5.3 详写修复 |
| PORT-5433 | `.env.example` 写 `localhost:5432`,实际容器 `5433` | P0 | 🟡 CLAUDE.md + 本 PRD 强调 |
| DEFAULT-SECRET | `NEXTAUTH_SECRET=your-secret-here-change-in-production` 在生产直接用 | P0 | 🟡 部署前 checklist 强制 |
| DEFAULT-ADMIN | 默认 admin/admin123 未改 | P0 | 🟡 部署前 checklist 强制 |
| OSS-UNUSED | `.env.example` 含 `ALIYUN_*` 占位,新人误以为图床已接入 | P1 | 🟡 ADR-002 + 本 PRD §5 强调 |
| BACKUP-FREQ | 无定时备份任务 | P1 | 🟡 本 PRD §5.6 配置 crontab |
| NO-HEALTHCHECK | app 容器有 healthcheck,但 nginx 失败时不会重启 | P2 | 🟡 计划 docker-compose restart policy |

## 4. 改进路线

### 4.1 已完成
- 2026-06-14: P3005 修复 SOP(见 CLAUDE.md "环境陷阱" §4)
- 2026-06-15: DB 迁移 `_prisma_migrations` 表手动建表法
- 2026-06-19: AUDIT 完成,触发 Runbook 编写

### 4.2 进行中
- 本 PRD 编写
- `scripts/deploy-smoke.mjs` 实现

### 4.3 计划
- Q3 2026: 接入阿里云 SLS 日志 + 钉钉告警 webhook
- Q4 2026: 蓝绿部署(blue-green)实现,零停机切换
- 2027 H1: GitOps(Argo CD) 接入,提交即部署

## 5. 实施规范(部署全流程)

### 5.1 部署前 Checklist(20 项)

#### 5.1.1 代码层(5 项)
```bash
# [1] 工作分支干净
git status  # 期望: nothing to commit, working tree clean

# [2] 本地 main 与远程同步
git fetch origin && git status -sb  # 期望: ## main...origin/main

# [3] CI 全绿(GitHub Actions)
# 访问 https://github.com/<owner>/lanhui-website/actions,确认最新 commit 绿色
# 或本地: npm run check  # lint + typecheck + verify:zeekr-images + build

# [4] 版本号更新(CHANGELOG.md)
# 编辑 CHANGELOG.md 追加 ## [Unreleased] 或 ## [v0.4.0] - 2026-XX-XX

# [5] 数据库迁移脚本已生成
ls prisma/migrations/  # 若改了 schema.prisma,确认有新增的 20XXMMDDHHMMSS_xxx/
```

#### 5.1.2 数据库层(4 项)
```bash
# [6] 数据库备份(部署前 5 分钟)
docker exec lanhui-postgres pg_dump -U lanhui lanhui > backups/lanhui_pre-deploy_$(date +%Y%m%d_%H%M%S).sql
# 验证文件大小 > 1KB(空库也至少 1KB)

# [7] 确认迁移兼容性
# 查新迁移是否含 DROP COLUMN / DROP TABLE — 若有,必须 Coya 二次确认
grep -E "DROP (COLUMN|TABLE)" prisma/migrations/20*_*/migration.sql || echo "OK: no DROP"

# [8] 备份远程镜像(若用阿里云 ACR)
docker tag lanhui-website:latest registry.cn-shanghai.aliyuncs.com/lanhui/lanhui-website:v0.3.1-pre
docker push registry.cn-shanghai.aliyuncs.com/lanhui/lanhui-website:v0.3.1-pre

# [9] 确认 DB schema 与代码同步
set -a && source .env && set +a
npx prisma migrate status  # 期望: "Database schema is up to date!"
```

#### 5.1.3 环境变量层(7 项)
```bash
# [10] NEXTAUTH_SECRET ≥ 32 字符且不与上一版本相同
grep -E "^NEXTAUTH_SECRET=" .env  # 必须非默认占位

# [11] DATABASE_URL 容器内用 postgres:5432,主机侧用 localhost:5433
# .env 主机开发: postgresql://lanhui:lanhui_password@localhost:5433/lanhui
# docker-compose env: postgresql://lanhui:lanhui_password@postgres:5432/lanhui

# [12] NEXTAUTH_URL 是 HTTPS(生产强制)
grep -E "^NEXTAUTH_URL=https://" .env

# [13] NEXT_PUBLIC_API_BASE_URL 与 NEXTAUTH_URL 一致

# [14] ALIYUN_* 未配置(本地存储阶段不需要) — 但保留占位避免误配
grep -E "^ALIYUN_ACCESS_KEY_ID=$" .env  # 必须为空

# [15] POSTGRES_PASSWORD 在 docker-compose.yml 已改为强密码
grep -E "POSTGRES_PASSWORD: lanhui_password$" docker-compose.yml  # 应无匹配

# [16] 数据库外部端口未暴露(生产)
# docker-compose.yml 应无 `ports: - 5433:5432`,或注释掉
```

#### 5.1.4 服务器层(4 项)
```bash
# [17] 服务器资源足够(2C4G 起)
ssh user@server "free -h && df -h / && nproc"
# 期望:可用内存 ≥ 1GB,磁盘 ≥ 10GB,CPU ≥ 2 核

# [18] Docker 与 Docker Compose 版本
ssh user@server "docker --version && docker compose version"
# 期望: Docker ≥ 20.10, Compose ≥ v2.0

# [19] 80/443 端口未占用
ssh user@server "sudo ss -tlnp | grep -E ':(80|443)\s'"

# [20] 当前无运行中的部署任务
ssh user@server "docker ps --format '{{.Names}}' | grep lanhui" || echo "OK: 无运行中容器"
```

### 5.2 部署流程(Docker 镜像方案)

#### 阶段 A:本地构建(10 分钟)
```bash
# A1. 切到 main 并拉取
git checkout main && git pull origin main

# A2. 更新版本号(README/package.json)
# 编辑 package.json version: "0.3.1" → "0.3.2"
# 编辑 CHANGELOG.md

# A3. 本地构建镜像
docker build -t lanhui-website:v0.3.2 -t lanhui-website:latest .

# A4. 本地验证(可选)
docker compose up -d
sleep 30
curl -sI http://localhost:3000/ | head -n 1
# 期望: HTTP/1.1 200 OK
docker compose down
```

#### 阶段 B:镜像推送(到阿里云 ACR,5 分钟)
```bash
# B1. 登录阿里云容器镜像服务
docker login registry.cn-shanghai.aliyuncs.com -u <aliyun-user>

# B2. 推送带版本号的镜像
docker push registry.cn-shanghai.aliyuncs.com/lanhui/lanhui-website:v0.3.2
docker push registry.cn-shanghai.aliyuncs.com/lanhui/lanhui-website:latest

# B3. 在阿里云控制台确认镜像已上传
```

#### 阶段 C:服务器部署(15 分钟)
```bash
# C1. SSH 到服务器
ssh user@lanhui-prod-server

# C2. 拉取最新代码(用于 docker-compose 与 .env)
cd /opt/lanhui-website
sudo git pull origin main

# C3. 拉取新镜像
sudo docker compose pull app

# C4. 滚动重启(零停机)
sudo docker compose up -d --no-deps --build app
# 等价:docker compose stop app && docker compose up -d app
# 短暂停机约 10s,可接受

# C5. 等待 app 健康
sleep 30
sudo docker compose ps app  # 期望:State healthy
```

#### 阶段 D:数据库迁移(15 分钟)
```bash
# D1. 加载环境变量
set -a && source .env && set +a

# D2. ⚠️ P3005 陷阱处理 — 见 §5.3

# D3. 正常迁移
sudo docker compose exec app npx prisma migrate deploy

# D4. 验证
sudo docker compose exec app npx prisma migrate status
# 期望: "Database schema is up to date!"

# D5. (可选)重新 seed(若 seed.ts 有更新)
sudo docker compose exec app npx tsx prisma/seed.ts
```

### 5.3 ⚠️ P3005 陷阱与解决方案

**问题**:`prisma migrate deploy` 在"已用 `db push` bootstrap,无 `_prisma_migrations` 表"的 DB 上报 P3005 "Database schema is not empty"。

**触发条件**:
- DB 在 2026-06-15 之前用 `npx prisma db push` 创建
- `_prisma_migrations` 表不存在
- 之后未运行过 `prisma migrate dev` 或 `migrate deploy`

**解决方案**(在服务器上执行):
```bash
# D2.1 进入 postgres 容器
sudo docker exec -it lanhui-postgres psql -U lanhui -d lanhui

# D2.2 手动建 _prisma_migrations 表(注意 logs 是复数!)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "_prisma_migrations_migration_name_idx"
  ON "_prisma_migrations" ("migration_name");
CREATE INDEX IF NOT EXISTS "_prisma_migrations_finished_at_idx"
  ON "_prisma_migrations" ("finished_at");

# D2.3 插入所有历史迁移记录(假设从 20260101000001_init 到 20260615000007_xxx)
INSERT INTO "_prisma_migrations"
  (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
SELECT
  gen_random_uuid()::text,
  '',
  NOW(),
  migration_name,
  NULL,
  NOW(),
  1
FROM (
  VALUES
    ('20260101000001_init'),
    ('20260201000002_add_store_metadata'),
    ('20260301000003_add_article_status'),
    ('20260401000004_seed_enhancement'),
    ('20260501000005_analytics_index'),
    ('20260601000006_window_film_pkg'),
    ('20260615000007_pending_review_state')
) AS migrations(migration_name);

# D2.4 退出 psql
\q

# D2.5 此时再跑 migrate deploy
sudo docker compose exec app npx prisma migrate deploy
# 期望成功

# D2.6 验证
sudo docker compose exec app npx prisma migrate status
# 期望: "Database schema is up to date!"
```

**预防**:新部署直接用 `prisma migrate deploy` + 初次 `migrate dev --name init`;**绝不**用 `db push` 上生产。

### 5.4 部署后 Smoke Test(10 分钟)

自动脚本 `scripts/deploy-smoke.mjs`(本 PRD 输出,见附录 B):
```bash
# 部署完成后立即跑
node scripts/deploy-smoke.mjs --env production
```

手动验证清单(脚本失败时回退):
```bash
# S1. 首页 200
curl -sI https://lanhui.example.com/ | head -n 1  # HTTP/1.1 200 OK

# S2. 产品列表 200
curl -sI https://lanhui.example.com/product | head -n 1

# S3. 门店列表 200(测试 P0-6 修复)
curl -sI https://lanhui.example.com/agent | head -n 1

# S4. 后台登录页 200
curl -sI https://lanhui.example.com/admin/login | head -n 1

# S5. sitemap.xml 200
curl -sI https://lanhui.example.com/sitemap.xml | head -n 1

# S6. 后台登录功能(admin / <新密码>)
curl -c cookies.txt -X POST https://lanhui.example.com/api/auth/callback/credentials \
  -d 'username=admin&password=<新密码>'  # 期望 302 / set-cookie

# S7. analytics track 200(冒烟)
curl -X POST https://lanhui.example.com/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"pageview","pathname":"/smoke"}]}'

# S8. (可选)API stores 列表返回 published
curl -s https://lanhui.example.com/api/stores | jq '.data[] | select(.status != "published")'
# 期望:空数组(P0-6 已修)
```

### 5.5 回滚方案

#### 场景 A:代码 bug,需立即回退到上一版本(5 分钟)
```bash
# RA1. SSH 到服务器
ssh user@lanhui-prod-server
cd /opt/lanhui-website

# RA2. 停止当前容器
sudo docker compose stop app

# RA3. 拉取上一版本镜像
sudo docker compose pull app  # 取决于 docker-compose.yml 中 image tag
# 或:docker tag ...:v0.3.1 ...:latest && docker compose up -d

# RA4. 重启
sudo docker compose up -d app

# RA5. smoke test
node scripts/deploy-smoke.mjs --env production

# RA6. 回滚 DB 迁移(若本次部署含新迁移且已执行)
# 注意:Prisma 不支持自动 rollback,需手动写反向 SQL
sudo docker exec -it lanhui-postgres psql -U lanhui -d lanhui < rollback_20XXMMDDHHMMSS.sql
```

#### 场景 B:DB 误删 / 数据损坏(30 分钟)
```bash
# RB1. 立即停止写入(把 app 停掉,只读 DB 用于取证)
sudo docker compose stop app

# RB2. 列出最近备份
ls -lt backups/lanhui_pre-deploy_*.sql | head -n 5

# RB3. 恢复最新一份
cat backups/lanhui_pre-deploy_20260620_143022.sql | \
  sudo docker exec -i lanhui-postgres psql -U lanhui -d lanhui

# RB4. 验证数据完整性
sudo docker exec -it lanhui-postgres psql -U lanhui -d lanhui -c \
  "SELECT 'Store' as t, COUNT(*) FROM \"Store\" UNION ALL
   SELECT 'Article', COUNT(*) FROM \"Article\" UNION ALL
   SELECT 'User', COUNT(*) FROM \"User\";"
# 数字应与备份前一致(± 5 分钟内的合法写入)

# RB5. 重启 app
sudo docker compose up -d app

# RB6. smoke test + 通知 Coya
```

#### 场景 C:服务器不可用(1 小时)
```bash
# RC1. 启动备用服务器(需预先准备镜像)
ssh user@lanhui-backup-server
cd /opt/lanhui-website

# RC2. 拉取镜像 + 启动
sudo docker compose pull
sudo docker compose up -d

# RC3. 切换 DNS(阿里云 DNS API / Cloudflare API)
# 假设域名 lanhui.example.com 解析到生产 IP,改为备用 IP

# RC4. 通知 Coya + 客户
```

### 5.6 监控告警(最低配置)

#### 服务器层(Node Exporter + 钉钉 webhook)
```bash
# 阿里云 ECS 自带云监控,只需开启"基础监控"
# 配置项:CPU > 80% 持续 5 分钟 → 告警
# 内存使用 > 90% → 告警
# 磁盘使用 > 85% → 告警
```

#### DB 层(postgres_exporter 或云监控 RDS)
```bash
# 监控项:
# - 活跃连接数 > 80% max_connections(默认 100)→ 告警
# - 数据库大小 > 10GB → 提示扩容
# - 慢查询(> 1s)数量突增 → 告警
# - Replication lag(若启用只读副本)> 10s → 告警
```

#### 应用层(Next.js 错误率 + analytics 异常)
```bash
# 监控项:
# - /api/* 5xx 错误率 > 1% 持续 5 分钟 → 告警(钉钉 webhook)
# - /api/analytics/track 限流 429 突增 → 提示攻击
# - /admin/login 失败次数 > 50/h → 提示暴力破解
# - 容器 OOM 重启 → 立即告警
```

#### 日志收集(SLS 或自建 Loki)
```bash
# 推荐:阿里云 SLS(简单)
# 替代:docker compose logs → Loki → Grafana
# 必须收集:app stdout、nginx access、postgres slow log
```

#### 定时备份(crontab)
```bash
# 编辑 crontab
ssh user@lanhui-prod-server
crontab -e

# 每天凌晨 3 点全量备份
0 3 * * * cd /opt/lanhui-website && \
  docker compose exec -T postgres pg_dump -U lanhui lanhui | \
  gzip > /opt/backups/lanhui_$(date +\%Y\%m\%d).sql.gz

# 每周日凌晨 4 点清理 30 天前备份
0 4 * * 0 find /opt/backups -name "lanhui_*.sql.gz" -mtime +30 -delete
```

## 6. 验收标准 (DoD)

- [ ] 本 PRD 文档完整(8 节,≥ 200 行)
- [ ] `scripts/deploy-smoke.mjs` 实现,支持 `--env production` 标志
- [ ] `scripts/deploy-smoke.mjs` 接入 `npm run smoke`(可选,不强制 check)
- [ ] 部署前 20 项 checklist 全部命令可在 shell 中直接执行(无占位)
- [ ] P3005 修复 SOP 包含完整可粘贴的 SQL
- [ ] 回滚 3 场景(代码/DB/服务器)各自有完整步骤
- [ ] 监控告警 3 类(服务器/DB/应用)配置示例就绪
- [ ] 定时备份 crontab 可直接 `crontab -e` 粘贴
- [ ] 至少 1 次模拟部署演练(本地 docker compose 全流程跑通)
- [ ] 演练结果写入 `docs/test-reports/DEPLOYMENT_DRILL_2026-06-XX.md`

## 7. 任务清单 (Backlog)

| ID | 任务 | 优先级 | 估时 | 状态 |
|---|---|---|---|---|
| RUN-T01 | 写 `scripts/deploy-smoke.mjs`(5 公开路由 + 后台登录 + analytics track) | P0 | 1h | ⚪ |
| RUN-T02 | 在阿里云申请备案域名 + SSL 证书 + 阿里云容器镜像服务 ACR | P1 | 1d | ⚪ |
| RUN-T03 | 配置 ECS 安全组(仅 80/443 暴露) | P1 | 0.5h | ⚪ |
| RUN-T04 | 配置 ECS 云监控基础告警 | P1 | 1h | ⚪ |
| RUN-T05 | 配置 SLS 日志收集(app + nginx + postgres) | P2 | 2h | ⚪ |
| RUN-T06 | 接入钉钉 webhook 告警(企业群机器人) | P1 | 0.5h | ⚪ |
| RUN-T07 | 定时备份 crontab 实装 | P1 | 0.3h | ⚪ |
| RUN-T08 | 第一次部署演练(本地 docker compose 全流程) | P0 | 1h | ⚪ |
| RUN-T09 | 写演练报告 `docs/test-reports/DEPLOYMENT_DRILL_2026-06-XX.md` | P1 | 0.5h | ⚪ |
| RUN-T10 | P3005 修复脚本化 `scripts/fix-p3005.sh`(本 PRD §5.3 自动化) | P2 | 1h | ⚪ |
| RUN-T11 | 蓝绿部署(blue-green)调研与 POC | P3 | 5h | ⚪ |
| RUN-T12 | GitOps(Argo CD / Flux)接入调研 | P3 | 8h | ⚪ |

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿,Runbook + 20 项 checklist + P3005 修复 SOP + 回滚 3 场景 | Coya |

---

## 附录 A: 部署命令速查卡(打印贴工位)

```
┌─────────────────────────────────────────────────────────────┐
│  LANHUI 部署命令速查 v0.1                                     │
├─────────────────────────────────────────────────────────────┤
│  # 部署前 9 步                                                │
│  1. git pull origin main                                     │
│  2. git status  # clean                                     │
│  3. npm run check  # lint+typecheck+build                    │
│  4. docker exec lanhui-postgres pg_dump ... > backup.sql    │
│  5. cat .env | grep -E 'NEXTAUTH_SECRET|POSTGRES_PASSWORD'  │
│  6. npx prisma migrate status  # up to date                 │
│  7. docker build -t lanhui-website:v0.3.2 .                 │
│  8. docker push registry.cn-shanghai.aliyuncs.com/lanhui/v0.3.2 │
│  9. ssh server "cd /opt/lanhui-website && git pull"          │
│                                                              │
│  # 部署中 4 步                                                │
│  10. ssh server "docker compose pull app"                    │
│  11. ssh server "docker compose up -d --no-deps --build app"│
│  12. ssh server "docker compose exec app npx prisma migrate │
│                  deploy"  # P3005 见 §5.3                    │
│  13. ssh server "docker compose exec app npx prisma migrate │
│                  status"                                     │
│                                                              │
│  # 部署后 smoke test                                          │
│  14. node scripts/deploy-smoke.mjs --env production         │
│  15. 手动 curl 5 路由(见 §5.4)                               │
│  16. 登录 admin 验证后台                                       │
│                                                              │
│  # 回滚(代码)                                                │
│  99. ssh server "docker compose stop app &&                  │
│                  docker tag ...:v0.3.1 ...:latest &&        │
│                  docker compose up -d app"                  │
└─────────────────────────────────────────────────────────────┘
```

## 附录 B: scripts/deploy-smoke.mjs 草案

```js
#!/usr/bin/env node
// 部署后 smoke test,验证关键 5 路由 + 后台登录 + analytics
import { setTimeout as sleep } from "node:timers/promises";

const env = process.argv.includes("--env production") ? "production" : "staging";
const BASE = env === "production"
  ? "https://lanhui.example.com"
  : "http://localhost:3000";

const ROUTES = [
  { path: "/", expect: 200, name: "首页" },
  { path: "/product", expect: 200, name: "产品中心" },
  { path: "/agent", expect: 200, name: "门店网络" },
  { path: "/admin/login", expect: 200, name: "后台登录" },
  { path: "/sitemap.xml", expect: 200, name: "sitemap" },
];

let passed = 0, failed = 0;
for (const r of ROUTES) {
  try {
    const res = await fetch(BASE + r.path, { redirect: "manual" });
    const status = res.status;
    const ok = status === r.expect;
    console.log(`${ok ? "✓" : "✗"} ${r.name} ${BASE}${r.path} → ${status}`);
    if (ok) passed++; else failed++;
  } catch (e) {
    console.log(`✗ ${r.name} ${BASE}${r.path} → ERR ${e.message}`);
    failed++;
  }
}

// analytics track 冒烟
try {
  const res = await fetch(BASE + "/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [{ type: "pageview", pathname: "/smoke" }] }),
  });
  const ok = res.status === 200;
  console.log(`${ok ? "✓" : "✗"} analytics track → ${res.status}`);
  if (ok) passed++; else failed++;
} catch (e) {
  console.log(`✗ analytics track → ERR ${e.message}`);
  failed++;
}

console.log(`\n[deploy-smoke] ${env} → ${passed} pass / ${failed} fail`);
process.exit(failed > 0 ? 1 : 0);
```

## 附录 C: 参考案例
- [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 全站审计
- [SECURITY_AUDIT_PRD_2026-06-20.md](./SECURITY_AUDIT_PRD_2026-06-20.md) — 安全审计
- [PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md](./PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md) — 性能优化

## 附录 D: 相关文档
- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.5 / §8
- [../../CLAUDE.md](../../CLAUDE.md) §环境陷阱 — P3005/端口 5433 详解
- [../../docs/CMS_OPERATIONS.md](../../docs/CMS_OPERATIONS.md) §六 — 部署基础
- [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §11 — Docker / Nginx / Postgres 拓扑
- [../../Dockerfile](../../Dockerfile) — 3 阶段构建
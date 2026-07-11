# 腾讯云轻量商用部署 Day 1–Day 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use comet full workflow with change name **tencent-cloud-lean-commercial-deployment**, then use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans task-by-task.

**Goal:** 7 个工作日内完成“腾讯云 CDN + 1 台 CVM/Nginx + Next.js Docker Blue/Green + TencentDB PostgreSQL + COS + Admin CMS”的轻量商用部署。

**Architecture:** www 通过 CDN 回源 CVM/Nginx；admin 直接进入 Nginx 且禁止缓存；media 通过 CDN 回源 COS。PostgreSQL 是业务数据事实源，COS 是图片事实源。

**Source of Truth:** [腾讯云轻量商用架构](./tencent-cloud-lean-commercial-architecture.md)

## Global Constraints

- 不引入 CLB、Kubernetes、Redis、SCF 或第二台 CVM。
- Blue/Green 用于发布和回滚，不代表主机级高可用。
- 生产不运行 PostgreSQL 容器，不向容器文件系统写业务图片。
- 应用只绑定 127.0.0.1:3001/3002。
- 生产数据库错误不得回退 src/lib/news.ts 或 src/lib/store.ts。
- 公开 RSC 不得 HTTP 自调用 /api/public/*。
- Admin 写请求继续要求 session、role、Zod、CSRF/Origin。
- 镜像按 Git SHA 标记；CVM 不执行 npm install 或 next build。
- 数据库迁移使用 expand → migrate → contract，不自动 down migration。
- TypeScript strict，禁止 any；执行前建立独立 worktree。
- 每个 Day Gate 都是阻塞点；云资源外部写入必须由授权人员确认。

## 开始前输入

负责人通过密码管理器提供：www/admin/media 域名，腾讯云地域/VPC/安全组，TCR 仓库，COS bucket/region，TencentDB 私网连接和迁移账号，Sentry DSN，GitHub production Environment 审批人。禁止写入 Git。

---

## Day 1：生产基线、环境契约与健康检查

### 目标

建立环境校验、live/readiness、云资源清单和更新后的部署 SPEC；不接正式流量。

### Files

- Create: src/lib/env/server.ts、src/lib/env/server.test.ts
- Create: src/app/api/health/live/route.ts、route.test.ts
- Create: src/app/api/health/ready/route.ts、route.test.ts
- Create: docs/operations/TENCENT_CLOUD_RESOURCE_CHECKLIST.md
- Modify: .env.example、docs/SPEC/deploy/operations.md

### Steps

- [ ] 先写环境校验失败测试：拒绝 localhost 生产 URL、默认 secret、缺失 DB/COS 配置。
- [ ] 实现惰性 parseServerEnv/getServerEnv；next build 导入阶段不得强制读取生产 secret。

~~~ts
const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  APP_RELEASE: z.string().min(7).default("development"),
  COS_REGION: z.string().min(1),
  COS_BUCKET: z.string().min(1),
  COS_MEDIA_BASE_URL: z.string().url(),
});
~~~

- [ ] 先写 health 测试：live 不访问 DB；ready 成功 200、异常/2 秒超时 503；响应不泄露配置。
- [ ] 实现 live：

~~~ts
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    release: process.env.APP_RELEASE ?? "unknown",
  });
}
~~~

- [ ] ready 使用 Prisma 执行常量 SELECT 1，并通过 Promise.race 设置 2 秒超时。
- [ ] 资源清单记录地域、VPC、安全组、私网、备份、COS 版本、CDN 源站、证书和负责人，不记录 secret。
- [ ] 更新部署 SPEC，移除 Caddy、本地生产 DB、阿里云 OSS和本地图片生产方案。

### Verify

~~~bash
npx vitest run src/lib/env/server.test.ts \
  src/app/api/health/live/route.test.ts \
  src/app/api/health/ready/route.test.ts
npm run lint
npm run typecheck
~~~

### Gate

- [ ] live 在 DB 故障时仍为 200；ready 为 503。
- [ ] 不安全生产配置显式失败。
- [ ] 云资源清单有负责人且未接正式流量。

### Rollback

回滚本日 commit；旧首页 healthcheck 保留到 Day 5。

---

## Day 2：TencentDB 与博客/门店数据边界

### 目标

创建托管 DB并迁移数据；公开 RSC 直读 server-only repository，移除本站 API 自调用和 mock fallback。

### Files

- Create: src/features/articles/server/cache.ts、repository.ts、repository.test.ts
- Create: src/features/stores/server/cache.ts、repository.ts、repository.test.ts
- Modify: src/lib/data.ts、src/lib/data.test.ts
- Modify: src/app/news/page.tsx、src/app/news/[slug]/page.tsx
- Modify: src/app/agent/page.tsx、src/app/agent/[slug]/page.tsx
- Modify: src/app/agent/[slug]/[city]/page.tsx、src/app/agent/store/[id]/page.tsx
- Modify: src/components/FeaturedStores.tsx
- Create: scripts/verify-production-data.mjs
- Modify: package.json

### Steps

- [ ] 授权运维创建同地域/同 VPC TencentDB：关闭公网、SSL、PITR、14–30 天保留；应用账号非 owner，迁移账号独立。
- [ ] 先确认备份，再运行 migrator 镜像中的 npx prisma migrate deploy；生产不运行默认 admin seed。
- [ ] repository 测试验证只返回 published/active、明确 select、DB 错误抛出、不 import 静态 mock。
- [ ] 建立缓存标签：

~~~ts
export const ARTICLE_CACHE_TAGS = {
  list: "articles:list",
  slug: (slug: string) => "articles:slug:" + slug,
} as const;

export const STORE_CACHE_TAGS = {
  list: "stores:list",
  id: (id: string) => "stores:id:" + id,
  province: (slug: string) => "stores:province:" + slug,
} as const;
~~~

- [ ] 使用 unstable_cache 包装 Prisma 查询；province/city/slug 作为参数传入，不能隐藏在 closure。
- [ ] 博客/门店改运行时 RSC；必要时 dynamic = force-dynamic，查询由 repository 缓存。产品/品牌继续 SSG。
- [ ] 删除 src/lib/data.ts 中文章/门店的 NEXT_PUBLIC_API_BASE_URL 自调用和 try/catch fallback。
- [ ] 数据校验脚本只输出计数、孤立省市、重复 slug、缺图，不打印敏感数据。

### Verify

~~~bash
npx vitest run src/features/articles/server/repository.test.ts \
  src/features/stores/server/repository.test.ts src/lib/data.test.ts
npm run build
DATABASE_URL='<private-test-url>' node scripts/verify-production-data.mjs
~~~

### Gate

- [ ] CI build 不需要生产 DB。
- [ ] 生产 runtime 只从 TencentDB 读取博客/门店。
- [ ] DB 故障不显示演示数据。
- [ ] 迁移前后计数一致，PITR 已开启。

### Rollback

旧 DB 只读保留 7 天；应用可回滚，DB 不 down migration。数据错误恢复到新实例后再切连接。

---

## Day 3：COS 图片事实源与 media CDN

### 目标

将文章/门店图片从容器 public/images 迁移 COS，保留 auth、CSRF、大小、MIME、magic bytes 和 Sharp 校验。

### Files

- Modify: package.json、package-lock.json
- Create: src/infrastructure/storage/types.ts、cos.ts、cos.test.ts
- Modify: src/app/api/upload/route.ts、route.test.ts
- Modify: src/components/admin/EntityImageUploader.tsx
- Create: scripts/migrate-images-to-cos.mjs、scripts/verify-cos-images.mjs
- Modify: next.config.ts、.env.example、README.md、docs/SPEC/api/upload.md

### Steps

- [ ] 运行 npm uninstall ali-oss && npm install cos-nodejs-sdk-v5@3.0.0。
- [ ] COS adapter 测试覆盖路径穿越、不可变 key、Content-Type、SDK 错误和 CDN URL。
- [ ] 使用内容哈希生成对象键：

~~~ts
export function buildImageKey(
  entity: "article" | "store",
  entityId: string,
  body: Buffer,
): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(entityId)) {
    throw new Error("Invalid entityId");
  }
  const digest = createHash("sha256").update(body).digest("hex").slice(0, 24);
  return "prod/" + entity + "s/" + entityId + "/" + digest + ".webp";
}
~~~

- [ ] 上传顺序：认证/CSRF → 校验 → Sharp → COS PUT → DB 更新 → cache invalidation → 201。
- [ ] 删除 fs.mkdir/writeFile/rename/unlink。DB 更新失败记录 storage.orphan.created。
- [ ] 删除图片先清 DB 引用，再删 COS；COS 删除失败进入清理日志。
- [ ] next.config.ts 添加 media 域名 remotePatterns。
- [ ] 授权运维开启私有桶、版本控制、加密、最小 CORS、生命周期和 CDN 源站鉴权。
- [ ] 迁移脚本默认 --dry-run；只有 --apply 才写；每批 100 个，manifest 可续跑。

### Verify

~~~bash
npx vitest run src/infrastructure/storage/cos.test.ts \
  src/app/api/upload/route.test.ts
node scripts/migrate-images-to-cos.mjs --dry-run
node scripts/verify-cos-images.mjs
npm run build
~~~

### Gate

- [ ] 新图片不写容器文件系统。
- [ ] COS/DB 失败不会产生假成功。
- [ ] 容器重建后图片仍可访问。
- [ ] 版本恢复和 CDN 鉴权通过。

### Rollback

旧 public/images 只读保留一个发布周期；不删除已上传 COS 对象。

---

## Day 4：业务服务层与缓存一致性

### 目标

把文章/门店事务、审计、状态机和失效策略收敛到 service，确保首页、列表、详情、区域页和 sitemap 一致。

### Files

- Create: src/features/articles/server/service.ts、service.test.ts
- Create: src/features/stores/server/service.ts、service.test.ts
- Modify: src/app/api/articles/**/route.ts
- Modify: src/app/api/stores/**/route.ts
- Modify: src/app/api/upload/route.ts
- Create: scripts/check-content-cache-contract.mjs
- Modify: package.json

### Steps

- [ ] 测试文章 create/update/publish/withdraw/delete/upload 和门店 create/update/activate/suspend/delete/upload 的精确 tag/path。
- [ ] Route Handler 使用 revalidateTag(tag, "max")；不得使用只允许 Server Action 的 updateTag。
- [ ] 建立统一失效函数：

~~~ts
export function invalidateArticleContent(slug: string): void {
  revalidateTag("articles:list", "max");
  revalidateTag("articles:slug:" + slug, "max");
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/" + slug);
  revalidatePath("/sitemap.xml");
}
~~~

- [ ] Route 只处理 auth、role、CSRF、Zod、HTTP；transaction、audit、status、invalidation 进入 service。
- [ ] 发布切流观察期启用 CMS 写锁，避免 Blue/Green 内存缓存分叉。
- [ ] 静态检查禁止写 route 再散落新的 revalidatePath 列表。

### Verify

~~~bash
npx vitest run src/features/articles/server/service.test.ts \
  src/features/stores/server/service.test.ts
node scripts/check-content-cache-contract.mjs
npm run check
~~~

### Gate

- [ ] CMS 修改后的公开页面有自动测试。
- [ ] Route 不复制业务事务和失效列表。
- [ ] 首页、博客、门店、sitemap 一致。
- [ ] 观察期 CMS 写锁已实现。

### Rollback

缓存代码随应用回滚；本日不允许破坏性 schema contract。

---

## Day 5：生产 Docker、Nginx、域名与 CDN

### 目标

建立单 CVM Blue/Green 运行拓扑；生产 Compose 不含 DB/dev/明文 secret。

### Files

- Modify: Dockerfile
- Create: Dockerfile.migrate
- Create: deploy/compose.prod.yml
- Create: deploy/nginx/lanhui.conf、upstream-blue.conf、upstream-green.conf
- Create: deploy/nginx/security-headers.conf
- Create: deploy/docker/daemon.json.example
- Create: scripts/check-production-compose.mjs、scripts/check-nginx-config.mjs
- Modify: package.json、.dockerignore、docs/SPEC/deploy/operations.md

### Steps

- [ ] Compose 静态检查拒绝 postgres/dev、明文 secret、latest 唯一 tag、0.0.0.0:3000、源码 volume、缺少 health/log rotation。
- [ ] Web 镜像继续 standalone/non-root；Migrate 镜像包含 Prisma CLI、config、schema、migrations。
- [ ] Blue/Green 使用 SHA 镜像、回环端口、只读 rootfs、tmpfs 和 Node fetch healthcheck。

~~~yaml
web-blue:
  image: registry.example.com/lanhui-web:<git-sha>
  env_file: /etc/lanhui/lanhui.env
  ports: ["127.0.0.1:3001:3000"]
  restart: unless-stopped
  read_only: true
  tmpfs: ["/tmp", "/app/.next/cache"]
  logging:
    driver: json-file
    options: { max-size: "20m", max-file: "5" }
~~~

- [ ] Nginx 配置 80→443、安全头、真实 IP、6MB 上传、timeouts、隐藏版本、静态 immutable。
- [ ] admin 域名、/admin/*、/api/* 设置 private,no-store。
- [ ] 三域名固定：

~~~text
www.<domain>   → CDN → CVM/Nginx
admin.<domain> → DNS → CVM/Nginx
media.<domain> → CDN → COS
~~~

- [ ] 安全组仅 80/443；22 仅固定 IP/VPN；3001/3002 不开放；DB 仅私网。
- [ ] 预生产启动 Blue，验证 live/ready，再 nginx -t/reload。

### Verify

~~~bash
node scripts/check-production-compose.mjs
node scripts/check-nginx-config.mjs
docker build --target runner -t lanhui-web:test .
docker build -f Dockerfile.migrate -t lanhui-migrate:test .
docker compose -f deploy/compose.prod.yml config
~~~

### Gate

- [ ] Compose 无 DB/dev/明文 secret。
- [ ] 3001/3002 公网不可达。
- [ ] HTTP 强制 HTTPS，admin/API no-store。
- [ ] Blue live/ready 通过，重建不丢数据/图片。

### Rollback

正式 DNS TTL 预先降至 300 秒；nginx -t 失败不得 reload。

---

## Day 6：Blue/Green 发布、回滚与 CI/CD

### 目标

实现 SHA 镜像、迁移、候选检查、Nginx 原子切流、观察窗口和快速回切。

### Files

- Create: deploy/scripts/common.sh、deploy.sh、rollback.sh
- Create: deploy/scripts/smoke.sh、cleanup.sh、deploy.test.sh
- Create: .github/workflows/release.yml
- Create: docs/operations/RELEASE_RUNBOOK.md
- Modify: package.json

### Steps

- [ ] fake docker/curl/nginx 测试：候选不 ready 不切流；nginx -t 失败不 reload；rollback 恢复 previous。
- [ ] 使用 flock 获取 /opt/lanhui/state/deploy.lock，读取 active-slot 并选择另一个端口。
- [ ] 发布顺序固定：pull SHA → 确认 PITR → CMS 写锁 → migrate → candidate → live/ready 90 秒 → smoke → nginx -t → 原子切流 → 公网 smoke → 观察 10–30 分钟 → 解锁 → 停旧槽。
- [ ] rollback 只切 previous upstream，不执行 down migration，不删除日志或 COS。
- [ ] smoke 检查 health、首页、产品、新闻、门店、admin login，并从 sitemap 动态选择文章/门店详情。
- [ ] GitHub production Environment 审批后执行质量门、构建 web/migrate、扫描、推 TCR、SSH deploy.sh SHA。
- [ ] GitHub 只保存 TCR/CVM 发布凭证；DB/COS runtime secret 留在 CVM/CAM。

发布锁核心：

~~~bash
exec 9>/opt/lanhui/state/deploy.lock
flock -n 9 || { echo "another deployment is running" >&2; exit 1; }

active="$(cat /opt/lanhui/state/active-slot)"
if [ "$active" = "blue" ]; then
  candidate="green"
  port=3002
else
  candidate="blue"
  port=3001
fi
~~~

### Verify

~~~bash
bash deploy/scripts/deploy.test.sh
shellcheck deploy/scripts/*.sh
actionlint .github/workflows/release.yml
npm run check
npm run test:e2e
~~~

预生产必须演练：候选失败不切流、Blue→Green、Green→Blue rollback。

### Gate

- [ ] 发布关联 commit、digest、migration、operator。
- [ ] 候选失败不影响活动槽。
- [ ] 应用回滚 5 分钟内完成。
- [ ] 旧槽保留到观察期结束。

### Rollback

CI 可禁用但活动容器不受影响；只有 smoke/监控正常才 cleanup。

---

## Day 7：监控、备份、灾备演练与上线

### 目标

完成告警、托管备份恢复、COS 恢复、空白 CVM 重建、上线签字。

### Files

- Modify: sentry.server.config.ts、sentry.edge.config.ts、next.config.ts
- Modify: src/instrumentation.ts
- Modify: docs/DATABASE_BACKUP_RUNBOOK.md
- Modify: scripts/check-backup-strategy.mjs
- Create: docs/operations/MONITORING_RUNBOOK.md
- Create: docs/operations/DISASTER_RECOVERY_RUNBOOK.md
- Create: docs/operations/GO_LIVE_CHECKLIST.md
- Create: scripts/verify-production-readiness.mjs
- Create: docs/test-reports/2026-07-11/TENCENT_CLOUD_COMMERCIAL_DEPLOYMENT_REPORT.md
- Modify: docs/README.md

### Steps

- [ ] Sentry error 带 APP_RELEASE、environment、request ID；清洗 DB URL、COS secret、cookie、Authorization、未发布正文。
- [ ] 告警阈值：

~~~text
外部 HTTPS 连续 3 次失败 → Critical
Nginx 5xx 5 分钟 > 2% Warning，> 5% Critical
CPU > 80% 10 分钟；内存 > 85%；磁盘 > 75%
PostgreSQL 连接 > 70%；证书剩余 < 30 天
TencentDB 备份/PITR 失败 → Critical
~~~

- [ ] 改写备份 Runbook：TencentDB 自动备份/PITR 为主，逻辑导出仅额外副本。
- [ ] 恢复最新备份到临时 TencentDB，运行 migration status、数据校验和只读 smoke，记录真实 RPO/RTO。
- [ ] 在 COS dr-test/ 前缀演练删除和版本恢复，不操作真实内容。
- [ ] 从空白 CVM 安装 Docker/Nginx、恢复加密 env、拉 SHA、连接 DB/COS、通过 smoke，记录 RTO。
- [ ] readiness 总检查覆盖安全组、TLS、安全头、no-store、端口、SHA、备份、COS 版本、CDN、告警、active slot、rollback。
- [ ] 三方签字后切流，观察 60 分钟；上线窗口不同时发布业务功能。

### Verify

~~~bash
node scripts/verify-production-readiness.mjs \
  --base-url https://www.<domain> \
  --admin-url https://admin.<domain> \
  --media-url https://media.<domain>
npm run check
npm run test:e2e
~~~

### Gate

- [ ] 测试告警送达负责人。
- [ ] TencentDB PITR 和 COS 版本恢复实际成功。
- [ ] Blue/Green rollback 与空白 CVM 重建有计时证据。
- [ ] 上线报告记录命令、结果、风险接受人和遗留项。

### Rollback

流量异常切回 previous slot；DB 事故冻结写入并恢复到新实例；CVM 事故按 Runbook 重建并切 EIP/DNS。

---

## 最终目标状态

~~~mermaid
flowchart LR
  visitor["访客"] --> wwwcdn["www / 腾讯云 CDN"]
  wwwcdn --> nginx["CVM / Nginx"]
  admin["管理员"] --> admindomain["admin / HTTPS no-store"]
  admindomain --> nginx
  nginx -->|active| blue["Next.js Blue"]
  nginx -.->|standby| green["Next.js Green"]
  blue --> pg[("TencentDB PostgreSQL")]
  green --> pg
  blue --> cos["COS 私有桶"]
  green --> cos
  cos --> mediacdn["media / CDN"]
  mediacdn --> visitor
  ci["GitHub Actions + TCR"] --> blue
  ci --> green
~~~

## 最终商用验收矩阵

| 维度 | 必须达到 |
|---|---|
| 数据 | TencentDB 私网；无 mock fallback；PITR 演练通过 |
| 图片 | COS 事实源；media CDN；容器重建不丢图；版本恢复通过 |
| 代码 | RSC 直读 repository；写入 service；精确 tag/path 失效 |
| 安全 | HTTPS；admin/API no-store；3001/3002 不暴露；无默认 secret |
| 部署 | web/migrate SHA 镜像；候选验证后切流；5 分钟回滚 |
| 监控 | live/ready、5xx、资源、证书、DB、Sentry、备份告警 |
| 灾备 | DB、COS、应用回滚、空白 CVM 重建均有证据 |

## Comet 执行边界

1. 新建 full change：tencent-cloud-lean-commercial-deployment，不续接现有 change。
2. Open 阶段将 7 Days 映射为 7 个 task group，不压缩成一次提交。
3. Design 阶段确认三域名、DB 迁移、COS 事务、Blue/Green rollback。
4. Build 推荐 worktree + subagent-driven；每个 Day 独立 review/commit。
5. Day Gate 失败留在当前 Day 修复。
6. 云资源、DNS、生产恢复和正式流量发布必须等待授权确认。
7. Verify 以 Gate 和验收矩阵为准，不能以“代码已提交”代替演练。


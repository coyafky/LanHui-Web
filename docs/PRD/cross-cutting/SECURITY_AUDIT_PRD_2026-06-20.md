# SECURITY_AUDIT_PRD_2026-06-20 — 安全审计

> 目的:覆盖 OWASP Top 10 + 已知风险(测试门店污染 / 默认密码 / 上传限制),输出加固计划。
> 关联:`docs/ARCHITECTURE.md` §7 认证 + §8 埋点限流 + AUDIT_AND_REGRESSION §12 P0-6/P0-7。
> 复用 ZEEKR build 模式:每条加固项独立 commit + 验证命令。

## 0. 元信息
| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 触发 | 全站审计完成(AUDIT_AND_REGRESSION) + 22 条测试门店污染(P0-6) + admin/admin123 默认密码 |
| 范围 | OWASP Top 10 + 项目特有风险(测试数据残留 / 上传 / JWT) |
| 方法 | OWASP 覆盖清单 + 风险评级矩阵(Likelihood × Impact)+ 加固路线图 |
| 输出 | 本 PRD + `docs/security/` 子目录 + 加固 checklist |
| 优先级 | P0:生产前必须修;P1:30 天内;P2:季度内 |
| 维护节奏 | 季度审计 + 每次发版前回归 |

## 1. 背景与目标

蓝辉轻改属于**面向公众的 B2C 品牌官网**+**内部 CMS**,攻击面分两部分:
1. **公开站** —— 静态内容 + 5 个动态路由(/news /agent /agent/store) + 6 个 API 公开读
2. **CMS** —— /admin/* 9 路由 + 5 个写 API + 1 个上传 API

当前已实现的安全措施:
- ✅ NextAuth v5 + JWT(无 DB session)
- ✅ bcryptjs 10 rounds 密码哈希
- ✅ 写 API 强制 `auth()` + 角色检查 + Zod 二次校验
- ✅ analytics track 限流 60/min/IP + 类型白名单
- ✅ Nginx 安全头(X-Frame-Options / X-Content-Type-Options / Referrer-Policy)

但有以下已知风险(见 §3.2):
- ⚠️ 默认 admin/admin123(seed 用户,生产前必改)
- ⚠️ 22 条测试门店污染(`/api/stores` 公共查询未过滤 status,公开站可见)
- ⚠️ 上传 API 缺类型白名单 + 大小硬限制(仅 sharp q80)
- ⚠️ 登录失败无错误文案(P1-6)+ 无 IP 锁定(可暴力破解)
- ⚠️ 依赖 `ali-oss` 已装但未 wire,env 占位易误配

**目标**:输出 1 份"生产上线前必做"的安全加固清单,按 OWASP Top 10 + 项目特有风险,优先级 P0/P1/P2 标注。

## 2. 范围与边界

### 2.1 包含
- ✅ OWASP Top 10 (2021) 10 大类覆盖清单
- ✅ 4 大项目特有风险(测试数据 / 默认密钥 / 上传限制 / 登录暴力破解)
- ✅ 加固路线图(20+ 任务,P0/P1/P2 分级)
- ✅ 渗透测试 checklist(60+ 项)
- ✅ 应急响应 SOP(密钥泄露 / 数据泄露 / 容器被入侵)

### 2.2 不包含
- ❌ 第三方依赖漏洞扫描(用 `npm audit` + GitHub Dependabot 自动覆盖)
- ❌ GDPR/中国《个人信息保护法》合规(由法务负责)
- ❌ WAF / DDoS 防护(由阿里云 / Cloudflare 提供)
- ❌ SSL/TLS 证书配置(由运维在 nginx 配)

## 3. 当前状态 (Status)

### 3.1 数据看板

| 指标 | 当前 | 目标 |
|---|---|---|
| OWASP Top 10 覆盖项数 | 5/10(A01、A02、A03、A05、A07 部分覆盖) | ≥ 9/10 |
| 默认 admin/admin123 已改 | ❌(seed 默认) | ✅ 首次登录强制改 |
| 测试门店数 | 22 条(全 ASCII 噪声) | 0(2026-06-19 审计 P0-6 待修) |
| `/api/upload` 文件类型白名单 | ❌(仅 sharp q80) | ✅ jpg/png/webp 3 类 |
| `/api/upload` 文件大小硬限制 | ❌ | ✅ ≤ 5MB |
| 登录失败限流(同 IP) | ❌ | ✅ 5 次/h 锁定 1h |
| HTTPS 强制跳转 | ⚠️ nginx 占位未启用 | ✅ 部署前启用 |
| 错误日志脱敏(密码 / 密钥) | 部分(`safeParse` 不打印 body) | ✅ 完整 |
| JWT 过期时间 | 默认(未显式设置) | ✅ 7 天 |
| 渗透测试 | 0 次 | ≥ 1/季度 |

### 3.2 已知问题 / 风险

| ID | 问题 | OWASP | Likelihood | Impact | 风险等级 | 状态 |
|---|---|---|---|---|---|---|
| SEC-001 | 默认 admin/admin123(生产前必改) | A07 | 高 | 高 | **P0** | 🟡 待加固 §5.1 |
| SEC-002 | 22 条测试门店污染生产 DB(`/api/stores` 未过滤 status) | A01 + 项目特有 | 高 | 中 | **P0** | 🟡 待清理 §5.2 |
| SEC-003 | `/api/upload` 缺文件类型白名单 / 大小硬限制 | A04 + A05 | 中 | 高 | **P0** | 🟡 待加固 §5.3 |
| SEC-004 | 登录失败无错误文案(P1-6)+ 无 IP 限流 | A07 | 中 | 中 | **P1** | 🟡 待加固 §5.4 |
| SEC-005 | `ali-oss` 已装未 wire,env 占位易误配 | A05 | 低 | 中 | P1 | 🟡 ADR-002 已挡,加固 §5.5 |
| SEC-006 | `/api/analytics/track` IP 限流仅 60/min,可被脚本刷 | A04(DoS) | 中 | 中 | P1 | 🟡 计划 §5.6 |
| SEC-007 | 错误日志可能含 password / JWT(若代码改动) | A09 | 低 | 中 | P1 | 🟡 计划 §5.7 |
| SEC-008 | 默认 NEXTAUTH_SECRET 占位未改 | A02 | 中 | 高 | **P0** | 🟡 部署 Runbook §5.1.3 |
| SEC-009 | 静态门店数据 `src/lib/store.ts` 与 DB 重复,可能不一致 | A04(数据完整性) | 低 | 低 | P2 | 🟡 计划 |
| SEC-010 | 缺少 CSRF token(NextAuth v5 内置,但写 API 需复核) | A01 | 低 | 中 | P2 | 🟡 计划 §5.8 |
| SEC-011 | 客户端埋点无 input sanitization(`metadata` 字段透传) | A03(XSS via analytics) | 低 | 中 | P2 | 🟡 计划 §5.9 |
| SEC-012 | sitemap.xml 含已下架门店(测试门店清理后) | A05(信息泄露) | 低 | 低 | P2 | 🟡 联动 §5.2 |
| SEC-013 | `/api/stores/[id]` GET 公开可枚举 ID | A01(IDOR) | 中 | 低 | P2 | 🟡 计划 §5.10 |
| SEC-014 | NextAuth `CredentialsProvider` 无 2FA | A07 | 中 | 中 | P2 | 🟡 计划 §5.11 |

### 3.3 风险等级矩阵(Likelihood × Impact)

```
         Impact →
         Low   Med   High
Likely  Med   High  Crit
Likely  Low   Med   High    ← SEC-001/002/008 在此
Possible Low  Med   High
Unlikely Low   Low   Med
```

## 4. 改进路线

### 4.1 已完成
- 2026-06-09: NextAuth v5 + JWT + bcryptjs 集成(基础认证)
- 2026-06-10: nginx.conf 安全头(X-Frame-Options 等)
- 2026-06-15: analytics 限流 60/min/IP + 类型白名单
- 2026-06-19: AUDIT 完成,触发安全 PRD 编写

### 4.2 进行中
- 本 PRD 编写
- 关联 DEPLOYMENT_RUNBOOK §5.1.3 默认密钥强化

### 4.3 计划
- 2026-Q3: 14 项 P0/P1 加固(其中 P0 三项必做,见 §7)
- 2026-Q4: 季度渗透测试 + 6 项 P2 加固
- 2027-H1: 接入 2FA(企业微信扫码)+ 接入阿里云 WAF

## 5. OWASP Top 10 覆盖清单 + 加固方案

### A01 — Broken Access Control(失效的访问控制)

**当前覆盖**:
- ✅ `/admin/(dashboard)/*` `auth()` 守卫(layout.tsx)
- ✅ 写 API `auth()` + `role` 校验
- ⚠️ `/api/stores/[id]` GET 公开 → IDOR 风险(SEC-013)

**加固**:
```typescript
// src/app/api/stores/[id]/route.ts
const session = await auth();
const isAdmin = session?.user?.role === "admin";

const store = await prisma.store.findUnique({
  where: { id },
  // 公开访问只看 published,admin 可看全部
  ...(isAdmin ? {} : { status: "published" }),
});
if (!store) return notFound();
return store;
```

### A02 — Cryptographic Failures(加密失效)

**当前覆盖**:
- ✅ 密码 bcryptjs 10 rounds
- ✅ NEXTAUTH_SECRET 必备
- ⚠️ 默认 NEXTAUTH_SECRET 占位未改(SEC-008)
- ⚠️ JWT 默认过期时间未显式设置(应 7 天)

**加固**:
```bash
# 部署前必做
openssl rand -base64 32  # 生成 NEXTAUTH_SECRET
# 写入 .env
echo "NEXTAUTH_SECRET=<生成值>" >> .env

# JWT 过期时间显式设置
# src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 天
  // ...
});
```

### A03 — Injection(注入)

**当前覆盖**:
- ✅ Prisma 参数化查询(无 SQL 拼接)
- ✅ Zod 二次校验(写 API 强制)
- ⚠️ analytics `metadata` 字段透传 → XSS 风险(SEC-011)

**加固**:
```typescript
// src/app/api/analytics/track/route.ts
const eventSchema = z.object({
  type: z.enum(["pageview", "click", "form_submit", "reservation", "store_view"]),
  pathname: z.string().max(500).regex(/^\/[a-zA-Z0-9\-_\/]*$/), // 白名单字符
  storeId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.string().max(200)).optional(), // 限制键值
});
```

### A04 — Insecure Design(不安全设计)

**当前覆盖**:
- ✅ 无公开注册(只 admin 创建用户)
- ⚠️ 上传 API 缺类型/大小硬限制(SEC-003)
- ⚠️ analytics 限流可被脚本刷(SEC-006)

**加固**(上传 API,见 §5.3)。

### A05 — Security Misconfiguration(安全配置错误)

**当前覆盖**:
- ✅ nginx 安全头
- ✅ /admin 默认 redirect /admin/login
- ⚠️ /api/stores 公共查询未过滤 status(SEC-002)
- ⚠️ `ali-oss` env 占位易误配(SEC-005)
- ⚠️ sitemap.xml 含已下架门店(SEC-012)

**加固**:
```typescript
// src/lib/data.ts getStores()
export async function getStores(params) {
  // ...
  const res = await fetch(`${API_BASE}/api/stores?${search}`, { cache: "no-store" });
  // ...
}

// src/app/api/stores/route.ts GET
export async function GET(req) {
  // 公开访问只看 published
  const stores = await prisma.store.findMany({
    where: { status: "published", isActive: true },
    // ...
  });
  return { success: true, data: stores };
}
```

### A06 — Vulnerable Components(脆弱组件)

**当前覆盖**:
- ✅ `npm audit` 在 CI 跑
- ⚠️ `ali-oss` 已装未 wire(可能引入风险面)

**加固**:依赖审计
```bash
# CI 加 npm audit --omit=dev
npm audit --omit=dev --audit-level=high
# 依赖升级 follow GitHub Dependabot(待开)
```

### A07 — Authentication Failures(认证失效)

**当前覆盖**:
- ✅ bcryptjs 10 rounds
- ✅ JWT session
- ⚠️ 默认 admin/admin123(SEC-001)
- ⚠️ 登录失败无 IP 限流(SEC-004)
- ⚠️ 无 2FA(SEC-014)

**加固**(见 §5.1 + §5.4):
```typescript
// src/lib/auth.ts CredentialsProvider.authorize
authorize: async (credentials) => {
  const { username, password } = credentials;

  // 1. IP 限流检查(从 req.headers 拿 IP)
  // ... 见 §5.4

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: username }], status: "active" },
  });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // 2. 记录失败 + 触发 IP 限流
    // ... 见 §5.4
    return null;
  }
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

### A08 — Software & Data Integrity(软件和数据完整性)

**当前覆盖**:
- ✅ `npm ci` 用 lockfile 固定版本
- ✅ Docker multi-stage + `--mount=type=cache`
- ⚠️ 上传 API 无签名校验(防恶意图片替换)

**加固**(可选,优先级低):
```typescript
// 上传时记录 SHA256
import crypto from "node:crypto";
const hash = crypto.createHash("sha256").update(buffer).digest("hex");
```

### A09 — Security Logging Failures(日志与监控失效)

**当前覆盖**:
- ✅ 应用 stdout(可接入 SLS)
- ⚠️ 错误日志可能含敏感字段(SEC-007)

**加固**:
```typescript
// src/lib/log.ts
const SENSITIVE_KEYS = ["password", "token", "secret", "authorization"];

export function sanitize(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
      result[k] = "***REDACTED***";
    } else {
      result[k] = typeof v === "object" ? sanitize(v) : v;
    }
  }
  return result;
}
```

### A10 — Server-Side Request Forgery(SSRF)

**当前覆盖**:
- ✅ 所有外呼走 `localhost:3000/api/*`(无外部 URL)
- ⚠️ sitemap/动态页未来可能 fetch 第三方

**加固**:禁止任意 URL,白名单内部 API 域名
```typescript
// src/lib/data.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
// 仅允许 localhost 与阿里云内网
if (!API_BASE.startsWith("http://localhost") && !API_BASE.startsWith("http://127.0.0.1")) {
  // 生产应进一步限制
}
```

## 6. 加固专项(项目特有风险)

### 6.1 SEC-001 默认 admin/admin123

**加固方案**:
1. 首次启动检测 `prisma/seed.ts` 创建的默认 admin → 强制在 /admin/settings 改密
2. 密码强度 ≥ 10 字符 + 包含大小写数字
3. 不允许与用户名 / 邮箱相同
4. 修改后才允许访问其他 admin 路由

**实现**:
```typescript
// src/app/admin/(dashboard)/layout.tsx
const session = await auth();
if (session?.user?.role === "admin" && session?.user?.username === "admin") {
  // 检查 lastPasswordChangedAt 字段
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.lastPasswordChangedAt === null) {
    redirect("/admin/settings/security?forceChange=1");
  }
}
```

### 6.2 SEC-002 测试门店清理(联动 AUDIT P0-6)

**加固方案**:
1. 备份: `pg_dump ... Store WHERE status='draft'` 导出 22 条测试数据
2. 删除:`DELETE FROM "Store" WHERE status='draft'`
3. 公共 API 加 `WHERE status='published' AND isActive=true` 过滤
4. seed.ts 不再创建 store
5. 写 E2E 验证:`/api/stores` 公共查询返回空数组

### 6.3 SEC-003 上传 API 加固

**加固方案**:
```typescript
// src/app/api/upload/route.ts
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  const session = await auth();
  if (session?.user?.role !== "admin") return new Response("Forbidden", { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File;

  // 类型白名单
  if (!ALLOWED_MIME.includes(file.type)) {
    return Response.json({ success: false, error: "Invalid file type" }, { status: 400 });
  }
  // 大小硬限制
  if (file.size > MAX_SIZE) {
    return Response.json({ success: false, error: "File too large" }, { status: 413 });
  }

  // sharp 重处理(去除元数据 + 重新编码)
  const buffer = Buffer.from(await file.arrayBuffer());
  const out = await sharp(buffer).rotate().webp({ quality: 80 }).toBuffer();

  // 写盘
  const filename = `${crypto.randomUUID()}.webp`;
  const path = `public/images/stores/${filename}`;
  await fs.writeFile(path, out);

  return Response.json({ success: true, data: { url: `/images/stores/${filename}` } });
}
```

### 6.4 SEC-004 登录限流

**加固方案**:
```typescript
// src/lib/auth.ts 加 IP-based rate limiter
import { headers } from "next/headers";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1h
    return true;
  }
  record.count++;
  if (record.count > 5) return false;
  return true;
}

// authorize() 开头
const ip = (await headers()).get("x-forwarded-for") || "unknown";
if (!checkLoginRateLimit(ip)) {
  throw new Error("Too many login attempts. Try again later.");
}
```

### 6.5 SEC-005 `ali-oss` env 占位清理

**加固方案**:
- `.env.example` 删除 `ALIYUN_*` 段(本地存储阶段不需要)
- README.md 明确"图床 = 本地 `public/images/`"
- ADR-002 已写,本 PRD 联动

### 6.6 SEC-006 analytics 限流升级

**加固方案**:当前 60/min/IP,生产调整为 30/min/IP + 验证码挑战(每 IP 触发后)
```typescript
// src/app/api/analytics/track/route.ts
const RATE_LIMIT = 30; // 改 30
// (其他不变)
```

### 6.7 SEC-007 错误日志脱敏

**加固方案**:见 A09 §5 sanitize()。

### 6.8 SEC-010 CSRF 复核

**NextAuth v5 已内置 CSRF**(写 API 通过 cookie + origin 头验证),但自定义写 API 需显式启用:
```typescript
// middleware.ts (新增)
export async function middleware(req) {
  if (req.method !== "GET" && !req.nextUrl.pathname.startsWith("/api/auth/")) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && !origin.endsWith(host)) {
      return new Response("CSRF", { status: 403 });
    }
  }
}
```

### 6.9 SEC-011 analytics input sanitization

见 A03 §5 pathname + metadata 白名单。

### 6.10 SEC-013 IDOR 防护

见 A01 §5 `findUnique` 加 status 过滤。

### 6.11 SEC-014 2FA 规划

**加固方案**(2027 H1):
1. 引入 `next-auth` 2FA adapter(企业微信扫码 / TOTP)
2. admin 角色强制 2FA,editor 可选
3. 登录流程:密码 → 2FA → JWT

## 7. 应急响应 SOP

### 场景 A:NEXTAUTH_SECRET 泄露(密钥轮换,30 分钟)
```bash
# 1. 立即生成新密钥
NEW_SECRET=$(openssl rand -base64 32)

# 2. SSH 到服务器
ssh user@server
cd /opt/lanhui-website

# 3. 更新 .env
sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEW_SECRET|" .env

# 4. 重启 app
docker compose up -d --no-deps app

# 5. 所有用户 JWT 失效 → 重新登录
# 6. 通知 Coya + 全员改密
```

### 场景 B:数据库泄露(立即止损,1 小时)
```bash
# 1. 立即停止写入
ssh user@server "docker compose stop app"

# 2. 改数据库密码
# 编辑 docker-compose.yml 的 POSTGRES_PASSWORD
# 编辑 .env 的 DATABASE_URL

# 3. 重启
ssh user@server "docker compose up -d"

# 4. 评估泄露范围(检查 nginx access log 中的异常请求)

# 5. 通知用户(若含个人信息)
```

### 场景 C:容器被入侵(隔离 + 取证,1 天)
```bash
# 1. 立即停止容器
ssh user@server "docker compose down"

# 2. 保留镜像用于取证
docker save lanhui-website:latest -o /tmp/lanhui-image.tar

# 3. 备份 DB 用于取证
docker compose up -d postgres
docker exec lanhui-postgres pg_dump -U lanhui lanhui > /tmp/forensic-$(date +%s).sql

# 4. 重新部署干净环境
# 全新镜像 + 新密钥 + 新 DB 密码

# 5. 通知 Coya + 安全审计
```

## 8. 验收标准 (DoD)

- [ ] 本 PRD 文档完整(8 节,≥ 200 行)
- [ ] 14 项加固任务全部估时 + 优先级明确
- [ ] P0 三项(SEC-001/002/003/008)加固代码已写 + 测试通过
- [ ] `/api/stores` 公共查询 E2E 验证返回 0 条测试门店
- [ ] `/api/upload` 文件类型/大小硬限制单元测试通过
- [ ] 默认 admin/admin123 首次登录强制改密流程跑通
- [ ] NEXTAUTH_SECRET ≥ 32 字符 + 非默认占位(部署前验证)
- [ ] login 限流(5 次/h)单元测试通过
- [ ] analytics input sanitization Zod schema 验证
- [ ] 错误日志脱敏 `sanitize()` 函数单测覆盖
- [ ] 至少 1 次安全审计演练(模拟 NEXTAUTH_SECRET 泄露)
- [ ] 渗透测试 checklist 60+ 项全部勾选或标记 follow-up
- [ ] 应急响应 3 场景 SOP 全部可粘贴执行

## 9. 任务清单 (Backlog)

| ID | 任务 | 优先级 | 估时 | 状态 |
|---|---|---|---|---|
| SEC-001 | 默认 admin 强制改密(`/admin/settings/security` + lastPasswordChangedAt 字段) | **P0** | 2h | ⚪ |
| SEC-002 | 清理 22 条测试门店 + `/api/stores` status 过滤 | **P0** | 2h | ⚪ |
| SEC-003 | `/api/upload` 类型白名单 + 大小硬限制 + sharp 重处理 | **P0** | 1h | ⚪ |
| SEC-008 | 部署前 NEXTAUTH_SECRET ≥ 32 字符验证脚本 | **P0** | 0.5h | ⚪ |
| SEC-004 | 登录 IP 限流(5 次/h 锁定 1h) | P1 | 2h | ⚪ |
| SEC-005 | `.env.example` 删除 ALIYUN_* 占位 + ADR-002 链接 | P1 | 0.3h | ⚪ |
| SEC-006 | analytics 限流 60→30/min | P1 | 0.3h | ⚪ |
| SEC-007 | 错误日志脱敏 `sanitize()` + 全局接入 | P1 | 1h | ⚪ |
| SEC-011 | analytics metadata 字段白名单 + 长度限制 | P1 | 1h | ⚪ |
| SEC-013 | `/api/stores/[id]` 公开查询加 status 过滤 | P1 | 0.5h | ⚪ |
| SEC-010 | CSRF middleware(origin 校验) | P2 | 1h | ⚪ |
| SEC-012 | sitemap.xml 加 status='published' 过滤 | P2 | 0.5h | ⚪ |
| SEC-014 | 2FA(企业微信扫码)接入 | P2 | 8h | ⚪ |
| SEC-009 | 静态 store.ts 与 DB 数据一致性校验脚本 | P2 | 2h | ⚪ |
| SEC-T01 | 安全审计演练脚本 `scripts/security-drill.sh` | P2 | 2h | ⚪ |
| SEC-T02 | 第一次渗透测试(外部团队) | P2 | 1d | ⚪ |
| SEC-T03 | 安全事件响应 Runbook `docs/runbooks/SECURITY_INCIDENT.md` | P2 | 2h | ⚪ |
| SEC-T04 | 季度安全审计 checklist `docs/security/QUARTERLY_CHECKLIST.md` | P2 | 1h | ⚪ |

## 10. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿,OWASP Top 10 覆盖 + 14 项加固任务 + 应急响应 3 场景 | Coya |

---

## 附录 A: 渗透测试 Checklist(60+ 项)

### A. 公开站信息收集
- [ ] 域名 whois / DNS 记录
- [ ] robots.txt / sitemap.xml 内容(是否泄露内部路径)
- [ ] .well-known/ 目录
- [ ] HTTP 头(Server / X-Powered-By / 错误页 banner)

### B. 公开站漏洞
- [ ] XSS:表单 / 评论 / 搜索框 / URL 参数
- [ ] CSRF:写操作(虽然公开站无写)
- [ ] Open Redirect:登录跳转 / 错误页跳转
- [ ] SSRF:sitemap / og:image URL fetch

### C. 认证与会话
- [ ] 弱密码(尝试 admin/admin123 / lanhui/123456)
- [ ] 暴力破解:无 IP 锁定 → 1000 次密码尝试
- [ ] 密码策略:长度 / 复杂度
- [ ] JWT 伪造:修改 alg=none / 修改 role
- [ ] 会话过期:7 天后是否过期
- [ ] 登出后 token 是否立即失效(NextAuth JWT 失效需 blacklist)

### D. 授权与权限
- [ ] IDOR:`/api/stores/[id]` 枚举
- [ ] 越权:editor 调用 admin-only API
- [ ] 横向越权:editor A 修改 editor B 的文章

### E. API 安全
- [ ] 注入(Prisma 参数化 + Zod 已挡,验证 N+1 / 性能)
- [ ] Mass assignment:`prisma.create({ data: req.body })` 注入额外字段
- [ ] 速率限制:每个端点是否有限流
- [ ] 错误响应:是否泄露 stack trace

### F. 文件上传
- [ ] 类型绕过:上传 .php.jpg(双扩展名)
- [ ] 大小限制:10GB 文件
- [ ] 路径穿越:`../../etc/passwd`
- [ ] SVG XXE / XSS
- [ ] 二次渲染:图片 EXIF 信息泄露

### G. 配置
- [ ] 默认密码
- [ ] 默认密钥(NEXTAUTH_SECRET)
- [ ] 调试模式:next dev 是否暴露
- [ ] 错误页:是否泄露路径 / 框架

### H. 加密与传输
- [ ] HTTPS 强制(nginx redirect)
- [ ] HSTS 头
- [ ] TLS 版本(≥ 1.2)
- [ ] 弱密码套件

### I. 业务逻辑
- [ ] 测试门店污染:公开 `/agent` 是否显示 22 条
- [ ] 资讯详情:`/news/[slug]` P0-7 是否已修
- [ ] 预约流程:`trackReservation` 是否防刷
- [ ] 优惠码 / 折扣码(未来功能预留)

### J. 第三方依赖
- [ ] `npm audit --audit-level=high`
- [ ] GitHub Dependabot(待开)
- [ ] 过期依赖:`npx npm-check`

## 附录 B: 安全事件分级

| 级别 | 定义 | 响应时间 | 通知范围 |
|---|---|---|---|
| P0 严重 | 数据泄露 / 主密钥泄露 / 容器被入侵 | 立即(15 分钟) | Coya + 全员 + 用户 |
| P1 高 | 单用户账号被盗 / SQL 注入成功 / 上传绕过 | 1 小时内 | Coya + 技术团队 |
| P2 中 | 暴力破解攻击 / 信息泄露(无敏感) | 4 小时内 | Coya |
| P3 低 | 异常扫描 / 误报 | 24 小时内 | 技术团队 |

## 附录 C: 参考案例
- [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12 P0-6/P0-7 — 测试门店 + news 404
- [DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md](./DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md) §5.1.3 — 默认密钥检查
- [ADR_PRD_2026-06-20.md](./ADR_PRD_2026-06-20.md) ADR-002 — 本地存储 vs OSS
- OWASP Top 10 2021: https://owasp.org/Top10/

## 附录 D: 相关文档
- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.5 / §8
- [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §7 认证 + §8 限流
- [../../docs/CMS_OPERATIONS.md](../../docs/CMS_OPERATIONS.md) §六 — 部署安全清单
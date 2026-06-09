# 蓝辉轻改 CMS 后台管理系统操作文档

> 版本：1.0.0 | 更新日期：2026-06-09

---

## 目录

1. [环境准备](#一环境准备)
2. [首次启动步骤](#二首次启动步骤)
3. [登录方式](#三登录方式)
4. [用户管理](#四用户管理)
5. [功能模块使用指南](#五功能模块使用指南)
6. [部署到阿里云 ECS](#六部署到阿里云-ecs)
7. [常见问题 FAQ](#七常见问题-faq)

---

## 一、环境准备

### 1.1 系统要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | >= 24 | 项目基线强制要求 |
| PostgreSQL | 15 | 本地安装或通过 Docker 启动 |
| Docker | >= 20.10 | 可选，用于容器化部署 |
| Docker Compose | >= v2.0 | 可选，编排多容器服务 |

### 1.2 环境变量配置

从模板复制并编辑环境变量文件：

```bash
cp .env.example .env
```

`.env` 文件说明：

```bash
# 数据库连接地址
DATABASE_URL=postgresql://lanhui:password@localhost:5432/lanhui

# NextAuth 认证配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-change-in-production   # 生产环境必须修改！

# 前端 API 基地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 阿里云 OSS 配置（图片上传，可选）
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_OSS_ENDPOINT=oss-cn-shanghai.aliyuncs.com
ALIYUN_OSS_BUCKET=lanhui-website-prod
```

> **重要**：`NEXTAUTH_SECRET` 在生产环境中必须修改为随机强密钥（至少 32 字符）。可用以下命令生成：
> ```bash
> openssl rand -base64 32
> ```

---

## 二、首次启动步骤

### 方式 A：Docker Compose 全栈启动（推荐）

适合快速部署和团队统一环境。

```bash
# 1. 复制环境变量
cp .env.example .env
# 编辑 .env 修改 NEXTAUTH_SECRET 等敏感配置

# 2. 构建并启动所有服务（app + postgres + nginx）
docker compose up -d

# 3. 等待 postgres 健康检查通过后，运行数据库迁移
docker compose exec app npx prisma migrate deploy

# 4. 初始化种子数据（创建管理员账号、省份城市、示例门店）
docker compose exec app npx prisma db seed

# 5. 访问后台
# 浏览器打开 http://localhost:3000/admin/login
```

**服务说明**：

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| app | lanhui-website | 3000 | Next.js 生产服务 |
| dev | lanhui-website-dev | 3001 | Next.js 开发服务（热更新） |
| postgres | lanhui-postgres | 5432 | PostgreSQL 数据库 |
| nginx | lanhui-nginx | 80 / 443 | 反向代理 |

> 启动开发服务（支持热更新）：`docker compose up dev -d`

### 方式 B：本地开发环境

适合日常开发调试。

```bash
# 1. 安装 PostgreSQL 15 并创建数据库
createdb lanhui

# 2. 配置环境变量
cp .env.example .env
# 编辑 DATABASE_URL，示例：
# DATABASE_URL=postgresql://你的用户名:你的密码@localhost:5432/lanhui

# 3. 运行数据库迁移（首次使用 --name init）
npx prisma migrate dev --name init

# 4. 生成 Prisma Client
npx prisma generate

# 5. 填充种子数据（创建管理员账号 + 基础数据）
npx prisma db seed

# 6. 启动开发服务器
npm run dev

# 7. 访问后台
# 浏览器打开 http://localhost:3000/admin/login
```

---

## 三、登录方式

### 3.1 登录入口

访问 `/admin/login` 页面，输入用户名/邮箱和密码登录。

- **登录地址**：http://localhost:3000/admin/login
- **支持登录方式**：用户名 或 邮箱

### 3.2 默认管理员账号

| 字段 | 值 |
|------|-----|
| 用户名 | `admin` |
| 邮箱 | `admin@lanhui.com` |
| 密码 | `admin123` |
| 角色 | `admin` |

> **首次登录后请立即修改密码！** 默认密码仅用于初始化，生产环境部署前必须更改。

### 3.3 认证机制说明

系统使用 **NextAuth.js v5 (beta)** + **JWT 策略** 进行身份认证：

- 登录成功后颁发 JWT Token
- 支持用户名或邮箱登录（`authorize` 方法同时匹配 `username` 和 `email`）
- 仅 `status: "active"` 的用户可以登录
- 密码使用 `bcryptjs` 加密存储（salt rounds = 10）
- 未登录访问 `/admin/*` 路由会自动重定向到 `/admin/login`

---

## 四、用户管理

### 4.1 安全设计：无公开注册页面

本系统**没有公开注册页面**，这是有意为之的安全设计：

- CMS 后台属于内部管理系统，不应暴露注册入口
- 所有用户必须由已有管理员手动创建
- 避免恶意用户自行注册获取后台权限

### 4.2 用户角色

| 角色 | 说明 |
|------|------|
| `admin` | 超级管理员，拥有所有权限 |
| `editor` | 编辑，可管理内容和门店数据 |

### 4.3 添加新用户的方法

#### 方法 1：使用创建管理员脚本（推荐）

项目提供了专用的管理员创建脚本：

```bash
npx tsx scripts/create-admin.ts --username 新用户名 --email 新用户@lanhui.com --password 安全密码
```

示例：

```bash
# 创建管理员
npx tsx scripts/create-admin.ts --username editor1 --email editor1@lanhui.com --password mySecurePass123 --role editor

# 创建管理员（默认 role 为 admin）
npx tsx scripts/create-admin.ts --username admin2 --email admin2@lanhui.com --password anotherPass456
```

> 脚本详情参见 `scripts/create-admin.ts`。

#### 方法 2：通过 Prisma Studio 可视化管理

```bash
npx prisma studio
```

Prisma Studio 会在浏览器打开一个可视化数据库管理界面（默认 http://localhost:5555）：

1. 打开 `User` 表
2. 点击 "Add record" 添加新记录
3. 填写字段：
   - `email`：用户邮箱（唯一）
   - `username`：用户名（唯一）
   - `password`：**必须使用 bcrypt 加密后的哈希值**（见下方生成方法）
   - `name`：显示名称（可选）
   - `role`：`admin` 或 `editor`
   - `status`：`active`

生成 bcrypt 哈希值：

```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('你的密码', 10);
console.log('加密后的密码:', hash);
"
```

将输出的哈希值填入 `password` 字段即可。

#### 方法 3：通过后台界面管理（规划中）

后续可在 `/admin/settings/users` 页面进行用户管理，当前版本需使用上述方法。

---

## 五、功能模块使用指南

后台路径前缀：`/admin`

侧边栏导航结构：

```
┌─────────────────────┐
│  蓝辉轻改 管理后台    │
├─────────────────────┤
│  Dashboard          │  → /admin
│  门店管理            │  → /admin/stores
│  文章管理            │  → /admin/articles
│  数据分析            │  → /admin/analytics
│  系统设置            │  → /admin/settings
├─────────────────────┤
│  [用户名]            │
│  退出登录            │
└─────────────────────┘
```

### 5.1 Dashboard 仪表盘

**路径**：`/admin`

展示系统核心数据概览：

| 统计项 | 说明 |
|--------|------|
| 门店总数 | 当前活跃门店数量 |
| 文章总数 | 已发布的文章数量 |
| 本月访问 | 当月 PV 统计 |
| 本月预约 | 当月预约统计 |

### 5.2 门店管理

**路径**：`/admin/stores`

#### 门店列表

- 支持按**门店名称/地址**搜索（400ms 防抖）
- 支持按**省份**筛选
- 支持按**门店类型**筛选（旗舰店 / 标准店 / 授权店）
- 分页展示（每页 20 条）

#### 门店类型说明

| 类型 | 标识 | 说明 |
|------|------|------|
| 旗舰店 | `flagship` | 品牌旗舰体验中心，提供全品类服务 |
| 标准店 | `standard` | 标准服务门店，覆盖主要品类 |
| 授权店 | `authorized` | 授权合作门店，专注特定品类 |

#### 新建门店

**路径**：`/admin/stores/new`

必填字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 门店名称 | 蓝辉轻改顺德大良店 |
| provinceSlug | 省份标识 | guangdong |
| provinceLabel | 省份名称 | 广东省 |
| citySlug | 城市标识 | foshan-shunde |
| cityLabel | 城市名称 | 佛山 |
| address | 详细地址 | 广东省佛山市顺德区... |
| phone | 联系电话 | 0757-2288 1001 |
| phoneTel | 拨号链接 | tel:075722881001 |

可选字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| district | 区域 | 顺德大良 |
| businessHours | 营业时间 | 09:00-18:00 |
| services | 服务项目列表 | ["电动踏板升级", "轮毂升级"] |
| description | 门店描述 | 蓝辉轻改旗舰服务中心... |
| highlights | 亮点标签 | ["旗舰体验中心", "全品类施工"] |
| category | 门店类型 | flagship / standard / authorized |
| latitude / longitude | 经纬度 | 22.805900 / 113.243100 |
| imageUrl | 门店图片 URL | |

#### 编辑门店

点击列表中的「编辑」按钮进入编辑页面（`/admin/stores/[id]`），可修改任意字段。

#### 删除门店

点击列表中的「删除」按钮，弹出确认对话框后执行**逻辑删除**（将 `isActive` 标记为 `false`），数据仍保留在数据库中，可后续恢复。

### 5.3 文章管理

**路径**：`/admin/articles`

#### 文章列表

- 展示所有文章，显示标题、分类、状态、作者、发布时间
- 支持搜索和筛选

#### 新建文章

**路径**：`/admin/articles/new`

| 字段 | 说明 | 是否必填 |
|------|------|---------|
| title | 文章标题 | 是 |
| slug | URL 友好标识（自动生成） | 是 |
| content | 文章内容（Markdown 格式） | 是 |
| excerpt | 文章摘要 | 否 |
| category | 分类 | 否 |
| tags | 标签列表 | 否 |
| featuredImage | 封面图片 URL | 否 |
| status | 状态 | 是 |

#### 文章发布流程

```
草稿 (draft) → 已发布 (published) → 归档 (archived)
```

- **草稿**：新建文章的默认状态，仅后台可见
- **已发布**：前台可见，同时记录 `publishedAt` 发布时间
- **归档**：前台不再展示，后台保留记录

#### 置顶文章

设置 `isSticky: true` 可将文章置顶显示。

### 5.4 数据分析

**路径**：`/admin/analytics`

基于 `AnalyticsEvent` 模型提供以下分析功能：

| 功能 | 说明 |
|------|------|
| PV 趋势 | 按时间维度查看页面浏览量变化 |
| 热门页面排行 | 访问量最高的页面排名 |
| 门店访问统计 | 各门店页面的访问数据 |

> 数据通过 `/api/analytics` 接口采集，前端页面访问时自动记录事件。

### 5.5 系统设置

**路径**：`/admin/settings`

系统全局配置管理（功能持续迭代中）。

---

## 六、部署到阿里云 ECS

### 6.1 服务器准备

1. 购买阿里云 ECS 实例（推荐 2C4G 及以上配置）
2. 安装 Docker 和 Docker Compose
3. 开放安全组端口：80 (HTTP)、443 (HTTPS)

### 6.2 部署步骤

```bash
# 1. 克隆代码到服务器
git clone <your-repo-url> /opt/lanhui-website
cd /opt/lanhui-website

# 2. 配置生产环境变量
cp .env.example .env
```

编辑 `.env`，修改以下关键配置：

```bash
# 修改为服务器实际地址
NEXTAUTH_URL=https://your-domain.com

# 生成强密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 数据库连接（Docker 内部网络使用 postgres 服务名）
DATABASE_URL=postgresql://lanhui:你的强密码@postgres:5432/lanhui

NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

同时修改 `docker-compose.yml` 中的数据库密码：

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: 你的强密码   # 与 DATABASE_URL 中的密码一致

app:
  environment:
    - DATABASE_URL=postgresql://lanhui:你的强密码@postgres:5432/lanhui
    - NEXTAUTH_SECRET=你的强密钥
    - NEXTAUTH_URL=https://your-domain.com
```

```bash
# 3. 构建并启动
docker compose up -d

# 4. 运行迁移
docker compose exec app npx prisma migrate deploy

# 5. 初始化种子数据
docker compose exec app npx prisma db seed

# 6. 验证服务
curl http://localhost:3000
```

### 6.3 配置 HTTPS / SSL 证书

1. 在阿里云申请免费 SSL 证书（或使用 Let's Encrypt）
2. 将证书文件放置到服务器（如 `/etc/nginx/ssl/` 目录）
3. 修改 `nginx.conf` 配置 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/ssl/your-domain.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

4. 更新 `docker-compose.yml` 挂载 SSL 证书：

```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/nginx/ssl:/etc/nginx/ssl:ro
```

5. 重启 Nginx 服务：`docker compose restart nginx`

### 6.4 安全检查清单

- [ ] 修改默认数据库密码
- [ ] 修改 `NEXTAUTH_SECRET` 为强随机密钥
- [ ] 修改管理员默认密码 `admin123`
- [ ] 关闭 PostgreSQL 外部端口映射（生产环境去掉 `ports: 5432`）
- [ ] 配置 HTTPS 强制跳转
- [ ] 配置防火墙/安全组仅开放 80/443

---

## 七、常见问题 FAQ

### Q: 忘记管理员密码怎么办？

使用创建管理员脚本重置：

```bash
# 通过脚本创建新管理员（如果旧账号还在，可先在 Prisma Studio 中删除旧记录）
npx tsx scripts/create-admin.ts --username admin --email admin@lanhui.com --password 新密码
```

或者直接在数据库中更新密码哈希：

```bash
# 1. 生成新密码的哈希值
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('新密码', 10));"

# 2. 使用 Prisma Studio 更新
npx prisma studio
# 打开 User 表 → 找到目标用户 → 将 password 字段替换为生成的哈希值
```

### Q: 如何重置数据库？

```bash
# 方式 1：本地开发环境
npx prisma migrate reset
# 此命令会删除数据库并重新创建，同时自动运行 seed

# 方式 2：Docker 环境
docker compose exec app npx prisma migrate reset

# 方式 3：完全重建（彻底清空包括 Docker Volume）
docker compose down -v
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

> **警告**：重置数据库将丢失所有数据，操作前请务必备份！

### Q: 门店数据什么时候在前台更新？

前台页面采用 **ISR（Incremental Static Regeneration）** 机制：

- 页面在构建时生成静态 HTML，访问速度极快
- 后台修改门店数据后，前台会在 **revalidate 时间到期后**自动重新生成
- 默认 revalidate 周期根据页面配置而定（通常 60-300 秒）
- 如需立即生效，可在 Next.js 配置中使用 `revalidatePath()` 或 `revalidateTag()` 手动触发
- 也可以重新构建部署：`docker compose up -d --build`

### Q: 如何备份数据库？

```bash
# 方式 1：pg_dump 导出（推荐）
docker compose exec postgres pg_dump -U lanhui lanhui > backup_$(date +%Y%m%d_%H%M%S).sql

# 方式 2：备份 Docker Volume
docker run --rm -v lanhui-website_pgdata:/data -v $(pwd):/backup alpine \
  tar czf /backup/pgdata_backup_$(date +%Y%m%d).tar.gz -C /data .

# 恢复备份
cat backup_20260609_120000.sql | docker compose exec -T postgres psql -U lanhui lanhui
```

建议设置定时任务自动备份：

```bash
# 添加 crontab，每天凌晨 3 点备份
0 3 * * * cd /opt/lanhui-website && docker compose exec -T postgres pg_dump -U lanhui lanhui > /opt/backups/lanhui_$(date +\%Y\%m\%d).sql
```

### Q: Docker 容器启动失败怎么排查？

```bash
# 查看容器日志
docker compose logs app
docker compose logs postgres

# 查看容器状态
docker compose ps

# 常见问题：
# 1. postgres 未就绪 → 等待 healthcheck 通过
# 2. DATABASE_URL 配置错误 → 检查 .env 文件
# 3. 端口冲突 → 修改 docker-compose.yml 中的端口映射
# 4. 迁移未执行 → 运行 npx prisma migrate deploy
```

### Q: 如何更新代码并重新部署？

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker compose up -d --build

# 3. 如果有数据库变更，运行迁移
docker compose exec app npx prisma migrate deploy

# 4. 验证服务
docker compose ps
docker compose logs app --tail 50
```

### Q: 如何查看系统运行日志？

```bash
# 查看应用日志
docker compose logs app --tail 100 -f

# 查看数据库日志
docker compose logs postgres --tail 50

# 查看 Nginx 访问日志
docker compose logs nginx --tail 50
```

---

## 附录

### A. 技术栈概览

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.1 | 全栈框架（App Router） |
| React | 19.2.4 | UI 库 |
| TypeScript | 5+ | 类型安全 |
| PostgreSQL | 15 | 关系型数据库 |
| Prisma | 7.8.0 | ORM |
| NextAuth.js | 5.0.0-beta.31 | 身份认证 |
| bcryptjs | 3.0.3 | 密码加密 |
| Tailwind CSS | v4 | 样式系统 |
| shadcn/ui | v4.1.0 | UI 组件库 |
| Docker | - | 容器化部署 |

### B. 数据库模型关系

```
User ──< Article          （用户拥有多篇文章）
Province ──< City          （省份包含多个城市）
Province ──< Store         （省份包含多个门店）
City ──< Store             （城市包含多个门店）
Store ──< AnalyticsEvent   （门店关联访问事件）
```

### C. API 端点一览

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | * | NextAuth 认证 |
| `/api/stores` | GET | 门店列表 |
| `/api/stores/[id]` | GET/PUT/DELETE | 门店详情/更新/删除 |
| `/api/articles` | GET | 文章列表 |
| `/api/articles/[slug]` | GET | 文章详情 |
| `/api/provinces` | GET | 省份列表 |
| `/api/cities` | GET | 城市列表 |
| `/api/analytics/*` | GET/POST | 数据分析 |

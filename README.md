# 蓝辉轻改 / LANHUI Website

> 汽车轻改装 + 车身膜服务的官方品牌站与运营后台
> 广州/佛山 · 顺德大良店

公开站点（产品浏览、门店查询、资讯）+ 完整的管理后台（文章、门店、数据分析）一体化实现。
代码库同时也是 AI 辅助开发工作流（`/dispatch` / `/prompt-boost` / `/clone-website`）的承载项目。

---

## ✨ 站点功能

### 公开站（SSG 优先）
| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | Hero + 产品矩阵 + 门店入口 + 微信咨询弹窗 |
| 品牌页 | `/brand` | 品牌故事、定位、服务范围 |
| 资讯 | `/news` + `/news/[slug]` | 列表 + Markdown 详情，含置顶、归档 |
| 产品 | `/product/<9 类>` | 电动踏板、轮毂、底盘、汽车窗膜、改色膜、PPF/隐形车衣、木地板、问界专题、小米专题、ZEEKR 专题 |
| 门店地图 | `/agent` + `/agent/store` | 全国 27 省 / 75 市 / ~150 门店（树形检索 + 详情） |
| 联系 | `/contact` | 联系方式、地址、营业时间 |
| SEO | `robots.ts` + `sitemap.ts` + `Organization` JSON-LD | 全自动生成 |

### 管理后台 `/admin`
| 模块 | 路径 | 角色 | 能力 |
| --- | --- | --- | --- |
| 仪表盘 | `/admin` | admin / editor | 运营概览 |
| 文章管理 | `/admin/articles` | admin / editor | CRUD + 一键发布/取消发布 + 一键置顶/取消置顶 |
| 门店管理 | `/admin/stores` | admin | CRUD + 软删除/恢复 + 多级省市联动 |
| 数据分析 | `/admin/analytics` | admin | 浏览/咨询/提交漏斗 + 实时事件流 |
| 系统设置 | `/admin/settings` | admin | 个人资料、密码 |

---

## 🧱 技术栈

| 层 | 选型 | 版本 |
| --- | --- | --- |
| Framework | Next.js（App Router）+ React | 16.2.1 / 19.2.4 |
| Language | TypeScript（strict） | 5.x |
| Database | PostgreSQL + Prisma（adapter-pg） | 7.8 |
| Auth | NextAuth v5（Credentials + JWT，迁移兜底） | 5.0.0-beta.31 |
| UI | shadcn/ui + Radix + Tailwind v4（oklch） | — |
| Icons | lucide-react | 1.6 |
| State | React built-in（useState/useReducer/useTransition） | — |
| Markdown | react-markdown | 10.1 |
| Charts | recharts | 3.8 |
| Object Storage | 阿里云 OSS（ali-oss） | 6.23 |
| Testing | vitest + happy-dom + Playwright | 3.2 / 1.55+ |
| Lint / Format | ESLint 9 + eslint-config-next | — |
| AI Workflow | Claude Code + 自定义 skills（`.claude/skills/*`） | — |

---

## 🚀 快速开始

### 0. 前置
- Node.js **24+**
- Docker（用于本地 PostgreSQL）
- 阿里云 OSS 凭据（图片上传，可选）

### 1. 安装依赖
```bash
npm install
```

### 2. 启动 PostgreSQL
```bash
docker run -d --name lanhui-postgres \
  -e POSTGRES_USER=lanhui \
  -e POSTGRES_PASSWORD=lanhui_password \
  -e POSTGRES_DB=lanhui \
  -p 5433:5432 \
  postgres:16
```

### 3. 配置环境变量
```bash
cp .env.example .env   # 不存在则参考下方模板
```

`.env` 最小配置：
```bash
DATABASE_URL=postgresql://lanhui:lanhui_password@localhost:5433/lanhui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
ALI_OSS_ACCESS_KEY_ID=...   # 可选；缺省时上传降级为本地占位
ALI_OSS_ACCESS_KEY_SECRET=...
ALI_OSS_BUCKET=...
ALI_OSS_REGION=...
```

### 4. 初始化数据库
```bash
npx prisma migrate deploy
npx prisma db seed            # 写入 admin 用户 + 大陆省市数据
```

### 5. 启动开发服务器
```bash
npm run dev
# → http://localhost:3000  公开站
# → http://localhost:3000/admin/login  管理后台
```

默认管理员账号（来自 `prisma/seed.ts`）：
| 字段 | 值 |
| --- | --- |
| 用户名 / 邮箱 | `admin` / `admin@lanhui.com` |
| 密码 | `admin123` |

> **生产环境必改**。Seed 仅用于本地开发。

---

## 📜 命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Next.js dev server（Turbopack） |
| `npm run build` | 生产构建（含 SSG 静态页生成） |
| `npm run start` | 启动生产 server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint + typecheck + build 一把梭 |
| `npm test` | vitest 单元测试（happy-dom） |
| `npm run test:watch` | vitest watch 模式 |
| `npm run test:coverage` | 覆盖率报告 |
| `npm run test:e2e` | Playwright e2e |
| `npx prisma studio` | 浏览器查看数据库 |
| `npx prisma migrate dev --name <name>` | 新建/修改迁移 |

---

## 🗂 项目结构

```
src/
├─ app/                              # Next.js 16 App Router
│  ├─ page.tsx                       # 公开首页
│  ├─ layout.tsx                     # 根 layout（注入 Analytics + WeChat 弹窗）
│  ├─ globals.css                    # 全局样式 + Tailwind v4 + oklch token
│  ├─ brand/ contact/ news/          # 公开内容页
│  ├─ product/                       # 9 个产品分类
│  ├─ agent/                         # 门店地图
│  ├─ admin/                         # 管理后台（路由组 (dashboard) 共享 layout）
│  │  ├─ login/
│  │  └─ (dashboard)/
│  │     ├─ articles/                # 列表 + new + [id] 编辑
│  │     ├─ stores/                  # 列表 + new + [id] 编辑
│  │     ├─ analytics/               # 数据看板
│  │     └─ settings/                # 系统设置
│  └─ api/                           # Route Handlers
│     ├─ auth/[...nextauth]/         # NextAuth
│     ├─ articles/                   # CRUD
│     ├─ stores/                     # CRUD
│     ├─ regions/ provinces/ cities/ # 行政区划
│     ├─ analytics/                  # 事件
│     └─ upload/                     # ali-oss
├─ components/
│  ├─ ui/                            # shadcn/ui 基础
│  ├─ shared/                        # 跨页共享（WeChat 弹窗等）
│  ├─ Header.tsx Footer.tsx Hero.tsx
│  └─ window-film/                   # 业务组件
├─ lib/
│  ├─ auth.ts auth-callbacks.ts      # NextAuth + JWT 迁移兜底
│  ├─ prisma.ts                      # Prisma 7 单例 + adapter-pg
│  ├─ validations/                   # Zod schemas
│  ├─ brand.ts                       # 品牌数据集中地
│  ├─ products.ts stores.ts ...      # 静态数据层
│  └─ admin-dashboard.ts             # 活动日志
└─ types/
   └─ next-auth.d.ts                 # Session.user.id / role 类型
prisma/
├─ schema.prisma                     # User/Article/Store/Province/City/...
├─ seed.ts                           # admin + 27 省 + 75 市
└─ migrations/
public/
├─ images/                           # 产品图、门店图、Logo
└─ ...
docs/
├─ PRD/                              # 产品需求（YYYY-MM-DD-NAME.md）
├─ test-reports/                     # 缺陷修复与验证报告
├─ designs/                          # 设计稿
└─ prompts/                          # 复盘用的 prompt 记录
.claude/
├─ skills/                           # 自定义 skills（dispatch / prompt-boost / ...）
└─ worktrees/                        # Agent worktree 临时目录
AGENTS.md / CLAUDE.md                # AI agent 协作约定
```

---

## 🤖 AI 辅助开发

本项目以 AI agent 为核心开发方式，所有需求都通过工作流推进：

```
自然语言需求 → /prompt-boost (生成精确 spec)
             → /dispatch (架构师 → 实现者 → 测试 → 部署)
             → worktree 隔离并行
             → PR 合并 → 推送
```

核心约定见 [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md)。

常用 skills（在 Claude Code 中以 `/` 触发）：

| Skill | 作用 |
| --- | --- |
| `/prompt-boost` | 自然语言 → 结构化实现 spec |
| `/dispatch` | 流水线编排（架构 → 实现 → 测试 → 部署） |
| `/build` | 增量实现下一个 plan task |
| `/test` | TDD：失败用例 → 通过 → 验证 |
| `/review` | 五轴代码审查（正确性 / 可读性 / 架构 / 安全 / 性能） |
| `/ship` | 上线前 checklist |
| `/clone-website <url>` | 从 URL 反向克隆站点（本项目曾是模板） |

---

## 📚 文档

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — 架构总览
- [`docs/PRD/`](./docs/PRD/) — 各产品需求 PRD
- [`docs/test-reports/`](./docs/test-reports/) — 缺陷修复与验证报告（按日期归档）
- [`AGENTS.md`](./AGENTS.md) — AI agent 协作约定

---

## 🧪 质量门禁

- `npm run typecheck` — 0 错误
- `npm test` — 全过（当前 162 用例）
- `npm run build` — 成功（含 465+ 静态页）
- `npm run test:e2e` — Playwright 端到端
- 每次 PR 由 `code-review` skill 跑五轴审查

---

## 👤 维护

| 项 | 信息 |
| --- | --- |
| 品牌方 | 蓝辉轻改 / LANHUI |
| 地址 | 广东省佛山市顺德区大良 |
| 当前门店 | 顺德大良店 |
| 技术维护 | 冯科雅（Coya）· AI 部 |
| GitHub | [@coyafky](https://github.com/coyafky) |
| 远程仓库 | <https://github.com/coyafky/LanHui-Website.git> |

---

## 📄 License

Private / All rights reserved.
未经授权不得用于商业用途或对外再分发。

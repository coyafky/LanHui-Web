# Admin 系统设置页面 PRD

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。本轮只定义需求、实现边界与验证标准。

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品 | 蓝辉轻改 LANHUI 官网 |
| 需求名称 | Admin 系统设置页面 |
| 版本 | v1.0 (Demo 阶段) |
| 日期 | 2026-06-14 |
| 循环阶段 | Discover -> Plan -> Execute -> Verify -> Refine |
| 本轮周期 | 1 天内打穿一个最小可用版本 |
| 核心交付 | `/admin/settings` 三个 Tab 页面 + 对应 API + vitest 测试 |
| 涉及页面 | `/admin/settings` |
| 不涉及页面 | `/admin/stores`、`/admin/articles`、`/admin/analytics`、前台任意页面 |

## 2. 背景与目标

LANHUI 后台当前在 Sidebar 已预留「系统设置」入口(`/admin/settings`),点击后会 404。本轮目标是补齐这个页面,让运营人员和品牌负责人可以在后台完成最基础的自助管理。

Demo 阶段硬约束:**不新建任何数据表、不做 Prisma migration、不动 `prisma/seed.ts`**。仅复用现有 `User` 表(写)和 `src/lib/brand.ts`(只读 import)。

## 3. 用户与业务结果

### 3.1 用户角色

| 用户 | 需求 |
| --- | --- |
| 运营人员 | 改自己账号的姓名、用户名、密码,不需要找开发者 |
| 品牌负责人 | 在系统设置看到当前品牌信息全貌(只读),了解哪些字段还是「待补充」状态 |
| 开发者 | 拿到清晰的 API 契约、测试覆盖、零 schema 漂移 |

### 3.2 本轮业务结果

- 后台系统设置入口不再 404
- 运营人员改 name 后,顶栏 Header 同步显示
- 运营人员改密码后,退出登录用新密码可重登
- 品牌 tab 显式标注「Demo 阶段只读」,占位字段用 amber 提示「需运营人员填写」

## 4. 范围定义

### 4.1 本轮必须完成

- `src/lib/validations/settings.ts`:ProfileUpdateSchema + ChangePasswordSchema(zod)
- `src/app/api/settings/profile/route.ts`:GET 读当前 user / PUT 更新 name + username
- `src/app/api/settings/change-password/route.ts`:POST bcrypt 验证 + 更新
- `src/app/admin/(dashboard)/settings/page.tsx`:3 tab 主页面
- `src/components/admin/settings/Tabs.tsx`:tab 容器
- `src/components/admin/settings/ProfileTab.tsx`:个人资料表单
- `src/components/admin/settings/ChangePasswordDialog.tsx`:改密码弹窗
- `src/components/admin/settings/BrandTab.tsx`:品牌信息只读
- `src/components/admin/settings/SystemTab.tsx`:系统信息只读
- 4 个测试文件,共 19 个 it

### 4.2 本轮不做

- ❌ 新建 `BrandProfile` 表(留给 v2)
- ❌ 品牌信息表单提交(只读,改用「复制 JSON」或 export 也不做)
- ❌ 用户管理(列表/启停/改角色)
- ❌ 头像上传
- ❌ 双因子认证
- ❌ 邮件通知改密
- ❌ 操作审计日志
- ❌ i18n(后台保持中文)
- ❌ SEO 字段
- ❌ 主题色/品牌色编辑
- ❌ 任何新的第三方依赖

## 5. 数据模型

### 5.1 不变更 schema

`prisma/schema.prisma` **保持现状**,本轮不动。

### 5.2 现有 User 表(本次唯一可写表)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String   // bcrypt 哈希
  name      String?
  role      String   @default("editor")
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 5.3 品牌信息(只读,无新表)

直接 `import { brand } from '@/lib/brand'`,字段:

| 字段 | 当前值 | 占位标记 |
| --- | --- | --- |
| `zh` | "蓝辉轻改" |  |
| `en` | "LANHUI" |  |
| `slogan` | "让爱车更有型,也好用" |  |
| `shortDescription` | 长描述 |  |
| `foundedYear` | 2026 |  |
| `phone` | "联系方式待补充" | ⚠️ 需补充 |
| `phoneTel` | "#contact" | ⚠️ 需补充 |
| `email` | "lanhui@example.com" |  |
| `address` | "广东省佛山市顺德区大良(详细地址待补充)" | ⚠️ 需补充 |
| `businessHours` | "营业时间待确认" | ⚠️ 需确认 |
| `icp` | "ICP备案号待备案" | ⚠️ 需备案 |
| `police` | "公安备案号待备案" | ⚠️ 需备案 |

**占位检测规则**:值非空 + 值包含「待补充」/「待备案」/「待确认」/「example」中任一关键词 → 触发 amber 提示。

## 6. API 契约

### 6.1 `GET /api/settings/profile`

| 项 | 内容 |
| --- | --- |
| 鉴权 | 必须登录(JWT session) |
| 请求体 | 无 |
| 200 响应 | `{ success: true, data: { id, username, name, email, role, status } }` |
| 401 响应 | `{ success: false, error: "未登录" }` |
| 500 响应 | `{ success: false, error: "服务器错误" }` |

注意:响应**不包含 password 字段**。

### 6.2 `PUT /api/settings/profile`

| 项 | 内容 |
| --- | --- |
| 鉴权 | 必须登录 |
| 请求体 | `{ name: string(1-50), username: string(2-30, /^[a-zA-Z0-9_-]+$/) }` |
| 200 响应 | `{ success: true, data: { id, username, name, email, role, status } }` |
| 400 校验失败 | `{ success: false, error: "参数错误", details: { name?: string[], username?: string[] } }` |
| 400 用户名冲突 | `{ success: false, error: "用户名已被使用" }`(catch Prisma P2002) |
| 401 响应 | `{ success: false, error: "未登录" }` |

### 6.3 `POST /api/settings/change-password`

| 项 | 内容 |
| --- | --- |
| 鉴权 | 必须登录 |
| 请求体 | `{ currentPassword: string, newPassword: string(8-64), confirmPassword: string }` |
| 200 响应 | `{ success: true }` |
| 400 校验失败 | `{ success: false, error: "参数错误", details }` |
| 400 原密码错 | `{ success: false, error: "原密码错误" }` |
| 400 两次不一致 | `{ success: false, error: "两次输入不一致" }` |
| 401 响应 | `{ success: false, error: "未登录" }` |

实现细节:`bcrypt.compare(currentPassword, user.password)` + 成功后 `bcrypt.hash(newPassword, 10)` 写回。

### 6.4 不提供的 API

- `GET/PUT /api/settings/brand` — Demo 阶段不需要
- `GET /api/settings/system` — 由 Server Component 直接读 `process.version` 等

## 7. UI 规格

### 7.1 布局

```
+-------------------------------------------+
| 系统设置                                   |  ← h1,text-2xl
+-------------------------------------------+
| [个人资料] [品牌信息] [系统信息]            |  ← 横向 Tabs
+-------------------------------------------+
|  (当前 tab 内容)                           |
+-------------------------------------------+
```

### 7.2 个人资料 Tab

- 标题:「个人信息」
- 显示只读字段:邮箱、角色、状态、注册时间
- 可编辑字段:姓名(必填)、用户名(必填,unique)
- 提交按钮:橙色「保存修改」
- 「修改密码」按钮:次按钮,打开弹窗
- 提交成功后:`router.refresh()` + toast「已保存」
- 后端 400 时:字段下方红字 `text-sm text-red-400` 显示 `error` 或 `details[field]`

### 7.3 改密码弹窗

- Modal 居中,半透明黑遮罩
- 3 字段:原密码、新密码、确认密码
- 「确认修改」/「取消」
- 成功后:关闭弹窗 + toast「密码已更新,请下次登录使用新密码」
- 失败:弹窗内字段下方红字

### 7.4 品牌信息 Tab(Demo 阶段只读)

- 标题旁徽章:`<span class="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">Demo 阶段只读</span>`
- 11 字段卡片布局:每行 2 列(移动端单列)
- 占位检测:值含「待补充」/「待备案」/「待确认」/「example」/ 为空 → 右侧 amber 提示「该字段需运营人员填写」
- **不显示任何「保存」「编辑」按钮**

### 7.5 系统信息 Tab(只读)

字段:
- Next.js 版本(从 `next/package.json` 读)
- Node.js 版本(`process.version`)
- Prisma 版本(`@prisma/client/package.json`)
- 当前环境(`process.env.NODE_ENV`)
- 当前用户:role + status
- 数据库连接状态:`✅ 已连接` / `❌ 未连接`(`prisma.$queryRaw` 健康检查)

字段缺失用 `—` 占位。

## 8. 测试规格

### 8.1 API 集成测试(沿用 `vi.hoisted` + `vi.mock('@/lib/prisma')` 范式)

#### `src/app/api/settings/profile/route.test.ts`

| ID | 场景 | 期望 |
| --- | --- | --- |
| I1 | 无 session 调用 GET | 401 `{ success: false, error: "未登录" }` |
| I2 | 有 session 调用 GET | 200,响应 data 不含 password 字段 |
| I3 | PUT 缺 name 字段 | 400,details.name 存在 |
| I4 | PUT username 格式错(含中文) | 400,details.username 存在 |
| I5 | PUT 正常字段 | 200,prisma.user.update 被调一次 |
| I6 | PUT username 重复(Prisma P2002) | 400 `{ error: "用户名已被使用" }` |

#### `src/app/api/settings/change-password/route.test.ts`

| ID | 场景 | 期望 |
| --- | --- | --- |
| I1 | 无 session | 401 |
| I2 | 缺 newPassword 字段 | 400,details.newPassword 存在 |
| I3 | 两次密码不一致 | 400,details.confirmPassword 存在 |
| I4 | 新密码 6 位(短) | 400,details.newPassword 存在 |
| I5 | 旧密码错(bcrypt.compare false) | 400 `{ error: "原密码错误" }` |
| I6 | 成功 | 200,prisma.user.update 被调,password 字段被覆盖为哈希值 |

#### `src/components/admin/settings/ProfileTab.test.tsx`

| ID | 场景 | 期望 |
| --- | --- | --- |
| U1 | mount 时 GET /api/settings/profile | 渲染 username、name、email |
| U2 | 提交表单 | 触发 PUT /api/settings/profile |
| U3 | 后端 400 username 冲突 | 「用户名已被使用」红字出现 |
| U4 | 点「修改密码」按钮 | 弹窗打开,显示 3 字段 |

#### `src/components/admin/settings/BrandTab.test.tsx`

| ID | 场景 | 期望 |
| --- | --- | --- |
| U1 | mount | 渲染 zh、en、slogan、phone、address 等 ≥10 个字段标签 |
| U2 | 包含「待补充」字段 | amber 提示「该字段需运营人员填写」出现 |
| U3 | mount | 「Demo 阶段只读」徽章出现 |

**不测试**:`ChangePasswordDialog.test.tsx`、`SystemTab.test.tsx`(范围控制,验证通过 build + 手测覆盖)

### 8.2 测试运行

```bash
npm run test
```

19 个 it 必须全绿。

## 9. 验收标准

- [ ] `docs/PRD/SETTINGS_PAGE_PRD_2026-06-14.md` 存在(本文件)
- [ ] `prisma/schema.prisma` `git diff` 为空
- [ ] `prisma/seed.ts` `git diff` 为空
- [ ] `src/lib/brand.ts` `git diff` 为空
- [ ] 2 个 API 文件 + 6 个组件文件 + 1 个 validations 文件存在
- [ ] `/admin/settings` 路由可访问(Sidebar 链接已存在)
- [ ] 4 个测试文件全绿
- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] 浏览器手测:登录后改 name → 顶栏更新;改密码 → 退出用新密码可登;品牌 tab 显示「Demo 阶段只读」徽章
- [ ] 改动**仅限**:`docs/PRD/SETTINGS_PAGE_PRD_2026-06-14.md`、`src/lib/validations/settings.ts`、`src/app/api/settings/`、`src/app/admin/(dashboard)/settings/`、`src/components/admin/settings/`

## 10. 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 改密码后顶栏 name 不同步 | Coder 必须调 `router.refresh()`,Tester 验证 |
| Sidebar 链接已存在但页面 404 | Coder 实现后必须本地启 dev 验证 |
| `prisma.user.findUnique` 失败导致 500 | catch 后返回 500,不泄漏 stack |
| bcrypt 哈希耗时影响响应 | 接受(单次 100ms 级),后续可异步 |
| happy-dom 不支持 RSC | UI 测试只覆盖 client component,Server Component 不测 |
| `next/server` headers mock 不全 | 沿用 `analytics/track` 测试的 mock 模式 |

## 11. 不做清单(明确写出来)

- ❌ 任何 UI 改造(只新建 7 个文件,不动其他 admin 页面)
- ❌ 任何 Prisma schema 变更
- ❌ 任何新依赖
- ❌ 任何 i18n
- ❌ 任何 SEO/og/meta
- ❌ 任何「复制 JSON / 导出 / 导入」功能
- ❌ 任何 brand API(等 v2)
- ❌ 任何用户管理
- ❌ 任何审计日志
- ❌ 任何主题/品牌色编辑

---

> 本文档为 Demo 阶段最小可用版本规格,所有超出范围的需求请走 v2 评审。

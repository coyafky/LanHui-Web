# [FEATURE]_PRD_<YYYY-MM-DD>.md — 横切功能模板

> 用于横跨多个页面/路由的功能模块子 PRD 模板(图片上传 / 埋点 / SEO / 认证等)。

---

## 1. 概述

**功能**: `<NAME>` (例: 图片上传 / 埋点系统 / SEO / 认证守卫)
**类型**: 横切 (无独立路由)
**优先级**: P0 / P1 / P2
**Owner**: 冯科雅
**版本**: v0 / v1
**最后更新**: YYYY-MM-DD

### 1.1 目标

1-2 句话说明此功能解决什么问题。

### 1.2 适用页面

| 路由 | 使用方式 |
|---|---|
| `/admin/stores/[id]/image` | 上传门店图 |
| `/admin/articles/new` | 上传文章头图 |
| ... | ... |

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| admin | 想给门店上传图 | 在 `/admin/stores/[id]/image` 拖拽/选择 → 实时预览 → 保存 | P0 |
| 站长 | 想看页面流量 | `/admin/analytics` 看到 PV / UV / 来源 | P0 |
| 访客 | 想分享到微信 | OG 图 + 标题正确显示 | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | 上传文件(图片/PDF) | P0 | ✅ |
| F2 | 实时预览 + 裁剪 | P1 | ⚪ |
| F3 | 缩略图自动生成 | P1 | ⚪ |
| F4 | 限流 (60/min/IP) | P0 | ⚪ |
| F5 | 错误处理 + 重试 | P0 | ⚪ |
| F6 | CDN / OSS 集成 (规划) | P2 | ⚪ |

---

## 4. UI / 交互

### 4.1 视觉规范 (如有 UI)

- 拖拽区: 虚线边框 + 浅色背景
- 进度条: orange-500
- 错误: red-500 文字 + 图标

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `<Feature>Uploader` | `src/components/shared/<Feature>Uploader.tsx` | CC | 上传 UI |
| `<Feature>Provider` | `src/components/<Feature>Provider.tsx` | CC | 全局 provider |

### 4.3 API 客户端

(如适用)

```ts
// src/lib/<feature>.ts
export function track(type: string, metadata?: object) {
  // 缓冲 5 条 / 10s flush
  // sendBeacon 优先
}
```

---

## 5. 数据模型

### 5.1 涉及表

(如适用)

```
DB: <Table>            # 例: AnalyticsEvent
schema: prisma/schema.prisma
```

### 5.2 存储策略

(如适用)

| 类型 | 路径 | 大小限制 | 命名 |
|---|---|---|---|
| 门店图 | `public/images/stores/<id>.webp` | 5MB | `<storeId>.webp` |
| 文章头图 | `public/images/articles/<id>.webp` | 5MB | `<articleId>.webp` |
| 用户头像 | `public/images/avatars/<id>.webp` | 2MB | `<userId>.webp` |

**当前实现**: 本地存储 (sharp 处理,q80 WebP)
**规划**: 阿里云 OSS(已安装 `ali-oss` 依赖,未启用)

---

## 6. API 接口

| Method | 路径 | 用途 | 权限 |
|---|---|---|---|
| POST | `/api/<feature>` | 写入 | admin |
| GET | `/api/<feature>/stats` | 查询 | admin |

(如适用) 完整 schema 见 route handler 源码。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] 上传 / 写入 / 查询流程完整
- [ ] 错误场景有用户友好提示
- [ ] 限流生效(>60/min 拒绝)

### 7.2 性能

- [ ] 上传 < 5s (5MB 文件)
- [ ] 查询 < 200ms
- [ ] 无 N+1 查询

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] vitest 单元测试覆盖
- [ ] Playwright e2e 覆盖关键路径

### 7.4 安全

- [ ] 文件类型白名单(防 XSS)
- [ ] 文件大小限制
- [ ] 路径遍历防护
- [ ] 限流
- [ ] 输入 Zod 校验

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| YYYY-MM-DD | v0 | 初稿 | Coya |
| YYYY-MM-DD | v1 | 完整规格 + 限流 + 降级 | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4
- [../../src/lib/](../../src/lib/) — 工具函数
- [../../src/components/](../../src/components/) — UI 组件

## 附录 B: 横切功能清单

| 功能 | 当前状态 | 已知问题 |
|---|---|---|
| 图片上传 | 🟡 v0 (本地) | 规划迁 OSS |
| 埋点 | 🟡 v0 (基础 pageview) | click/store_view/booking 几乎为零 (P1-12, P1-13) |
| SEO | 🟡 v0 (meta + sitemap) | /news/[slug] 缺 meta (P0-7) |
| 认证守卫 | 🟢 v1 (NextAuth) | 7 写 API 仅 2 写 ActivityLog (B3) |

# 蓝辉咨询渠道数据库模型 PRD

> **数据库**：PostgreSQL + Prisma  
> **关联路由**：[CONSULTATION_CHANNEL_ROUTES_PRD_2026-06-22.md](../api/CONSULTATION_CHANNEL_ROUTES_PRD_2026-06-22.md)  
> **版本**：v0.1  
> **状态**：规划中，未授权迁移

## 1. 模型目标

保存总部和门店使用的微信、企业微信、电话咨询渠道，支持状态、优先级、生效时间、二维码替换、公开解析和操作审计。

## 2. 推荐模型

```prisma
model ConsultationChannel {
  id            String    @id @default(cuid())
  name          String
  type          String
  scope         String
  storeId       String?
  store         Store?    @relation(fields: [storeId], references: [id], onDelete: Restrict)
  displayName   String
  accountHint   String?
  phone         String?
  qrImagePath   String?
  status        String    @default("draft")
  isDefault     Boolean   @default(false)
  priority      Int       @default(100)
  effectiveFrom DateTime?
  effectiveTo   DateTime?
  disabledReason String?
  notes         String?
  createdById   String?
  updatedById   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status, type, scope])
  @@index([storeId, status])
  @@index([isDefault, status])
  @@index([effectiveFrom, effectiveTo])
}
```

实现时可根据 Prisma 关系命名要求补充 User 的创建/更新关系；若关系造成不必要复杂度，一期可只保留 actor ID 字符串，并依赖 ActivityLog 追溯。

## 3. 字段规则

| 字段 | 规则 |
|---|---|
| `type` | `wecom/wechat/phone` |
| `scope` | `headquarters/store` |
| `storeId` | scope=store 时必填 |
| `displayName` | 公开弹窗显示的承接主体 |
| `accountHint` | 可选公开提示，不存聊天内容 |
| `phone` | phone 类型或降级电话 |
| `qrImagePath` | 微信类 active 时必填 |
| `status` | `draft/active/disabled` |
| `isDefault` | 总部默认渠道 |
| `priority` | 数字越小优先级越高 |
| `effectiveFrom/To` | 可选生效区间 |
| `disabledReason` | 停用原因，仅后台 |
| `notes` | 内部备注，绝不公开 |

## 4. 约束

- `scope=headquarters` 时 `storeId` 必须为空。
- `scope=store` 时 `storeId` 必须存在。
- `type in (wecom,wechat)` 且 status=active 时 `qrImagePath` 必填。
- `type=phone` 且 status=active 时 `phone` 必填。
- `effectiveTo` 必须晚于 `effectiveFrom`。
- 同一时刻只能有一个 `isDefault=true AND status=active AND scope=headquarters AND type=wecom`。

最后一条推荐通过服务端事务保证；如项目确认使用 PostgreSQL partial unique index，可在 SQL migration 中增加部分唯一索引，并记录 Prisma schema 无法完整表达该约束。

## 5. Store 关系

在 Store 增加：

```prisma
consultationChannels ConsultationChannel[]
```

- 删除有关联渠道的 Store 使用 Restrict。
- 门店终止合作不删除渠道，统一停用并保留历史。
- 公开解析需同时检查 Store 状态。

## 6. AnalyticsEvent 关系

一期不强制增加数据库外键，`contactChannelId` 可先放入 metadata，避免高频事件写入时增加关系复杂度。

如果后续需要长期统计渠道生命周期，可增加 nullable `consultationChannelId` 与 `onDelete: SetNull`，但应另行评估迁移和查询价值。

## 7. 图片存储

- 本期沿用本地存储，不接 OSS。
- 推荐路径：`/images/consultation/<channelId>-<version>.webp`。
- 数据库只存公开相对路径。
- 替换顺序：写新文件 → 更新 DB → 刷新缓存 → 异步清理旧文件。
- 失败时保留旧文件和旧路径。

## 8. 迁移

1. 新建 `ConsultationChannel` 表。
2. 增加索引和 Store 关系。
3. 将现有真实二维码迁移为一个 headquarters draft。
4. 由 admin 核验后启用。
5. 页面切换为解析接口。
6. 删除硬编码账号提示；旧图片在确认无引用后清理。

现有二维码和账号尚未确认有效，因此迁移时不得自动设为 active。

## 9. 种子与静态兜底

- 开发 seed 可以创建 draft 示例，但不应使用假二维码模拟 active 生产渠道。
- 生产静态兜底只允许包含业务确认的总部联系方式。
- 没有真实配置时返回联系页，不生成假数据。

## 10. 验收

- [ ] 数据模型能表达总部和门店渠道。
- [ ] 状态、生效时间和优先级可查询。
- [ ] 默认企业微信唯一性得到保障。
- [ ] 门店终止后渠道保留但不公开。
- [ ] 二维码替换失败不丢失旧图。
- [ ] migration 可在新数据库 deploy。


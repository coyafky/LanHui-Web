# 蓝辉咨询渠道路由与 API PRD

> **关联产品 PRD**：[公开咨询承接系统](../public-site/CONSULTATION_CHANNEL_SYSTEM_PRD_2026-06-22.md)  
> **关联后台 PRD**：[咨询渠道后台管理](../admin/CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md)  
> **版本**：v0.1  
> **状态**：规划中，未授权编码

## 1. 页面路由

| 路由 | 权限 | 用途 |
|---|---|---|
| `/contact` | 公开 | 集中展示总部咨询与真实门店联系方式 |
| `/admin/consultation-channels` | admin | 渠道列表 |
| `/admin/consultation-channels/new` | admin | 新建渠道 |
| `/admin/consultation-channels/[id]` | admin | 编辑、预览和状态操作 |

一期不新增公开二维码详情页。公开页面通过统一弹窗展示，避免二维码页面被搜索引擎单独收录。

## 2. 公开解析 API

### `GET /api/consultation-channels/resolve`

查询参数：

| 参数 | 必填 | 说明 |
|---|---:|---|
| `channel` | 否 | `wecom/wechat/phone`，默认优先微信类 |
| `storeId` | 否 | 门店详情场景 |
| `entityType` | 否 | product、vehicle_project、article、store |
| `entityId` | 否 | 稳定实体 ID/key |

响应：

```json
{
  "success": true,
  "data": {
    "id": "channel_id",
    "type": "wecom",
    "displayName": "蓝辉轻改车型顾问",
    "qrImagePath": "/images/consultation/channel_id.webp",
    "accountHint": "企业微信",
    "phone": null,
    "scope": "headquarters",
    "fallbackUsed": false
  }
}
```

公开响应不得包含：

- 内部备注。
- 创建人。
- 停用原因。
- 未生效渠道。
- 未关联公开门店的内部信息。

无可用二维码时仍返回 `success: true`，data 可包含 phone/contactPath 降级；完全无渠道时返回可理解的空结果，不返回 500。

## 3. 后台 API

| Method | 路径 | 用途 |
|---|---|---|
| GET | `/api/admin/consultation-channels` | 搜索、筛选和分页 |
| POST | `/api/admin/consultation-channels` | 创建 draft |
| GET | `/api/admin/consultation-channels/[id]` | 详情 |
| PUT | `/api/admin/consultation-channels/[id]` | 编辑 |
| POST | `/api/admin/consultation-channels/[id]/activate` | 启用 |
| POST | `/api/admin/consultation-channels/[id]/disable` | 停用 |
| POST | `/api/admin/consultation-channels/[id]/restore` | 重新启用前恢复编辑 |
| POST | `/api/admin/consultation-channels/[id]/qr` | 上传或替换二维码 |
| DELETE | `/api/admin/consultation-channels/[id]/qr` | 删除 draft/disabled 二维码 |

所有写接口要求 `auth()`、admin 角色、Zod 校验和 ActivityLog。

## 4. 解析规则

在同一请求中按以下顺序选择：

1. 指定门店的 active 渠道，按 priority 升序。
2. 总部默认 active 企业微信。
3. 总部 active 个人微信。
4. 门店真实电话。
5. `/contact`。

解析必须过滤：

- 非 active。
- 未到生效时间或已过失效时间。
- 缺少二维码的微信类渠道。
- 关联门店非 active。

## 5. 缓存

- 公开解析接口允许短缓存。
- 后台 activate、disable、二维码替换后触发 tag/path revalidation。
- 二维码图片文件名建议包含版本或更新时间，避免浏览器继续使用旧图。
- 管理 API 禁止缓存。

## 6. 安全

- entity/store 参数仅用于选择和埋点上下文，不拼接文件路径。
- 二维码上传使用服务端生成路径。
- 防止 SVG 和伪造 MIME。
- 公开接口限流但不能因单个客户端影响全站。
- 不返回私人备注和员工信息。

## 7. 测试

- 总部渠道解析。
- 门店专属优先。
- 门店渠道停用后回退总部。
- 生效/失效时间边界。
- 缺图渠道被排除。
- 未登录和 editor 写接口拒绝。
- 默认渠道冲突。
- 上传类型、大小、损坏图片和路径穿越。
- 缓存失效。


# api-rate-limiting

管理后台写 API 速率限制能力。

## ADDED Requirements

### Requirement: 内存速率限制器

系统 SHALL 提供一个基于内存 Map 的速率限制模块 `src/lib/security/rate-limit.ts`，用于限制管理后台写 API 的请求频率。

#### Scenario: 窗口内正常请求通过

- **GIVEN** 用户 A 的 `POST /api/stores` 限制为 60 次/分钟
- **WHEN** 用户 A 在第 59 次请求时
- **THEN** 限流器返回 `{ ok: true, remaining: 1 }`

#### Scenario: 窗口内超限被拒绝

- **GIVEN** 用户 A 的 `POST /api/stores` 限制为 60 次/分钟
- **WHEN** 用户 A 在第 61 次请求时
- **THEN** 限流器返回 `{ ok: false, retryAfter: <秒数>, limit: 60, remaining: 0 }`
- **AND** API 返回 429 状态码
- **AND** 响应头包含 `Retry-After: <秒数>`

#### Scenario: 窗口过期后恢复

- **GIVEN** 用户 A 在 1 分钟前已达到限制
- **WHEN** 窗口过期后再次请求
- **THEN** 限流器返回 `{ ok: true, remaining: 59 }`

#### Scenario: 不同 key 互不影响

- **GIVEN** 用户 A 已达到 `POST /api/stores` 的 60 次/分钟限制
- **WHEN** 用户 B 请求同一端点
- **THEN** 用户 B 不受影响，正常通过

#### Scenario: 过期记录自动清理

- **GIVEN** 内存 Map 中存在 1000 条过期记录
- **WHEN** 每次调用限流器 `check()` 时
- **THEN** 过期记录被清理，内存不会无限增长

### Requirement: 限流维度

限流器 SHALL 支持以下 key 维度：

- `ip`：按 IP 地址限制
- `userId`：按用户 ID 限制
- `ip:userId`：按 IP + 用户 ID 组合限制
- `route:userId`：按路由 + 用户 ID 组合限制

### Requirement: 默认限流策略

系统 SHALL 应用以下默认限流策略：

| 目标 | 限制 |
|------|------|
| 普通管理写 API | 60 次/分钟/user |
| 上传 API (`POST /api/upload`) | 10 次/分钟/user + 30 次/天/user |
| 未登录请求（公开 track） | 60 次/分钟/IP |

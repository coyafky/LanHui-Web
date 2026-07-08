# article-confirm-dialog Specification

## Purpose
TBD - created by archiving change admin-article-ux-improvements. Update Purpose after archive.
## Requirements
### Requirement: 单篇文章操作确认

系统 MUST 对文章行内菜单操作（除置顶外）使用 ConfirmDialog 确认。

#### Scenario: 发布确认

- **GIVEN** 文章状态为 "草稿"
- **WHEN** 用户点击 "发布"
- **THEN** 弹出 ConfirmDialog，标题 "确认发布文章？"
- **AND** variant "default"（橙色按钮）

#### Scenario: 撤回确认

- **GIVEN** 文章状态为 "已发布"
- **WHEN** 用户点击 "撤回"
- **THEN** 弹出 ConfirmDialog，标题 "确认撤回文章？"

#### Scenario: 归档确认

- **GIVEN** 文章状态为 "草稿" 或 "已撤回"
- **WHEN** 用户点击 "归档"
- **THEN** 弹出 ConfirmDialog，标题 "确认归档文章？"

#### Scenario: 恢复确认

- **GIVEN** 文章状态为 "已归档"
- **WHEN** 用户点击 "恢复草稿"
- **THEN** 弹出 ConfirmDialog，标题 "确认恢复为草稿？"

#### Scenario: 删除确认 (danger)

- **GIVEN** 用户在文章列表
- **WHEN** 用户点击 "删除"
- **THEN** 弹出 ConfirmDialog，标题 "确认删除文章？"
- **AND** description "删除后不可恢复"
- **AND** variant "danger"
- **AND** confirmLabel "删除"

#### Scenario: 置顶跳过确认

- **GIVEN** 用户在文章列表
- **WHEN** 用户点击 "置顶" 或 "取消置顶"
- **THEN** 不弹出 ConfirmDialog，直接执行操作

#### Scenario: 确认后执行操作

- **GIVEN** ConfirmDialog 已弹出
- **WHEN** 用户点击确认
- **THEN** 执行对应 API 调用
- **AND** 成功后关闭 ConfirmDialog、关闭菜单、刷新列表

#### Scenario: 取消操作

- **GIVEN** ConfirmDialog 已弹出
- **WHEN** 用户点击取消或按 Esc
- **THEN** 关闭 ConfirmDialog，不调用 API

### Requirement: 批量操作确认

系统 MUST 对选中多篇文章后的批量操作使用 ConfirmDialog 确认。

#### Scenario: 批量发布确认

- **GIVEN** 用户选中 3 篇文章
- **WHEN** 用户点击 "批量发布"
- **THEN** 弹出 ConfirmDialog，标题 "确认对 3 篇文章执行发布吗？"

#### Scenario: 批量删除确认 (danger)

- **GIVEN** 用户选中 5 篇文章
- **WHEN** 用户点击 "批量删除"
- **THEN** 弹出 ConfirmDialog，标题 "确认对 5 篇文章执行删除吗？"
- **AND** description "此操作不可撤销"
- **AND** variant "danger"

#### Scenario: 操作失败处理

- **GIVEN** 用户在 ConfirmDialog 确认后
- **WHEN** API 调用失败
- **THEN** toast error 提示错误信息
- **AND** 不使用 alert()

#### Scenario: 无原生 confirm

- **GIVEN** 文章列表页代码
- **WHEN** 搜索 `confirm(` 和 `window.confirm`
- **THEN** 零匹配


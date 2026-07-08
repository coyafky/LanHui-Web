# Article Unsaved Changes Guard

编辑/新建文章页离开时的未保存修改保护。

## ADDED Requirements

### Requirement: 离开保护

系统 MUST 当表单有未保存修改时，拦截离开行为并弹出确认对话框。

#### Scenario: dirty 时浏览器刷新拦截

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户尝试刷新页面或关闭 tab
- **THEN** 浏览器显示 beforeunload 确认提示

#### Scenario: clean 时不拦截

- **GIVEN** 用户在编辑页未做任何修改或已保存成功
- **WHEN** 用户离开页面
- **THEN** 不显示任何确认提示

#### Scenario: 站内链接点击拦截

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击页面内的返回/取消链接
- **THEN** 弹出 ConfirmDialog，标题 "有未保存的修改"
- **AND** description "离开后当前编辑内容将丢失，确定离开吗？"
- **AND** confirmLabel "离开页面"，cancelLabel "继续编辑"
- **AND** variant "danger"

#### Scenario: 确认离开后执行跳转

- **GIVEN** 用户在编辑页修改了内容后点击返回链接
- **AND** ConfirmDialog 已弹出
- **WHEN** 用户点击 "离开页面"
- **THEN** 执行目标跳转

#### Scenario: 忽略外部链接和新窗口

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击 target="_blank" 链接
- **THEN** 不弹出确认，允许打开新窗口

#### Scenario: 忽略修饰键点击

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户 Cmd/Ctrl+点击链接
- **THEN** 不弹出确认，允许新 tab 打开

#### Scenario: 忽略 hash 跳转

- **GIVEN** 用户在编辑页
- **WHEN** 用户点击同页面 hash 链接（如 `#section`）
- **THEN** 不弹出确认

#### Scenario: 忽略 download 链接

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击带 download 属性的链接
- **THEN** 不弹出确认

#### Scenario: 保存中不拦截

- **GIVEN** 用户在编辑页修改了内容且正在保存中
- **WHEN** 用户尝试离开页面
- **THEN** 不弹出离开确认

#### Scenario: 保存成功后清理 dirty

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 保存成功
- **THEN** dirty 状态被清除
- **AND** 离开页面不再触发确认

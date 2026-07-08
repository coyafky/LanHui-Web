# Article Client Validation

文章表单提交前执行客户端 Zod 校验，字段级错误展示。

## ADDED Requirements

### Requirement: 客户端表单校验

系统 MUST 在提交前调用 Zod `safeParse` 校验表单数据，错误在对应字段下方展示，不发送 API 请求。

#### Scenario: 标题为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 标题为空时点击保存
- **THEN** API 不被调用
- **AND** 标题字段下方显示 "标题不能为空"
- **AND** 标题输入框边框变红

#### Scenario: 内容为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 内容为空时点击保存
- **THEN** API 不被调用
- **AND** 内容字段下方显示 "内容不能为空"

#### Scenario: 发布时分类为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 状态选择 "发布" 但分类为空时点击保存
- **THEN** API 不被调用
- **AND** 分类字段下方显示 "发布前请选择分类"

#### Scenario: draft 分类为空允许

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 状态为 "草稿" 且分类为空时点击保存
- **THEN** 校验通过，允许提交

#### Scenario: slug 格式非法

- **GIVEN** 用户在文章编辑页
- **WHEN** slug 输入包含中文或特殊字符时点击保存
- **THEN** slug 字段下方显示 "只允许小写字母、数字、短横线"

#### Scenario: 摘要超长

- **GIVEN** 用户在文章编辑页
- **WHEN** 摘要超过 300 字时点击保存
- **THEN** 摘要字段下方显示错误提示

#### Scenario: tags 自动清理

- **GIVEN** 用户添加标签含前后空格、重复标签
- **WHEN** 提交表单
- **THEN** tags 自动 trim、去空、去重

#### Scenario: 服务端 details 映射

- **GIVEN** 客户端校验通过但服务端返回 `{ success: false, details: { fieldErrors } }`
- **WHEN** 客户端收到响应
- **THEN** 将 `details.fieldErrors` 映射到对应字段的错误展示

#### Scenario: 聚焦第一个错误字段

- **GIVEN** 表单有多个字段校验失败
- **WHEN** 校验完成
- **THEN** 自动聚焦到第一个有错误的字段

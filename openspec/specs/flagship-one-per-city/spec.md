# flagship-one-per-city Specification

## Purpose
每个城市最多只能有 1 个非终止状态的星辉旗舰店（level === "flagship"）。

## Requirements

### Requirement: 同城旗舰店唯一性校验
创建、编辑、发布旗舰店时，系统必须校验目标城市不存在其他非终止状态的旗舰店。

#### Scenario: 同城市创建第一个旗舰店成功
- GIVEN 城市 A 没有非终止状态旗舰店
- WHEN 创建 level=flagship 的门店指向城市 A
- THEN 返回 201

#### Scenario: 同城市创建第二个旗舰店返回 409
- GIVEN 城市 A 已有一个非终止状态旗舰店
- WHEN 创建另一个 level=flagship 门店指向城市 A
- THEN 返回 409, error="该城市已存在星辉旗舰店"

#### Scenario: 已终止旗舰店不占用名额
- GIVEN 城市 A 只有一个 terminated 状态旗舰店
- WHEN 创建新的 level=flagship 门店指向城市 A
- THEN 返回 201

### Requirement: 数据库层 partial unique index
数据库必须有 partial unique index 兜底，防止并发请求绕过 API 校验。

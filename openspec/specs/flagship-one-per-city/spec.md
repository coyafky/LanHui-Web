# flagship-one-per-city Specification

## Purpose
每个城市（provinceSlug + citySlug）最多只能有 1 个非终止状态的星辉旗舰店（level === "flagship"）。

## Requirements

### Requirement: 同城旗舰店唯一性校验（创建入口）
创建门店时，如果目标城市已存在非终止状态的旗舰店，系统必须拒绝创建。

#### Scenario: 同城市创建第一个旗舰店成功
- GIVEN 城市 A（guangdong/foshan）没有非终止状态旗舰店
- WHEN 管理员创建 level=flagship 门店，provinceSlug=guangdong, citySlug=foshan
- THEN 返回 201，门店创建成功

#### Scenario: 同城市创建第二个旗舰店返回 409
- GIVEN 城市 A（guangdong/foshan）已有一个非终止状态旗舰店
- WHEN 管理员创建另一个 level=flagship 门店，provinceSlug=guangdong, citySlug=foshan
- THEN 返回 409，error="该城市已存在星辉旗舰店"，details.level=["每个城市最多只能设置一个星辉旗舰店"]

#### Scenario: 不同城市各自创建旗舰店成功
- GIVEN 城市 A 已有旗舰店，城市 B 没有旗舰店
- WHEN 管理员创建 level=flagship 门店指向城市 B
- THEN 返回 201

#### Scenario: 同城市创建非旗舰店等级成功
- GIVEN 城市 A 已有旗舰店
- WHEN 管理员创建 level=premium/specialty/member 门店指向城市 A
- THEN 返回 201，不受旗舰店约束限制

### Requirement: 同城旗舰店唯一性校验（编辑入口）
编辑门店时，如果将门店改为旗舰店或将旗舰店迁移到已有旗舰店的城市，系统必须拒绝。

#### Scenario: 编辑普通门店为旗舰店，目标城市已有旗舰店时返回 409
- GIVEN 城市 A 已有一个旗舰店，城市 A 还有另一个 non-flagship 门店
- WHEN 管理员将 non-flagship 门店的 level 改为 flagship
- THEN 返回 409

#### Scenario: 编辑当前唯一旗舰店的非等级字段成功
- GIVEN 城市 A 只有一个旗舰店（当前门店）
- WHEN 管理员编辑该旗舰店的 phone/address/description 等非 level 非城市字段
- THEN 返回 200，更新成功（排除自身不冲突）

### Requirement: 同城旗舰店唯一性校验（发布入口）
发布（publish）旗舰店时，如果同城已有其他已发布或待发布的旗舰店，系统必须拒绝。

#### Scenario: 发布旗舰店时同城已有其他旗舰店返回 409
- GIVEN 城市 A 已有 active 旗舰店（门店 X），另有一个 pending flagship 门店 Y
- WHEN 管理员 publish 门店 Y
- THEN 返回 409

#### Scenario: 已终止旗舰店不阻止同城新旗舰店
- GIVEN 城市 A 只有一个 terminated 状态旗舰店
- WHEN 管理员创建/编辑/发布新的 level=flagship 门店指向城市 A
- THEN 操作成功（terminated 不占用名额）

### Requirement: 数据库层 partial unique index 兜底
数据库层必须有 PostgreSQL partial unique index，防止并发请求绕过 API 校验。

### Requirement: Prisma P2002 唯一约束错误友好处理
当数据库层 unique index 触发 Prisma P2002 错误时，必须识别为旗舰店冲突并返回 HTTP 409 友好错误。

### Requirement: 后台 UI 等级提示
后台门店新建/编辑表单中，等级字段旁需展示「星辉旗舰店：每个城市最多 1 家」提示文字；API 返回 409 时需在表单错误区域展示后端错误信息。


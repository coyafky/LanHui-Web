# car-care-page Specification

## Purpose
TBD - created by archiving change car-care-service-topic. Update Purpose after archive.
## Requirements
### Requirement: 洗美项目专题页

系统 SHALL 在 `/product/car-care` 提供洗美项目专题页，包含洗车和内饰清洁两项服务。

#### Scenario: 用户访问洗美项目页

- **WHEN** 用户访问 `/product/car-care`
- **THEN** 页面展示 Hero 标题「洗美养护」、价值主张网格、洗车和内饰清洁两个服务项目卡片、施工流程步骤、底部 CTA 引导

#### Scenario: SEO 结构化数据

- **WHEN** 页面渲染
- **THEN** 包含完整的 metadata（title/description）、OpenGraph 图片、JSON-LD CollectionPage 结构化数据

### Requirement: 洗美项目路由注册

系统 SHALL 将 `car-care` 注册为 `service_category` 类型路由，归属新 ServiceGroup `car_care`。

#### Scenario: 产品中心展示洗美入口

- **WHEN** 用户访问 `/product` 产品中心
- **THEN** 在按项目区域可见洗美养护入口，点击跳转到 `/product/car-care`

### Requirement: 首页洗美入口

系统 SHALL 在首页 CoreServices 区域展示洗美养护卡片，并在区域描述中体「洗美 + 贴膜 + 轻改装一条龙」的服务覆盖。

#### Scenario: 首页展示洗美卡片

- **WHEN** 用户访问首页
- **THEN** CoreServices 区域可见「洗美养护」卡片，描述包含一条龙服务表述，点击跳转到 `/product/car-care`


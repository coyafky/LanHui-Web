# 后台系统设置 PRD

> **系统范围**：`/admin/settings`、站点基础配置 API、品牌信息、咨询承接配置、SEO 基础配置、账号权限说明  
> **用户**：总部 admin 为主，editor 只读  
> **版本**：v0.1  
> **状态**：规划中，未授权编码  
> **日期**：2026-06-25  
> **关联报告**：[后台管理系统骨架布局测试报告](../../daily/2026-06-25/ADMIN_SHELL_LAYOUT_TEST_REPORT_2026-06-25.md)  
> **关联 PRD**：[咨询渠道后台管理 PRD](./CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md)

---

## 1. 背景

当前后台已经具备 Dashboard、门店管理、文章管理、数据分析等核心运营模块，但 `/admin/settings` 尚未编写。

settings 页不应被设计成“大而全”的系统后台，也不应在第一版承载复杂权限、媒体库、OSS、支付、订单、加盟审核等超出当前业务阶段的功能。

本阶段 settings 的核心定位是：

> 为总部管理员提供蓝辉官网和后台的基础配置入口，优先解决品牌信息、咨询承接、站点 SEO 和账号权限说明，不引入不必要的复杂系统。

---

## 2. 三棱镜定义

### 2.1 实现什么

构建 `/admin/settings` 页面，作为后台基础配置中心。

V1 只包含 4 个模块：

1. 品牌基础信息
2. 咨询渠道配置摘要与入口
3. 站点 SEO 基础配置
4. 账号与权限说明

### 2.2 怎么实现

- 使用现有 `/admin` 后台布局骨架。
- 页面采用 Card 分组，不做复杂多级设置菜单。
- 配置写入统一站点设置数据结构。
- admin 可编辑；editor 只读。
- 咨询渠道本身不在 settings 内重复实现完整 CRUD，只提供默认配置摘要和跳转入口。

### 2.3 怎么验收

- `/admin/settings` 可以正常打开，不出现 404。
- admin 能编辑并保存品牌、SEO 等基础配置。
- editor 可查看但不可保存。
- 咨询渠道模块能明确展示当前状态，并跳转到专门的咨询渠道管理页。
- 保存失败、未保存离开、字段校验等状态都有明确提示。

---

## 3. 产品定位

### 3.1 页面定位

`/admin/settings` 是后台“系统基础配置中心”，不是日常高频业务运营页面。

它服务于：

- 初始上线前配置品牌与站点信息。
- 后续调整官网公共展示文案。
- 管理统一咨询承接配置。
- 说明账号与权限策略。

### 3.2 不做什么

V1 明确不做：

- 不做完整用户管理系统。
- 不做复杂角色权限矩阵编辑器。
- 不做 OSS / CDN / 图片存储配置。
- 不做通用媒体库。
- 不做支付、订单、加盟审核配置。
- 不做每个产品页独立 CTA 设置。
- 不做埋点规则编辑器。

---

## 4. 用户与权限

| 角色 | 查看 settings | 编辑品牌信息 | 编辑 SEO | 管理咨询渠道 | 查看账号说明 |
|---|---:|---:|---:|---:|---:|
| admin | 是 | 是 | 是 | 是，跳转专页 | 是 |
| editor | 是 | 否 | 否 | 否 | 是 |
| 未登录 | 否 | 否 | 否 | 否 | 否 |

权限规则：

- settings 影响全站展示，只允许 admin 编辑。
- editor 进入 settings 时显示只读状态和权限提示。
- 未登录访问 `/admin/settings` 跳转 `/admin/login`。
- 写操作必须记录 `ActivityLog`。

---

## 5. 页面结构

### 5.1 路由

```txt
/admin/settings
```

V1 不拆子路由。

后续可扩展：

```txt
/admin/settings/brand
/admin/settings/consultation
/admin/settings/seo
/admin/settings/accounts
```

### 5.2 页面布局

```txt
系统设置
用于配置官网和后台的基础参数

┌──────────────────────────────┐
│ 品牌基础信息                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 咨询渠道配置                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 站点 SEO 基础配置             │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 账号与权限                    │
└──────────────────────────────┘
```

### 5.3 Header 要求

结合 Admin Shell 布局报告，settings 页 Header 应展示：

```txt
系统设置
管理后台 / 系统设置
```

---

## 6. 模块一：品牌基础信息

### 6.1 目标

让总部管理员可以维护官网公共品牌展示信息，避免每次修改品牌文案都需要改代码。

### 6.2 字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---:|---|---|
| 品牌中文名 | text | 是 | 蓝辉轻改 | 官网 Header / Footer 可用 |
| 品牌英文名 | text | 否 | LANHUI | 品牌展示可用 |
| 品牌 slogan | text | 否 | 专业新能源轻改服务 | Footer / 首页可用 |
| 公司/门店主地址 | textarea | 否 | 空 | 联系区展示 |
| 官方联系电话 | text | 否 | 空 | 联系区展示 |
| 营业时间 | text | 否 | 空 | 联系区展示 |
| 品牌简介 | textarea | 否 | 空 | 后续品牌页可用 |

### 6.3 V1 不开放字段

| 字段 | 原因 |
|---|---|
| Logo 上传 | 当前品牌资产应由代码和设计统一维护，避免后台误替换 |
| 品牌色配置 | 会影响全站 UI 稳定性，暂不开放 |
| 多语言配置 | 当前业务不需要 |

### 6.4 校验

- 品牌中文名不能为空。
- 官方联系电话如填写，需通过手机号或固定电话基础校验。
- 品牌简介建议不超过 300 字。

### 6.5 验收

- [ ] admin 可以编辑并保存品牌基础信息。
- [ ] editor 只能查看，保存按钮不可用。
- [ ] 刷新后配置仍然存在。
- [ ] 品牌中文名为空时禁止保存。
- [ ] 保存成功显示 toast。
- [ ] 保存失败显示错误原因。

---

## 7. 模块二：咨询渠道配置

### 7.1 目标

settings 页不重复实现完整咨询渠道管理，而是作为“统一咨询承接配置”的摘要入口。

咨询渠道完整生命周期由独立 PRD 定义：

- [CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md](./CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md)

### 7.2 页面展示

settings 中展示：

| 信息 | 说明 |
|---|---|
| 当前默认咨询渠道 | 微信 / 企业微信 / 电话 |
| 当前渠道状态 | 已启用 / 草稿 / 已停用 / 未配置 |
| 承接主体 | 例如“蓝辉轻改官方顾问” |
| 二维码状态 | 已配置 / 未配置 |
| 最后更新时间 | 用于判断配置新旧 |

### 7.3 操作

| 操作 | V1 是否支持 | 说明 |
|---|---:|---|
| 查看当前默认渠道摘要 | 是 | settings 卡片内展示 |
| 跳转咨询渠道管理页 | 是 | 指向 `/admin/consultation-channels` |
| 在 settings 内上传二维码 | 否 | 避免重复实现 |
| 在 settings 内新建渠道 | 否 | 交给专门模块 |
| 设置产品页独立 CTA | 否 | 不符合最新产品页要求 |

### 7.4 业务约束

- 产品页不配置独立 CTA。
- 公开站咨询入口统一读取总部默认咨询渠道。
- 如果默认渠道未配置，前台应使用安全 fallback，不展示破图。
- settings 页只展示摘要，不直接写咨询渠道核心数据。

### 7.5 验收

- [ ] settings 中能看到当前默认咨询渠道状态。
- [ ] 未配置时显示“未配置”，不显示虚假成功。
- [ ] 点击“管理咨询渠道”跳转到 `/admin/consultation-channels`。
- [ ] 不在 settings 中重复出现二维码上传表单。

---

## 8. 模块三：站点 SEO 基础配置

### 8.1 目标

提供最小可用的站点级 SEO 配置，供首页和未单独配置 SEO 的页面使用。

### 8.2 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| 默认站点标题 | text | 是 | 例如“蓝辉轻改｜新能源车轻改服务” |
| 默认站点描述 | textarea | 是 | 默认 meta description |
| 默认关键词 | text | 否 | 逗号分隔 |
| 站点作者/品牌名 | text | 否 | 默认使用蓝辉轻改 |
| 备案号 | text | 否 | Footer 可展示 |
| Open Graph 默认图 | text | 否 | V1 可只填路径，不开放上传 |

### 8.3 校验

- 默认站点标题不能为空，建议不超过 60 字。
- 默认站点描述不能为空，建议不超过 160 字。
- Open Graph 默认图如填写，必须是站内路径或合法 URL。

### 8.4 读取规则

页面 SEO 优先级：

```txt
页面独立 SEO > 分类/专题默认 SEO > settings 站点默认 SEO > 代码 fallback
```

### 8.5 验收

- [ ] admin 可以编辑默认标题和描述。
- [ ] 字段为空时禁止保存。
- [ ] 保存后刷新页面配置仍存在。
- [ ] 前台页面如果无独立 SEO，可读取站点默认配置。
- [ ] 配置缺失时使用代码 fallback，不影响 build。

---

## 9. 模块四：账号与权限说明

### 9.1 目标

V1 不做完整账号管理，只明确当前后台账号与权限策略。

### 9.2 页面内容

```txt
账号与权限

当前后台仅供总部员工使用。
账号创建暂通过内部脚本完成。
当前角色包含 admin 和 editor。

admin：可管理门店、文章、数据分析和系统设置。
editor：可管理文章，可只读查看部分设置。

后续将支持员工账号、角色权限、登录日志和账号停用。
```

### 9.3 操作

| 操作 | V1 是否支持 |
|---|---:|
| 查看当前登录账号 | 是 |
| 查看当前角色 | 是 |
| 创建账号 | 否 |
| 修改密码 | 否 |
| 停用账号 | 否 |
| 查看登录日志 | 否 |

### 9.4 验收

- [ ] settings 页显示当前账号和角色。
- [ ] 页面说明账号创建暂通过内部脚本完成。
- [ ] 不暴露不可用的账号管理按钮。

---

## 10. 状态流转

settings 页主要状态是配置编辑状态。

```txt
未修改
  ↓ 编辑字段
有未保存修改
  ↓ 点击保存
保存中
  ├── 保存成功 → 已保存
  └── 保存失败 → 保存失败，可重试
```

### 10.1 页面状态

| 状态 | 表现 |
|---|---|
| 未修改 | 保存按钮 disabled 或弱化 |
| 有未保存修改 | 保存按钮高亮，离开页面提示 |
| 保存中 | 保存按钮 loading，表单禁止重复提交 |
| 保存成功 | toast 提示“设置已保存” |
| 保存失败 | 显示错误原因，保留用户输入 |
| 只读 | editor 可查看但字段 disabled |

### 10.2 离开保护

如果存在未保存修改：

- 点击后台其他导航时提示确认。
- 浏览器刷新或关闭时触发原生离开提示。

---

## 11. 数据与 API 设计

### 11.1 推荐数据模型

V1 推荐使用统一配置表，避免一开始建多个重模型。

```txt
SiteSetting
- id
- key
- valueJson
- updatedAt
- updatedBy
```

推荐 key：

```txt
brand
seo
settingsMeta
```

咨询渠道不直接写入 `SiteSetting`，只读取咨询渠道模块的默认配置摘要。

### 11.2 API

```txt
GET /api/admin/settings
PATCH /api/admin/settings
```

### 11.3 GET 返回

```ts
{
  success: true,
  data: {
    brand: {
      name: "蓝辉轻改",
      englishName: "LANHUI",
      slogan: "专业新能源轻改服务",
      address: "",
      phone: "",
      businessHours: "",
      intro: ""
    },
    consultation: {
      status: "unconfigured" | "draft" | "active" | "disabled",
      defaultChannelName: string | null,
      channelType: "wechat" | "work_wechat" | "phone" | null,
      hasQrCode: boolean,
      updatedAt: string | null
    },
    seo: {
      defaultTitle: "",
      defaultDescription: "",
      defaultKeywords: "",
      author: "蓝辉轻改",
      icp: "",
      ogImage: ""
    },
    accountPolicy: {
      currentRole: "admin" | "editor",
      editable: boolean,
      accountManagementMode: "script"
    }
  }
}
```

### 11.4 PATCH 入参

```ts
{
  brand?: {
    name: string,
    englishName?: string,
    slogan?: string,
    address?: string,
    phone?: string,
    businessHours?: string,
    intro?: string
  },
  seo?: {
    defaultTitle: string,
    defaultDescription: string,
    defaultKeywords?: string,
    author?: string,
    icp?: string,
    ogImage?: string
  }
}
```

### 11.5 API 约束

- `GET`：admin / editor 均可访问。
- `PATCH`：仅 admin 可访问。
- 写入成功后记录 `ActivityLog`，类型建议：`settings.update`。
- 不接受客户端直接写 `consultation` 摘要数据。
- Zod 校验失败返回统一 `{ success: false, error, details }`。

---

## 12. 异常处理

| 场景 | 处理 |
|---|---|
| 未登录访问 | 跳转 `/admin/login` |
| editor 保存 | 返回 403，页面按钮 disabled |
| 品牌名为空 | 阻止保存，字段下显示错误 |
| SEO 标题为空 | 阻止保存 |
| SEO 描述为空 | 阻止保存 |
| API 保存失败 | 保留输入，显示错误 toast |
| 咨询渠道未配置 | settings 显示“未配置”，提供跳转入口 |
| 数据库无 settings | 返回默认 fallback，不导致页面崩溃 |

---

## 13. 与前台页面关系

settings 中的配置会影响前台公共区域，但不改变产品页最新原则。

### 13.1 可影响区域

| 配置 | 影响位置 |
|---|---|
| 品牌中文名 / 英文名 | Header、Footer、品牌区 |
| slogan | Footer、首页品牌介绍 |
| 电话 / 地址 / 营业时间 | Footer、联系区 |
| 默认 SEO | 无独立 SEO 的页面 |
| 备案号 | Footer |
| 默认咨询渠道摘要 | 首页 / Header / Footer 统一咨询入口 |

### 13.2 不影响区域

- 不为每个产品页生成独立 CTA。
- 不覆盖车型专题页自身内容结构。
- 不改变门店管理状态机。
- 不改变文章发布状态机。

---

## 14. UI 要求

### 14.1 页面风格

- 继承后台深色 Admin Shell。
- Card 分组清晰，不做复杂 tab。
- 每个 Card 标题下需要一句业务说明。
- 编辑区字段不宜过多，V1 控制在单屏到一屏半内。

### 14.2 表单体验

- 保存按钮建议放在页面顶部右侧和底部 sticky 区域二选一。
- 有未保存修改时明确提示。
- 保存中禁止重复提交。
- 只读状态下显示权限说明。

### 14.3 空状态

咨询渠道未配置时，不显示空白卡片，应显示：

```txt
尚未配置默认咨询渠道
前台将使用安全 fallback，不展示错误二维码。
```

---

## 15. 验收清单

### 15.1 页面验收

- [ ] `/admin/settings` 能正常访问。
- [ ] Header 显示“系统设置 / 管理后台 / 系统设置”。
- [ ] 页面包含品牌基础信息、咨询渠道配置、站点 SEO、账号与权限四个 Card。
- [ ] settings 未完成的子功能不暴露为无效按钮。

### 15.2 权限验收

- [ ] admin 可以编辑并保存。
- [ ] editor 可以查看但不能保存。
- [ ] 未登录访问跳转 login。
- [ ] PATCH 接口 editor 调用返回 403。

### 15.3 表单验收

- [ ] 品牌中文名不能为空。
- [ ] 默认 SEO 标题不能为空。
- [ ] 默认 SEO 描述不能为空。
- [ ] 保存失败保留用户输入。
- [ ] 保存成功刷新后仍保留配置。
- [ ] 有未保存修改时离开页面有提示。

### 15.4 咨询渠道验收

- [ ] settings 显示当前默认咨询渠道摘要。
- [ ] 未配置时显示明确空状态。
- [ ] “管理咨询渠道”跳转 `/admin/consultation-channels`。
- [ ] settings 不重复实现二维码上传。

### 15.5 前台兼容验收

- [ ] 没有 settings 数据时前台仍可 build。
- [ ] settings 数据缺失时使用代码 fallback。
- [ ] 产品页不新增页面私有 CTA。
- [ ] Header / Footer 的统一咨询入口可继续按全局配置工作。

---

## 16. 里程碑

| 阶段 | 内容 | 状态 |
|---|---|---|
| M1 | 完成 PRD | 已完成 |
| M2 | 输出 Design / SPEC | 待办 |
| M3 | 实现 `/admin/settings` 页面骨架 | 待办 |
| M4 | 实现 GET/PATCH API 与数据模型 | 待办 |
| M5 | 接入品牌 / SEO 前台读取 fallback | 待办 |
| M6 | 权限、保存、离开保护测试 | 待办 |

---

## 17. 后续拆分建议

如果 settings 模块进入开发阶段，建议再补充：

```txt
docs/SPEC/admin/admin-settings.md
docs/designs/admin/ADMIN_SETTINGS_DESIGN_2026-06-25.md
```

如果账号系统后续升级，再单独新建：

```txt
docs/PRD/admin/ADMIN_ACCOUNT_MANAGEMENT_PRD_YYYY-MM-DD.md
```

避免把复杂账号系统提前塞进 settings V1。

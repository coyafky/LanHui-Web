# SPEC: API 地理区域 Regions

> 实现状态：✅ **完成**

---

## 1. 职责范围

省/市地理数据 API。供门店表单和公开站地理筛选使用。

## 2. 路由

| 路径 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/provinces` | GET | 活跃省份列表（含城市计数+门店计数） | ✅ |
| `/api/cities` | GET | 活跃城市列表，`?province=slug` 过滤（含门店计数） | ✅ |
| `/api/regions` | GET | 省市树结构（省份→城市嵌套） | ✅ |

## 3. 数据来源

DB Province/City 表（seed 写入 27 省 + 75 市），非运行时从静态数据生成。

## 4. 响应示例

```json
// /api/provinces
{ "success": true, "data": [{ "slug": "guangdong", "name": "广东省", "cityCount": 5, "storeCount": 3 }] }

// /api/regions
{ "success": true, "data": [{ "slug": "guangdong", "name": "广东省", "cities": [{ "slug": "foshan", "name": "佛山市" }] }]
```

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | 省/市地理数据 API 实现 + DB seed（27 省 75 市） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

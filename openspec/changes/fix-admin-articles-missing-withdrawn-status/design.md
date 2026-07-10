## 修复方案

在 3 处添加 `withdrawn` 状态：

1. **STATUS_MAP** — 新增状态徽章样式，红色系与 "已撤回" 语义匹配（参考 `DashboardContentHealth` 中 `withdrawn: "bg-red-500/10 text-red-400 border-red-500/20"`）
2. **STATUS_OPTIONS** — 新增筛选选项
3. **MetaFields** — 编辑模式下新增 `withdrawn` 状态单选

无需 API/DB 变更。`ArticleStatus` 类型、状态转换规则、dashboard 健康检查均已支持 `withdrawn`。

# /admin/login — 后台登录评分卡

**路由**: `/admin/login`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/admin-login.png) · [mobile](../screenshots/mobile/admin-login.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 18 | 20 | 居中卡片 + LANHUI logo + 表单,简洁 |
| D2 Visual | 17 | 20 | orange 登录按钮 + 深色卡片,与后台风格一致 |
| D3 Color | 18 | 20 | orange + zinc-950 黑底一致 |
| D4 Typography | 17 | 20 | "蓝辉轻改 后台管理" h2 + 表单标签层级清晰 |
| D5 Accessibility | 16 | 20 | **P1-3: 缺失败文案/错误反馈(06-19 评 5/5/5/4 + P1)** |
| **总分** | **86** | **100** | **B 良好** |

---

## 5 维度详细

### D1 Layout 布局 (18/20)
- ✅ 居中卡片,适合后台身份验证场景

### D2 Visual 视觉 (17/20)
- ✅ LANHUI logo + 表单 + orange 登录按钮,焦点明确

### D3 Color 色彩 (18/20)
- ✅ 严格 dark theme

### D4 Typography 排版 (17/20)
- ✅ "蓝辉轻改 后台管理" h2 + 表单标签 + 占位符

### D5 Accessibility 可访问性 (16/20)
- ⚠️ **P1-3: 缺失败文案** — 错误时仅 console,不显示用户提示
- ⚠️ 缺 `aria-describedby` 关联错误信息
- ⚠️ 缺"显示密码"切换按钮

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P1-3** | 增加失败 toast/内联错误提示(红色文字 + icon) | 1h |
| **P1** | 错误信息加 `aria-describedby` 关联输入框 | 0.5h |
| **P2** | 密码输入增加"显示/隐藏"切换按钮 | 0.5h |
| **P2** | 增加"忘记密码"链接(目前无) | 1h |
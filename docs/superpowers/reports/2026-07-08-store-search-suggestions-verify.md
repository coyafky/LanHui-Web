# 验证报告：store-search-suggestions

- 日期：2026-07-08
- verify_mode：light（手动覆盖，实际仅 3 个代码文件变更）

## 验证检查清单

| # | 检查项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | tasks.md 全部勾选 | PASS | `grep -c '\- \[ \]'` = 0 |
| 2 | 改动文件与 tasks 一致 | PASS | 3 文件：route.ts (+3)、StoreSearch.tsx (+260)、StoreSearch.test.tsx (+374) |
| 3 | 构建通过 | PASS | `npm run build` 522/522 pages |
| 4 | 测试通过 | PASS | 984 passed, 17 pre-existing failures (无回归) |
| 5 | 无明显安全问题 | PASS | 无硬编码密钥、search 参数 encodeURIComponent 编码、Prisma contains 参数化查询 |
| 6 | 代码审查（standard） | PASS | 1 Critical + 2 Important 已修复 (commit 73ef52d) |

## 代码审查修复记录

| 严重度 | 问题 | 状态 |
|--------|------|------|
| Critical | HTTP error 响应被静默当作空结果 | 已修复 — 添加 `res.ok` 检查 |
| Important | AbortController 未在 unmount 时 abort | 已修复 — 清理函数中追加 `abortRef.current?.abort()` |
| Important | 第三个 Enter 分支缺少 e.preventDefault() | 已修复 — 添加 `e.preventDefault()` |
| N/A | district 不显示（审查者认为需修复） | 已拒绝 — 用户明确要求仅显示 name + province + city |

## 代码审查发现（已接受）

- `json.data ?? json` 改为 `json.data ?? []` — 配合 `res.ok` 修复，避免类型断言误导
- `mousedown` 替代 `click` 用于外部点击检测 — 避免与 option onClick 竞态（合理优化）
- `closeDropdown()` 辅助函数 — 减少重复代码（合理抽象）

## 偏差说明

- **district 字段不展示**：用户明确要求 "我们只设计了省份和城市，然后还有一个模块是店的名字，这3个作为搜索的核心"。delta spec 中的 district 场景被用户显式覆盖。
- **验证模式覆盖为 light**：scale 脚本因 plan 子步骤数（11 个）判定为 full，但实际代码变更为 3 文件/1 capability，手动覆盖为 light。

## 结论

所有门禁通过，代码审查问题已修复，可进入归档阶段。

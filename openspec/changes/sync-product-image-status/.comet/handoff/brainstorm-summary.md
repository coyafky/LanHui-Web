# Brainstorm Summary

- Change: sync-product-image-status
- Date: 2026-06-29

## 确认的技术方案

直接逐文件编辑：对 8 个产品数据文件，逐一读取对应的图片映射清单（items.json/manifest.json），按中文名手动配对，使用 Edit 工具更新 imageStatus/publicPath/width/height/aspectRatio。

关键扩展发现：xiaomi SU7/YU7 的接口定义（XiaomiSu7UpgradeProject / XiaomiYu7UpgradeProject）当前没有 publicPath/width/height 字段，需要新增可选的 readonly 图片字段。

## 关键取舍与风险

- **手动匹配优先于脚本**：中文名匹配靠人工判断最准确，脚本的模糊匹配易误配
- **xiaomi 接口需扩展**：新增 readonly publicPath?/width?/height? 字段，保持不可变性
- **xiaomi YU7 无匹配**：manifest 的 6 张图（大灯饰板/出风口等）与产品 lib 的 9 个项目（软包脚垫/平衡杆等）完全不匹配，全部保持 missing
- **xiaomi 系列保持 pending-review**：manifest 无系列级产品图
- **修复 YU7 ImageStatus typo**：`"matched" | "missing" | "missing"` → `"matched" | "pending-review" | "missing"`

## 测试策略

- `npm run typecheck`：确保 publicPath 字面量类型编译通过
- `npm test -- --run`：确保现有测试通过
- `npm run build`：确保 SSG 不受影响
- 人工检查每个文件的 imageStatus 分布

## Spec Patch

无 — 不涉及 spec 级行为变更

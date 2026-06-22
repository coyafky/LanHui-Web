# SPEC: API 文件上传 Upload

> 对应 PRD：`docs/PRD/admin/STORE_MANAGEMENT_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

图片上传/删除。本地存储（非 OSS），sharp 压缩。

## 2. 路由

| 路径 | 方法 | 权限 | 说明 | 状态 |
|------|------|------|------|------|
| `/api/upload` | POST | admin | 图片上传 | ✅ |
| `/api/upload` | DELETE | admin | 图片删除 | ✅ |

## 3. 实现细节

- **存储**: 本地 `public/images/stores/<id>.webp`
- **处理**: sharp 转 webp q80
- **校验**: MIME 类型 + sharp 二次校验
- **写入**: 原子写入（临时文件 → rename）
- **删除**: 物理删除文件 + DB imagePath 置 null

## 4. 限制

- 当前只支持 `entity=store`
- ali-oss 已安装但未使用（`local storage is the current implementation`）

## 5. 已知问题

- [P2] 仅支持门店图片，未扩展至文章封面/品牌图片

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 图片上传 API 初始实现（sharp + 本地存储） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 + PRD 引用更新 | 完成 | — |

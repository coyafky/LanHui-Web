# 图片上传系统端到端测试报告 — 2026-06-10

## 概要

- 测试范围：`/api/upload` (POST/DELETE) + `/admin/stores/[id]/image` + `StoreForm` 重构
- 用例总数：10（TC-F1 ~ TC-F10）
- PASS / FAIL：8 / 2
- 测试环境：localhost:3000（dev server） / Chromium via playwright-cli 0.1.7
- 关联 PRD：`docs/PRD/IMAGE_MANAGEMENT_PRD_2026-06-10.md` (v1.2)
- BUG-1 修复验证：**部分通过**（imageUrl 字段已移除 / store 创建不拦截）但**新发现 BUG-2**：创建后未跳转到 image 页

## 用例结果详情

### TC-F1 上传图片成功 — PASS

- 前置：admin 登录，store id = 100018（imagePath=null）
- 操作：访问 `/admin/stores/100018/image` → 点击"选择文件" → 选择 `fixture-1.jpg` (800x600, 3117 字节)
- 验证：
  - `public/images/stores/100018.webp` 存在，946 字节，`file` 报告格式 `Web/P, VP8 encoding, 800x600`
  - `GET /api/stores/100018` → `imagePath: "/images/stores/100018.webp"`
  - 页面 `img[alt="门店主图"].src` == `http://localhost:3000/images/stores/100018.webp`
  - 页面出现"替换图片"/"删除图片"按钮
- 截图：`docs/test-reports/image-upload-2026-06-10/tc-f1-upload-success.png`

### TC-F2 替换图片（覆盖旧文件）— PASS

- 前置：TC-F1 完成后
- 操作：点击"替换图片" → 选择 `fixture-2.png` (1024x768, 17315 字节)
- 验证：
  - `public/images/stores/100018.webp` 大小由 946 → 1482 字节
  - `file` 报告尺寸变为 1024x768（与新素材一致）
  - 文件路径保持 `/images/stores/100018.webp`（覆盖语义生效）
  - DB `imagePath` 未变
- 截图：`docs/test-reports/image-upload-2026-06-10/tc-f2-replace.png`

### TC-F3 删除图片 — PASS

- 前置：TC-F2 完成后
- 操作：点击"删除图片" → window.confirm "确认删除当前图片？" → 接受
- 验证：
  - `public/images/stores/100018.webp` 已删除（目录为空）
  - DB `imagePath: null`
  - 页面回到"拖拽图片到此处" + "选择文件" 按钮
- 截图：`docs/test-reports/image-upload-2026-06-10/tc-f3-delete.png`

### TC-F4 错误类型文件被服务端拒 — PASS

- 操作：curl POST `/api/upload` 上传 `fake.txt`（伪装 MIME=image/jpeg，9 字节）
- 实际响应：`HTTP 400` + `{"success":false,"error":"文件类型不支持，仅允许 jpg/png/webp"}`
- 分析：服务端走 sharp metadata 二次验证（`sharp(buffer).metadata()` 失败 → 拒绝），与 PRD 一致

### TC-F5 超 5MB 文件被拒 — PASS

- 操作：curl POST `/api/upload` 上传 `fixture-big.jpg`（7620630 字节 ≈ 7.3MB，image/jpeg）
- 实际响应：`HTTP 413` + `{"success":false,"error":"文件大小超过限制（最大 5MB）"}`
- 分析：命中 `route.ts` 第 93-98 行 size 校验（在 sharp 转码之前提前拒绝，避免内存浪费）

### TC-F6 不支持的 entity 类型被拒 — PASS

| 步骤 | entity | 实际响应 | 校验 |
|---|---|---|---|
| F6a | `province` | HTTP 400 + "本期暂不支持该实体类型" | 符合 PRD §6.1 |
| F6b | `city` | HTTP 400 + "City 不支持图片" | 符合 PRD §6.1 |

- 注：F6a 的 `entityId=guangdong` 即使是合法省份 slug，因为 entity 类型被拒，也走不到 DB 校验

### TC-F7 entityId 路径穿越攻击 — PASS

- 测试用例 1：`entityId=../etc/passwd`
  - 响应：HTTP 404 + "门店不存在"
  - 副作用检查：`public/images/etc/` 不存在；`public/etc/` 不存在
- 测试用例 2：`entityId=100018/../evil`（前缀伪装）
  - 响应：HTTP 404 + "门店不存在"
  - 副作用检查：`public/images/evil/` 不存在；`public/evil/` 不存在
- 分析：实际的拦截点不是 `buildStorePath` 的 sanitize（第 36 行），而是在此之前 Prisma 实体存在性校验把 `100018/../evil` 视为不存在的 store id 拒绝了。建议 Coder 复核：sanitize 逻辑位置（应放在 entity 校验之前），并补单测以防未来重构导致顺序变化时绕过 sanitize。

### TC-F8 未登录访问被拒 — PASS

- 操作：清空 Cookie 后 curl POST `/api/upload`
- 响应：`HTTP 401` + `{"success":false,"error":"未认证"}`
- 验证与 PRD §6 完全一致

### TC-F9 创建门店不填图片（BUG-1 回归）— **部分通过**

- 步骤 1-3：访问 `/admin/stores/new`
  - `document.querySelector('input[name="imageUrl"]')` → **null** ✅
  - 表单 inputs：`["name","slug","district","address","phone","businessHours","phoneTel"]`（无 imageUrl）
  - labels：`["门店名称*","URL标识 (slug)*","省份 / 城市*","区域","详细地址*","联系电话*","营业时间","门店描述"]`（无"图片"/"imageUrl"标签）
  - 截图：`tc-f9-new-form-no-imageurl.png`
- 步骤 4：填表（name=测试图片门店, slug=image-test-1781096106, 广东/佛山/顺德大良, 地址, 0757-22880001）
- 步骤 5：点击"创建门店"
- 实际结果：
  - `POST /api/stores` → HTTP 201（**BUG-1 修复确认**：不再被 imageUrl 空串拦截）
  - 新 store id = `100018`，DB `imagePath: null`
  - **页面跳转到了 `/admin/stores`（列表页），不是 `/admin/stores/100018/image`** ❌
- **根因**：`StoreForm.tsx` line 144 `router.push("/admin/stores")` 与 `stores/new/page.tsx` line 28 `router.push(/admin/stores/${newId}/image)` 存在竞争。StoreForm 在 `await onSubmit(data)` 之后立即 push 到 list；new page 的 push 被覆盖。Stack trace 也显示曾 RSC 预取 `/admin/stores/100018/image?_rsc=...`，但最终 URL 为 `/admin/stores`。
- 截图：`tc-f9-redirect-to-image-page.png`（显示最终落在列表页）
- **结论：BUG-1（imageUrl 拦截）已修复，但暴露 BUG-2（创建后跳转错误）**

### TC-F10 编辑现有门店不强制图片 — PASS

- 前置：store 100018（imagePath=null）
- 操作：访问 `/admin/stores/100018` → 修改 `businessHours="09:00-21:00"` → 点击"保存修改"
- 验证：
  - `PUT /api/stores/100018` → HTTP 200
  - DB 更新：`businessHours: "09:00-21:00"`，`imagePath: null`（未被拦截）
- 截图：`tc-f10-edit-no-imageurl.png`（编辑页同样无 imageUrl 字段）

## 发现的问题

| ID | 严重度 | 描述 | 复现步骤 | 建议 |
|---|---|---|---|---|
| **BUG-2** | **High** | 创建门店成功后未跳转到 `/admin/stores/{id}/image`，而是落到 `/admin/stores` 列表页。`StoreForm` 与 `stores/new` 两个组件各自调用 `router.push`，StoreForm 的 push 覆盖了 new page 的 push | 1. 登录 admin<br>2. 访问 `/admin/stores/new`<br>3. 填表后点击"创建门店"<br>4. 观察 URL → 落在 `/admin/stores` 而非 `/admin/stores/{id}/image` | 移除 `StoreForm.tsx` line 144 的 `router.push("/admin/stores")`。让调用方（new/edit page）完全控制跳转；或把跳转逻辑从 StoreForm 中参数化（接受 `onSuccessRedirect?: string`） |
| **NOTE-1** | Medium | TC-F7 的拦截发生在 Prisma 实体存在性校验阶段，而非 `buildStorePath` 的 sanitize 阶段。两者都生效，但 sanitize 是冗余的；假如未来重构把存在性校验移走，sanitize 才是真正兜底 | 1. 上传 `entityId=100018/../evil`<br>2. 实际靠 Prisma 找不到该 id 拒绝<br>3. `buildStorePath` 的 `/[\/\\\.]/` 校验未被触发 | 建议在 `buildStorePath` 上加单测覆盖 `../` 与 `/` 等畸形 id；将 sanitize 移至 `POST` 入口最前（entity 校验之前）以便纵深防御 |
| **NOTE-2** | Low | 实体存在性校验对 `entityId` 形如 `100018/../evil` 也会按字面量查 Prisma（不会做 URL decode），安全但浪费一次 DB 查询 | 同上 | 性能可忽略；可不修 |
| **NOTE-3** | Low | `imageUrl` 字段虽从表单移除，但 `StoreForm` 的 defaultValues 仍包含 `imageUrl: null, imagePath: null`（line 114-115）；未来如果恢复 imageUrl 输入，会再次踩 BUG-1 | 静态分析 | 建议在移除字段时同步清理 zod schema 与 defaultValues |

## 已知未覆盖

- **并发上传**：未测试同一 storeId 并发 POST /api/upload（PRD §7.3 已提到，原子 rename + .tmp 模式应当能保证一致性，但未实测）
- **网络抖动 / 大文件超时**：未测试 4.99MB 边界值与超慢网络
- **进度条 UI**：`EntityImageUploader` 的"处理中..."覆盖了进度条，PRD §4.3.1 提到要展示百分比——当前实现无 XHR 或 fetch 进度回调，超大文件用户看不到进度
- **图片裁剪/缩放预览**：上传后无客户端预览，next/image 加载服务端 webp 较慢
- **webp 动画**：fixture-3.webp 是静态 webp，未测试动图
- **EXIF 处理**：未验证 sharp 是否自动 strip EXIF（按默认 `sharp().webp()` 不带 `withMetadata`，应已 strip）
- **MIME 嗅探攻击**：未测试 `image/jpeg` MIME 头 + 真实 PNG 内容的混搭（应被 sharp metadata 拒，但未实测）
- **门店删除时残留图片**：未测试删除 store 是否级联删除 imagePath 文件（PRD §6.2 提到，但本测试范围不含）
- **错误重试**：未测试上传失败后的重试 UI 行为

## 后续建议

1. **修 BUG-2**：把跳转职责完全交给 `stores/new/page.tsx`，删除 `StoreForm` 内部 `router.push`
2. **补 E2E 单测**：在 `tests/e2e/` 下加 upload flow 自动化（Playwright Test）
3. **加 API 单测**：vitest + supertest 覆盖 `route.ts` 关键分支（特别是 sanitize 顺序、文件 size 边界）
4. **进度条升级**：换用 `XMLHttpRequest` 或 `fetch` + ReadableStream 拿到上传进度
5. **图像边界**：`MAX_FILE_SIZE` 可考虑提到 10MB，门店主图 5MB 偏紧

## 截图清单

| 用例 | 截图路径 |
|---|---|
| TC-F1 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f1-upload-success.png` |
| TC-F2 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f2-replace.png` |
| TC-F3 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f3-delete.png` |
| TC-F9 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f9-new-form-no-imageurl.png` |
| TC-F9 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f9-redirect-to-image-page.png` |
| TC-F10 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/docs/test-reports/image-upload-2026-06-10/tc-f10-edit-no-imageurl.png` |

注：TC-F4 ~ TC-F8 是纯 API 校验（curl），未附 UI 截图。


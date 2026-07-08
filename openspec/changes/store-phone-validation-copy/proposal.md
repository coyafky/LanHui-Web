## Why

`Store.phone` / `phoneTel` 的产品规则已正式确定：只接受中国大陆 11 位手机号，不接受座机、分机、短号、带横线电话。但代码中校验文案模糊（"联系电话必须为 11 位数字"）、表单标签/placeholder 误导运营人员（标签写"联系电话"、placeholder 展示 `0757-2288 1001` 座机格式），容易让后续维护者误判为 bug 而放宽正则。

本次变更不做功能修改，仅统一规则表达，让代码自文档化。

## What Changes

- `src/lib/validations/store.ts`：重命名 `PHONE_REGEX` → `MOBILE_PHONE_REGEX`（更名不改值，保留 `/^\d{11}$/`），更新错误文案，添加业务规则注释
- `src/components/admin/StoreForm.tsx`：标签改为"门店联系手机号"，placeholder 改为手机号示例，input 增加 `inputMode`/`maxLength` 约束
- `src/lib/validations/store.test.ts`：新增手机号格式测试（通过/失败用例），更新已有错误文案断言

## Capabilities

### New Capabilities

无

### Modified Capabilities

无（仅文案与注释变更，不改变校验逻辑本身）

## Impact

- 前端表单：门店新建/编辑页 label + placeholder 变更
- Zod 校验：错误文案变更（API 和前端共用 `StoreCreateSchema`/`StoreUpdateSchema`）
- 测试：验证文件中的错误文案断言需同步更新

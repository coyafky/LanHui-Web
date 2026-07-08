## 实现方案

### 1. store.ts — 重命名 + 文案 + 注释

```ts
// 业务规则：门店联系电话只接受 11 位手机号，不接受座机。
export const MOBILE_PHONE_REGEX = /^\d{11}$/;
```

- 不改为 `/^1\d{10}$/`：保留 `\d{11}` 约束，兼容未来可能的非 1 开头号段
- 错误文案改为：`"请输入 11 位手机号，不支持座机或带横线号码"`
- 所有引用 `PHONE_REGEX` 的地方同步更新为 `MOBILE_PHONE_REGEX`

### 2. StoreForm.tsx — 标签 + placeholder + input 属性

- 标签：`"联系电话"` → `"门店联系手机号"`
- placeholder：`"例：0757-2288 1001"` → `"请输入 11 位手机号，例如 13800138000"`
- 增加 `inputMode="numeric"` 和 `maxLength={11}`

### 3. store.test.ts — 测试更新

- 修复已有断言的错误文案字符串
- 新增手机号格式测试：
  - 通过：`13800138000`、`19912345678`
  - 失败：`0757-22881001`、`075722881001`、`400-888-8888`、`12345`、`1380013800a`、`+8613800138000`

### 不改动的文件

- `src/app/api/stores/route.ts`：Zod schema 错误自动来自 store.ts，无需单独修改
- `src/app/api/stores/[id]/route.ts`：同上
- `src/components/agent/StoreCard.tsx`：前台展示 `store.phone` 不变，"联系电话"标签在 StoreCard 已是前端展示，无需改名
- `src/app/agent/store/[id]/page.tsx`：同上

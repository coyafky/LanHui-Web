请直接实现蓝辉轻改「门店搜索组件 + 星辉旗舰店推荐展示」功能，不要只给方案。先阅读 AGENTS.md 和相关代码，再按下面需求修改并验证。

## 需求概述

为蓝辉轻改公开站门店页增加一个类似参考图的搜索组件，为未来大量门店数据预留检索能力。搜索范围覆盖省份、城市、区县/区域、门店名称、地址等字段。

同时规范「推荐门店」来源：不新增单独推荐字段，而是使用后台已开放门店的等级字段。只要管理员将已开放门店编辑为 `星辉旗舰店`，前台推荐门店区域就自动展示这些门店。

## 项目上下文

技术栈：

- Next.js 16 App Router
- React 19
- TypeScript strict
- Tailwind CSS v4
- Prisma 7 + PostgreSQL

相关门店等级：

- 文件：`src/lib/validations/store.ts`
- `flagship`: `星辉旗舰店`
- `premium`: `星耀尊享店`
- `specialty`: `星辰专营店`
- `member`: `星光会员店`

相关页面和组件：

- `src/app/agent/page.tsx`
  - 当前是全国门店页
  - 当前渲染 Hero、按省份浏览、已开放门店
- `src/components/agent/StoreCard.tsx`
  - 公开站门店卡片
  - 已显示 `StoreLevelBadge`
- `src/components/agent/StoreLevelBadge.tsx`
  - 门店等级 Badge
- `src/components/FeaturedStores.tsx`
  - 首页「推荐门店」section
- `src/lib/data.ts`
  - `getStores`
- `src/app/api/stores/route.ts`
  - 已支持 `search`
  - 已支持多值 `level`
  - 已支持 `status`
  - 已支持 `sort`

## 实现目标

### 1. 在 `/agent` 页面增加门店搜索组件

参考截图效果：

- 黑色背景
- 居中大标题
- 标题下方显示统计信息：省份数量、门店数量
- 下方放一个大号搜索框
- 搜索框占据中等宽度，桌面端大约 `max-w-3xl`
- 左侧使用搜索图标
- placeholder：
  `输入省份、城市、区县或门店名称搜索...`

搜索框建议位置：

- 放在 `src/app/agent/page.tsx` Hero 下方或 Hero 内统计信息下方
- 与当前深色设计风格一致
- 使用橙色 focus 边框或 glow
- 移动端宽度为 `w-full`

### 2. 搜索行为

实现 URL 参数驱动搜索，适合未来大量门店： 
下面的作为参考

- URL 参数使用 `?q=关键词`
- `/agent?q=佛山`
- `/agent?q=顺德`
- `/agent?q=D2`
- `/agent?q=星辉旗舰店`

实现方式建议：

- 新增 Client Component：`src/components/agent/StoreSearch.tsx`
- 组件读取初始 keyword
- 用户输入后点击搜索或按 Enter 跳转到 `/agent?q=...`
- 提供清空按钮，清空后回到 `/agent`
- 不要只在前端过滤当前列表，应该让页面根据 URL 参数重新获取数据

### 3. 扩展数据获取能力

修改 `src/lib/data.ts` 的 `getStores` 参数类型，支持：

```ts
{
  province?: string;
  city?: string;
  limit?: number;
  sort?: "public_featured";
  search?: string;
  level?: StoreLevel | StoreLevel[];
}
调用 /api/stores 时：
search 映射为 ?search=xxx
level 映射为 ?level=flagship
多个 level 时追加多个 level
保持 API-first + static fallback 模式
fallback 静态数据也要支持搜索：
匹配 store.name
store.provinceLabel
store.cityLabel
store.district
store.address
store.phone
4. /agent 页面支持 searchParams
修改 src/app/agent/page.tsx：
接收 searchParams
读取 q
const keyword = ...
调用 getStores({ search: keyword })
对结果继续使用 sortStoresByLevel
搜索后「已开放门店」标题旁显示结果数量，例如：
找到 12 家门店
搜索无结果时显示空状态：
未找到匹配门店，请尝试搜索城市、区域或门店名称。
如果有关键词，提供「清除搜索」链接回到 /agent
5. 推荐门店只展示星辉旗舰店
规范推荐门店来源：
不新增 isRecommended
不新增 featured 字段
推荐门店 = 已开放且 level === "flagship" 的门店
后台只需要把已开放门店编辑为「星辉旗舰店」，前台推荐门店就自动展示
修改 src/components/FeaturedStores.tsx：
getStores({ limit: 4, sort: "public_featured" })
改为只获取或过滤 level === "flagship" 的门店
仍然过滤 s.isActive !== false
如果没有星辉旗舰店，整个推荐门店 section 不渲染
标题保持「推荐门店」
可在标题下加一句：
精选星辉旗舰店，优先展示已开放的旗舰服务中心。
如果 /api/stores 的 sort=public_featured 当前不是旗舰优先，请调整排序策略：
旗舰优先
有门店图片优先
创建时间或 id 稳定排序兜底
6. 已开放门店列表排序
/agent 的已开放门店列表继续使用：
sortStoresByLevel
星辉旗舰店优先展示
其他等级按已有权重排序
不要把「已开放门店」改成只展示旗舰店。它应该展示所有已开放门店，只是搜索和排序更好用。
需要修改的文件
优先修改：
src/app/agent/page.tsx
src/components/agent/StoreSearch.tsx 新增
src/lib/data.ts
src/components/FeaturedStores.tsx
src/app/api/stores/route.ts 如排序或 search 字段不足，再补充
可能需要更新测试：
src/components/FeaturedStores.test.tsx
src/lib/data.test.ts
可新增 src/components/agent/StoreSearch.test.tsx
可新增或更新 /agent 页面测试，如果项目已有对应模式
视觉要求
搜索组件风格参考截图，但要适配蓝辉轻改：
背景：黑色 / zinc-950
输入框：bg-zinc-900/80
边框：border-zinc-700
focus：focus:border-orange-500
图标：text-zinc-500
placeholder：text-zinc-500
圆角：rounded-2xl
高度：桌面端约 h-16，移动端可略小
不使用紫色渐变，不做装饰性大色块
移动端不能横向溢出
验收标准

/agent 页面 Hero 区出现门店搜索框

输入关键词并按 Enter 后跳转到 /agent?q=关键词

搜索结果按关键词过滤门店

可搜索省份、城市、区域、门店名、地址、电话

搜索无结果时显示友好空状态

清除搜索后恢复全部已开放门店

已开放门店仍按等级排序，星辉旗舰店优先

首页「推荐门店」只展示已开放且 level === "flagship" 的门店

管理员在后台把门店等级编辑为「星辉旗舰店」后，前台推荐门店自动出现

没有星辉旗舰店时，推荐门店 section 不渲染

390px、768px、1440px 下布局正常

npm run lint 通过

npm run build 通过

如运行 npm run typecheck，注意项目已有测试文件中的 pre-existing errors，不要误报为本次回归
约束
不引入新依赖
TypeScript strict，禁止 any
遵循现有 API response 格式
不直接在 RSC 中调用 prisma.*
不新增推荐字段，推荐逻辑必须来自 level === "flagship"
不破坏现有省份页 /agent/[slug] 和城市页 /agent/[slug]/[city]
# SPEC: 跨页共享组件 Shared Components

> 实现状态：✅ **完成**

---

## 1. 职责范围

被多个页面引用的共享组件，非专题专用。

## 2. 组件清单

| 组件 | 文件 | Client? | 职责 |
|------|------|---------|------|
| Header | `src/components/Header.tsx` | 是 | 粘性导航，桌面下拉菜单+移动端滑面板，CTA 按钮，滚动收缩 |
| Footer | `src/components/Footer.tsx` | 否 | 品牌列+导航+产品+联系+ICP/备案 |
| Logo | `src/components/Logo.tsx` | 否 | Next/Image 包装，`lanhui-logo.png` |
| OptimizedImage | `src/components/OptimizedImage.tsx` | 否 | 通用图片渲染，标准 quality=75，支持 fill |
| WeChatConsultModal | `src/components/shared/WeChatConsultModal.tsx` | 是 | 全屏微信弹窗，emitter 驱动 |
| AnalyticsProvider | `src/components/AnalyticsProvider.tsx` | 是 | 路由变化自动 pageview，跳过 /admin |
| PhoneCta | `src/components/cta/PhoneCta.tsx` | 是 | 电话咨询 CTA 按钮+埋点 |
| ProductGalleryCarousel | `src/components/ProductGalleryCarousel.tsx` | 是 | Embla 产品轮播，自动播放 |

## 3. 关键模式：模块级 Emitter

`src/lib/wechat-modal.ts` 实现跨组件状态同步，采用发布-订阅模式。

### 原理

```
┌─────────────┐     emitter.emit('open')     ┌───────────────────┐
│  组件 A     │ ──────────────────────────→   │  组件 B           │
│ (CTA Button)│                              │ (WeChatConsultModal)│
│  openWeChat │                              │  subscribe → setOpen│
│  Modal()    │                              │                    │
└─────────────┘                              └───────────────────┘
```

### 实现要点

- 模块级 `let isOpen = false` 变量 + `Set<Listener>` 订阅集合
- `subscribeWeChatModal(listener)` 返回取消订阅函数，订阅时立即同步当前状态
- `openWeChatModal()` / `closeWeChatModal()` 用 `isOpen` guard 防重复
- 订阅者可以是任意组件（不限层级），无需 Context Provider
- 在 React 组件中通过 `useEffect` 调用 `subscribeWeChatModal`，与 React 生命周期解耦

### WeChatConsultModal 状态管理

| 状态 | 触发条件 | 用户表现 | 处理策略 |
|------|---------|---------|---------|
| **loading** | 首次挂载或 QR 码加载中 | 占位区域 + 骨架屏 | `aspect-square` 容器预留空间，防 CLS |
| **valid** | 企业微信 QR 码正常显示 | 完整弹窗：标题+描述+二维码+客服信息 | 默认呈现状态 |
| **no channel** | QR 码图片缺失（`/images/brand/wechat-qr.png` 不存在） | 显示"暂未开通"提示，CTA 按钮改为"电话咨询" | `onError` 回退到备选联系方式 |
| **image failed** | 图片加载失败（网络/资源问题） | 重试按钮 + 错误提示 | `useState` 追踪加载错误，支持手动重试 |
| **disabled** | 非工作时间或业务暂停 | 弹窗不弹出，或显示"当前无客服在线" | 业务层通过 emitter guard 控制 |
| **debounce** | 用户快速连续点击 CTA | 忽略 500ms 内的重复打开请求 | `openWeChatModal()` 内部的 `isOpen` guard 天然防抖 |

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | Header/Footer/Logo/WeChatConsultModal 实现 | 完成 | — |
| 2026-06-15 | Claude Code | AnalyticsProvider + PhoneCta + ProductGalleryCarousel | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |

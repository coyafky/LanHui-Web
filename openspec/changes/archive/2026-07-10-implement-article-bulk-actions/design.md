---
comet_change: implement-article-bulk-actions
role: technical-design
canonical_spec: openspec
---

# Design Doc — 文章批量操作前端实现

## 1. 问题分析

后端 `POST /api/articles/bulk` 已完整实现：
- Auth + role check (admin only)
- CSRF (`requireCsrf`)
- 速率限制 (60/min)
- 状态机校验 (`canRunArticleAction` + `validateArticlePublishFields`)
- 逐个处理，返回 `{ succeeded, skipped, failed }` 分类结果
- 日志 (`logActivity`) + 缓存刷新 (`revalidateArticlePaths`)

前端差距：
- `selectedIds` 状态不存在 → 没有复选框
- `handleConfirmAction` 的 `bulk` 分支是空实现
- 没有批量操作触发 UI

## 2. UI 设计

### 2.1 复选框

表格新增首列（表头 + 每行）：
- 表头复选框：全选/取消全选当前页文章
- 行复选框：切换单篇文章选中状态
- 翻页后清空选中（避免跨页选中已不可见的文章）

### 2.2 批量操作栏

当 `selectedIds.size > 0` 时，在筛选栏下方显示工具栏：
- 显示已选数量："已选 N 篇"
- 按钮组：批量发布、批量归档、批量删除（danger 样式）
- 取消选择按钮
- 不提供"批量撤回"（业务上撤回是精细化操作，不适合批量）

没有选中时不显示工具栏，保持现有布局。

### 2.3 handleConfirmAction bulk 分支

```typescript
case "bulk": {
  const { action, ids } = pendingConfirm;
  const res = await adminCsrfFetch("/api/articles/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ids }),
  });
  const json = await res.json();
  if (json.success) {
    const { succeeded, skipped, failed } = json.data;
    if (failed.length === 0 && skipped.length === 0) {
      toast.success(`已${ACTION_LABELS[action]} ${succeeded.length} 篇文章`);
    } else {
      toast.success(
        `完成 ${succeeded.length} 篇，跳过 ${skipped.length} 篇，失败 ${failed.length} 篇`
      );
    }
    setPendingConfirm(null);
    setSelectedIds(new Set());
    fetchArticles();
  } else {
    toast.error(json.error || "批量操作失败");
  }
}
```

## 3. 状态管理

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

function toggleSelectAll() {
  if (selectedIds.size === articles.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(articles.map((a) => a.id)));
  }
}

function toggleSelectOne(id: string) {
  const next = new Set(selectedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  setSelectedIds(next);
}
```

分页/筛选变化时清空 `selectedIds`。

## 4. 稳定性规则

- 现有单篇操作路径不变
- 现有 `page.test.tsx` 测试不变（新增测试，不改已有测试）
- 批量操作使用与单篇操作相同的 `adminCsrfFetch`（CSRF 自动处理）
- ConfirmDialog 复用已有的 `case "bulk"` 配置

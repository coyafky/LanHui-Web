// ── 管理后台共享类型 ──
// 供 articles/*、stores/* 等 admin 子目录共用

/** 文章列表行数据 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  publishedAt: string | null;
  viewCount: number;
  isSticky: boolean;
  createdAt: string;
  author: { id: string; name: string | null };
}

/** 分页信息 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 文章状态标签 */
export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-zinc-700 text-zinc-300" },
  published: { label: "已发布", className: "bg-emerald-900/50 text-emerald-400" },
  withdrawn: { label: "已撤回", className: "bg-red-900/50 text-red-400" },
  archived: { label: "已归档", className: "bg-yellow-900/50 text-yellow-400" },
};

/** 分类 fallback：API 失败时使用 */
export const CATEGORIES_FALLBACK = [
  { value: "新闻", label: "新闻" },
  { value: "行业动态", label: "行业动态" },
  { value: "产品知识", label: "产品知识" },
  { value: "公司公告", label: "公司公告" },
];

export interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

export type ArticleAction = "publish" | "unpublish" | "archive" | "delete";

export const ACTION_LABELS: Record<ArticleAction, string> = {
  publish: "发布",
  unpublish: "撤回发布",
  archive: "归档",
  delete: "删除",
};

export type PendingArticleConfirm =
  | { type: "single"; article: Article; action: ArticleAction }
  | { type: "delete"; article: Article }
  | { type: "bulk"; action: ArticleAction; ids: string[] }
  | null;

export const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "withdrawn", label: "已撤回" },
  { value: "archived", label: "已归档" },
];

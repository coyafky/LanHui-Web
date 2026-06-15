"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

const CATEGORIES = [
  { value: "新闻", label: "新闻" },
  { value: "行业动态", label: "行业动态" },
  { value: "产品知识", label: "产品知识" },
  { value: "公司公告", label: "公司公告" },
];

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  tags: string[];
  status: string;
  isSticky: boolean;
  publishedAt: string | null;
}

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 表单字段
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [isSticky, setIsSticky] = useState(false);

  // 加载文章数据
  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const json = await res.json();
        if (!json.success) {
          setError("文章不存在");
          return;
        }
        const article: ArticleData = json.data;
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt || "");
        setContent(article.content);
        setCategory(article.category || "");
        setTags(article.tags);
        setStatus(article.status as "draft" | "published" | "archived");
        setIsSticky(article.isSticky);
      } catch {
        setError("加载失败");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  function handleAddTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || undefined,
          content,
          category: category || null,
          tags,
          status,
          isSticky,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || "更新失败");
        return;
      }

      const titleForBanner = encodeURIComponent(title || "文章");
      router.push(`/admin/articles?updated=${titleForBanner}`);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-zinc-500">加载中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 页头 */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">编辑文章</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            标题 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入文章标题"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
          />
        </div>

        {/* 摘要 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            摘要
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="简短描述文章内容..."
            rows={2}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入文章内容（支持 Markdown）"
            rows={20}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
            required
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            分类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
          >
            <option value="">选择分类</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 标签 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            标签
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="输入标签后按回车添加"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              添加
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 状态 + 置顶 */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              状态
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">草稿</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">发布</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={status === "archived"}
                  onChange={() => setStatus("archived")}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">归档</span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              置顶
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isSticky}
                onChange={(e) => setIsSticky(e.target.checked)}
                className="accent-orange-500"
              />
              <span className="text-sm text-zinc-300">置顶文章</span>
            </label>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "保存中..." : "更新"}
          </button>
          <Link
            href="/admin/articles"
            className="rounded-lg border border-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/admin-csrf-fetch", () => ({
  adminCsrfFetch: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
import { toast } from "sonner";
import { useArticleFormState } from "./use-article-form-state";
import type { ArticleFormInput } from "@/lib/validations/article";

const mockAdminCsrfFetch = vi.mocked(adminCsrfFetch);

function getCreateInitial() {
  return renderHook(() => useArticleFormState("create"));
}

function getEditInitial(data?: Partial<ArticleFormInput>) {
  const defaultData: ArticleFormInput = {
    title: "Original Title",
    slug: "original-title",
    excerpt: "Original excerpt",
    content: "Original content",
    featuredImage: undefined,
    category: "新闻",
    tags: ["tag1", "tag2"],
    status: "draft",
    isSticky: false,
    ...data,
  };
  return renderHook(() =>
    useArticleFormState("edit", {
      initialData: defaultData,
      articleId: "123",
    }),
  );
}

describe("useArticleFormState — create mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes all fields to empty defaults", () => {
    const { result } = getCreateInitial();

    expect(result.current.title).toBe("");
    expect(result.current.slug).toBe("");
    expect(result.current.excerpt).toBe("");
    expect(result.current.content).toBe("");
    expect(result.current.featuredImage).toBe("");
    expect(result.current.category).toBe("");
    expect(result.current.tags).toEqual([]);
    expect(result.current.status).toBe("draft");
    expect(result.current.isSticky).toBe(false);
    expect(result.current.slugManuallyEdited).toBe(false);
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.saving).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it("dirty is false initially", () => {
    const { result } = getCreateInitial();
    expect(result.current.dirty).toBe(false);
  });

  it("dirty is true when title is non-empty", () => {
    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("Test");
    });

    expect(result.current.dirty).toBe(true);
  });

  it("auto-generates slug from title when not manually edited", () => {
    const now = 1720000000000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("测试文章");
    });

    expect(result.current.slug).toBe(now.toString(36));
  });

  it("does NOT auto-generate slug when manually edited", () => {
    const now = 1720000000000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onSlugChange("my-slug");
    });

    expect(result.current.slug).toBe("my-slug");

    act(() => {
      result.current.onTitleChange("测试文章");
    });

    // Slug should remain "my-slug" (not auto-generated)
    expect(result.current.slug).toBe("my-slug");
  });

  it("handleSubmit calls POST /api/articles on valid input", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("Test Article");
    });
    act(() => {
      result.current.onContentChange("Test content");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockAdminCsrfFetch).toHaveBeenCalledWith(
      "/api/articles",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("创建成功");
    expect(mockPush).toHaveBeenCalledWith("/admin/articles");
  });

  it("handleSubmit sets fieldErrors on validation failure", async () => {
    const { result } = getCreateInitial();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.title).toBeTruthy();
    expect(result.current.fieldErrors.content).toBeTruthy();
  });

  it("handleSubmit does not call adminCsrfFetch when validation fails", async () => {
    const { result } = getCreateInitial();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockAdminCsrfFetch).not.toHaveBeenCalled();
  });

  it("handleSubmit calls toast.error on API failure", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({ success: false, error: "Server error occurred" }),
    } as Response);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("Test Article");
    });
    act(() => {
      result.current.onContentChange("Test content");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(toast.error).toHaveBeenCalledWith("Server error occurred");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handleSubmit maps server fieldErrors to form", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: "校验失败",
          details: { fieldErrors: { title: "标题已存在" } },
        }),
    } as Response);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("Test Article");
    });
    act(() => {
      result.current.onContentChange("Test content");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.title).toBe("标题已存在");
  });

  it("handleSubmit sets saving false after completion", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const { result } = getCreateInitial();

    act(() => {
      result.current.onTitleChange("Test Article");
    });
    act(() => {
      result.current.onContentChange("Test content");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.saving).toBe(false);
  });
});

describe("useArticleFormState — edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes fields from initialData", () => {
    const { result } = getEditInitial();

    expect(result.current.title).toBe("Original Title");
    expect(result.current.slug).toBe("original-title");
    expect(result.current.excerpt).toBe("Original excerpt");
    expect(result.current.content).toBe("Original content");
    expect(result.current.featuredImage).toBe("");
    expect(result.current.category).toBe("新闻");
    expect(result.current.tags).toEqual(["tag1", "tag2"]);
    expect(result.current.status).toBe("draft");
    expect(result.current.isSticky).toBe(false);
  });

  it("dirty is false when values match snapshot", () => {
    const { result } = getEditInitial();
    expect(result.current.dirty).toBe(false);
  });

  it("dirty is true when title differs from snapshot", () => {
    const { result } = getEditInitial();

    act(() => {
      result.current.onTitleChange("Modified Title");
    });

    expect(result.current.dirty).toBe(true);
  });

  it("does NOT auto-generate slug when title changes", () => {
    const { result } = getEditInitial();

    act(() => {
      result.current.onTitleChange("Modified Title");
    });

    // Slug should remain as initial
    expect(result.current.slug).toBe("original-title");
  });

  it("handleSubmit calls PUT /api/articles/{id} on valid input", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const { result } = getEditInitial();

    // Modify something
    act(() => {
      result.current.onTitleChange("Modified Title");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockAdminCsrfFetch).toHaveBeenCalledWith(
      "/api/articles/123",
      expect.objectContaining({
        method: "PUT",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("更新成功");
    expect(mockPush).toHaveBeenCalledWith("/admin/articles");
  });

  it("handleSubmit updates snapshot after successful save", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const { result } = getEditInitial();

    // Modify title
    act(() => {
      result.current.onTitleChange("Modified Title");
    });

    expect(result.current.dirty).toBe(true);

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    // After successful save, dirty should be false (snapshot updated)
    expect(result.current.dirty).toBe(false);
  });

  it("handleSubmit calls toast.error on API failure", async () => {
    mockAdminCsrfFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({ success: false, error: "Update failed" }),
    } as Response);

    const { result } = getEditInitial();

    act(() => {
      result.current.onTitleChange("Modified Title");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(toast.error).toHaveBeenCalledWith("Update failed");
    expect(mockPush).not.toHaveBeenCalled();
  });
});

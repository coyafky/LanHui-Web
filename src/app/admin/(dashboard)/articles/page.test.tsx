import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, within } from '@testing-library/react';

/**
 * ArticlesPage per-row menu tests (M1-M5)
 *
 * 策略：
 * - Mock next/navigation (useRouter, useSearchParams) 和全局 fetch
 * - 用 addEventListener spy 验证 document-level listener 只在菜单打开时注册
 * - 渲染 <ArticlesPage /> → 找到 MoreHorizontal 按钮 → 触发 click
 */

const fetchMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
}));

import ArticlesPage from './page';

const SAMPLE_ARTICLE = {
  id: 'art-1',
  title: '测试文章标题',
  slug: 'test-article',
  status: 'draft',
  category: '新闻',
  publishedAt: null,
  viewCount: 0,
  isSticky: false,
  createdAt: '2026-06-15T00:00:00.000Z',
  author: { id: 'u-1', name: '测试作者' },
};

function mockFetchSuccess() {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes('/categories')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { categories: [{ value: '新闻', label: '新闻', count: 1 }] },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [SAMPLE_ARTICLE],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });
  });
}

describe('ArticlesPage per-row menu', () => {
  let clickListenerAddCount: number;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock.mockReset();
    mockFetchSuccess();
    global.fetch = fetchMock as unknown as typeof fetch;

    // 监听 document.addEventListener 调用次数（仅 click）。
    // 用 EventTarget.prototype.addEventListener 走真实实现，
    // 避免 spy 自身递归。
    clickListenerAddCount = 0;
    const protoAdd = EventTarget.prototype.addEventListener;
    addEventListenerSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(((
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) => {
        if (event === 'click' && typeof handler === 'function') {
          clickListenerAddCount += 1;
        }
        return protoAdd.call(document, event, handler, options);
      }) as typeof document.addEventListener);
  });

  afterEach(() => {
    cleanup();
    addEventListenerSpy.mockRestore();
  });

  it('M1: 点击 ... 按钮后，菜单 div 出现', async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    // 初始：菜单不显示
    expect(screen.queryByText('编辑')).not.toBeInTheDocument();

    const moreBtn = findMoreButton();
    expect(moreBtn).toBeDefined();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });
  });

  it('M2: 菜单打开后，点击 document 外部元素，菜单关闭', async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    const moreBtn = findMoreButton();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    // 模拟点击 document.body（外部，body 本身不包含在 menu 容器内）
    fireEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    });
  });

  it('M3: 菜单打开后，点击菜单项 "编辑"，菜单仍显示（不被关闭）', async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    const moreBtn = findMoreButton();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    // "编辑" 是一个 Link，包装在 <a> 中。点击它的事件目标仍然在
    // containerRef 内（menu div 是 div 父级的子级），所以菜单不会被关闭。
    const editLink = screen.getByText('编辑').closest('a');
    expect(editLink).toBeTruthy();
    fireEvent.click(editLink!);

    // 菜单仍在 DOM 中
    expect(screen.getByText('编辑')).toBeInTheDocument();
  });

  it('M4: 没有菜单打开时，document 上没有注册 click 监听器', async () => {
    render(<ArticlesPage />);

    // 等初始 render 完成
    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    // 此时 openMenuId === null，effect 早返回 → 没有 click listener
    expect(clickListenerAddCount).toBe(0);
  });

  it('M5: 点击删除后弹出 ConfirmDialog（不调 window.confirm）', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      render(<ArticlesPage />);

      await waitFor(() => {
        expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
      });

      // 打开菜单
      const moreBtn = findMoreButton();
      fireEvent.click(moreBtn!);

      await waitFor(() => {
        expect(screen.getByText('删除')).toBeInTheDocument();
      });

      // 点击删除
      const deleteBtn = screen.getByText('删除');
      fireEvent.click(deleteBtn);

      // ConfirmDialog 应该出现
      await waitFor(() => {
        expect(screen.getByText('确认删除文章？')).toBeInTheDocument();
      });
      expect(screen.getByText('删除后不可恢复')).toBeInTheDocument();

      // 验证没有调用原生 window.confirm（而是使用 ConfirmDialog 组件）
      expect(confirmSpy).not.toHaveBeenCalled();
    } finally {
      confirmSpy.mockRestore();
    }
  });
});

describe('ArticlesPage ConfirmDialog', () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock.mockReset();
    mockFetchSuccess();
    global.fetch = fetchMock as unknown as typeof fetch;
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    confirmSpy.mockRestore();
  });

  it('A: 确认删除后调 DELETE API', async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    // 打开菜单
    const moreBtn = findMoreButton();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    // 点击删除
    fireEvent.click(screen.getByText('删除'));

    // ConfirmDialog 应该出现
    await waitFor(() => {
      expect(screen.getByText('确认删除文章？')).toBeInTheDocument();
    });

    // 点击弹窗中的确认（删除）按钮
    // 用 within 限定在 alertdialog 内查找，避免与菜单项的"删除"混淆
    const dialog = screen.getByRole('alertdialog');
    const confirmBtn = within(dialog).getByText('删除');
    fireEvent.click(confirmBtn);

    // 验证 DELETE API 被调用
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/articles/art-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  it('B: 点击取消按钮关闭 ConfirmDialog', async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    // 打开菜单
    const moreBtn = findMoreButton();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    // 点击删除
    fireEvent.click(screen.getByText('删除'));

    // ConfirmDialog 应该出现
    await waitFor(() => {
      expect(screen.getByText('确认删除文章？')).toBeInTheDocument();
    });

    // 点击取消按钮
    fireEvent.click(screen.getByText('取消'));

    // ConfirmDialog 应该消失
    await waitFor(() => {
      expect(screen.queryByText('确认删除文章？')).not.toBeInTheDocument();
    });
  });

  it('C: 删除操作 danger variant 确认按钮样式', async () => {
    // 注意：当前文章列表页未实现批量操作 UI（复选框 + 批量删除按钮），
    // 无法直接通过用户交互触发批量删除 ConfirmDialog。
    // 单篇删除也使用 danger variant，借此验证 danger 样式生效。
    // 待批量 UI 上线后应补充：
    //   - 选中文章 → 点击批量删除
    //   - ConfirmDialog 应显示 "确认对 1 篇文章执行删除吗？" + "此操作不可撤销"
    //   - confirmLabel 为 "删除"，variant 为 "danger"
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
    });

    const moreBtn = findMoreButton();
    fireEvent.click(moreBtn!);

    await waitFor(() => {
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('删除'));

    await waitFor(() => {
      expect(screen.getByText('确认删除文章？')).toBeInTheDocument();
    });

    // 验证 danger variant：确认按钮应包含 bg-red-500 样式
    const dialog = screen.getByRole('alertdialog');
    const confirmBtn = within(dialog).getByText('删除');
    expect(confirmBtn.className).toContain('bg-red-500');

    // 关闭弹窗（清理）
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => {
      expect(screen.queryByText('确认删除文章？')).not.toBeInTheDocument();
    });
  });
});

/**
 * 找到 MoreHorizontal 按钮：通过其内部包含 lucide-more-horizontal
 * 类的 svg 来定位。
 */
function findMoreButton(): HTMLElement {
  const allButtons = screen.getAllByRole('button');
  const moreBtn = allButtons.find((b) =>
    b.querySelector('svg.lucide-more-horizontal, svg.lucide-ellipsis'),
  );
  if (!moreBtn) {
    throw new Error('Could not find MoreHorizontal button');
  }
  return moreBtn;
}

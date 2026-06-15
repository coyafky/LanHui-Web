import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

/**
 * ArticlesPage per-row menu tests (M1-M4)
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
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: [SAMPLE_ARTICLE],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }),
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

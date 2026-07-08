import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

const fetchMock = vi.hoisted(() => vi.fn());
const routerPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: vi.fn(), replace: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import NewArticlePage from './page';

describe('NewArticlePage', () => {
  function categoriesResponse() {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          categories: [
            { value: '新闻', label: '新闻' },
            { value: '行业动态', label: '行业动态' },
          ],
        },
      }),
    };
  }

  function postSuccessResponse() {
    return {
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { id: 'new-1' },
      }),
    };
  }

  function postErrorResponse(fieldErrors?: Record<string, string>) {
    return {
      ok: true,
      status: 400,
      json: async () => ({
        success: false,
        error: 'Validation failed',
        details: fieldErrors ? { fieldErrors } : undefined,
      }),
    };
  }

  beforeEach(() => {
    fetchMock.mockReset();
    routerPush.mockReset();

    // Default: categories GET succeeds, POST succeeds
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/articles/categories') {
        return Promise.resolve(categoriesResponse());
      }
      return Promise.resolve(postSuccessResponse());
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    cleanup();
  });

  async function renderAndWaitForForm() {
    render(<NewArticlePage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('输入文章标题')).toBeInTheDocument();
    });
  }

  it('renders ArticleForm with mode="create"', async () => {
    await renderAndWaitForForm();

    expect(screen.getByText('新建文章')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入文章标题')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('输入文章内容（支持 Markdown）'),
    ).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('client-side validation prevents API POST when required fields are empty', async () => {
    await renderAndWaitForForm();

    // Clear the categories fetch call from mount
    fetchMock.mockClear();

    // Submit the form directly (fireEvent.click on submit button
    // does not reliably trigger form submit in happy-dom + React 19)
    const form = screen.getByText('保存').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('标题不能为空')).toBeInTheDocument();
    });
    expect(screen.getByText('内容不能为空')).toBeInTheDocument();

    // Verify /api/articles POST was never called
    const postCalls = fetchMock.mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/articles',
    );
    expect(postCalls).toHaveLength(0);
  });

  it('submits successfully and navigates to /admin/articles', async () => {
    await renderAndWaitForForm();

    // Fill required fields
    const titleInput = screen.getByPlaceholderText('输入文章标题');
    const contentInput = screen.getByPlaceholderText(
      '输入文章内容（支持 Markdown）',
    );

    fireEvent.change(titleInput, { target: { value: '测试文章' } });
    fireEvent.change(contentInput, { target: { value: '这是文章内容' } });

    // Submit the form
    const form = screen.getByText('保存').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    // Wait for navigation to list page
    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('maps server fieldErrors to form when API returns validation error', async () => {
    // Override POST to return error with fieldErrors
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/articles/categories') {
        return Promise.resolve(categoriesResponse());
      }
      return Promise.resolve(
        postErrorResponse({ title: '标题已存在' }),
      );
    });

    await renderAndWaitForForm();

    // Fill required fields
    const titleInput = screen.getByPlaceholderText('输入文章标题');
    const contentInput = screen.getByPlaceholderText(
      '输入文章内容（支持 Markdown）',
    );

    fireEvent.change(titleInput, { target: { value: '重复标题' } });
    fireEvent.change(contentInput, { target: { value: '内容' } });

    // Submit the form
    const form = screen.getByText('保存').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    // Wait for server error to appear as field error
    await waitFor(() => {
      expect(screen.getByText('标题已存在')).toBeInTheDocument();
    });
  });
});

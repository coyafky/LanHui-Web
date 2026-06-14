import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileTab } from './ProfileTab';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

/**
 * ProfileTab 组件测试 (U1-U4)
 *
 * - 通过 global.fetch mock 拦截网络请求
 * - U4 断言 ChangePasswordDialog 出现（dialog 角色）
 */

function mockFetchResponse(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

const baseProfile = {
  id: 'user-1',
  username: 'admin',
  name: '管理员',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ProfileTab', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('U1: mount 时调用 fetch /api/settings/profile, 渲染 username、name、email', async () => {
    mockFetchResponse({ success: true, data: baseProfile });
    render(<ProfileTab />);
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/settings/profile');

    // 字段回填到 input
    const nameInput = (await screen.findByDisplayValue('管理员')) as HTMLInputElement;
    const usernameInput = (await screen.findByDisplayValue('admin')) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();

    // email 只读区
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('U2: 提交表单 → 触发 fetch PUT /api/settings/profile', async () => {
    mockFetchResponse({ success: true, data: baseProfile });
    const user = userEvent.setup();
    render(<ProfileTab />);

    const nameInput = (await screen.findByDisplayValue('管理员')) as HTMLInputElement;
    const usernameInput = (await screen.findByDisplayValue('admin')) as HTMLInputElement;

    await user.clear(nameInput);
    await user.type(nameInput, '新管理员');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'new_admin');

    // 重新 mock fetch，提交后会再调用一次（PUT）
    const putMock = mockFetchResponse({ success: true, data: { ...baseProfile, name: '新管理员', username: 'new_admin' } });
    await user.click(screen.getByRole('button', { name: /保存修改/ }));

    await waitFor(() => {
      const putCall = putMock.mock.calls.find(
        (c) => (c[1] as RequestInit | undefined)?.method === 'PUT'
      );
      expect(putCall).toBeDefined();
    });
    const putCall = putMock.mock.calls.find(
      (c) => (c[1] as RequestInit | undefined)?.method === 'PUT'
    )!;
    expect(putCall[0]).toBe('/api/settings/profile');
    const body = JSON.parse((putCall[1] as RequestInit).body as string);
    expect(body).toEqual({ name: '新管理员', username: 'new_admin' });
  });

  it('U3: mock 后端 400 username 冲突 → 「用户名已被使用」红字出现', async () => {
    mockFetchResponse({ success: true, data: baseProfile });
    const user = userEvent.setup();
    render(<ProfileTab />);

    const nameInput = (await screen.findByDisplayValue('管理员')) as HTMLInputElement;
    const usernameInput = (await screen.findByDisplayValue('admin')) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, '管理员2');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'admin2');

    mockFetchResponse(
      { success: false, error: '用户名已被使用' },
      400
    );
    await user.click(screen.getByRole('button', { name: /保存修改/ }));

    const err = await screen.findByText('用户名已被使用');
    expect(err).toBeInTheDocument();
  });

  it('U4: 点「修改密码」按钮 → ChangePasswordDialog 出现', async () => {
    mockFetchResponse({ success: true, data: baseProfile });
    const user = userEvent.setup();
    render(<ProfileTab />);
    await screen.findByDisplayValue('管理员');

    // 初始时 dialog 不存在
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /修改密码/ }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // dialog 标题 (h3)
    expect(screen.getByRole('heading', { name: '修改密码' })).toBeInTheDocument();
  });
});

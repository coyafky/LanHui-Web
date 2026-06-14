import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * /api/settings/profile 集成测试 (I1-I6)
 *
 * 关键点：通过 vi.mock 替换 auth、prisma，使用 vi.resetModules()
 * 隔离模块状态，确保 freshPOST 每次都拿到全新模块。
 */

const findUniqueMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

import { auth } from '@/lib/auth';

function makeRequest(body?: unknown): Request {
  return new Request('http://localhost:3000/api/settings/profile', {
    method: body ? 'PUT' : 'GET',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function freshRoute() {
  vi.resetModules();
  return import('./route');
}

function setSession(userId: string | null) {
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    userId ? { user: { id: userId } } : null
  );
}

describe('GET /api/settings/profile', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it('I1: 无 session → 401', async () => {
    setSession(null);
    const { GET } = await freshRoute();
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('未登录');
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it('I2: GET 成功 → 200, 响应不含 password', async () => {
    setSession('user-1');
    findUniqueMock.mockResolvedValue({
      id: 'user-1',
      username: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    const { GET } = await freshRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      id: 'user-1',
      username: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
    });
    expect(json.data).not.toHaveProperty('password');
    // 同时验证 findUnique 被调用时 select 不含 password
    const callArgs = findUniqueMock.mock.calls[0] as [
      { select: Record<string, boolean> },
    ];
    expect(callArgs[0].select).not.toHaveProperty('password');
  });
});

describe('PUT /api/settings/profile', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it('I3: PUT 缺 name → 400, details.name 存在', async () => {
    setSession('user-1');
    const { PUT } = await freshRoute();
    const res = await PUT(makeRequest({ username: 'valid_user' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('参数错误');
    expect(json.details).toBeDefined();
    expect(json.details.name).toBeDefined();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('I4: PUT username 含中文 → 400, details.username 存在', async () => {
    setSession('user-1');
    const { PUT } = await freshRoute();
    const res = await PUT(makeRequest({ name: '管理员', username: '中文名' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details.username).toBeDefined();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('I5: PUT 成功 → 200, prisma.user.update 被调 1 次', async () => {
    setSession('user-1');
    updateMock.mockResolvedValue({
      id: 'user-1',
      username: 'new_name',
      name: '新名',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    const { PUT } = await freshRoute();
    const res = await PUT(makeRequest({ name: '新名', username: 'new_name' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.username).toBe('new_name');
    expect(updateMock).toHaveBeenCalledTimes(1);
    const callArgs = updateMock.mock.calls[0] as [
      { where: { id: string }; data: Record<string, string> },
    ];
    expect(callArgs[0].where.id).toBe('user-1');
    expect(callArgs[0].data).toEqual({ name: '新名', username: 'new_name' });
  });

  it('I6: PUT 用户名冲突 (P2002) → 400 { error: "用户名已被使用" }', async () => {
    setSession('user-1');
    const err = new Error('Unique constraint failed') as Error & { code: string };
    err.code = 'P2002';
    updateMock.mockRejectedValue(err);
    const { PUT } = await freshRoute();
    const res = await PUT(makeRequest({ name: '管理员', username: 'taken' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('用户名已被使用');
  });
});

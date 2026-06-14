import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * /api/settings/change-password 集成测试 (I1-I6)
 *
 * 关键点：
 * - bcryptjs 的 compare/hash 通过 hoisted mock 引用同一对象，
 *   在 freshRoute 之后 mutate 也生效（vi.mock 的工厂只运行一次）。
 * - vi.resetModules() 让路由模块重新 import，但已 mock 的 bcryptjs
 *   每次拿到的是同一个 factory 返回的 mock 对象。
 */

const findUniqueMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());
const compareMock = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const hashMock = vi.hoisted(() => vi.fn().mockResolvedValue('$2a$10$mockedhashvalue1234567890'));

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

vi.mock('bcryptjs', () => ({
  default: {
    compare: compareMock,
    hash: hashMock,
  },
}));

import { auth } from '@/lib/auth';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/settings/change-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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

describe('POST /api/settings/change-password', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
    compareMock.mockReset();
    hashMock.mockReset();
    // 默认：旧密码匹配成功，hash 返回合法 bcrypt 串
    compareMock.mockResolvedValue(true);
    hashMock.mockResolvedValue('$2a$10$abcdefghijklmnopqrstuv');
  });

  it('I1: 无 session → 401', async () => {
    setSession(null);
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'old12345678',
      newPassword: 'new12345678',
      confirmPassword: 'new12345678',
    }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('未登录');
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it('I2: 缺 newPassword → 400, details.newPassword 存在', async () => {
    setSession('user-1');
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'old12345678',
      confirmPassword: 'new12345678',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('参数错误');
    expect(json.details.newPassword).toBeDefined();
  });

  it('I3: 两次密码不一致 → 400, details.confirmPassword 存在', async () => {
    setSession('user-1');
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'old12345678',
      newPassword: 'new12345678',
      confirmPassword: 'different123',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details.confirmPassword).toBeDefined();
  });

  it('I4: 新密码 6 位 → 400, details.newPassword 存在', async () => {
    setSession('user-1');
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'old12345678',
      newPassword: 'short',
      confirmPassword: 'short',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details.newPassword).toBeDefined();
  });

  it('I5: 旧密码错 → 400 { error: "原密码错误" }', async () => {
    setSession('user-1');
    findUniqueMock.mockResolvedValue({
      id: 'user-1',
      password: '$2a$10$existinghash',
    });
    compareMock.mockResolvedValueOnce(false);
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'wrongpass1',
      newPassword: 'new12345678',
      confirmPassword: 'new12345678',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('原密码错误');
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('I6: 成功 → 200, prisma.user.update 被调 1 次, password 是 bcrypt 哈希', async () => {
    setSession('user-1');
    findUniqueMock.mockResolvedValue({
      id: 'user-1',
      password: '$2a$10$existinghash',
    });
    updateMock.mockResolvedValue({ id: 'user-1' });
    compareMock.mockResolvedValue(true);
    hashMock.mockResolvedValue('$2a$10$abcdefghijklmnopqrstuv');
    const { POST } = await freshRoute();
    const res = await POST(makeRequest({
      currentPassword: 'old12345678',
      newPassword: 'new12345678',
      confirmPassword: 'new12345678',
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(updateMock).toHaveBeenCalledTimes(1);
    const callArgs = updateMock.mock.calls[0] as [
      { where: { id: string }; data: { password: string } },
    ];
    expect(callArgs[0].where.id).toBe('user-1');
    expect(callArgs[0].data.password).toMatch(/^\$2/);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { jwtCallback, sessionCallback } from "./auth-callbacks";

describe("auth — jwt callback", () => {
  it("writes user.id and user.role into token when user is provided", async () => {
    const token: Record<string, unknown> = {};
    const result = await jwtCallback({
      token,
      user: { id: "user_123", role: "admin" },
    });
    expect(result.id).toBe("user_123");
    expect(result.role).toBe("admin");
  });

  it("leaves token untouched when user is undefined (subsequent requests)", async () => {
    const token: Record<string, unknown> = { id: "existing", role: "editor" };
    const result = await jwtCallback({ token });
    expect(result.id).toBe("existing");
    expect(result.role).toBe("editor");
  });

  it("overwrites previous token values when a fresh user is provided", async () => {
    const token: Record<string, unknown> = { id: "old", role: "viewer" };
    const result = await jwtCallback({
      token,
      user: { id: "new", role: "admin" },
    });
    expect(result.id).toBe("new");
    expect(result.role).toBe("admin");
  });
});

describe("auth — session callback", () => {
  it("propagates token.id and token.role onto session.user", async () => {
    const session: { user?: Record<string, unknown> } = { user: { email: "x@y.com" } };
    const result = await sessionCallback({
      session,
      token: { id: "user_42", role: "admin" },
    });
    const user = result.user as Record<string, unknown>;
    expect(user.id).toBe("user_42");
    expect(user.role).toBe("admin");
    // original fields preserved
    expect(user.email).toBe("x@y.com");
  });

  it("does not throw when session has no user", async () => {
    const session = { user: undefined };
    const result = await sessionCallback({
      session,
      token: { id: "user_1", role: "admin" },
    });
    expect(result).toBe(session);
  });
});

describe("jwt callback — stale token migration", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("migrates stale token lacking id by looking up user by email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      role: "admin",
    } as never);

    const result = await jwtCallback({
      token: { email: "admin@lanhui.com", role: "admin" },
      user: undefined,
    });

    expect(result.id).toBe("user-1");
    expect(result.role).toBe("admin");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@lanhui.com" },
      select: { id: true, role: true },
    });
  });

  it("does not query DB when token already has id (no migration needed)", async () => {
    const result = await jwtCallback({
      token: { id: "user-1", email: "x@x.com", role: "admin" },
      user: undefined,
    });

    expect(result.id).toBe("user-1");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("silently passes through when DB lookup returns null (user deleted)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const result = await jwtCallback({
      token: { email: "deleted@x.com" },
      user: undefined,
    });

    expect(result.id).toBeUndefined();
  });

  it("falls back to sub lookup when email is absent", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-2",
      role: "editor",
    } as never);

    const result = await jwtCallback({
      token: { sub: "user-2" },
      user: undefined,
    });

    expect(result.id).toBe("user-2");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-2" },
      select: { id: true, role: true },
    });
  });
});

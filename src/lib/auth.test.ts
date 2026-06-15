import { describe, it, expect } from "vitest";
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

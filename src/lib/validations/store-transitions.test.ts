import { describe, it, expect } from "vitest";
import {
  canTransition,
  ALLOWED_TRANSITIONS,
  ACTION_TARGET,
  availableActionsFor,
  actionForTarget,
} from "./store-transitions";

describe("Store state machine", () => {
  it("allows pending→active (publish)", () => {
    expect(canTransition("pending", "active")).toBe(true);
  });
  it("allows active→suspended (suspend)", () => {
    expect(canTransition("active", "suspended")).toBe(true);
  });
  it("allows suspended→active (resume)", () => {
    expect(canTransition("suspended", "active")).toBe(true);
  });
  it("allows pending→terminated (terminate)", () => {
    expect(canTransition("pending", "terminated")).toBe(true);
  });
  it("allows suspended→terminated (terminate)", () => {
    expect(canTransition("suspended", "terminated")).toBe(true);
  });
  it("forbids active→terminated (must suspend first)", () => {
    expect(canTransition("active", "terminated")).toBe(false);
  });
  it("forbids terminated→any (terminal state)", () => {
    for (const to of ["pending", "active", "suspended", "terminated"] as const) {
      expect(canTransition("terminated", to)).toBe(false);
    }
  });
  it("forbids pending→suspended (no skip)", () => {
    expect(canTransition("pending", "suspended")).toBe(false);
  });
  it("forbids active→pending (no rollback to pending)", () => {
    expect(canTransition("active", "pending")).toBe(false);
  });
  it("ALLOWED_TRANSITIONS terminated is empty", () => {
    expect(ALLOWED_TRANSITIONS.terminated).toEqual([]);
  });
  it("ACTION_TARGET.publish is non-destructive", () => {
    expect(ACTION_TARGET.publish.destructive).toBe(false);
  });
  it("ACTION_TARGET.suspend and terminate are destructive", () => {
    expect(ACTION_TARGET.suspend.destructive).toBe(true);
    expect(ACTION_TARGET.terminate.destructive).toBe(true);
  });
});

describe("availableActionsFor", () => {
  it("pending: 允许 publish + terminate", () => {
    expect(availableActionsFor("pending").sort()).toEqual(
      ["publish", "terminate"].sort()
    );
  });
  it("active: 允许 suspend", () => {
    expect(availableActionsFor("active")).toEqual(["suspend"]);
  });
  it("suspended: 允许 resume + terminate", () => {
    expect(availableActionsFor("suspended").sort()).toEqual(
      ["resume", "terminate"].sort()
    );
  });
  it("terminated: 没有可用动作", () => {
    expect(availableActionsFor("terminated")).toEqual([]);
  });
});

describe("actionForTarget", () => {
  it("active 目标 → publish 或 resume（取第一个匹配）", () => {
    expect(actionForTarget("active")).toBeTruthy();
    expect(["publish", "resume"]).toContain(actionForTarget("active"));
  });
  it("suspended 目标 → suspend", () => {
    expect(actionForTarget("suspended")).toBe("suspend");
  });
  it("terminated 目标 → terminate", () => {
    expect(actionForTarget("terminated")).toBe("terminate");
  });
  it("pending 目标 → null（没有动作会主动把门店改回 pending）", () => {
    expect(actionForTarget("pending")).toBeNull();
  });
});

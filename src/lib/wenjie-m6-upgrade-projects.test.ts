/**
 * 问界 M6 单车型数据 — vitest 单元测试
 *
 * 验证项：
 *   1. 长度字面量（projects=17, scenarios=6, bundles=3, steps=7, faq=7）
 *   2. id 唯一
 *   3. order 单调递增 1..17
 *   4. imageStatus 全部 "pending-review"（一期）
 */

import { describe, it, expect } from "vitest";

import {
  wenjieM6UpgradeProjects,
  wenjieM6Scenarios,
  wenjieM6Bundles,
  wenjieM6ServiceSteps,
  wenjieM6Faq,
} from "./wenjie-m6-upgrade-projects";

describe("wenjie-m6-upgrade-projects: lengths (literal constraints)", () => {
  it("projects has exactly 17 entries", () => {
    expect(wenjieM6UpgradeProjects).toHaveLength(17);
  });

  it("scenarios has exactly 6 entries", () => {
    expect(wenjieM6Scenarios).toHaveLength(6);
  });

  it("bundles has exactly 3 entries", () => {
    expect(wenjieM6Bundles).toHaveLength(3);
  });

  it("service steps has exactly 7 entries", () => {
    expect(wenjieM6ServiceSteps).toHaveLength(7);
  });

  it("faq has exactly 7 entries", () => {
    expect(wenjieM6Faq).toHaveLength(7);
  });
});

describe("wenjie-m6-upgrade-projects: projects invariants", () => {
  it("all ids are unique", () => {
    const ids = wenjieM6UpgradeProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("orders are strictly increasing 1..17", () => {
    const orders = wenjieM6UpgradeProjects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
  });

  it("all imageStatus are 'pending-review' (phase 1)", () => {
    expect(
      wenjieM6UpgradeProjects.every((p) => p.imageStatus === "pending-review"),
    ).toBe(true);
  });

  it("all sourceArea are 'poster_project_matrix'", () => {
    expect(
      wenjieM6UpgradeProjects.every((p) => p.sourceArea === "poster_project_matrix"),
    ).toBe(true);
  });

  it("no project has 'tier' field (M6 is single-layer)", () => {
    for (const p of wenjieM6UpgradeProjects) {
      expect((p as { tier?: unknown }).tier).toBeUndefined();
    }
  });
});

describe("wenjie-m6-upgrade-projects: scenarios & bundles", () => {
  it("all scenario keys are unique", () => {
    const keys = wenjieM6Scenarios.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all scenario projectIds reference real project ids", () => {
    const ids = new Set(wenjieM6UpgradeProjects.map((p) => p.id));
    for (const s of wenjieM6Scenarios) {
      for (const id of s.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("all bundle keys are unique", () => {
    const keys = wenjieM6Bundles.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all bundle projectIds reference real project ids", () => {
    const ids = new Set(wenjieM6UpgradeProjects.map((p) => p.id));
    for (const b of wenjieM6Bundles) {
      for (const id of b.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });
});

describe("wenjie-m6-upgrade-projects: service steps", () => {
  it("steps are numbered 1..7 sequentially", () => {
    const steps = wenjieM6ServiceSteps.map((s) => s.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("wenjie-m6-upgrade-projects: FAQ", () => {
  it("all faq entries have non-empty question and answer", () => {
    for (const f of wenjieM6Faq) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });
});
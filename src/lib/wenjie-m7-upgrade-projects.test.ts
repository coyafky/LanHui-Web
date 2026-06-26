/**
 * 问界 M7 单车型数据 — vitest 单元测试
 *
 * 验证项：
 *   1. 长度字面量（projects=30, scenarios=7, bundles=4, steps=7, faq=8）
 *   2. tier 分桶：must_have=5 / business_upgrade=15 / practical_accessory=10
 *   3. id 唯一
 *   4. order 单调递增 1..30
 *   5. imageStatus 全部 "pending-review"（一期）
 */

import { describe, it, expect } from "vitest";

import {
  wenjieM7UpgradeProjects,
  wenjieM7MustHaveProjects,
  wenjieM7BusinessUpgradeProjects,
  wenjieM7PracticalAccessoryProjects,
  wenjieM7Scenarios,
  wenjieM7Bundles,
  wenjieM7ServiceSteps,
  wenjieM7Faq,
} from "./wenjie-m7-upgrade-projects";

describe("wenjie-m7-upgrade-projects: lengths (literal constraints)", () => {
  it("upgradeProjects has exactly 30 entries", () => {
    expect(wenjieM7UpgradeProjects).toHaveLength(30);
  });

  it("mustHave has exactly 5 entries", () => {
    expect(wenjieM7MustHaveProjects).toHaveLength(5);
  });

  it("businessUpgrade has exactly 15 entries", () => {
    expect(wenjieM7BusinessUpgradeProjects).toHaveLength(15);
  });

  it("practicalAccessory has exactly 10 entries", () => {
    expect(wenjieM7PracticalAccessoryProjects).toHaveLength(10);
  });

  it("scenarios has exactly 7 entries", () => {
    expect(wenjieM7Scenarios).toHaveLength(7);
  });

  it("bundles has exactly 4 entries", () => {
    expect(wenjieM7Bundles).toHaveLength(4);
  });

  it("service steps has exactly 7 entries", () => {
    expect(wenjieM7ServiceSteps).toHaveLength(7);
  });

  it("faq has exactly 8 entries", () => {
    expect(wenjieM7Faq).toHaveLength(8);
  });

  it("tier buckets sum to 30 (5 + 15 + 10)", () => {
    expect(
      wenjieM7MustHaveProjects.length +
        wenjieM7BusinessUpgradeProjects.length +
        wenjieM7PracticalAccessoryProjects.length,
    ).toBe(30);
  });
});

describe("wenjie-m7-upgrade-projects: projects invariants", () => {
  it("all ids are unique across all 30 projects", () => {
    const ids = wenjieM7UpgradeProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("orders are strictly increasing 1..30", () => {
    const orders = wenjieM7UpgradeProjects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("all imageStatus are 'pending-review' (phase 1)", () => {
    expect(
      wenjieM7UpgradeProjects.every((p) => p.imageStatus === "pending-review"),
    ).toBe(true);
  });

  it("must_have projects all have tier='must_have'", () => {
    expect(wenjieM7MustHaveProjects.every((p) => p.tier === "must_have")).toBe(true);
  });

  it("business_upgrade projects all have tier='business_upgrade'", () => {
    expect(
      wenjieM7BusinessUpgradeProjects.every((p) => p.tier === "business_upgrade"),
    ).toBe(true);
  });

  it("practical_accessory projects all have tier='practical_accessory'", () => {
    expect(
      wenjieM7PracticalAccessoryProjects.every((p) => p.tier === "practical_accessory"),
    ).toBe(true);
  });

  it("sourceArea matches tier (must_have ↔ poster_must_have, etc.)", () => {
    for (const p of wenjieM7MustHaveProjects) {
      expect(p.sourceArea).toBe("poster_must_have");
    }
    for (const p of wenjieM7BusinessUpgradeProjects) {
      expect(p.sourceArea).toBe("poster_business_upgrade");
    }
    for (const p of wenjieM7PracticalAccessoryProjects) {
      expect(p.sourceArea).toBe("poster_practical_accessory");
    }
  });
});

describe("wenjie-m7-upgrade-projects: scenarios & bundles", () => {
  it("all scenario keys are unique", () => {
    const keys = wenjieM7Scenarios.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all scenario projectIds reference real project ids", () => {
    const ids = new Set<string>(wenjieM7UpgradeProjects.map((p) => p.id));
    for (const s of wenjieM7Scenarios) {
      for (const id of s.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("all bundle keys are unique", () => {
    const keys = wenjieM7Bundles.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all bundle projectIds reference real project ids", () => {
    const ids = new Set<string>(wenjieM7UpgradeProjects.map((p) => p.id));
    for (const b of wenjieM7Bundles) {
      for (const id of b.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });
});

describe("wenjie-m7-upgrade-projects: service steps", () => {
  it("steps are numbered 1..7 sequentially", () => {
    const steps = wenjieM7ServiceSteps.map((s) => s.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("wenjie-m7-upgrade-projects: FAQ", () => {
  it("all faq entries have non-empty question and answer", () => {
    for (const f of wenjieM7Faq) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });
});
/**
 * 问界 M8 单车型数据 — vitest 单元测试
 *
 * 验证项：
 *   1. 长度字面量（projects=30, scenarios=6, bundles=4, steps=7, faq=8）
 *   2. tier 分桶：must_have=5 / business_upgrade=15 / practical_accessory=10
 *   3. id 唯一
 *   4. order 单调递增 1..30
 *   5. imageStatus 全部 "pending-review"（一期）
 *   6. §10 P0 电动门 caution 字段非空且包含"电动门"字样
 *   7. wenjieM8ElectricDoorProject 单条引用一致性
 */

import { describe, it, expect } from "vitest";

import {
  wenjieM8UpgradeProjects,
  wenjieM8MustHaveProjects,
  wenjieM8BusinessUpgradeProjects,
  wenjieM8PracticalAccessoryProjects,
  wenjieM8ElectricDoorProject,
  wenjieM8Scenarios,
  wenjieM8Bundles,
  wenjieM8ServiceSteps,
  wenjieM8Faq,
} from "./wenjie-m8-upgrade-projects";

describe("wenjie-m8-upgrade-projects: lengths (literal constraints)", () => {
  it("upgradeProjects has exactly 30 entries", () => {
    expect(wenjieM8UpgradeProjects).toHaveLength(30);
  });

  it("mustHave has exactly 5 entries", () => {
    expect(wenjieM8MustHaveProjects).toHaveLength(5);
  });

  it("businessUpgrade has exactly 15 entries", () => {
    expect(wenjieM8BusinessUpgradeProjects).toHaveLength(15);
  });

  it("practicalAccessory has exactly 10 entries", () => {
    expect(wenjieM8PracticalAccessoryProjects).toHaveLength(10);
  });

  it("scenarios has exactly 6 entries (no independent 'electric_convenience')", () => {
    expect(wenjieM8Scenarios).toHaveLength(6);
  });

  it("bundles has exactly 4 entries", () => {
    expect(wenjieM8Bundles).toHaveLength(4);
  });

  it("service steps has exactly 7 entries", () => {
    expect(wenjieM8ServiceSteps).toHaveLength(7);
  });

  it("faq has exactly 8 entries", () => {
    expect(wenjieM8Faq).toHaveLength(8);
  });

  it("tier buckets sum to 30 (5 + 15 + 10)", () => {
    expect(
      wenjieM8MustHaveProjects.length +
        wenjieM8BusinessUpgradeProjects.length +
        wenjieM8PracticalAccessoryProjects.length,
    ).toBe(30);
  });
});

describe("wenjie-m8-upgrade-projects: projects invariants", () => {
  it("all ids are unique across all 30 projects", () => {
    const ids = wenjieM8UpgradeProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("orders are strictly increasing 1..30", () => {
    const orders = wenjieM8UpgradeProjects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("all imageStatus are 'pending-review' (phase 1)", () => {
    expect(
      wenjieM8UpgradeProjects.every((p) => p.imageStatus === "pending-review"),
    ).toBe(true);
  });

  it("must_have projects all have tier='must_have'", () => {
    expect(wenjieM8MustHaveProjects.every((p) => p.tier === "must_have")).toBe(true);
  });

  it("business_upgrade projects all have tier='business_upgrade'", () => {
    expect(
      wenjieM8BusinessUpgradeProjects.every((p) => p.tier === "business_upgrade"),
    ).toBe(true);
  });

  it("practical_accessory projects all have tier='practical_accessory'", () => {
    expect(
      wenjieM8PracticalAccessoryProjects.every((p) => p.tier === "practical_accessory"),
    ).toBe(true);
  });

  it("sourceArea matches tier", () => {
    for (const p of wenjieM8MustHaveProjects) {
      expect(p.sourceArea).toBe("poster_must_have");
    }
    for (const p of wenjieM8BusinessUpgradeProjects) {
      expect(p.sourceArea).toBe("poster_business_upgrade");
    }
    for (const p of wenjieM8PracticalAccessoryProjects) {
      expect(p.sourceArea).toBe("poster_practical_accessory");
    }
  });
});

describe("wenjie-m8-upgrade-projects: §10 P0 electric_door caution", () => {
  it("electric_door project exists at order 10 in business tier", () => {
    const door = wenjieM8BusinessUpgradeProjects.find((p) => p.id === "m8-electric-door");
    expect(door).toBeDefined();
    expect(door?.order).toBe(10);
    expect(door?.tier).toBe("business_upgrade");
  });

  it("electric_door caution is non-empty and contains '电动门'", () => {
    const door = wenjieM8BusinessUpgradeProjects.find((p) => p.id === "m8-electric-door");
    expect(door?.caution).toBeDefined();
    expect(door?.caution?.length).toBeGreaterThan(0);
    expect(door?.caution).toContain("电动门");
  });

  it("wenjieM8ElectricDoorProject is the same object as in businessUpgrade bucket", () => {
    expect(wenjieM8ElectricDoorProject.id).toBe("m8-electric-door");
    expect(wenjieM8ElectricDoorProject.caution).toContain("电动门");
    // reference equality
    expect(wenjieM8ElectricDoorProject).toBe(
      wenjieM8BusinessUpgradeProjects[4],
    );
  });
});

describe("wenjie-m8-upgrade-projects: scenarios & bundles", () => {
  it("all scenario keys are unique", () => {
    const keys = wenjieM8Scenarios.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all scenario projectIds reference real project ids", () => {
    const ids = new Set<string>(wenjieM8UpgradeProjects.map((p) => p.id));
    for (const s of wenjieM8Scenarios) {
      for (const id of s.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("all bundle keys are unique", () => {
    const keys = wenjieM8Bundles.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all bundle projectIds reference real project ids", () => {
    const ids = new Set<string>(wenjieM8UpgradeProjects.map((p) => p.id));
    for (const b of wenjieM8Bundles) {
      for (const id of b.projectIds) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("electric_door bundle (electric-and-rear) references the project", () => {
    const electricBundle = wenjieM8Bundles.find((b) =>
      b.key.includes("electric-and-rear"),
    );
    expect(electricBundle).toBeDefined();
    expect(electricBundle?.projectIds).toContain("m8-electric-door");
  });
});

describe("wenjie-m8-upgrade-projects: service steps", () => {
  it("steps are numbered 1..7 sequentially", () => {
    const steps = wenjieM8ServiceSteps.map((s) => s.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("wenjie-m8-upgrade-projects: FAQ", () => {
  it("all faq entries have non-empty question and answer", () => {
    for (const f of wenjieM8Faq) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });

  it("FAQ contains electric_door entry", () => {
    const doorFaq = wenjieM8Faq.find((f) => f.question.includes("电动门"));
    expect(doorFaq).toBeDefined();
    // PRD §13 4th FAQ: "需要重点确认车型版本、门体结构、安装方式和施工风险"
    expect(doorFaq?.answer).toContain("车型版本");
    expect(doorFaq?.answer).toContain("门体结构");
  });
});
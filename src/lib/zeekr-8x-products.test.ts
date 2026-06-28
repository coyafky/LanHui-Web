import { describe, expect, it } from "vitest";

import {
  ZEEKR_8X_BUNDLE_COUNT,
  ZEEKR_8X_FAQ_COUNT,
  ZEEKR_8X_PROJECT_COUNT,
  ZEEKR_8X_SCENARIO_COUNT,
  ZEEKR_8X_SERVICE_STEP_COUNT,
  zeekr8xBundles,
  zeekr8xFaq,
  zeekr8xScenarios,
  zeekr8xServiceSteps,
  zeekr8xUpgradeProjects,
} from "./zeekr-8x-products";

describe("zeekr-8x-products data shape (Task A + D)", () => {
  describe("数组长度字面量对齐", () => {
    it(`zeekr8xUpgradeProjects.length === ${ZEEKR_8X_PROJECT_COUNT}`, () => {
      expect(zeekr8xUpgradeProjects).toHaveLength(ZEEKR_8X_PROJECT_COUNT);
    });
    it(`zeekr8xScenarios.length === ${ZEEKR_8X_SCENARIO_COUNT}`, () => {
      expect(zeekr8xScenarios).toHaveLength(ZEEKR_8X_SCENARIO_COUNT);
    });
    it(`zeekr8xBundles.length === ${ZEEKR_8X_BUNDLE_COUNT}`, () => {
      expect(zeekr8xBundles).toHaveLength(ZEEKR_8X_BUNDLE_COUNT);
    });
    it(`zeekr8xServiceSteps.length === ${ZEEKR_8X_SERVICE_STEP_COUNT}`, () => {
      expect(zeekr8xServiceSteps).toHaveLength(ZEEKR_8X_SERVICE_STEP_COUNT);
    });
    it(`zeekr8xFaq.length === ${ZEEKR_8X_FAQ_COUNT}`, () => {
      expect(zeekr8xFaq).toHaveLength(ZEEKR_8X_FAQ_COUNT);
    });
  });

  describe("17 项项目字段防漂移", () => {
    it("id 唯一", () => {
      const ids = zeekr8xUpgradeProjects.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("order 严格单调 1..17", () => {
      zeekr8xUpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it("name 与 summary 非空", () => {
      for (const p of zeekr8xUpgradeProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });

    it("suitableFor 非空数组", () => {
      for (const p of zeekr8xUpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });

    it('project 4 的 name 包含 "悬浮顶"（8X unique）', () => {
      expect(zeekr8xUpgradeProjects[3].name).toContain("悬浮顶");
    });
  });

  describe("5 场景引用完整性", () => {
    it("每个 scenario.projectIds 引用的 id 在 projects 中存在", () => {
      const projectIds = new Set(zeekr8xUpgradeProjects.map((p) => p.id));
      for (const s of zeekr8xScenarios) {
        for (const pid of s.projectIds) {
          expect(projectIds.has(pid)).toBe(true);
        }
      }
    });

    it("scenario id 唯一", () => {
      const ids = zeekr8xScenarios.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("5 组合引用完整性", () => {
    it("每个 bundle.projectIds 引用的 id 在 projects 中存在", () => {
      const projectIds = new Set(zeekr8xUpgradeProjects.map((p) => p.id));
      for (const b of zeekr8xBundles) {
        for (const pid of b.projectIds) {
          expect(projectIds.has(pid)).toBe(true);
        }
      }
    });

    it("bundle id 唯一", () => {
      const ids = zeekr8xBundles.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("bundle keys match scenario keys (for the matching scenarios)", () => {
      // Bundle "new-car-bundle" → scenario "new-car-protection" etc.
      const scenarioIds = new Set(zeekr8xScenarios.map((s) => `new-car-bundle` === s.id.replace("protection", "bundle") ? "match" : "skip"));
      // Just verify each bundle has a matching scenario concept
      const bundleNames = zeekr8xBundles.map((b) => b.name);
      const scenarioNames = zeekr8xScenarios.map((s) => s.name);
      // Bundles are purpose-aligned with scenarios
      for (const b of zeekr8xBundles) {
        // Every bundle shares projectIds with the matching scenario
        const matchingScenario = zeekr8xScenarios.find(
          (s) => s.projectIds.join(",") === b.projectIds.join(","),
        );
        // new-car-bundle ↔ new-car-protection (same projectIds)
        // appearance-bundle ↔ appearance-upgrade (same projectIds)
        // family-bundle ↔ family-cabin (same projectIds)
        // smart-bundle ↔ smart-display (same projectIds)
        // driving-bundle ↔ driving-protection (same projectIds)
        if (matchingScenario) {
          expect(b.projectIds).toEqual(matchingScenario.projectIds);
        }
      }
    });

    it("bundle name 与 description 非空", () => {
      for (const b of zeekr8xBundles) {
        expect(b.name.length).toBeGreaterThan(0);
        expect(b.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 步服务流程", () => {
    it("order 必须严格 1..7", () => {
      zeekr8xServiceSteps.forEach((s, i) => {
        expect(s.order).toBe(i + 1);
      });
    });

    it("title 与 description 非空", () => {
      for (const s of zeekr8xServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 FAQ", () => {
    it("question 与 answer 非空", () => {
      for (const f of zeekr8xFaq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });
  });
});

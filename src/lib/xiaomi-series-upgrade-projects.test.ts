import { describe, expect, it } from "vitest";

import {
  XIAOMI_SERIES_PROJECT_COUNT,
  XIAOMI_SERIES_SCENARIO_COUNT,
  XIAOMI_SERIES_SERVICE_STEP_COUNT,
  XIAOMI_SERIES_FAQ_COUNT,
  XIAOMI_SERIES_ULTRA_ZONE_COUNT,
  xiaomiSeriesUpgradeProjects,
  xiaomiSeriesScenarios,
  xiaomiSeriesServiceSteps,
  xiaomiSeriesFaq,
  xiaomiSeriesUltraZone,
} from "./xiaomi-series-upgrade-projects";

describe("Xiaomi Series data shape", () => {
  describe("数组长度字面量对齐", () => {
    it(`projects.length === ${XIAOMI_SERIES_PROJECT_COUNT}`, () => {
      expect(xiaomiSeriesUpgradeProjects).toHaveLength(XIAOMI_SERIES_PROJECT_COUNT);
    });
    it(`scenarios.length === ${XIAOMI_SERIES_SCENARIO_COUNT}`, () => {
      expect(xiaomiSeriesScenarios).toHaveLength(XIAOMI_SERIES_SCENARIO_COUNT);
    });
    it(`serviceSteps.length === ${XIAOMI_SERIES_SERVICE_STEP_COUNT}`, () => {
      expect(xiaomiSeriesServiceSteps).toHaveLength(XIAOMI_SERIES_SERVICE_STEP_COUNT);
    });
    it(`faq.length === ${XIAOMI_SERIES_FAQ_COUNT}`, () => {
      expect(xiaomiSeriesFaq).toHaveLength(XIAOMI_SERIES_FAQ_COUNT);
    });
    it(`ultraZone.length === ${XIAOMI_SERIES_ULTRA_ZONE_COUNT}`, () => {
      expect(xiaomiSeriesUltraZone).toHaveLength(XIAOMI_SERIES_ULTRA_ZONE_COUNT);
    });
  });

  describe("21 项项目字段防漂移", () => {
    it("id 唯一", () => {
      const ids = xiaomiSeriesUpgradeProjects.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("order 严格单调 1..21", () => {
      xiaomiSeriesUpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it('全部 imageStatus === "missing"', () => {
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(p.imageStatus).toBe("missing");
      }
    });

    it("所有项目有非空 name", () => {
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(p.name.trim().length).toBeGreaterThan(0);
      }
    });

    it("所有项目有非空 summary", () => {
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(p.summary.trim().length).toBeGreaterThan(0);
      }
    });

    it("所有项目有非空 suitableFor", () => {
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });

    it("所有项目的 sourceArea 正确", () => {
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(p.sourceArea).toBe("poster_main_list");
      }
    });

    it("category 是已知值", () => {
      const valid = ["protection", "appearance", "ultra_style", "cabin", "comfort", "convenience", "exterior_lights"] as const;
      for (const p of xiaomiSeriesUpgradeProjects) {
        expect(valid).toContain(p.category);
      }
    });
  });

  describe("7 场景数据完整性", () => {
    it("每个场景有非空 name", () => {
      for (const s of xiaomiSeriesScenarios) {
        expect(s.name.trim().length).toBeGreaterThan(0);
      }
    });

    it("每个场景引用已存在的 project id", () => {
      const validIds = new Set(xiaomiSeriesUpgradeProjects.map((p) => p.id));
      for (const s of xiaomiSeriesScenarios) {
        for (const pid of s.projectIds) {
          expect(validIds.has(pid), `scenario ${s.id} references unknown ${pid}`).toBe(true);
        }
      }
    });

    it("场景 id 唯一", () => {
      const ids = xiaomiSeriesScenarios.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("Ultra 专区完整性", () => {
    it("每个 Ultra 项目引用已存在的 project id", () => {
      const validIds = new Set(xiaomiSeriesUpgradeProjects.map((p) => p.id));
      for (const u of xiaomiSeriesUltraZone) {
        expect(validIds.has(u.projectId), `ultra references unknown ${u.projectId}`).toBe(true);
      }
    });

    it("所有 Ultra 项目属于 ultra_style category", () => {
      const ultraIds = new Set(xiaomiSeriesUltraZone.map((u) => u.projectId));
      for (const p of xiaomiSeriesUpgradeProjects) {
        if (ultraIds.has(p.id)) {
          expect(p.category).toBe("ultra_style");
        }
      }
    });

    it("每个 Ultra 项目有非空 highlight", () => {
      for (const u of xiaomiSeriesUltraZone) {
        expect(u.highlight.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 步服务流程", () => {
    it("order 严格 1..7", () => {
      xiaomiSeriesServiceSteps.forEach((s, i) => {
        expect(s.order).toBe(i + 1);
      });
    });

    it("第四步是方案确认", () => {
      expect(xiaomiSeriesServiceSteps[3].title).toBe("方案确认");
    });

    it("每步有非空 title 和 description", () => {
      for (const s of xiaomiSeriesServiceSteps) {
        expect(s.title.trim().length).toBeGreaterThan(0);
        expect(s.description.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 条 FAQ", () => {
    it("每条有非空 question 和 answer", () => {
      for (const f of xiaomiSeriesFaq) {
        expect(f.question.trim().length).toBeGreaterThan(0);
        expect(f.answer.trim().length).toBeGreaterThan(0);
      }
    });
  });
});

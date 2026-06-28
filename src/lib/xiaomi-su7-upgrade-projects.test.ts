import { describe, expect, it } from "vitest";

import {
  XIAOMI_SU7_PROJECT_COUNT,
  XIAOMI_SU7_SCENARIO_COUNT,
  XIAOMI_SU7_SERVICE_STEP_COUNT,
  XIAOMI_SU7_FAQ_COUNT,
  xiaomiSu7UpgradeProjects,
  xiaomiSu7Scenarios,
  xiaomiSu7ServiceSteps,
  xiaomiSu7Faq,
} from "./xiaomi-su7-upgrade-projects";

describe("Xiaomi SU7 data shape", () => {
  describe("数组长度字面量对齐", () => {
    it(`projects.length === ${XIAOMI_SU7_PROJECT_COUNT}`, () => {
      expect(xiaomiSu7UpgradeProjects).toHaveLength(XIAOMI_SU7_PROJECT_COUNT);
    });
    it(`scenarios.length === ${XIAOMI_SU7_SCENARIO_COUNT}`, () => {
      expect(xiaomiSu7Scenarios).toHaveLength(XIAOMI_SU7_SCENARIO_COUNT);
    });
    it(`serviceSteps.length === ${XIAOMI_SU7_SERVICE_STEP_COUNT}`, () => {
      expect(xiaomiSu7ServiceSteps).toHaveLength(XIAOMI_SU7_SERVICE_STEP_COUNT);
    });
    it(`faq.length === ${XIAOMI_SU7_FAQ_COUNT}`, () => {
      expect(xiaomiSu7Faq).toHaveLength(XIAOMI_SU7_FAQ_COUNT);
    });
  });

  describe("12 项项目字段防漂移", () => {
    it("id 唯一", () => {
      const ids = xiaomiSu7UpgradeProjects.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("order 严格单调 1..12", () => {
      xiaomiSu7UpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it('全部 imageStatus === "missing"', () => {
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(p.imageStatus).toBe("missing");
      }
    });

    it("所有项目有非空 name", () => {
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(p.name.trim().length).toBeGreaterThan(0);
      }
    });

    it("所有项目有非空 summary", () => {
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(p.summary.trim().length).toBeGreaterThan(0);
      }
    });

    it("所有项目有非空 suitableFor", () => {
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });

    it("所有项目的 sourceArea 正确", () => {
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(p.sourceArea).toBe("poster_project_matrix");
      }
    });

    it("category 是已知值", () => {
      const valid = ["cabin_protection", "chassis_protection", "exterior_parts", "film_style", "cabin_comfort", "electric_convenience", "handling"] as const;
      for (const p of xiaomiSu7UpgradeProjects) {
        expect(valid).toContain(p.category);
      }
    });
  });

  describe("5 场景数据完整性", () => {
    it("每个场景有非空 name", () => {
      for (const s of xiaomiSu7Scenarios) {
        expect(s.name.trim().length).toBeGreaterThan(0);
      }
    });

    it("每个场景引用已存在的 project id", () => {
      const validIds = new Set(xiaomiSu7UpgradeProjects.map((p) => p.id));
      for (const s of xiaomiSu7Scenarios) {
        for (const pid of s.projectIds) {
          expect(validIds.has(pid), `scenario ${s.id} references unknown ${pid}`).toBe(true);
        }
      }
    });

    it("场景 id 唯一", () => {
      const ids = xiaomiSu7Scenarios.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("6 步服务流程（无方案确认）", () => {
    it("order 严格 1..6", () => {
      xiaomiSu7ServiceSteps.forEach((s, i) => {
        expect(s.order).toBe(i + 1);
      });
    });

    it("没有方案确认步骤", () => {
      const titles = xiaomiSu7ServiceSteps.map((s) => s.title);
      expect(titles).not.toContain("方案确认");
    });

    it("每步有非空 title 和 description", () => {
      for (const s of xiaomiSu7ServiceSteps) {
        expect(s.title.trim().length).toBeGreaterThan(0);
        expect(s.description.trim().length).toBeGreaterThan(0);
      }
    });

    it("最后一步是售后支持", () => {
      expect(xiaomiSu7ServiceSteps[5].title).toBe("售后支持");
    });
  });

  describe("6 条 FAQ", () => {
    it("每条有非空 question 和 answer", () => {
      for (const f of xiaomiSu7Faq) {
        expect(f.question.trim().length).toBeGreaterThan(0);
        expect(f.answer.trim().length).toBeGreaterThan(0);
      }
    });
  });
});

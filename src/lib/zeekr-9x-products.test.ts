import { describe, expect, it } from "vitest";

import {
  ZEEKR_9X_CATEGORY_LABELS,
  ZEEKR_9X_FAQ_COUNT,
  ZEEKR_9X_PROJECT_COUNT,
  ZEEKR_9X_SCENARIO_COUNT,
  ZEEKR_9X_SERVICE_STEP_COUNT,
  zeekr9xFaq,
  zeekr9xScenarios,
  zeekr9xServiceSteps,
  zeekr9xUpgradeProjects,
  type Zeekr9xCategory,
} from "./zeekr-9x-products";

describe("Zeekr 9X data shape (Task D)", () => {
  describe("数组长度字面量对齐", () => {
    it(`zeekr9xUpgradeProjects.length === ${ZEEKR_9X_PROJECT_COUNT}`, () => {
      expect(zeekr9xUpgradeProjects).toHaveLength(ZEEKR_9X_PROJECT_COUNT);
    });
    it(`zeekr9xScenarios.length === ${ZEEKR_9X_SCENARIO_COUNT}`, () => {
      expect(zeekr9xScenarios).toHaveLength(ZEEKR_9X_SCENARIO_COUNT);
    });
    it(`zeekr9xServiceSteps.length === ${ZEEKR_9X_SERVICE_STEP_COUNT}`, () => {
      expect(zeekr9xServiceSteps).toHaveLength(ZEEKR_9X_SERVICE_STEP_COUNT);
    });
    it(`zeekr9xFaq.length === ${ZEEKR_9X_FAQ_COUNT}`, () => {
      expect(zeekr9xFaq).toHaveLength(ZEEKR_9X_FAQ_COUNT);
    });
  });

  describe("18 项项目字段防漂移", () => {
    it("id 唯一", () => {
      const ids = zeekr9xUpgradeProjects.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("order 严格单调 1..18", () => {
      zeekr9xUpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it('全部 imageStatus === "pending-review"', () => {
      for (const p of zeekr9xUpgradeProjects) {
        expect(p.imageStatus).toBe("pending-review");
      }
    });

    it("没有 generated-preview 状态（9X 不使用）", () => {
      for (const p of zeekr9xUpgradeProjects) {
        expect(p.imageStatus).not.toBe("generated-preview");
      }
    });

    it('全部 sourceArea === "poster_project_matrix"', () => {
      for (const p of zeekr9xUpgradeProjects) {
        expect(p.sourceArea).toBe("poster_project_matrix");
      }
    });

    it("name 与 summary 非空", () => {
      for (const p of zeekr9xUpgradeProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });

    it("suitableFor 非空数组", () => {
      for (const p of zeekr9xUpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });
  });

  describe("5 场景引用完整性", () => {
    it("每个 scenario.projectIds 引用的 id 在 projects 中存在", () => {
      const projectIds = new Set(zeekr9xUpgradeProjects.map((p) => p.id));
      for (const s of zeekr9xScenarios) {
        for (const pid of s.projectIds) {
          expect(projectIds.has(pid)).toBe(true);
        }
      }
    });

    it("scenario id 唯一", () => {
      const ids = zeekr9xScenarios.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("scenario name 与 description 非空", () => {
      for (const s of zeekr9xScenarios) {
        expect(s.name.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("6 步服务流程", () => {
    it("order 必须严格 1..6", () => {
      zeekr9xServiceSteps.forEach((s, i) => {
        expect(s.order).toBe(i + 1);
      });
    });

    it("title 与 description 非空", () => {
      for (const s of zeekr9xServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("6 FAQ", () => {
    it("question 与 answer 非空", () => {
      for (const f of zeekr9xFaq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });
  });

  describe("category labels 覆盖全部 7 个分类", () => {
    it("ZEEKR_9X_CATEGORY_LABELS 包含所有 7 个 category", () => {
      const allCategories: readonly Zeekr9xCategory[] = [
        "paint_protection",
        "film_style",
        "chassis_protection",
        "cabin_protection",
        "exterior_parts",
        "infotainment",
        "handling",
      ];
      for (const cat of allCategories) {
        expect(ZEEKR_9X_CATEGORY_LABELS[cat]).toBeDefined();
        expect(ZEEKR_9X_CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
      }
    });

    it("没有多余的 category label", () => {
      const allCategories = new Set<Zeekr9xCategory>([
        "paint_protection",
        "film_style",
        "chassis_protection",
        "cabin_protection",
        "exterior_parts",
        "infotainment",
        "handling",
      ]);
      const labelKeys = Object.keys(ZEEKR_9X_CATEGORY_LABELS);
      expect(labelKeys.length).toBe(allCategories.size);
      for (const key of labelKeys) {
        expect(allCategories.has(key as Zeekr9xCategory)).toBe(true);
      }
    });
  });

  describe("没有 bundles 导出（9X 无推荐组合）", () => {
    it("未导出 zeekr9xBundles", async () => {
      // 动态 import 确认没有 bundles 相关导出
      const mod = await import("./zeekr-9x-products");
      expect((mod as Record<string, unknown>).zeekr9xBundles).toBeUndefined();
    });
  });
});

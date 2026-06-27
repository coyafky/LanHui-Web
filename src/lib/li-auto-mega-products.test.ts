import { describe, expect, it } from "vitest";

import {
  CATEGORY_LABELS,
  LI_AUTO_MEGA_BUNDLE_COUNT,
  LI_AUTO_MEGA_FAQ_COUNT,
  LI_AUTO_MEGA_PROJECT_COUNT,
  LI_AUTO_MEGA_SCENARIO_COUNT,
  LI_AUTO_MEGA_SERVICE_STEP_COUNT,
  liAutoMegaBundles,
  liAutoMegaFaq,
  liAutoMegaScenarios,
  liAutoMegaServiceSteps,
  liAutoMegaUpgradeProjects,
} from "./li-auto-mega-products";

describe("li-auto-mega-products data shape (B.1)", () => {
  describe("数组长度字面量对齐", () => {
    it(`liAutoMegaUpgradeProjects.length === ${LI_AUTO_MEGA_PROJECT_COUNT}`, () => {
      expect(liAutoMegaUpgradeProjects).toHaveLength(LI_AUTO_MEGA_PROJECT_COUNT);
    });
    it(`liAutoMegaScenarios.length === ${LI_AUTO_MEGA_SCENARIO_COUNT}`, () => {
      expect(liAutoMegaScenarios).toHaveLength(LI_AUTO_MEGA_SCENARIO_COUNT);
    });
    it(`liAutoMegaBundles.length === ${LI_AUTO_MEGA_BUNDLE_COUNT}`, () => {
      expect(liAutoMegaBundles).toHaveLength(LI_AUTO_MEGA_BUNDLE_COUNT);
    });
    it(`liAutoMegaServiceSteps.length === ${LI_AUTO_MEGA_SERVICE_STEP_COUNT}`, () => {
      expect(liAutoMegaServiceSteps).toHaveLength(LI_AUTO_MEGA_SERVICE_STEP_COUNT);
    });
    it(`liAutoMegaFaq.length === ${LI_AUTO_MEGA_FAQ_COUNT}`, () => {
      expect(liAutoMegaFaq).toHaveLength(LI_AUTO_MEGA_FAQ_COUNT);
    });
  });

  describe("18 项项目字段防漂移", () => {
    it("key 唯一", () => {
      const keys = liAutoMegaUpgradeProjects.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("order 严格单调 1..18", () => {
      liAutoMegaUpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it("全部 imageStatus === \"pending-review\"", () => {
      for (const p of liAutoMegaUpgradeProjects) {
        expect(p.imageStatus).toBe("pending-review");
      }
    });

    it("全部未设置 publicPath（当前无实际图片）", () => {
      for (const p of liAutoMegaUpgradeProjects) {
        expect(p.publicPath).toBeUndefined();
      }
    });

    it("name 与 summary 非空", () => {
      for (const p of liAutoMegaUpgradeProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });

    it("suitableFor 非空数组", () => {
      for (const p of liAutoMegaUpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });
  });

  describe("5 场景引用完整性", () => {
    it("每个 scenario.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(liAutoMegaUpgradeProjects.map((p) => p.key));
      for (const s of liAutoMegaScenarios) {
        for (const pk of s.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("scenario key 唯一", () => {
      const keys = liAutoMegaScenarios.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("name 与 description 非空", () => {
      for (const s of liAutoMegaScenarios) {
        expect(s.name.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("5 组合引用完整性", () => {
    it("每个 bundle.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(liAutoMegaUpgradeProjects.map((p) => p.key));
      for (const b of liAutoMegaBundles) {
        for (const pk of b.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("bundle key 唯一", () => {
      const keys = liAutoMegaBundles.map((b) => b.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("name 与 description 非空", () => {
      for (const b of liAutoMegaBundles) {
        expect(b.name.length).toBeGreaterThan(0);
        expect(b.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 步服务流程", () => {
    it("step 必须严格 1..7", () => {
      liAutoMegaServiceSteps.forEach((s, i) => {
        expect(s.step).toBe(i + 1);
      });
    });

    it("title 与 description 非空", () => {
      for (const s of liAutoMegaServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("9 FAQ", () => {
    it("question 与 answer 非空", () => {
      for (const f of liAutoMegaFaq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });
  });

  describe("CATEGORY_LABELS 覆盖", () => {
    it("所有出现的 category 都有中文标签", () => {
      const usedCategories = new Set(
        liAutoMegaUpgradeProjects.map((p) => p.category),
      );
      const labeledCategories = new Set(
        Object.keys(CATEGORY_LABELS) as string[],
      );
      for (const cat of usedCategories) {
        expect(labeledCategories.has(cat)).toBe(true);
        expect(CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS].length).toBeGreaterThan(0);
      }
    });

    it("CATEGORY_LABELS 包含全部 9 个类别", () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(9);
    });
  });

  describe("每个项目至少在一个场景中", () => {
    it("所有项目的 key 至少被一个 scenario 引用", () => {
      const referencedKeys = new Set<string>();
      for (const s of liAutoMegaScenarios) {
        for (const pk of s.projectKeys) {
          referencedKeys.add(pk);
        }
      }
      for (const p of liAutoMegaUpgradeProjects) {
        expect(referencedKeys.has(p.key)).toBe(true);
      }
    });
  });

  describe("caution 红线词检查", () => {
    const RED_LINE_WORDS = ["官方", "原厂", "质保承诺"];

    it("所有 caution 字段不含红线词", () => {
      const cautionProjects = liAutoMegaUpgradeProjects.filter((p) => p.caution);
      for (const p of cautionProjects) {
        for (const word of RED_LINE_WORDS) {
          expect(
            p.caution?.includes(word),
            `project "${p.key}" caution contains red-line word "${word}"`,
          ).toBe(false);
        }
      }
    });
  });
});

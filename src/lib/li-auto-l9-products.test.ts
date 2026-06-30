import { describe, expect, it } from "vitest";

import {
  CATEGORY_LABELS,
  LI_AUTO_L9_BUNDLE_COUNT,
  LI_AUTO_L9_FAQ_COUNT,
  LI_AUTO_L9_PROJECT_COUNT,
  LI_AUTO_L9_SCENARIO_COUNT,
  LI_AUTO_L9_SERVICE_STEP_COUNT,
  liAutoL9Bundles,
  liAutoL9Faq,
  liAutoL9Scenarios,
  liAutoL9ServiceSteps,
  liAutoL9UpgradeProjects,
} from "./li-auto-l9-products";

describe("li-auto-l9-products data shape (B.1)", () => {
  describe("数组长度字面量对齐", () => {
    it(`liAutoL9UpgradeProjects.length === ${LI_AUTO_L9_PROJECT_COUNT}`, () => {
      expect(liAutoL9UpgradeProjects).toHaveLength(LI_AUTO_L9_PROJECT_COUNT);
    });
    it(`liAutoL9Scenarios.length === ${LI_AUTO_L9_SCENARIO_COUNT}`, () => {
      expect(liAutoL9Scenarios).toHaveLength(LI_AUTO_L9_SCENARIO_COUNT);
    });
    it(`liAutoL9Bundles.length === ${LI_AUTO_L9_BUNDLE_COUNT}`, () => {
      expect(liAutoL9Bundles).toHaveLength(LI_AUTO_L9_BUNDLE_COUNT);
    });
    it(`liAutoL9ServiceSteps.length === ${LI_AUTO_L9_SERVICE_STEP_COUNT}`, () => {
      expect(liAutoL9ServiceSteps).toHaveLength(LI_AUTO_L9_SERVICE_STEP_COUNT);
    });
    it(`liAutoL9Faq.length === ${LI_AUTO_L9_FAQ_COUNT}`, () => {
      expect(liAutoL9Faq).toHaveLength(LI_AUTO_L9_FAQ_COUNT);
    });
  });

  describe("14 项项目字段防漂移", () => {
    it("key 唯一", () => {
      const keys = liAutoL9UpgradeProjects.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("order 严格单调 1..14", () => {
      liAutoL9UpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it("全部 imageStatus === \"generated-preview\"", () => {
      for (const p of liAutoL9UpgradeProjects) {
        expect(p.imageStatus).toBe("generated-preview");
      }
    });

    it("全部设置了 publicPath（AI 生成预览图）", () => {
      for (const p of liAutoL9UpgradeProjects) {
        expect(p.publicPath).toBeDefined();
        expect(p.publicPath).toMatch(/^\/images\/products\/li-auto\/l9\/generated\/.+\.png$/);
      }
    });

    it("name 与 summary 非空", () => {
      for (const p of liAutoL9UpgradeProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });

    it("suitableFor 非空数组", () => {
      for (const p of liAutoL9UpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });
  });

  describe("5 场景引用完整性", () => {
    it("每个 scenario.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(liAutoL9UpgradeProjects.map((p) => p.key));
      for (const s of liAutoL9Scenarios) {
        for (const pk of s.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("scenario key 唯一", () => {
      const keys = liAutoL9Scenarios.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("name 与 description 非空", () => {
      for (const s of liAutoL9Scenarios) {
        expect(s.name.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("4 组合引用完整性", () => {
    it("每个 bundle.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(liAutoL9UpgradeProjects.map((p) => p.key));
      for (const b of liAutoL9Bundles) {
        for (const pk of b.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("bundle key 唯一", () => {
      const keys = liAutoL9Bundles.map((b) => b.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("name 与 description 非空", () => {
      for (const b of liAutoL9Bundles) {
        expect(b.name.length).toBeGreaterThan(0);
        expect(b.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 步服务流程", () => {
    it("step 必须严格 1..7", () => {
      liAutoL9ServiceSteps.forEach((s, i) => {
        expect(s.step).toBe(i + 1);
      });
    });

    it("title 与 description 非空", () => {
      for (const s of liAutoL9ServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("9 FAQ", () => {
    it("question 与 answer 非空", () => {
      for (const f of liAutoL9Faq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });

    it("FAQ 中包含「图片是真实施工案例吗」澄清 pending-review 状态", () => {
      const hasImageStatusFaq = liAutoL9Faq.some(
        (f) =>
          f.question.includes("图片") &&
          (f.answer.includes("施工图片") || f.answer.includes("暂无")),
      );
      expect(hasImageStatusFaq).toBe(true);
    });
  });

  describe("CATEGORY_LABELS 覆盖", () => {
    it("所有出现的 category 都有中文标签", () => {
      const usedCategories = new Set(
        liAutoL9UpgradeProjects.map((p) => p.category),
      );
      const labeledCategories = new Set(
        Object.keys(CATEGORY_LABELS) as string[],
      );
      for (const cat of usedCategories) {
        expect(labeledCategories.has(cat)).toBe(true);
        expect(CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS].length).toBeGreaterThan(0);
      }
    });

    it("CATEGORY_LABELS 包含全部 8 个类别", () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(8);
    });
  });

  describe("每个项目至少在一个场景中", () => {
    it("所有项目的 key 至少被一个 scenario 引用", () => {
      const referencedKeys = new Set<string>();
      for (const s of liAutoL9Scenarios) {
        for (const pk of s.projectKeys) {
          referencedKeys.add(pk);
        }
      }
      for (const p of liAutoL9UpgradeProjects) {
        expect(referencedKeys.has(p.key)).toBe(true);
      }
    });
  });
});

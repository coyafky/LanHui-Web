import { describe, expect, it } from "vitest";
import {
  teslaFeaturedProjects,
  teslaOptionalProjects,
  teslaScenarios,
  teslaServiceSteps,
  teslaFaq,
  TESLA_CATEGORY_LABELS,
} from "./tesla-products";

describe("tesla-products data shape", () => {
  describe("featured projects (PRD §7: 10 项)", () => {
    it("长度必须为 10", () => {
      expect(teslaFeaturedProjects).toHaveLength(10);
    });
    it("key 唯一", () => {
      const keys = teslaFeaturedProjects.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
    it("priority 必须为 featured", () => {
      for (const p of teslaFeaturedProjects) {
        expect(p.priority).toBe("featured");
      }
    });
    it("order 单调递增 1..10", () => {
      teslaFeaturedProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });
    it("imageStatus 全部 pending-review", () => {
      for (const p of teslaFeaturedProjects) {
        expect(p.imageStatus).toBe("pending-review");
      }
    });
  });

  describe("optional projects (PRD §9.1: 32 项)", () => {
    it("长度必须为 32", () => {
      expect(teslaOptionalProjects).toHaveLength(32);
    });
    it("key 唯一", () => {
      const keys = teslaOptionalProjects.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
    it("priority 必须为 optional", () => {
      for (const p of teslaOptionalProjects) {
        expect(p.priority).toBe("optional");
      }
    });
    it("order 单调递增 11..42", () => {
      teslaOptionalProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 11);
      });
    });
    it("featured + optional 跨表 key 不重复", () => {
      const allKeys = [
        ...teslaFeaturedProjects.map((p) => p.key),
        ...teslaOptionalProjects.map((p) => p.key),
      ];
      expect(new Set(allKeys).size).toBe(allKeys.length);
    });
  });

  describe("category 字段白名单", () => {
    const VALID_CATEGORIES = [
      "paint_protection",
      "film_style",
      "chassis_protection",
      "cabin_comfort",
      "electric_convenience",
      "infotainment",
      "exterior_parts",
      "storage_accessory",
    ] as const;

    it("所有 project category 在白名单内", () => {
      const all = [...teslaFeaturedProjects, ...teslaOptionalProjects];
      for (const p of all) {
        expect(VALID_CATEGORIES).toContain(p.category);
      }
    });
  });

  describe("imageStatus 字段白名单", () => {
    it("所有 project imageStatus 在白名单内", () => {
      const all = [...teslaFeaturedProjects, ...teslaOptionalProjects];
      for (const p of all) {
        expect(["matched", "pending-review", "missing"]).toContain(p.imageStatus);
      }
    });
  });

  describe("scenarios (PRD §8: 6 场景)", () => {
    it("长度必须为 6", () => {
      expect(teslaScenarios).toHaveLength(6);
    });
    it("key 唯一", () => {
      const keys = teslaScenarios.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
    it("scenario key 不与 project key 冲突", () => {
      const projectKeys = new Set([
        ...teslaFeaturedProjects.map((p) => p.key),
        ...teslaOptionalProjects.map((p) => p.key),
      ]);
      for (const s of teslaScenarios) {
        expect(projectKeys.has(s.key)).toBe(false);
      }
    });
    it("每个 scenario.projectKeys 必须引用存在的 project", () => {
      const allKeys = new Set([
        ...teslaFeaturedProjects.map((p) => p.key),
        ...teslaOptionalProjects.map((p) => p.key),
      ]);
      for (const s of teslaScenarios) {
        for (const pk of s.projectKeys) {
          expect(allKeys.has(pk)).toBe(true);
        }
      }
    });
    it("每个 featured 至少被一个 scenario 引用", () => {
      const referenced = new Set<string>();
      for (const s of teslaScenarios) {
        for (const pk of s.projectKeys) {
          referenced.add(pk);
        }
      }
      for (const p of teslaFeaturedProjects) {
        expect(referenced.has(p.key)).toBe(true);
      }
    });
  });

  describe("service steps (PRD §11: 6 步)", () => {
    it("长度必须为 6", () => {
      expect(teslaServiceSteps).toHaveLength(6);
    });
    it("step 必须 1..6", () => {
      teslaServiceSteps.forEach((s, i) => {
        expect(s.step).toBe(i + 1);
      });
    });
    it("title 与 description 非空", () => {
      for (const s of teslaServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("faq (PRD §12: 5 条)", () => {
    it("长度必须为 5", () => {
      expect(teslaFaq).toHaveLength(5);
    });
    it("question 非空", () => {
      for (const f of teslaFaq) {
        expect(f.question.length).toBeGreaterThan(0);
      }
    });
    it("answer 非空", () => {
      for (const f of teslaFaq) {
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });
  });

  describe("类别中文标签", () => {
    it("TESLA_CATEGORY_LABELS 必须有 8 项", () => {
      expect(Object.keys(TESLA_CATEGORY_LABELS)).toHaveLength(8);
    });
    it("每个标签非空", () => {
      for (const [, label] of Object.entries(TESLA_CATEGORY_LABELS)) {
        expect(label.length).toBeGreaterThan(0);
      }
    });
    it("覆盖 8 个白名单 category", () => {
      const VALID_CATEGORIES = [
        "paint_protection",
        "film_style",
        "chassis_protection",
        "cabin_comfort",
        "electric_convenience",
        "infotainment",
        "exterior_parts",
        "storage_accessory",
      ] as const;
      for (const c of VALID_CATEGORIES) {
        expect(TESLA_CATEGORY_LABELS[c]).toBeDefined();
      }
    });
  });

  describe("summary 与 name 非空", () => {
    it("featured project name 与 summary 非空", () => {
      for (const p of teslaFeaturedProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });
    it("optional project name 与 summary 非空", () => {
      for (const p of teslaOptionalProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
      }
    });
  });
});

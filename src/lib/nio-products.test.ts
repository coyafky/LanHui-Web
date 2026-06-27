import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  NIO_ES8_BUNDLE_COUNT,
  NIO_ES8_FAQ_COUNT,
  NIO_ES8_PROJECT_COUNT,
  NIO_ES8_SCENARIO_COUNT,
  NIO_ES8_SERVICE_STEP_COUNT,
  nioEs8Bundles,
  nioEs8Faq,
  nioEs8Scenarios,
  nioEs8ServiceSteps,
  nioEs8UpgradeProjects,
} from "./nio-products";

describe("nio-products data shape (B.1 + F.1)", () => {
  describe("数组长度字面量对齐", () => {
    it(`nioEs8UpgradeProjects.length === ${NIO_ES8_PROJECT_COUNT}`, () => {
      expect(nioEs8UpgradeProjects).toHaveLength(NIO_ES8_PROJECT_COUNT);
    });
    it(`nioEs8Scenarios.length === ${NIO_ES8_SCENARIO_COUNT}`, () => {
      expect(nioEs8Scenarios).toHaveLength(NIO_ES8_SCENARIO_COUNT);
    });
    it(`nioEs8Bundles.length === ${NIO_ES8_BUNDLE_COUNT}`, () => {
      expect(nioEs8Bundles).toHaveLength(NIO_ES8_BUNDLE_COUNT);
    });
    it(`nioEs8ServiceSteps.length === ${NIO_ES8_SERVICE_STEP_COUNT}`, () => {
      expect(nioEs8ServiceSteps).toHaveLength(NIO_ES8_SERVICE_STEP_COUNT);
    });
    it(`nioEs8Faq.length === ${NIO_ES8_FAQ_COUNT}`, () => {
      expect(nioEs8Faq).toHaveLength(NIO_ES8_FAQ_COUNT);
    });
  });

  describe("17 项项目字段防漂移", () => {
    it("key 唯一", () => {
      const keys = nioEs8UpgradeProjects.map((p) => p.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("order 严格单调 1..17", () => {
      nioEs8UpgradeProjects.forEach((p, i) => {
        expect(p.order).toBe(i + 1);
      });
    });

    it("全部 imageStatus === \"generated-preview\"", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.imageStatus).toBe("generated-preview");
      }
    });

    it("全部 width === 1448（字面量）", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.width).toBe(1448);
      }
    });

    it("全部 height === 1086（字面量）", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.height).toBe(1086);
      }
    });

    it('全部 aspectRatio === "4/3"（字面量）', () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.aspectRatio).toBe("4/3");
      }
    });

    it("publicPath 全部以 /images/products/nio-es8/generated/ 开头", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.publicPath.startsWith("/images/products/nio-es8/generated/")).toBe(true);
        expect(p.publicPath.endsWith(".png")).toBe(true);
      }
    });

    it("publicPath 对应文件实际存在于 public/", () => {
      for (const p of nioEs8UpgradeProjects) {
        // /images/products/nio-es8/generated/foo.png → public/images/products/nio-es8/generated/foo.png
        const relative = p.publicPath.replace(/^\//, "");
        const absolute = join(process.cwd(), "public", relative);
        expect(existsSync(absolute)).toBe(true);
      }
    });

    it("name 与 summary 非空", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
        expect(p.promptSummary.length).toBeGreaterThan(0);
      }
    });

    it("suitableFor 非空数组", () => {
      for (const p of nioEs8UpgradeProjects) {
        expect(p.suitableFor.length).toBeGreaterThan(0);
      }
    });
  });

  describe("4 场景引用完整性", () => {
    it("每个 scenario.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(nioEs8UpgradeProjects.map((p) => p.key));
      for (const s of nioEs8Scenarios) {
        for (const pk of s.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("scenario key 唯一", () => {
      const keys = nioEs8Scenarios.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe("4 组合引用完整性", () => {
    it("每个 bundle.projectKeys 引用的 key 在 projects 中存在", () => {
      const projectKeys = new Set(nioEs8UpgradeProjects.map((p) => p.key));
      for (const b of nioEs8Bundles) {
        for (const pk of b.projectKeys) {
          expect(projectKeys.has(pk)).toBe(true);
        }
      }
    });

    it("bundle key 唯一", () => {
      const keys = nioEs8Bundles.map((b) => b.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("bundle name 与 description 非空", () => {
      for (const b of nioEs8Bundles) {
        expect(b.name.length).toBeGreaterThan(0);
        expect(b.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("7 步服务流程", () => {
    it("step 必须严格 1..7", () => {
      nioEs8ServiceSteps.forEach((s, i) => {
        expect(s.step).toBe(i + 1);
      });
    });

    it("title 与 description 非空", () => {
      for (const s of nioEs8ServiceSteps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("9 FAQ", () => {
    it("question 与 answer 非空", () => {
      for (const f of nioEs8Faq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    });

    it("FAQ 中包含「图片是真实施工案例吗」澄清 generated-preview 状态", () => {
      const hasImageStatusFaq = nioEs8Faq.some(
        (f) =>
          f.question.includes("图片") &&
          (f.answer.includes("AI") || f.answer.includes("generated-preview")),
      );
      expect(hasImageStatusFaq).toBe(true);
    });
  });
});
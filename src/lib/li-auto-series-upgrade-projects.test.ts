/**
 * 理想系列项目升级方案（一级）数据 — vitest 单元测试
 *
 * 验证项：
 *   1. 长度字面量（featured=10, optional=30, scenarios=6, steps=6, faq=6）
 *   2. key 唯一
 *   3. order 单调递增
 *   4. imageStatus 全部 "pending-review"（一期）
 */

import { describe, it, expect } from "vitest";

import {
  liAutoSeriesFeaturedProjects,
  liAutoSeriesOptionalProjects,
  liAutoSeriesScenarios,
  liAutoSeriesServiceSteps,
  liAutoSeriesFaq,
} from "./li-auto-series-upgrade-projects";

describe("li-auto-series-upgrade-projects: lengths (literal constraints)", () => {
  it("featured has exactly 10 projects", () => {
    expect(liAutoSeriesFeaturedProjects).toHaveLength(10);
  });

  it("optional has exactly 30 projects", () => {
    expect(liAutoSeriesOptionalProjects).toHaveLength(30);
  });

  it("scenarios has exactly 6 entries", () => {
    expect(liAutoSeriesScenarios).toHaveLength(6);
  });

  it("service steps has exactly 6 entries", () => {
    expect(liAutoSeriesServiceSteps).toHaveLength(6);
  });

  it("faq has exactly 6 entries", () => {
    expect(liAutoSeriesFaq).toHaveLength(6);
  });
});

describe("li-auto-series-upgrade-projects: featured projects invariants", () => {
  it("all featured keys are unique", () => {
    const keys = liAutoSeriesFeaturedProjects.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all featured orders are strictly increasing 1..10", () => {
    const orders = liAutoSeriesFeaturedProjects.map((p) => p.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("all featured priorities are 'featured'", () => {
    expect(
      liAutoSeriesFeaturedProjects.every((p) => p.priority === "featured"),
    ).toBe(true);
  });

  it("all featured imageStatus are 'pending-review'", () => {
    expect(
      liAutoSeriesFeaturedProjects.every((p) => p.imageStatus === "pending-review"),
    ).toBe(true);
  });
});

describe("li-auto-series-upgrade-projects: optional projects invariants", () => {
  it("all optional keys are unique", () => {
    const keys = liAutoSeriesOptionalProjects.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all optional orders are strictly increasing 11..40", () => {
    const orders = liAutoSeriesOptionalProjects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 30 }, (_, i) => i + 11));
  });

  it("all optional priorities are 'optional'", () => {
    expect(
      liAutoSeriesOptionalProjects.every((p) => p.priority === "optional"),
    ).toBe(true);
  });

  it("all optional imageStatus are 'pending-review'", () => {
    expect(
      liAutoSeriesOptionalProjects.every((p) => p.imageStatus === "pending-review"),
    ).toBe(true);
  });

  it("featured and optional keys do not collide", () => {
    const featuredKeys = new Set<string>(
      liAutoSeriesFeaturedProjects.map((p) => p.key),
    );
    for (const p of liAutoSeriesOptionalProjects) {
      expect(featuredKeys.has(p.key)).toBe(false);
    }
  });
});

describe("li-auto-series-upgrade-projects: scenarios invariants", () => {
  it("all scenario keys are unique", () => {
    const keys = liAutoSeriesScenarios.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("scenario projectKeys all reference existing projects", () => {
    const allKeys = new Set<string>([
      ...liAutoSeriesFeaturedProjects.map((p) => p.key),
      ...liAutoSeriesOptionalProjects.map((p) => p.key),
    ]);
    for (const scenario of liAutoSeriesScenarios) {
      for (const pk of scenario.projectKeys) {
        expect(allKeys.has(pk), `scenario "${scenario.key}" references "${pk}"`).toBe(true);
      }
    }
  });
});

describe("li-auto-series-upgrade-projects: service steps invariants", () => {
  it("all service steps are strictly increasing 1..6", () => {
    const steps = liAutoSeriesServiceSteps.map((s) => s.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("li-auto-series-upgrade-projects: FAQ invariants", () => {
  it("all FAQ questions are unique", () => {
    const questions = liAutoSeriesFaq.map((f) => f.question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});

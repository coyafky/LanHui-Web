/**
 * 问界系列项目升级方案（一级）数据 — vitest 单元测试
 *
 * 验证项：
 *   1. 长度字面量（featured=10, optional=24, scenarios=7, steps=6, faq=6）
 *   2. key 唯一
 *   3. order 单调递增
 *   4. imageStatus 全部 "generated-preview"（一期）
 */

import { describe, it, expect } from "vitest";

import {
  wenjieSeriesFeaturedProjects,
  wenjieSeriesOptionalProjects,
  wenjieSeriesScenarios,
  wenjieSeriesServiceSteps,
  wenjieSeriesFaq,
} from "./wenjie-series-upgrade-projects";

describe("wenjie-series-upgrade-projects: lengths (literal constraints)", () => {
  it("featured has exactly 10 projects", () => {
    expect(wenjieSeriesFeaturedProjects).toHaveLength(10);
  });

  it("optional has exactly 24 projects", () => {
    expect(wenjieSeriesOptionalProjects).toHaveLength(24);
  });

  it("scenarios has exactly 7 entries", () => {
    expect(wenjieSeriesScenarios).toHaveLength(7);
  });

  it("service steps has exactly 6 entries", () => {
    expect(wenjieSeriesServiceSteps).toHaveLength(6);
  });

  it("faq has exactly 6 entries", () => {
    expect(wenjieSeriesFaq).toHaveLength(6);
  });
});

describe("wenjie-series-upgrade-projects: featured projects invariants", () => {
  it("all featured keys are unique", () => {
    const keys = wenjieSeriesFeaturedProjects.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all featured orders are strictly increasing 1..10", () => {
    const orders = wenjieSeriesFeaturedProjects.map((p) => p.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("all featured priorities are 'featured'", () => {
    expect(
      wenjieSeriesFeaturedProjects.every((p) => p.priority === "featured"),
    ).toBe(true);
  });

  it("all featured imageStatus are 'generated-preview'", () => {
    expect(
      wenjieSeriesFeaturedProjects.every((p) => p.imageStatus === "generated-preview"),
    ).toBe(true);
  });
});

describe("wenjie-series-upgrade-projects: optional projects invariants", () => {
  it("all optional keys are unique", () => {
    const keys = wenjieSeriesOptionalProjects.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all optional orders are strictly increasing 11..34", () => {
    const orders = wenjieSeriesOptionalProjects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 24 }, (_, i) => i + 11));
  });

  it("all optional priorities are 'optional'", () => {
    expect(
      wenjieSeriesOptionalProjects.every((p) => p.priority === "optional"),
    ).toBe(true);
  });

  it("all optional imageStatus are 'generated-preview'", () => {
    expect(
      wenjieSeriesOptionalProjects.every((p) => p.imageStatus === "generated-preview"),
    ).toBe(true);
  });

  it("all projects have generated public preview images", () => {
    for (const p of [...wenjieSeriesFeaturedProjects, ...wenjieSeriesOptionalProjects]) {
      expect(p.image.publicPath).toBeNull();
      expect(p.image.width).toBe(1448);
      expect(p.image.height).toBe(1086);
      expect(p.image.aspectRatio).toBe("4/3");
    }
  });

  it("featured and optional keys do not collide", () => {
    const featuredKeys = new Set<string>(
      wenjieSeriesFeaturedProjects.map((p) => p.key),
    );
    for (const p of wenjieSeriesOptionalProjects) {
      expect(featuredKeys.has(p.key)).toBe(false);
    }
  });
});

describe("wenjie-series-upgrade-projects: scenarios", () => {
  it("all scenario keys are unique", () => {
    const keys = wenjieSeriesScenarios.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("wenjie-series-upgrade-projects: service steps", () => {
  it("steps are numbered 1..6 sequentially", () => {
    const steps = wenjieSeriesServiceSteps.map((s) => s.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("wenjie-series-upgrade-projects: FAQ", () => {
  it("all faq entries have non-empty question and answer", () => {
    for (const f of wenjieSeriesFaq) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from "vitest";
import { toBaseSlug, generateStoreSlug } from "./store-slug";

describe("toBaseSlug", () => {
  it("纯中文转拼音", () => {
    expect(toBaseSlug("顺德大良店")).toBe("shun-de-da-liang-dian");
  });

  it("中英混合保留英文", () => {
    const result = toBaseSlug("LANHUI 顺德店");
    expect(result).toContain("lanhui");
    expect(result).toContain("shun");
  });

  it("纯英文保留", () => {
    expect(toBaseSlug("LANHUI Shunde")).toBe("lanhui-shunde");
  });

  it("特殊字符处理", () => {
    const result = toBaseSlug("店 / 测试 & 演示");
    expect(result).not.toContain("/");
    expect(result).not.toContain("&");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  it("全特殊字符 fallback cuid", () => {
    const result = toBaseSlug("！@#$%");
    expect(result).toMatch(/^[a-z0-9]+$/);
  });

  it("长度截断", () => {
    const long = "a".repeat(100);
    expect(toBaseSlug(long).length).toBeLessThanOrEqual(60);
  });

  it("首尾 - 去除", () => {
    expect(toBaseSlug("---测试---")).not.toMatch(/^-|-$/);
  });
});

describe("generateStoreSlug", () => {
  it("基础名可用直接返回", () => {
    expect(generateStoreSlug("顺德大良店", [])).toBe("shun-de-da-liang-dian");
  });

  it("重名追加 -2", () => {
    expect(
      generateStoreSlug("顺德大良店", ["shun-de-da-liang-dian"])
    ).toBe("shun-de-da-liang-dian-2");
  });

  it("连续重名递增", () => {
    expect(
      generateStoreSlug("顺德大良店", [
        "shun-de-da-liang-dian",
        "shun-de-da-liang-dian-2",
        "shun-de-da-liang-dian-3",
      ])
    ).toBe("shun-de-da-liang-dian-4");
  });

  it("超过 60 字符回退 cuid", () => {
    const longName = "a".repeat(100);
    const result = generateStoreSlug(longName, [longName.slice(0, 60)]);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  it("全特殊字符 fallback", () => {
    const result = generateStoreSlug("！@#$%", ["something"]);
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });
});

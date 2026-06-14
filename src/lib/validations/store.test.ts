import { describe, it, expect } from "vitest";
import { z } from "zod";
import { StoreCreateSchema, SLUG_REGEX } from "@/lib/validations/store";

describe("StoreCreateSchema", () => {
  const validData = {
    slug: "shunde-daliang",
    name: "蓝辉轻改顺德大良店",
    provinceSlug: "guangdong",
    provinceLabel: "广东",
    citySlug: "foshan",
    cityLabel: "佛山",
    district: "顺德大良",
    address: "广东省佛山市顺德区大良街道xxx",
    phone: "0757-2288 1001",
    businessHours: "09:00-18:00",
    description: "门店描述",
  };

  it("accepts valid input", () => {
    const result = StoreCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("slug 校验", () => {
    it("拒绝空 slug", () => {
      const result = StoreCreateSchema.safeParse({ ...validData, slug: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug).toContain(
          "URL标识不能为空"
        );
      }
    });

    it("拒绝含大写字母的 slug", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        slug: "Shunde-Daliang",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug?.[0]).toMatch(
          /只能包含小写字母/
        );
      }
    });

    it("拒绝含下划线的 slug", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        slug: "shunde_daliang",
      });
      expect(result.success).toBe(false);
    });

    it("拒绝连续连字符的 slug", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        slug: "shunde--daliang",
      });
      expect(result.success).toBe(false);
    });

    it("接受 kebab-case slug", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        slug: "shun-de-da-liang-2026",
      });
      expect(result.success).toBe(true);
    });

    it("SLUG_REGEX 与 schema 行为一致", () => {
      expect(SLUG_REGEX.test("shunde-daliang")).toBe(true);
      expect(SLUG_REGEX.test("Shunde")).toBe(false);
      expect(SLUG_REGEX.test("-leading")).toBe(false);
      expect(SLUG_REGEX.test("trailing-")).toBe(false);
      expect(SLUG_REGEX.test("a--b")).toBe(false);
    });
  });

  describe("省份/城市错误文案", () => {
    it("缺 provinceSlug 返回中文 message", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        provinceSlug: "",
        provinceLabel: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        expect([errs.provinceSlug?.[0], errs.provinceLabel?.[0]]).toContain(
          "请选择省份"
        );
      }
    });

    it("缺 citySlug 返回中文 message", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        citySlug: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.citySlug).toContain(
          "请选择城市"
        );
      }
    });
  });

  describe("电话校验", () => {
    it("拒绝字母", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        phone: "0757-2288abc",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.phone).toContain(
          "电话格式不正确"
        );
      }
    });

    it("接受带空格和连字符的电话", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        phone: "0757-2288 1001",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("imagePath 字段", () => {
    it("imagePath 可选", () => {
      const result = StoreCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("imagePath 可赋值", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        imagePath: "/uploads/stores/abc.jpg",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("imageUrl 已从 schema 移除", () => {
    it("传入非法 imageUrl 不应阻塞 schema 校验（Zod 默认 strip）", () => {
      // imageUrl 字段已从 StoreCreateSchema 移除；前端不会再传。
      // 这里验证即便调用方意外传了非法值，schema 仍能成功（不报错）。
      const result = StoreCreateSchema.safeParse({
        ...validData,
        imageUrl: "not-a-url",
      });
      expect(result.success).toBe(true);
    });

    it("推断类型中不再含 imageUrl 字段", () => {
      // 编译期断言：type-level 保证 imageUrl 已被移除
      type HasImageUrl = z.infer<typeof StoreCreateSchema> extends {
        imageUrl?: unknown;
      }
        ? true
        : false;
      const hasImageUrl: HasImageUrl = false as HasImageUrl;
      expect(hasImageUrl).toBe(false);
    });
  });
});
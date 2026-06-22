import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  isActiveToStatus,
  resolveStoreStatus,
  statusToIsActive,
  StoreCreateSchema,
  SLUG_REGEX,
} from "@/lib/validations/store";

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
    phone: "13800138000",
    businessHours: "09:00-18:00",
    description: "门店描述",
  };

  it("accepts valid input", () => {
    const result = StoreCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("slug 校验", () => {
    it("允许空 slug（API 层会用 generateStoreSlug 兜底）", () => {
      const result = StoreCreateSchema.safeParse({ ...validData, slug: "" });
      expect(result.success).toBe(true);
    });

    it("允许省略 slug（undefined）", () => {
      const { slug: _unused, ...withoutSlug } = validData;
      void _unused;
      const result = StoreCreateSchema.safeParse(withoutSlug);
      expect(result.success).toBe(true);
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
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.provinceSlug).toContain(
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

  describe("AC-5：label 由服务端覆盖（schema 不再强求）", () => {
    it("缺省 provinceLabel 不阻塞 schema 校验（optional）", () => {
      const withoutProvinceLabel: Partial<typeof validData> = { ...validData };
      delete withoutProvinceLabel.provinceLabel;
      const result = StoreCreateSchema.safeParse(withoutProvinceLabel);
      expect(result.success).toBe(true);
    });

    it("缺省 cityLabel 不阻塞 schema 校验（optional）", () => {
      const withoutCityLabel: Partial<typeof validData> = { ...validData };
      delete withoutCityLabel.cityLabel;
      const result = StoreCreateSchema.safeParse(withoutCityLabel);
      expect(result.success).toBe(true);
    });

    it("两者都缺省仍可通过（服务端后续注入权威 label）", () => {
      const rest: Partial<typeof validData> = { ...validData };
      delete rest.provinceLabel;
      delete rest.cityLabel;
      const result = StoreCreateSchema.safeParse(rest);
      expect(result.success).toBe(true);
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
          "联系电话必须为 11 位数字"
        );
      }
    });

    it("拒绝带空格和连字符的电话", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        phone: "0757-2288 1001",
      });
      expect(result.success).toBe(false);
    });

    it("接受 11 位数字", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        phone: "13800138000",
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

  describe("门店状态字段", () => {
    it("status 缺省时 schema 不直接补值，交给 API 按场景处理", () => {
      const result = StoreCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBeUndefined();
        expect(result.data.isActive).toBeUndefined();
      }
    });

    it("status = pending 合法", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        status: "pending",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("拒绝非法 status", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        status: "offline",
      });
      expect(result.success).toBe(false);
    });

    it("isActive 兼容字段仍可传入", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        isActive: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("isActive 非 boolean → 失败", () => {
      const result = StoreCreateSchema.safeParse({
        ...validData,
        isActive: "true",
      });
      expect(result.success).toBe(false);
    });

    it("状态与兼容布尔字段互转", () => {
      expect(statusToIsActive("pending")).toBe(false);
      expect(statusToIsActive("active")).toBe(true);
      expect(statusToIsActive("suspended")).toBe(false);
      expect(statusToIsActive("terminated")).toBe(false);
      expect(isActiveToStatus(true)).toBe("active");
      expect(isActiveToStatus(false)).toBe("suspended");
      expect(resolveStoreStatus({})).toBe("pending");
      expect(resolveStoreStatus({ isActive: true })).toBe("active");
      expect(resolveStoreStatus({ isActive: false })).toBe("suspended");
      expect(resolveStoreStatus({ status: "terminated", isActive: true })).toBe("terminated");
    });
  });
});

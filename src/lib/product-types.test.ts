import { describe, it, expect } from "vitest";
import {
  PRODUCT_IMAGE_WIDTH,
  PRODUCT_IMAGE_HEIGHT,
  PRODUCT_IMAGE_ASPECT_RATIO,
  matchedImage,
  missingImage,
  productPreviewImage,
  pendingReviewImage,
  buildProductAlt,
  makeProductId,
  slugifyProductName,
} from "./product-types";
import type { ImageStatus, ProductImage } from "./product-types";

describe("product-types", () => {
  describe("constants", () => {
    it("PRODUCT_IMAGE_WIDTH is 1448", () => {
      expect(PRODUCT_IMAGE_WIDTH).toBe(1448);
    });

    it("PRODUCT_IMAGE_HEIGHT is 1086", () => {
      expect(PRODUCT_IMAGE_HEIGHT).toBe(1086);
    });

    it("PRODUCT_IMAGE_ASPECT_RATIO is 4/3", () => {
      expect(PRODUCT_IMAGE_ASPECT_RATIO).toBe("4/3");
    });
  });

  describe("image builders", () => {
    it("matchedImage returns full image with path and dimensions", () => {
      const img = matchedImage("/images/foo.png", "alt text");
      expect(img.publicPath).toBe("/images/foo.png");
      expect(img.alt).toBe("alt text");
      expect(img.width).toBe(1448);
      expect(img.height).toBe(1086);
      expect(img.aspectRatio).toBe("4/3");
    });

    it("missingImage returns null-path image", () => {
      const img = missingImage("图片待补充");
      expect(img.publicPath).toBeNull();
      expect(img.alt).toBe("图片待补充");
      expect(img.width).toBeNull();
      expect(img.height).toBeNull();
      expect(img.aspectRatio).toBeNull();
    });

    it("productPreviewImage returns full image with preview path", () => {
      const img = productPreviewImage("/preview/bar.png", "预览图");
      expect(img.publicPath).toBe("/preview/bar.png");
      expect(img.alt).toBe("预览图");
      expect(img.width).toBe(1448);
      expect(img.height).toBe(1086);
      expect(img.aspectRatio).toBe("4/3");
    });

    it("pendingReviewImage returns null-path image", () => {
      const img = pendingReviewImage("待复核");
      expect(img.publicPath).toBeNull();
      expect(img.alt).toBe("待复核");
      expect(img.width).toBeNull();
      expect(img.height).toBeNull();
      expect(img.aspectRatio).toBeNull();
    });
  });

  describe("buildProductAlt", () => {
    it("includes brand, model, product, kind", () => {
      const alt = buildProductAlt("极氪", "9X", "电动踏板", "产品展示图");
      expect(alt).toBe("极氪 9X 电动踏板 产品展示图");
    });
  });

  describe("makeProductId", () => {
    it("returns deterministic dashed id", () => {
      expect(makeProductId("zeekr", "9x", "01")).toBe("zeekr-9x-01");
    });

    it("filters empty parts", () => {
      expect(makeProductId("a", "", "b", "", "c")).toBe("a-b-c");
    });
  });

  describe("slugifyProductName", () => {
    it("converts Chinese name to slug", () => {
      expect(slugifyProductName("电动踏板 标准版")).toBe("电动踏板-标准版");
    });

    it("handles manual override", () => {
      const overrides: Record<string, string> = { "特殊名称": "custom-slug" };
      expect(slugifyProductName("特殊名称", overrides)).toBe("custom-slug");
    });

    it("falls back to generated slug when no override", () => {
      expect(slugifyProductName("普通名称")).toBe("普通名称");
    });

    it("removes parentheses", () => {
      expect(slugifyProductName("产品（升级版）")).toBe("产品-升级版");
    });
  });
});

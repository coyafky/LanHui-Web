import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WHEEL_IMAGE_ASPECT_RATIO,
  WHEEL_IMAGE_HEIGHT,
  WHEEL_IMAGE_WIDTH,
  wheelGalleryImages,
} from "./wheel-products";

describe("wheel-products", () => {
  it("registers all 21 wheel images", () => {
    expect(wheelGalleryImages).toHaveLength(21);
  });

  it("keeps the literal image spec stable", () => {
    for (const image of wheelGalleryImages) {
      expect(image.width).toBe(WHEEL_IMAGE_WIDTH);
      expect(image.height).toBe(WHEEL_IMAGE_HEIGHT);
      expect(image.aspectRatio).toBe(WHEEL_IMAGE_ASPECT_RATIO);
    }
  });

  it("points every image to an existing public asset", () => {
    for (const image of wheelGalleryImages) {
      const diskPath = join(process.cwd(), "public", image.publicPath);
      expect(existsSync(diskPath), image.publicPath).toBe(true);
    }
  });

  it("uses stable numeric ordering", () => {
    expect(wheelGalleryImages[0]?.filename).toBe("1-1.webp");
    expect(wheelGalleryImages[9]?.filename).toBe("1-10.webp");
    expect(wheelGalleryImages[20]?.filename).toBe("1-21.webp");
  });
});

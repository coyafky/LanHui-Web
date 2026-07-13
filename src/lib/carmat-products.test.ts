import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARMAT_IMAGE_ASPECT_RATIO,
  CARMAT_IMAGE_HEIGHT,
  CARMAT_IMAGE_WIDTH,
  carMatGalleryImages,
} from "./carmat-products";

describe("carmat-products", () => {
  it("registers all 29 car mat images", () => {
    expect(carMatGalleryImages).toHaveLength(29);
  });

  it("keeps the literal image spec stable", () => {
    for (const image of carMatGalleryImages) {
      expect(image.width).toBe(CARMAT_IMAGE_WIDTH);
      expect(image.height).toBe(CARMAT_IMAGE_HEIGHT);
      expect(image.aspectRatio).toBe(CARMAT_IMAGE_ASPECT_RATIO);
    }
  });

  it("points every image to an existing public asset", () => {
    for (const image of carMatGalleryImages) {
      const diskPath = join(process.cwd(), "public", image.publicPath);
      expect(existsSync(diskPath), image.publicPath).toBe(true);
    }
  });

  it("uses stable numeric ordering", () => {
    expect(carMatGalleryImages[0]?.filename).toBe("1-1.webp");
    expect(carMatGalleryImages[9]?.filename).toBe("1-10.webp");
    expect(carMatGalleryImages[28]?.filename).toBe("1-29.webp");
  });
});

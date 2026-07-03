import { describe, expect, it } from "vitest";
import { carCareValues, carCareServices, carCareProcess } from "./car-care-products";

describe("car-care-products", () => {
  it("exports exactly 4 value cards", () => {
    expect(carCareValues).toHaveLength(4);
  });
  it("exports exactly 2 services (exterior-wash + interior-detailing)", () => {
    expect(carCareServices).toHaveLength(2);
    expect(carCareServices[0]?.id).toBe("exterior-wash");
    expect(carCareServices[1]?.id).toBe("interior-detailing");
  });
  it("exports exactly 4 process steps", () => {
    expect(carCareProcess).toHaveLength(4);
  });
  it("each value card has required fields", () => {
    for (const v of carCareValues) {
      expect(v.id).toBeTruthy();
      expect(v.icon).toBeTruthy();
      expect(v.title).toBeTruthy();
      expect(v.description).toBeTruthy();
    }
  });
  it("each service has at least 3 highlights", () => {
    for (const s of carCareServices) {
      expect(s.highlights.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("each process step has step, title, and description", () => {
    for (const step of carCareProcess) {
      expect(step.step).toMatch(/^\d{2}$/);
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });
  it("values use valid Lucide icon names", () => {
    const validIcons = ["Droplets", "Sparkles", "Leaf", "Clock"];
    for (const v of carCareValues) {
      expect(validIcons).toContain(v.icon);
    }
  });
});

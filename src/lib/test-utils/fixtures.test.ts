import { describe, it, expect } from "vitest";
import {
  mockStore,
  mockStoreList,
  edgeCases,
  withSeed,
  STORE_LEVELS,
  STORE_STATUSES,
  type StoreFixture,
} from "./fixtures";

describe("mockStore", () => {
  it("generates a valid store by default", () => {
    const store = mockStore({ id: "200001" });
    expect(store).toMatchObject({
      id: "200001",
      provinceSlug: expect.any(String),
      citySlug: expect.any(String),
      phone: expect.stringMatching(/^1[3-9]\d{9}$/),
    });
    expect(STORE_STATUSES).toContain(store.status);
    expect(STORE_LEVELS).toContain(store.level);
    expect(store.name.length).toBeGreaterThan(0);
    expect(store.name.length).toBeLessThanOrEqual(80);
    expect(store.address.length).toBeLessThanOrEqual(200);
  });

  it("respects overrides", () => {
    const store = mockStore({
      id: "999",
      name: "测试门店",
      slug: "test-store",
      status: "suspended",
      level: "flagship",
    });
    expect(store.id).toBe("999");
    expect(store.name).toBe("测试门店");
    expect(store.slug).toBe("test-store");
    expect(store.status).toBe("suspended");
    expect(store.level).toBe("flagship");
  });

  it("is deterministic when seeded (stable fields only)", () => {
    // createdAt/updatedAt 走 faker.date.recent → 内部用 Date.now() fallback，
    // 同一 seed 两次调用可能差 2ms（faker 9.x 行为）。只断言稳定字段。
    withSeed(123);
    const a = mockStore();
    withSeed(123);
    const b = mockStore();
    expect(a).toMatchObject({
      id: b.id,
      slug: b.slug,
      name: b.name,
      phone: b.phone,
      phoneTel: b.phoneTel,
      provinceSlug: b.provinceSlug,
      provinceLabel: b.provinceLabel,
      citySlug: b.citySlug,
      cityLabel: b.cityLabel,
      district: b.district,
      address: b.address,
      businessHours: b.businessHours,
      status: b.status,
      level: b.level,
      imagePath: b.imagePath,
    });
  });
});

describe("mockStoreList", () => {
  it("generates n unique stores", () => {
    const list = mockStoreList(8);
    expect(list).toHaveLength(8);
    const ids = new Set(list.map((s) => s.id));
    expect(ids.size).toBe(8);
  });

  it("respects partial overrides on every item", () => {
    const list = mockStoreList(3, { level: "premium" });
    expect(list.every((s) => s.level === "premium")).toBe(true);
  });
});

describe("edgeCases", () => {
  it("name boundary cases are correct lengths", () => {
    const e = edgeCases().name;
    expect(e.minValid.length).toBe(1);
    expect(e.maxValid.length).toBe(80);
    expect(e.tooLong.length).toBe(81);
  });

  it("phone boundary cases", () => {
    const e = edgeCases().phone;
    expect(e.tooShort.length).toBe(10);
    expect(e.tooLong.length).toBe(12);
    expect(e.valid).toMatch(/^1[3-9]\d{9}$/);
  });

  it("address boundary cases", () => {
    const e = edgeCases().address;
    expect(e.maxValid.length).toBe(200);
    expect(e.tooLong.length).toBe(201);
  });

  it("slug boundary cases are invalid forms", () => {
    const e = edgeCases().slug;
    expect(e.consecutiveHyphens).toMatch(/--/); // 连续连字符
    expect(e.uppercase).toMatch(/[A-Z]/); // 含大写
  });

  it("status/level invalid forms are not in allowed enums", () => {
    const e = edgeCases();
    expect(STORE_STATUSES).not.toContain(e.status.invalid);
    expect(STORE_LEVELS).not.toContain(e.level.invalid);
  });
});

describe("StoreFixture type contract", () => {
  it("every field is well-typed (compile-time smoke)", () => {
    const s: StoreFixture = mockStore();
    // 编译期类型守卫：如果字段错，TS 会报错
    const _check: {
      id: string;
      slug: string;
      name: string;
      phone: string;
      status: typeof STORE_STATUSES[number];
      level: typeof STORE_LEVELS[number];
    } = s;
    expect(_check.id).toBe(s.id);
  });
});

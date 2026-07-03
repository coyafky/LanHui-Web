import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock products module to isolate test (避免拉起 Prisma / 网络)
vi.mock("@/lib/products", () => {
  const basePackages = [
    {
      slug: "chunfen",
      name: "春分套餐",
      models: "K7 + C15",
      audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
      frontProduct: "环保陶瓷膜 K7",
      frontParams:
        "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 47%；厚度 2mil",
      rearProduct: "环保陶瓷膜 C15",
      rearParams:
        "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 49%；厚度 1.5mil",
      warranty: "5年",
    },
    {
      slug: "guyu",
      name: "谷雨套餐",
      models: "T7 + F20",
      audience: "对紫外线、普通隔热、环保及隐私性要求较高的车主",
      frontProduct: "单层金属膜 T7",
      frontParams:
        "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 92%；总太阳能阻隔率 53%；厚度 2mil",
      rearProduct: "陶瓷护肤膜 F20",
      rearParams:
        "可见光阻隔率 80%；紫外线阻隔率 100%；红外线阻隔率 95%；总太阳能阻隔率 57%；厚度 2mil",
      warranty: "8年",
    },
    {
      slug: "xiaoman",
      name: "小满套餐",
      models: "Z70 + K15",
      audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
      frontProduct: "12 层金属膜 Z70",
      frontParams:
        "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
      rearProduct: "单银金属膜 K15",
      rearParams:
        "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 58%；厚度 2mil",
      warranty: "10年",
    },
    {
      slug: "mangzhong",
      name: "芒种套餐",
      models: "Z70 + Z20",
      audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
      frontProduct: "12 层金属膜 Z70",
      frontParams:
        "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
      rearProduct: "双银金属膜 Z20",
      rearParams:
        "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
      warranty: "10年",
    },
    {
      slug: "bailu",
      name: "白露套餐",
      models: "Z80 + Z20",
      audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
      frontProduct: "变色陶瓷膜 Z80",
      frontParams:
        "可见光阻隔率 28-55%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 53-62%；厚度 3mil",
      rearProduct: "双银金属膜 Z20",
      rearParams:
        "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
      warranty: "10年",
    },
    {
      slug: "wanghong",
      name: "网红套餐",
      models: "G7",
      audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
      frontProduct: "帝王紫/凤凰红 G7",
      frontParams:
        "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
      rearProduct: "同系列搭配",
      rearParams:
        "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
      warranty: "7年",
    },
    {
      slug: "yangsheng",
      name: "养生套餐",
      models: "M7 + N20",
      audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
      frontProduct: "负离子膜 M7",
      frontParams:
        "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 80%；总太阳能阻隔率 49%；厚度 2mil",
      rearProduct: "负离子膜 N20",
      rearParams:
        "可见光阻隔率 72%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 59%；厚度 2mil",
      warranty: "10年",
    },
  ];
  return {
    getWindowFilmPackage: (slug: string) =>
      basePackages.find((p) => p.slug === slug),
    getAllWindowFilmPackageSlugs: () => basePackages.map((p) => p.slug),
  };
});

describe("windowFilmDetails", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("覆盖 7 个套餐 slug", async () => {
    const { windowFilmDetails } = await import("./window-film-details");
    expect(Object.keys(windowFilmDetails).length).toBe(7);
    expect(Object.keys(windowFilmDetails).sort()).toEqual(
      ["bailu", "chunfen", "guyu", "mangzhong", "wanghong", "xiaoman", "yangsheng"].sort(),
    );
  });

  it("每个套餐详情都包含 PRD §9 列出的 8 个字段", async () => {
    const { windowFilmDetails } = await import("./window-film-details");
    for (const slug of Object.keys(windowFilmDetails)) {
      const d = windowFilmDetails[slug];
      expect(d.positioning, `${slug} positioning`).toBeTruthy();
      expect(d.headline, `${slug} headline`).toBeTruthy();
      expect(d.summary, `${slug} summary`).toBeTruthy();
      expect(d.painPoints.length, `${slug} painPoints count`).toBeGreaterThanOrEqual(3);
      expect(d.painPoints.length, `${slug} painPoints count`).toBeLessThanOrEqual(4);
      expect(d.benefits.length, `${slug} benefits count`).toBeGreaterThanOrEqual(2);
      expect(d.scenarios.length, `${slug} scenarios count`).toBeGreaterThanOrEqual(2);
      expect(d.parameterNotes.length, `${slug} parameterNotes count`).toBe(2);
      const positions = d.parameterNotes.map((n) => n.position).sort();
      expect(positions).toEqual(["front", "rear"]);
    }
  });

  it("每个套餐字段文案不包含 PRD §4.2 禁止话术", async () => {
    const { windowFilmDetails } = await import("./window-film-details");
    const banned = ["电话咨询", "咨询此款", "全网最低", "100%隔热", "永久质保", "官方授权"];
    for (const slug of Object.keys(windowFilmDetails)) {
      const d = windowFilmDetails[slug];
      const allText = [
        d.positioning,
        d.headline,
        d.summary,
        ...d.painPoints,
        ...d.benefits.flatMap((b) => [b.title, b.description]),
        ...d.scenarios.flatMap((s) => [s.title, s.description]),
        ...d.parameterNotes.flatMap((n) => [n.product, n.params, n.userMeaning]),
      ].join(" ");
      for (const word of banned) {
        expect(allText.includes(word), `${slug} 不应包含 "${word}"`).toBe(false);
      }
    }
  });
});

describe("windowFilmGuideItems / windowFilmParameterExplanations", () => {
  it("导购列表覆盖 7 个套餐", async () => {
    const { windowFilmGuideItems } = await import("./window-film-details");
    expect(windowFilmGuideItems.length).toBe(7);
    const slugs = windowFilmGuideItems.map((g) => g.packageSlug).sort();
    expect(slugs).toEqual(
      ["bailu", "chunfen", "guyu", "mangzhong", "wanghong", "xiaoman", "yangsheng"].sort(),
    );
  });

  it("参数解释覆盖 5 个指标", async () => {
    const { windowFilmParameterExplanations } = await import("./window-film-details");
    expect(windowFilmParameterExplanations.length).toBe(5);
    const codes = windowFilmParameterExplanations.map((p) => p.code).sort();
    expect(codes).toEqual(["IRR", "TSER", "UVR", "厚度", "可见光阻隔率"].sort());
  });

  it("参数解释对可见光阻隔率不扩写为 VLT 透过率", async () => {
    const { windowFilmParameterExplanations } = await import("./window-film-details");
    const vltRow = windowFilmParameterExplanations.find(
      (p) => p.code === "可见光阻隔率",
    );
    expect(vltRow).toBeTruthy();
    // 按 PRD §6.2 注释：当前字段为"可见光阻隔率"，不扩写为"透过率"。
    // fullName 应使用中性的"当前资料口径下的可见光指标"，不直接命名"透过率"
    expect(vltRow!.fullName).not.toBe("可见光透过率");
    expect(vltRow!.fullName).toContain("当前资料口径");
    expect(vltRow!.userMeaning).toContain("口径");
  });
});

describe("getWindowFilmPackageWithDetails", () => {
  it("合并基础数据与详情文案", async () => {
    const { getWindowFilmPackageWithDetails } = await import("./window-film-details");
    const pkg = getWindowFilmPackageWithDetails("chunfen");
    expect(pkg).toBeTruthy();
    // 基础数据字段
    expect(pkg!.slug).toBe("chunfen");
    expect(pkg!.name).toBe("春分套餐");
    expect(pkg!.warranty).toBe("5年");
    // 详情数据字段
    expect(pkg!.positioning).toBeTruthy();
    expect(pkg!.painPoints.length).toBeGreaterThanOrEqual(3);
    expect(pkg!.parameterNotes.length).toBe(2);
  });

  it("未知 slug 返回 undefined", async () => {
    const { getWindowFilmPackageWithDetails } = await import("./window-film-details");
    expect(getWindowFilmPackageWithDetails("nonexistent")).toBeUndefined();
  });
});

describe("getAllWindowFilmPackageSlugsWithDetails", () => {
  it("返回 7 个 slug", async () => {
    const { getAllWindowFilmPackageSlugsWithDetails } = await import(
      "./window-film-details"
    );
    expect(getAllWindowFilmPackageSlugsWithDetails().length).toBe(7);
  });
});

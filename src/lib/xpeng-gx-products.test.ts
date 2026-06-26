import { describe, expect, it } from "vitest";
import {
  xpengGxUpgradeProjects,
  xpengGxScenarios,
  xpengGxBundles,
  xpengGxServiceSteps,
  xpengGxFaq,
  XPENG_GX_CATEGORY_LABELS,
} from "./xpeng-gx-products";

describe("Xpeng GX 数据层 shape", () => {
  it("upgrade projects 长度为 15", () => {
    expect(xpengGxUpgradeProjects).toHaveLength(15);
  });

  it("scenarios 长度为 6", () => {
    expect(xpengGxScenarios).toHaveLength(6);
  });

  it("bundles 长度为 3", () => {
    expect(xpengGxBundles).toHaveLength(3);
  });

  it("service steps 长度为 7", () => {
    expect(xpengGxServiceSteps).toHaveLength(7);
  });

  it("faq 长度为 8", () => {
    expect(xpengGxFaq).toHaveLength(8);
  });
});

describe("id 唯一性", () => {
  it("projects id 唯一", () => {
    const ids = xpengGxUpgradeProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("scenario key 不与 project id 冲突", () => {
    const projectIds = new Set(xpengGxUpgradeProjects.map((p) => p.id));
    for (const s of xpengGxScenarios) {
      expect(projectIds.has(s.key)).toBe(false);
    }
  });

  it("bundle key 不与 project id 或 scenario key 冲突", () => {
    const allKeys = new Set<string>([
      ...xpengGxUpgradeProjects.map((p) => p.id),
      ...xpengGxScenarios.map((s) => s.key),
    ]);
    for (const b of xpengGxBundles) {
      expect(allKeys.has(b.key)).toBe(false);
    }
  });
});

describe("order 单调递增", () => {
  it("projects order 1-15", () => {
    xpengGxUpgradeProjects.forEach((p, i) => {
      expect(p.order).toBe(i + 1);
    });
  });
});

describe("saleStatus 字段", () => {
  it("电动门是 preorder", () => {
    const electricDoor = xpengGxUpgradeProjects.find(
      (p) => p.id === "xpeng-gx-electric-door",
    );
    expect(electricDoor).toBeDefined();
    expect(electricDoor?.saleStatus).toBe("preorder");
  });

  it("其他 14 项是 available 或 pending-review", () => {
    const nonPreorder = xpengGxUpgradeProjects.filter(
      (p) => p.id !== "xpeng-gx-electric-door",
    );
    expect(nonPreorder).toHaveLength(14);
    for (const p of nonPreorder) {
      expect(["available", "pending-review"]).toContain(p.saleStatus);
    }
  });

  it("所有项目 saleStatus 合法", () => {
    const valid = ["available", "preorder", "pending-review"];
    for (const p of xpengGxUpgradeProjects) {
      expect(valid).toContain(p.saleStatus);
    }
  });

  it("电动门必填 caution", () => {
    const electricDoor = xpengGxUpgradeProjects.find(
      (p) => p.id === "xpeng-gx-electric-door",
    );
    expect(electricDoor?.caution).toBeDefined();
    expect(electricDoor?.caution?.length).toBeGreaterThan(0);
  });
});

describe("category 字段", () => {
  const VALID_CATEGORIES = [
    "protection",
    "appearance",
    "electric_convenience",
    "chassis",
    "screen_care",
    "cabin_care",
  ] as const;

  it("所有 project category 在白名单内", () => {
    for (const p of xpengGxUpgradeProjects) {
      expect(VALID_CATEGORIES).toContain(p.category);
    }
  });

  it("电动门 category 是 electric_convenience", () => {
    const electricDoor = xpengGxUpgradeProjects.find(
      (p) => p.id === "xpeng-gx-electric-door",
    );
    expect(electricDoor?.category).toBe("electric_convenience");
  });
});

describe("scenario.projectIds 引用", () => {
  it("每个 scenario.projectId 都对应实际 project", () => {
    const projectIds = new Set(xpengGxUpgradeProjects.map((p) => p.id));
    for (const s of xpengGxScenarios) {
      for (const pid of s.projectIds) {
        expect(projectIds.has(pid)).toBe(true);
      }
    }
  });

  it("每个 project 至少被一个 scenario 引用", () => {
    const referenced = new Set<string>();
    for (const s of xpengGxScenarios)
      for (const pid of s.projectIds) referenced.add(pid);
    for (const p of xpengGxUpgradeProjects) {
      expect(referenced.has(p.id)).toBe(true);
    }
  });
});

describe("bundle.projectIds 引用", () => {
  it("每个 bundle.projectId 都对应实际 project", () => {
    const projectIds = new Set(xpengGxUpgradeProjects.map((p) => p.id));
    for (const b of xpengGxBundles) {
      for (const pid of b.projectIds) {
        expect(projectIds.has(pid)).toBe(true);
      }
    }
  });
});

describe("imageStatus 字段", () => {
  it("所有项目 imageStatus 是 matched/pending-review/missing", () => {
    const valid = ["matched", "pending-review", "missing"];
    for (const p of xpengGxUpgradeProjects) {
      expect(valid).toContain(p.imageStatus);
    }
  });
});

describe("service steps 序号连续", () => {
  it("step 从 1 到 7", () => {
    xpengGxServiceSteps.forEach((s, i) => {
      expect(s.step).toBe(i + 1);
    });
  });

  it("title 与 description 非空", () => {
    for (const s of xpengGxServiceSteps) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });
});

describe("FAQ 非空", () => {
  it("每条 FAQ 有 question 和 answer", () => {
    for (const f of xpengGxFaq) {
      expect(f.question.length).toBeGreaterThan(0);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });

  it("FAQ 包含电动门预售相关问答", () => {
    const hasPreorderFaq = xpengGxFaq.some((f) =>
      f.question.includes("电动门"),
    );
    expect(hasPreorderFaq).toBe(true);
  });
});

describe("6 类别中文标签完整性", () => {
  it("6 个类别都有中文标签", () => {
    expect(Object.keys(XPENG_GX_CATEGORY_LABELS)).toHaveLength(6);
  });

  it("每个标签非空", () => {
    for (const [, label] of Object.entries(XPENG_GX_CATEGORY_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("项目名称与 PRD §7 海报一致", () => {
  it("包含 15 个海报项目名", () => {
    const expectedNames = [
      "车衣",
      "隔热膜",
      "彩绘",
      "改色膜",
      "电动门",
      "平衡杆",
      "底盘护板",
      "360 脚垫",
      "轮毂",
      "门槛条",
      "防虫网",
      "挡泥板",
      "钢化膜",
      "抬头显示罩",
      "牌照框",
    ];
    const actualNames = xpengGxUpgradeProjects.map((p) => p.name);
    for (const name of expectedNames) {
      expect(actualNames).toContain(name);
    }
  });
});

describe("summary 与 name 非空", () => {
  it("所有 project name 与 summary 非空", () => {
    for (const p of xpengGxUpgradeProjects) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(0);
    }
  });
});

describe("suitableFor 字段非空", () => {
  it("每个 project 至少 1 个 suitableFor 项", () => {
    for (const p of xpengGxUpgradeProjects) {
      expect(p.suitableFor.length).toBeGreaterThan(0);
    }
  });
});

describe("sourceArea 字段统一", () => {
  it("所有 project sourceArea 是 poster_project_matrix", () => {
    for (const p of xpengGxUpgradeProjects) {
      expect(p.sourceArea).toBe("poster_project_matrix");
    }
  });
});

describe("场景描述与组合价值字段非空", () => {
  it("每个 scenario name/description 非空", () => {
    for (const s of xpengGxScenarios) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });

  it("每个 bundle name/value 非空", () => {
    for (const b of xpengGxBundles) {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.value.length).toBeGreaterThan(0);
    }
  });
});
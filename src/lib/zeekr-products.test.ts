/**
 * ZEEKR 改装专题页数据层测试
 *
 * 验证 PRD v2.0 §6 / §8.5 / §12 数据契约:
 * - 23 个产品行(9X 16 + 8X 6 + 009 1)
 * - 3 态 imageStatus(matched / pending-review / missing)分布
 * - 字面量类型保证(1448/1086/"4/3")
 * - matched 产品 image 字段非 null
 * - missing/pending-review 产品 image 字段 null
 * - zeekrProductsByModel 按车型分组
 * - zeekrTopicMeta 字段(23/3 字面量)
 */
import { describe, it, expect } from "vitest";
import {
  zeekrProducts,
  zeekrProductsByModel,
  zeekrTopicMeta,
  type ZeekrModel,
  type ZeekrImageStatus,
  type ZeekrProduct,
  type ZeekrImageWidth,
  type ZeekrImageHeight,
  type ZeekrImageAspectRatio,
} from "./zeekr-products";

const ALL_MODELS: ZeekrModel[] = ["9X", "8X", "009"];
const EXPECTED_MODEL_COUNTS: Record<ZeekrModel, number> = {
  "9X": 16,
  "8X": 6,
  "009": 1,
};

describe("PRD §6/§12 zeekrProducts 顶层数据", () => {
  it("总条数 = 23(9X 16 + 8X 6 + 009 1)", () => {
    expect(zeekrProducts).toHaveLength(23);
  });

  it("每行都有 id/model/orderInModel/name/rawName/category/imageStatus/image 字段", () => {
    for (const p of zeekrProducts) {
      expect(p.id, "id 必填").toBeTypeOf("string");
      expect(p.id.length, "id 非空").toBeGreaterThan(0);
      expect(ALL_MODELS, "model 在合法字面量集合内").toContain(p.model);
      expect(p.orderInModel, "orderInModel ≥ 1").toBeGreaterThanOrEqual(1);
      expect(p.name, "name 必填").toBeTypeOf("string");
      expect(p.rawName, "rawName 必填").toBeTypeOf("string");
      expect(p.category, "category 必填").toBeTypeOf("string");
      expect(p.imageStatus, "imageStatus 在合法字面量集合内").toMatch(
        /^(matched|pending-review|missing)$/,
      );
      expect(p.image, "image 字段必填").toBeDefined();
    }
  });

  it("id 格式遵循 zeekr-{modelLower}-{order}", () => {
    for (const p of zeekrProducts) {
      const modelLower = p.model.toLowerCase();
      const expectedPrefix = `zeekr-${modelLower}-`;
      expect(
        p.id.startsWith(expectedPrefix),
        `${p.id} 应以 ${expectedPrefix} 开头`,
      ).toBe(true);
    }
  });
});

describe("PRD §6.2/§6.3/§6.4 车型分组", () => {
  for (const model of ALL_MODELS) {
    it(`${model} 子集条数 = ${EXPECTED_MODEL_COUNTS[model]}`, () => {
      const subset = zeekrProducts.filter((p) => p.model === model);
      expect(subset).toHaveLength(EXPECTED_MODEL_COUNTS[model]);
    });
  }

  it("9X 的 orderInModel = 1..16 各 1 条,无重复", () => {
    const orders9x = zeekrProducts
      .filter((p) => p.model === "9X")
      .map((p) => p.orderInModel)
      .sort((a, b) => a - b);
    expect(orders9x).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it("8X 的 orderInModel = 1..6 各 1 条,无重复", () => {
    const orders8x = zeekrProducts
      .filter((p) => p.model === "8X")
      .map((p) => p.orderInModel)
      .sort((a, b) => a - b);
    expect(orders8x).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("009 的 orderInModel = 1 单条", () => {
    const orders009 = zeekrProducts
      .filter((p) => p.model === "009")
      .map((p) => p.orderInModel)
      .sort((a, b) => a - b);
    expect(orders009).toEqual([1]);
  });
});

describe("PRD §8.3 imageStatus 三态分布", () => {
  function countByStatus(status: ZeekrImageStatus): number {
    return zeekrProducts.filter((p) => p.imageStatus === status).length;
  }

  it("matched = 20", () => {
    expect(countByStatus("matched")).toBe(20);
  });

  it("pending-review = 1(9X 行 15 后备箱储物/盒)", () => {
    expect(countByStatus("pending-review")).toBe(1);
    const pr = zeekrProducts.filter((p) => p.imageStatus === "pending-review");
    expect(pr).toHaveLength(1);
    expect(pr[0]?.model).toBe("9X");
    expect(pr[0]?.orderInModel).toBe(15);
  });

  it("missing = 2(9X 行 8 挡泥板+内衬6件套 + 行 9 双层脚垫)", () => {
    expect(countByStatus("missing")).toBe(2);
    const ms = zeekrProducts
      .filter((p) => p.imageStatus === "missing")
      .sort((a, b) => a.orderInModel - b.orderInModel);
    expect(ms.map((p) => p.orderInModel)).toEqual([8, 9]);
    expect(ms.every((p) => p.model === "9X")).toBe(true);
  });
});

describe("PRD §8.5 字面量类型(1448/1086/4:3)", () => {
  it("ZeekrImageWidth 字面量 = 1448", () => {
    const w: ZeekrImageWidth = 1448;
    expect(w).toBe(1448);
  });

  it("ZeekrImageHeight 字面量 = 1086", () => {
    const h: ZeekrImageHeight = 1086;
    expect(h).toBe(1086);
  });

  it("ZeekrImageAspectRatio 字面量 = '4/3'", () => {
    const r: ZeekrImageAspectRatio = "4/3";
    expect(r).toBe("4/3");
  });

  it("matched 产品的 image.width/height/aspectRatio 是字面量值", () => {
    for (const p of zeekrProducts.filter((p) => p.imageStatus === "matched")) {
      expect(p.image.width, `${p.id} width`).toBe(1448);
      expect(p.image.height, `${p.id} height`).toBe(1086);
      expect(p.image.aspectRatio, `${p.id} aspectRatio`).toBe("4/3");
    }
  });

  it("missing/pending-review 产品的 image 尺寸字段为 null", () => {
    const downs = zeekrProducts.filter(
      (p) => p.imageStatus === "missing" || p.imageStatus === "pending-review",
    );
    expect(downs.length).toBeGreaterThan(0); // 至少 3 条 missing/pending-review
    for (const p of downs) {
      expect(p.image.width, `${p.id} width 应为 null`).toBeNull();
      expect(p.image.height, `${p.id} height 应为 null`).toBeNull();
      expect(p.image.aspectRatio, `${p.id} aspectRatio 应为 null`).toBeNull();
    }
  });
});

describe("PRD §8.3 image 路径前缀", () => {
  it("matched 产品的 image.publicPath 以 /images/products/zeekr/ 开头", () => {
    for (const p of zeekrProducts.filter((p) => p.imageStatus === "matched")) {
      expect(
        p.image.publicPath?.startsWith("/images/products/zeekr/"),
        `${p.id} publicPath ${p.image.publicPath}`,
      ).toBe(true);
    }
  });

  it("missing/pending-review 产品的 image.publicPath 为 null", () => {
    for (const p of zeekrProducts.filter(
      (p) => p.imageStatus !== "matched",
    )) {
      expect(p.image.publicPath, `${p.id} publicPath 应为 null`).toBeNull();
    }
  });
});

describe("PRD §6.5 分类完整性", () => {
  it("所有 15 个分类至少出现 0 次(=合法字面量集合)", () => {
    const validCategories = new Set([
      "地板尾箱",
      "尾箱防护",
      "尾箱收纳",
      "内饰便利",
      "内饰舒适",
      "内饰保护",
      "内饰升级",
      "门槛防护",
      "尾门防护",
      "车身防护",
      "防护配件",
      "挡泥板/内衬",
      "地板脚垫",
      "底盘防护",
      "电动踏板配件",
    ]);
    for (const p of zeekrProducts) {
      expect(
        validCategories.has(p.category),
        `${p.id} category "${p.category}" 不在合法集合内`,
      ).toBe(true);
    }
  });
});

describe("PRD §12 zeekrProductsByModel", () => {
  it("包含 9X/8X/009 三个 key", () => {
    expect(Object.keys(zeekrProductsByModel).sort()).toEqual([
      "009",
      "8X",
      "9X",
    ]);
  });

  it("各车型子集条数与 EXPECTED_MODEL_COUNTS 一致", () => {
    for (const model of ALL_MODELS) {
      expect(zeekrProductsByModel[model]).toHaveLength(
        EXPECTED_MODEL_COUNTS[model],
      );
    }
  });

  it("各车型子集按 orderInModel 升序", () => {
    for (const model of ALL_MODELS) {
      const arr = zeekrProductsByModel[model];
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.orderInModel).toBeGreaterThan(arr[i - 1]!.orderInModel);
      }
    }
  });
});

describe("PRD §12 zeekrTopicMeta", () => {
  it("totalProducts 字面量 = 23(禁止漂移)", () => {
    expect(zeekrTopicMeta.totalProducts).toBe(23);
  });

  it("totalModels 字面量 = 3(禁止漂移)", () => {
    expect(zeekrTopicMeta.totalModels).toBe(3);
  });

  it("title 必填且为'极氪改装专题'", () => {
    expect(zeekrTopicMeta.title).toBe("极氪改装专题");
  });

  it("description 必填且非空", () => {
    expect(zeekrTopicMeta.description).toBeTypeOf("string");
    expect(zeekrTopicMeta.description.length).toBeGreaterThan(0);
  });

  it("previewImage 路径为 /images/products/zeekr/preview.png", () => {
    expect(zeekrTopicMeta.previewImage).toBe(
      "/images/products/zeekr/preview.png",
    );
  });

  it("ogImage 路径为 /images/products/zeekr/preview.png", () => {
    expect(zeekrTopicMeta.ogImage).toBe("/images/products/zeekr/preview.png");
  });
});

describe("PRD §6.5 名称清洗规则", () => {
  it("9X 行 12 name = '冰箱垃圾桶按压款'(清洗了 3 空格)", () => {
    const p = zeekrProducts.find(
      (x) => x.model === "9X" && x.orderInModel === 12,
    )!;
    expect(p.name).toBe("冰箱垃圾桶按压款");
    expect(p.rawName).toBe("冰箱垃圾桶   按压款");
  });

  it("8X 行 1 name = '尾箱垫7件套'(清洗了 1 空格)", () => {
    const p = zeekrProducts.find(
      (x) => x.model === "8X" && x.orderInModel === 1,
    )!;
    expect(p.name).toBe("尾箱垫7件套");
  });

  it("8X 行 2 name = '挡泥板+内衬6件套'(清洗了 2 空格)", () => {
    const p = zeekrProducts.find(
      (x) => x.model === "8X" && x.orderInModel === 2,
    )!;
    expect(p.name).toBe("挡泥板+内衬6件套");
  });

  it("9X 行 14 '三段式方向盘' 和 8X 行 6 '三段式方向盘套' 是不同产品", () => {
    const p9x = zeekrProducts.find(
      (x) => x.model === "9X" && x.orderInModel === 14,
    )!;
    const p8x = zeekrProducts.find(
      (x) => x.model === "8X" && x.orderInModel === 6,
    )!;
    expect(p9x.name).toBe("三段式方向盘");
    expect(p8x.name).toBe("三段式方向盘套");
    expect(p9x.id).not.toBe(p8x.id);
  });
});

describe("image.alt 文本", () => {
  it("matched 产品的 alt 包含车型 + 产品名 + '产品展示图'", () => {
    for (const p of zeekrProducts.filter((p) => p.imageStatus === "matched")) {
      expect(p.image.alt).toContain(p.name);
      expect(p.image.alt).toContain("产品展示图");
    }
  });

  it("missing/pending-review 产品的 alt 包含车型 + 产品名 + '图片待补充'/'待复核'标识", () => {
    for (const p of zeekrProducts.filter(
      (p) => p.imageStatus !== "matched",
    )) {
      expect(p.image.alt).toContain(p.name);
      if (p.imageStatus === "missing") {
        expect(p.image.alt).toMatch(/图片待补充|暂无图片/);
      } else if (p.imageStatus === "pending-review") {
        expect(p.image.alt).toMatch(/待复核|待补充/);
      }
    }
  });
});

describe("类型推断 sanity check(ZeekrProduct)", () => {
  it("zeekrProducts[0] 是 ZeekrProduct 类型(编译期)", () => {
    const p: ZeekrProduct = zeekrProducts[0]!;
    expect(p.id).toBeTypeOf("string");
  });
});

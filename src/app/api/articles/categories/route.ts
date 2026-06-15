import { prisma } from "@/lib/prisma";

/** GET /api/articles/categories — 返回 DB 中实际存在的文章分类字典
 *
 *  与 `/api/articles` 公开 GET 一致：本接口也是公开元数据，不需要鉴权。
 *  过滤掉 category 为 NULL 的文章，按 value 升序排序让 UI 渲染稳定。
 */
export async function GET() {
  try {
    const groups = await prisma.article.groupBy({
      by: ["category"],
      where: { category: { not: null } },
      _count: { _all: true },
    });

    // 使用 Intl.Collator 做中文友好排序，失败时降级为 code point 排序，
    // 保证在缺少 ICU 数据的 Node 环境（如 vitest happy-dom）也能稳定输出。
    const collator = (() => {
      try {
        return new Intl.Collator("zh-Hans-CN", { sensitivity: "base" });
      } catch {
        return null;
      }
    })();

    const categories = groups
      .map((g) => ({
        value: g.category as string,
        label: g.category as string,
        count: g._count._all,
      }))
      .sort((a, b) => {
        if (collator) return collator.compare(a.value, b.value);
        return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
      });

    return Response.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("[GET /api/articles/categories]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

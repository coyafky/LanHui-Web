/**
 * 数据回填脚本（PRD §5.3）
 *
 * 将历史 imageUrl（相对路径 /images/...）回填到 imagePath 字段。
 * 远程 URL（http/https）不动。
 *
 * 运行： npx tsx scripts/migrate-image-paths.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.store.findMany({
    where: {
      imagePath: null,
      imageUrl: { not: null },
    },
    select: { id: true, slug: true, imageUrl: true, imagePath: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const s of candidates) {
    const url = s.imageUrl;
    if (!url) {
      skipped += 1;
      continue;
    }
    if (url.startsWith("/images/")) {
      await prisma.store.update({
        where: { id: s.id },
        data: { imagePath: url },
      });
      updated += 1;
      console.log(`  [migrated] ${s.slug} (${s.id}) → ${url}`);
    } else {
      skipped += 1;
      console.log(`  [skipped]  ${s.slug} (${s.id}) → 远程 URL: ${url}`);
    }
  }

  console.log("");
  console.log("─".repeat(50));
  console.log(`回填完成：updated=${updated}, skipped=${skipped}, total=${candidates.length}`);
  console.log("─".repeat(50));
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

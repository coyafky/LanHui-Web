import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { MAINLAND_PROVINCES, MAINLAND_CITIES } from "../src/lib/regions/mainland-regions";
import { mockStore, withSeed } from "../src/lib/test-utils/fixtures";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * 从大陆省市基础数据 upsert 写入 Province / City。
 * - 不删除已有省份/城市，update 子句只刷 code/type/order/label 等非 isActive 字段
 * - 已存在门店的外键引用不会被破坏
 */
async function seedRegions() {
  for (const p of MAINLAND_PROVINCES) {
    await prisma.province.upsert({
      where: { slug: p.slug },
      update: {
        code: p.code,
        type: p.type,
        order: p.order,
      },
      create: {
        slug: p.slug,
        code: p.code,
        type: p.type,
        label: p.label,
        order: p.order,
        isActive: true,
      },
    });
  }
  for (const c of MAINLAND_CITIES) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: {
        code: c.code,
        type: c.type,
        order: c.order,
        provinceSlug: c.provinceSlug,
      },
      create: {
        slug: c.slug,
        code: c.code,
        type: c.type,
        label: c.label,
        provinceSlug: c.provinceSlug,
        order: c.order,
        isActive: true,
      },
    });
  }
  console.log(
    `✅ 省份: ${MAINLAND_PROVINCES.length} 条；城市: ${MAINLAND_CITIES.length} 条`,
  );
}

async function main() {
  console.log("🌱 开始种子数据导入...");

  // ── 1. 创建 admin 用户 ──
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lanhui.com" },
    update: {},
    create: {
      email: "admin@lanhui.com",
      username: "admin",
      password: hashedPassword,
      name: "系统管理员",
      role: "admin",
      status: "active",
    },
  });

  console.log(`✅ 用户创建: ${admin.email}`);

  // ── 2. 写入大陆省/市基础数据（先于门店，保证外键存在） ──
  await seedRegions();

  // ── 3. 创建门店（从 store.ts Mock 数据迁移，使用自定义6位数字 ID） ──
  // 先清理：每个城市只保留一个 flagship，其余降级为 premium
  const flagshipCities = await prisma.store.findMany({
    where: {
      level: "flagship",
      status: { not: "terminated" },
    },
    orderBy: { id: "asc" },
    select: { id: true, provinceSlug: true, citySlug: true },
  });
  const seenCities = new Set<string>();
  const downgradeIds: string[] = [];
  for (const s of flagshipCities) {
    const key = `${s.provinceSlug}:${s.citySlug}`;
    if (seenCities.has(key)) {
      downgradeIds.push(s.id);
    } else {
      seenCities.add(key);
    }
  }
  if (downgradeIds.length > 0) {
    await prisma.store.updateMany({
      where: { id: { in: downgradeIds } },
      data: { level: "premium" },
    });
    console.log(`🔧 降级 ${downgradeIds.length} 个重复旗舰店为 premium`);
  }

  // 用 upsert 保持幂等，不删除已有记录，避免破坏 AnalyticsEvent 关联
  const storeData = [
    {
      id: "100001",
      slug: "shunde-daliang",
      name: "蓝辉轻改顺德大良店",
      provinceSlug: "guangdong",
      provinceLabel: "广东省",
      citySlug: "foshan",
      cityLabel: "佛山市",
      district: "顺德区大良",
      address: "广东省佛山市顺德区大良街道南国中路88号蓝辉轻改体验中心",
      phone: "0757-2288 1001",
      phoneTel: "tel:075722881001",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改旗舰服务中心，位于顺德大良核心商圈，提供全品类轻改装备与汽车膜系施工服务，配备独立施工工位与客户休息区。",
      level: "flagship",
    },
    {
      id: "100002",
      slug: "shunde-ronggui",
      name: "蓝辉轻改顺德容桂店",
      provinceSlug: "guangdong",
      provinceLabel: "广东省",
      citySlug: "foshan",
      cityLabel: "佛山市",
      district: "顺德区容桂",
      address: "广东省佛山市顺德区容桂街道容奇大道中66号",
      phone: "0757-2288 1002",
      phoneTel: "tel:075722881002",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改顺德容桂标准店，服务容桂及周边区域车主，提供轻改装备升级与膜系施工。",
      level: "premium",
    },
    {
      id: "100003",
      slug: "foshan-nanhai",
      name: "蓝辉轻改佛山南海店",
      provinceSlug: "guangdong",
      provinceLabel: "广东省",
      citySlug: "foshan",
      cityLabel: "佛山市",
      district: "南海区",
      address: "广东省佛山市南海区桂城街道灯湖东路6号万达广场1楼",
      phone: "0757-8628 6601",
      phoneTel: "tel:075786286601",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改佛山南海标准店，位于南海桂城核心商圈，服务南海及周边区域车主，提供轻改装备升级与膜系施工。",
      level: "specialty",
    },
    {
      id: "100004",
      slug: "nanjing-jiangning",
      name: "蓝辉轻改南京江宁店",
      provinceSlug: "jiangsu",
      provinceLabel: "江苏省",
      citySlug: "nanjing",
      cityLabel: "南京市",
      district: "江宁区",
      address: "江苏省南京市江宁区东山街道双龙大道1568号金轮新都汇1楼",
      phone: "025-5818 8801",
      phoneTel: "tel:02558188801",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改南京江宁标准店，覆盖江宁及南京南部区域，提供轻改升级与膜系施工服务。",
      level: "flagship",
    },
    {
      id: "100005",
      slug: "suzhou-yuanqu",
      name: "蓝辉轻改苏州园区店",
      provinceSlug: "jiangsu",
      provinceLabel: "江苏省",
      citySlug: "suzhou",
      cityLabel: "苏州市",
      district: "工业园区",
      address: "江苏省苏州市工业园区星湖街218号苏州中心商场B1层",
      phone: "0512-6288 5501",
      phoneTel: "tel:051262885501",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改苏州园区授权店，服务园区及周边高端社区车主，提供轻改升级方案。",
      level: "flagship",
    },
    {
      id: "100006",
      slug: "hangzhou-xiaoshan",
      name: "蓝辉轻改杭州萧山店",
      provinceSlug: "zhejiang",
      provinceLabel: "浙江省",
      citySlug: "hangzhou",
      cityLabel: "杭州市",
      district: "萧山区",
      address: "浙江省杭州市萧山区市心北路168号旺角城新天地1楼",
      phone: "0571-8833 7701",
      phoneTel: "tel:057188337701",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改杭州萧山标准店，覆盖萧山区及杭州南部新城车主，提供全品类轻改装备与膜系施工。",
      level: "flagship",
    },
    {
      id: "100007",
      slug: "foshan-chancheng",
      name: "蓝辉轻改佛山禅城店",
      provinceSlug: "guangdong",
      provinceLabel: "广东省",
      citySlug: "foshan",
      cityLabel: "佛山市",
      district: "禅城区",
      address: "广东省佛山市禅城区祖庙路33号百花广场1楼",
      phone: "0757-8328 3301",
      phoneTel: "tel:075783283301",
      businessHours: "09:00-18:00",
      description: "蓝辉轻改佛山禅城标准店，位于禅城核心商圈，服务佛山主城区车主，提供轻改升级与膜系施工服务。",
      level: "member",
    },
  ];

  // 不删除已有门店，改用 upsert 保持幂等（避免破坏已存在 AnalyticsEvent 关联）
  for (const s of storeData) {
    await prisma.store.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  console.log(`✅ 门店创建: ${storeData.length} 条`);

  // ── 4.5 用 faker 追加 30 家「边界样本」门店（id 200001-200030） ──
  // 用途：让 /admin/stores 列表测试有充足数据；
  // 覆盖长名/特殊字符/各种 status/level 组合。
  // 与 storeData 一样用 upsert 保持幂等。
  withSeed(20260625);
  const FAKER_STORE_COUNT = 30;
  const fakerFlagshipCities = new Set<string>();
  for (let i = 0; i < FAKER_STORE_COUNT; i++) {
    const id = String(200001 + i);
    const raw = mockStore({
      id,
      slug: `faker-${id}`,
    });
    // 确保每城市最多 1 个 flagship
    const cityKey = `${raw.provinceSlug}:${raw.citySlug}`;
    const level = raw.level === "flagship" && fakerFlagshipCities.has(cityKey)
      ? (["premium", "specialty", "member"] as const)[i % 3]
      : raw.level;
    if (level === "flagship") fakerFlagshipCities.add(cityKey);
    const fakerStore = { ...raw, level };
    await prisma.store.upsert({
      where: { id: fakerStore.id },
      update: fakerStore,
      create: fakerStore,
    });
  }
  console.log(
    `✅ faker 边界门店创建: ${FAKER_STORE_COUNT} 条（id 200001-${String(200000 + FAKER_STORE_COUNT).padStart(6, "0")}）`,
  );

  console.log("🎉 种子数据导入完成！");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 种子数据导入失败:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

  // ── 2. 创建省份 ──
  const provinceData = [
    { slug: "guangdong", label: "广东省", order: 1 },
    { slug: "jiangsu", label: "江苏省", order: 2 },
    { slug: "zhejiang", label: "浙江省", order: 3 },
  ];

  for (const p of provinceData) {
    await prisma.province.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log(`✅ 省份创建: ${provinceData.length} 条`);

  // ── 3. 创建城市（slug 与 china-regions.ts 对齐，使用城市级别简名） ──
  const cityData = [
    { slug: "foshan", provinceSlug: "guangdong", label: "佛山市", order: 1 },
    { slug: "nanjing", provinceSlug: "jiangsu", label: "南京市", order: 1 },
    { slug: "suzhou", provinceSlug: "jiangsu", label: "苏州市", order: 2 },
    { slug: "hangzhou", provinceSlug: "zhejiang", label: "杭州市", order: 1 },
  ];

  for (const c of cityData) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log(`✅ 城市创建: ${cityData.length} 条`);

  // ── 4. 创建门店（从 store.ts Mock 数据迁移，使用自定义6位数字 ID） ──
  //
  // 使用 deleteMany + create 代替 upsert，因为 Prisma upsert 的 update 子句
  // 不会更新主键 id 字段。若数据库中已存在 cuid 格式 ID 的旧记录，
  // upsert 无法将其更新为自定义6位数字 ID。
  //
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
    },
  ];

  // 清除旧门店数据（AnalyticsEvent.storeId 设为 SET NULL），再重新创建
  await prisma.store.deleteMany();
  for (const s of storeData) {
    await prisma.store.create({ data: s });
  }

  console.log(`✅ 门店创建: ${storeData.length} 条`);
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

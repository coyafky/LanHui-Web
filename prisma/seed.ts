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

  // ── 5. 创建文章种子数据 ──
  const articleData = [
    {
      title: "蓝辉轻改品牌官网正式上线",
      slug: "brand-website-launch",
      excerpt: "蓝辉轻改官方网站正式上线，系统展示轻改装备与汽车膜系服务，为车主提供一站式轻改方案。",
      content: `## 官网上线

蓝辉轻改官方网站正式上线！经过数月精心筹备，我们为车主打造了一个全新的线上平台。

### 网站特色

- **产品展示**：电动踏板、轮毂升级、底盘升级、汽车窗膜、改色膜与隐形车衣六大产品线完整呈现
- **门店导航**：一键查找离您最近的蓝辉门店，获取到店路线与联系方式
- **品牌资讯**：实时了解品牌动态、门店活动与产品更新

### 关于蓝辉轻改

蓝辉轻改专注于汽车轻改装领域，秉承「让爱车更有型，也更好用」的理念，为车主提供专业、可靠的轻改升级服务。目前已在广东、江苏、浙江等省份布局多家门店，服务网络持续扩展中。

> 欢迎到店咨询，专业技师为您推荐最优轻改方案。`,
      authorId: admin.id,
      status: "published",
      category: "品牌动态",
      tags: ["官网", "品牌"],
      publishedAt: new Date("2026-05-01"),
    },
    {
      title: "顺德大良店服务升级，新增改色膜施工工位",
      slug: "shunde-daliang-service-upgrade",
      excerpt: "蓝辉轻改顺德大良店完成服务升级，新增改色膜与隐形车衣专用施工工位，提升交付效率。",
      content: `## 门店升级

蓝辉轻改顺德大良店近期完成服务升级，新增改色膜与隐形车衣专用施工工位，全面提升交付效率与施工品质。

### 升级内容

- 新增 **2 个改色膜专用工位**，配备恒温无尘施工环境
- 引进专业裁膜设备，支持全车改色膜精确裁切
- 新增 **隐形车衣施工区**，配备专用水贴工艺
- 客户休息区升级，提供更舒适的等候体验

### 预约方式

如需预约施工服务，可通过以下方式联系我们：

1. 拨打门店电话 **0757-2288 1001**
2. 到店咨询：广东省佛山市顺德区大良街道南国中路88号
3. 通过官网联系页面在线预约

> 温馨提示：改色膜施工需提前 1-2 天预约，以便安排工位与备料。`,
      authorId: admin.id,
      status: "published",
      category: "门店动态",
      tags: ["顺德大良", "改色膜", "服务升级"],
      publishedAt: new Date("2026-05-15"),
    },
    {
      title: "电动踏板产品线全面升级，适配更多车型",
      slug: "electric-steps-product-upgrade",
      excerpt: "蓝辉轻改电动踏板产品线全面升级，新增适配车型30+，覆盖主流SUV与MPV车型。",
      content: `## 产品升级

蓝辉轻改电动踏板产品线迎来全面升级，新增适配车型30余款，覆盖市场主流SUV与MPV。

### 产品亮点

- **智能感应**：车门开启自动伸出，关闭自动收回
- **原车质感**：与原车踏板位完美匹配，无损安装
- **安全防护**：IP67 级防水，-30°C 至 80°C 全天候工作
- **静音电机**：运行噪音低于 40dB，舒适体验

### 新增适配车型（部分）

| 品牌 | 车型 |
|------|------|
| 丰田 | 汉兰达、塞纳、红杉 |
| 本田 | CR-V、奥德赛 |
| 大众 | 途昂、威然 |
| 别克 | GL8、昂科威 |

> 详情请到店咨询，专业技师将为您的车型推荐最优方案。`,
      authorId: admin.id,
      status: "published",
      category: "产品动态",
      tags: ["电动踏板", "产品升级", "适配车型"],
      publishedAt: new Date("2026-06-01"),
    },
    {
      title: "轮毂升级指南：如何选择适合的轮毂",
      slug: "wheel-upgrade-guide-draft",
      excerpt: "轮毂升级入门指南，从尺寸、材质到品牌，帮您做出明智选择。",
      content: `## 轮毂升级入门

本文为轮毂升级入门指南，帮助车主了解轮毂升级的基本知识。

### 轮毂尺寸选择

选择轮毂时需要考虑以下因素：

- 原车尺寸参数（J值、ET值、PCD、CB）
- 升级后的轮胎匹配
- 行驶通过性要求

### 材质对比

**铸造轮毂**：性价比高，款式丰富，适合日常使用
**旋压轮毂**：强度更高，重量更轻，兼顾性能与价格
**锻造轮毂**：极致轻量，强度最高，适合追求性能的车主

*（本文持续完善中...）*`,
      authorId: admin.id,
      status: "draft",
      category: "产品知识",
      tags: ["轮毂", "选购指南"],
    },
  ];

  for (const a of articleData) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }

  console.log(`✅ 文章创建: ${articleData.length} 条`);
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

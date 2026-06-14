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

  // ── 2. 创建省份（31 个大陆省级行政区，不含港澳台） ──
  const provinceData = [
    // 4 直辖市
    { slug: "beijing", label: "北京市", order: 1 },
    { slug: "tianjin", label: "天津市", order: 2 },
    { slug: "shanghai", label: "上海市", order: 3 },
    { slug: "chongqing", label: "重庆市", order: 4 },
    // 23 省
    { slug: "hebei", label: "河北省", order: 5 },
    { slug: "shanxi", label: "山西省", order: 6 },
    { slug: "liaoning", label: "辽宁省", order: 7 },
    { slug: "jilin", label: "吉林省", order: 8 },
    { slug: "heilongjiang", label: "黑龙江省", order: 9 },
    { slug: "jiangsu", label: "江苏省", order: 10 },
    { slug: "zhejiang", label: "浙江省", order: 11 },
    { slug: "anhui", label: "安徽省", order: 12 },
    { slug: "fujian", label: "福建省", order: 13 },
    { slug: "jiangxi", label: "江西省", order: 14 },
    { slug: "shandong", label: "山东省", order: 15 },
    { slug: "henan", label: "河南省", order: 16 },
    { slug: "hubei", label: "湖北省", order: 17 },
    { slug: "hunan", label: "湖南省", order: 18 },
    { slug: "guangdong", label: "广东省", order: 19 },
    { slug: "hainan", label: "海南省", order: 20 },
    { slug: "sichuan", label: "四川省", order: 21 },
    { slug: "guizhou", label: "贵州省", order: 22 },
    { slug: "yunnan", label: "云南省", order: 23 },
    { slug: "shaanxi", label: "陕西省", order: 24 },
    { slug: "gansu", label: "甘肃省", order: 25 },
    { slug: "qinghai", label: "青海省", order: 26 },
    // 5 自治区
    { slug: "neimenggu", label: "内蒙古自治区", order: 27 },
    { slug: "guangxi", label: "广西壮族自治区", order: 28 },
    { slug: "xizang", label: "西藏自治区", order: 29 },
    { slug: "ningxia", label: "宁夏回族自治区", order: 30 },
    { slug: "xinjiang", label: "新疆维吾尔自治区", order: 31 },
  ];

  for (const p of provinceData) {
    await prisma.province.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log(`✅ 省份创建: ${provinceData.length} 条`);

  // ── 3. 创建城市（~100 项热门城市/区） ──
  const cityData = [
    // 北京（6 区）
    { slug: "dongcheng", provinceSlug: "beijing", label: "东城区", order: 1 },
    { slug: "xicheng", provinceSlug: "beijing", label: "西城区", order: 2 },
    { slug: "chaoyang", provinceSlug: "beijing", label: "朝阳区", order: 3 },
    { slug: "haidian", provinceSlug: "beijing", label: "海淀区", order: 4 },
    { slug: "fengtai", provinceSlug: "beijing", label: "丰台区", order: 5 },
    { slug: "tongzhou", provinceSlug: "beijing", label: "通州区", order: 6 },
    // 天津（4 区）
    { slug: "heping", provinceSlug: "tianjin", label: "和平区", order: 1 },
    { slug: "hexiqu", provinceSlug: "tianjin", label: "河西区", order: 2 },
    { slug: "nankai", provinceSlug: "tianjin", label: "南开区", order: 3 },
    { slug: "binhaixinqu", provinceSlug: "tianjin", label: "滨海新区", order: 4 },
    // 上海（5 区）
    { slug: "huangpu", provinceSlug: "shanghai", label: "黄浦区", order: 1 },
    { slug: "xuhui", provinceSlug: "shanghai", label: "徐汇区", order: 2 },
    { slug: "changning", provinceSlug: "shanghai", label: "长宁区", order: 3 },
    { slug: "pudongxinqu", provinceSlug: "shanghai", label: "浦东新区", order: 4 },
    { slug: "minhang", provinceSlug: "shanghai", label: "闵行区", order: 5 },
    // 重庆（6 区）
    { slug: "yuzhong", provinceSlug: "chongqing", label: "渝中区", order: 1 },
    { slug: "jiangbei", provinceSlug: "chongqing", label: "江北区", order: 2 },
    { slug: "yubei", provinceSlug: "chongqing", label: "渝北区", order: 3 },
    { slug: "nanan", provinceSlug: "chongqing", label: "南岸区", order: 4 },
    { slug: "shapingba", provinceSlug: "chongqing", label: "沙坪坝区", order: 5 },
    { slug: "jiulongpo", provinceSlug: "chongqing", label: "九龙坡区", order: 6 },
    // 河北
    { slug: "shijiazhuang", provinceSlug: "hebei", label: "石家庄市", order: 1 },
    { slug: "tangshan", provinceSlug: "hebei", label: "唐山市", order: 2 },
    { slug: "baoding", provinceSlug: "hebei", label: "保定市", order: 3 },
    { slug: "handan", provinceSlug: "hebei", label: "邯郸市", order: 4 },
    // 山西
    { slug: "taiyuan", provinceSlug: "shanxi", label: "太原市", order: 1 },
    { slug: "datong", provinceSlug: "shanxi", label: "大同市", order: 2 },
    { slug: "linfen", provinceSlug: "shanxi", label: "临汾市", order: 3 },
    // 内蒙古
    { slug: "huhehaote", provinceSlug: "neimenggu", label: "呼和浩特市", order: 1 },
    { slug: "baotou", provinceSlug: "neimenggu", label: "包头市", order: 2 },
    { slug: "ordos", provinceSlug: "neimenggu", label: "鄂尔多斯市", order: 3 },
    // 辽宁
    { slug: "shenyang", provinceSlug: "liaoning", label: "沈阳市", order: 1 },
    { slug: "dalian", provinceSlug: "liaoning", label: "大连市", order: 2 },
    { slug: "anshan", provinceSlug: "liaoning", label: "鞍山市", order: 3 },
    // 吉林
    { slug: "changchun", provinceSlug: "jilin", label: "长春市", order: 1 },
    { slug: "jilin", provinceSlug: "jilin", label: "吉林市", order: 2 },
    // 黑龙江
    { slug: "haerbin", provinceSlug: "heilongjiang", label: "哈尔滨市", order: 1 },
    { slug: "daqing", provinceSlug: "heilongjiang", label: "大庆市", order: 2 },
    { slug: "qiqihaer", provinceSlug: "heilongjiang", label: "齐齐哈尔市", order: 3 },
    // 江苏
    { slug: "nanjing", provinceSlug: "jiangsu", label: "南京市", order: 1 },
    { slug: "suzhou", provinceSlug: "jiangsu", label: "苏州市", order: 2 },
    { slug: "wuxi", provinceSlug: "jiangsu", label: "无锡市", order: 3 },
    { slug: "changzhou", provinceSlug: "jiangsu", label: "常州市", order: 4 },
    // 浙江
    { slug: "hangzhou", provinceSlug: "zhejiang", label: "杭州市", order: 1 },
    { slug: "ningbo", provinceSlug: "zhejiang", label: "宁波市", order: 2 },
    { slug: "wenzhou", provinceSlug: "zhejiang", label: "温州市", order: 3 },
    { slug: "jiaxing", provinceSlug: "zhejiang", label: "嘉兴市", order: 4 },
    // 安徽
    { slug: "hefei", provinceSlug: "anhui", label: "合肥市", order: 1 },
    { slug: "wuhu", provinceSlug: "anhui", label: "芜湖市", order: 2 },
    { slug: "bengbu", provinceSlug: "anhui", label: "蚌埠市", order: 3 },
    // 福建
    { slug: "fuzhou", provinceSlug: "fujian", label: "福州市", order: 1 },
    { slug: "xiamen", provinceSlug: "fujian", label: "厦门市", order: 2 },
    { slug: "quanzhou", provinceSlug: "fujian", label: "泉州市", order: 3 },
    // 江西
    { slug: "nanchang", provinceSlug: "jiangxi", label: "南昌市", order: 1 },
    { slug: "jiujiang", provinceSlug: "jiangxi", label: "九江市", order: 2 },
    { slug: "ganzhou", provinceSlug: "jiangxi", label: "赣州市", order: 3 },
    // 山东
    { slug: "jinan", provinceSlug: "shandong", label: "济南市", order: 1 },
    { slug: "qingdao", provinceSlug: "shandong", label: "青岛市", order: 2 },
    { slug: "yantai", provinceSlug: "shandong", label: "烟台市", order: 3 },
    { slug: "weifang", provinceSlug: "shandong", label: "潍坊市", order: 4 },
    // 河南
    { slug: "zhengzhou", provinceSlug: "henan", label: "郑州市", order: 1 },
    { slug: "luoyang", provinceSlug: "henan", label: "洛阳市", order: 2 },
    { slug: "kaifeng", provinceSlug: "henan", label: "开封市", order: 3 },
    { slug: "xinxiang", provinceSlug: "henan", label: "新乡市", order: 4 },
    // 湖北
    { slug: "wuhan", provinceSlug: "hubei", label: "武汉市", order: 1 },
    { slug: "yichang", provinceSlug: "hubei", label: "宜昌市", order: 2 },
    { slug: "xiangyang", provinceSlug: "hubei", label: "襄阳市", order: 3 },
    // 湖南
    { slug: "changsha", provinceSlug: "hunan", label: "长沙市", order: 1 },
    { slug: "zhuzhou", provinceSlug: "hunan", label: "株洲市", order: 2 },
    { slug: "hengyang", provinceSlug: "hunan", label: "衡阳市", order: 3 },
    // 广东
    { slug: "guangzhou", provinceSlug: "guangdong", label: "广州市", order: 1 },
    { slug: "shenzhen", provinceSlug: "guangdong", label: "深圳市", order: 2 },
    { slug: "foshan", provinceSlug: "guangdong", label: "佛山市", order: 3 },
    { slug: "dongguan", provinceSlug: "guangdong", label: "东莞市", order: 4 },
    { slug: "zhuhai", provinceSlug: "guangdong", label: "珠海市", order: 5 },
    { slug: "zhongshan", provinceSlug: "guangdong", label: "中山市", order: 6 },
    // 广西
    { slug: "nanning", provinceSlug: "guangxi", label: "南宁市", order: 1 },
    { slug: "guilin", provinceSlug: "guangxi", label: "桂林市", order: 2 },
    { slug: "liuzhou", provinceSlug: "guangxi", label: "柳州市", order: 3 },
    // 海南
    { slug: "haikou", provinceSlug: "hainan", label: "海口市", order: 1 },
    { slug: "sanya", provinceSlug: "hainan", label: "三亚市", order: 2 },
    // 四川
    { slug: "chengdu", provinceSlug: "sichuan", label: "成都市", order: 1 },
    { slug: "mianyang", provinceSlug: "sichuan", label: "绵阳市", order: 2 },
    { slug: "yibin", provinceSlug: "sichuan", label: "宜宾市", order: 3 },
    // 贵州
    { slug: "guiyang", provinceSlug: "guizhou", label: "贵阳市", order: 1 },
    { slug: "zunyi", provinceSlug: "guizhou", label: "遵义市", order: 2 },
    // 云南
    { slug: "kunming", provinceSlug: "yunnan", label: "昆明市", order: 1 },
    { slug: "dali", provinceSlug: "yunnan", label: "大理市", order: 2 },
    { slug: "yuxi", provinceSlug: "yunnan", label: "玉溪市", order: 3 },
    // 西藏
    { slug: "lasa", provinceSlug: "xizang", label: "拉萨市", order: 1 },
    // 陕西
    { slug: "xian", provinceSlug: "shaanxi", label: "西安市", order: 1 },
    { slug: "xianyang", provinceSlug: "shaanxi", label: "咸阳市", order: 2 },
    { slug: "baoji", provinceSlug: "shaanxi", label: "宝鸡市", order: 3 },
    // 甘肃
    { slug: "lanzhou", provinceSlug: "gansu", label: "兰州市", order: 1 },
    { slug: "tianshui", provinceSlug: "gansu", label: "天水市", order: 2 },
    // 青海
    { slug: "xining", provinceSlug: "qinghai", label: "西宁市", order: 1 },
    // 宁夏
    { slug: "yinchuan", provinceSlug: "ningxia", label: "银川市", order: 1 },
    // 新疆
    { slug: "wulumuqi", provinceSlug: "xinjiang", label: "乌鲁木齐市", order: 1 },
    { slug: "kashi", provinceSlug: "xinjiang", label: "喀什市", order: 2 },
  ];

  for (const c of cityData) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log(`✅ 城市创建: ${cityData.length} 条`);

  // ── 4. 门店（保留现有数据，不重建） ──
  // 旧 seed 会调用 prisma.store.deleteMany() 清空门店再重建，会把用户已创建
  // 的门店（如 admin 手动添加的）一并清空。这里改为不删除、不重建，
  // 门店数据由 admin 在后台管理或通过迁移脚本维护。
  const existingStoreCount = await prisma.store.count();
  console.log(`✅ 门店: 保留现有数据（当前 ${existingStoreCount} 条）`);
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

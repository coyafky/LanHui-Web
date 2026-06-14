/**
 * 中国大陆省级行政区与地级市基础数据
 *
 * 数据范围：仅中国大陆（不含港澳台）
 * 数据粒度：省级 31 条（4 直辖市 + 22 省 + 5 自治区）；地级 333 条
 *
 * 数据来源：
 * - GB/T 2260-2007 中华人民共和国行政区划代码
 * - 国家统计局 2022 年统计用区划代码（公开数据）
 *
 * 字段说明：
 * - code: 6 位行政区划代码，作为稳定数据标识（Province 以 XX0000 结尾，City 以 XXYY00 结尾）
 * - slug: 拼音 slug，用于 URL 和后台选择器（直辖市 city slug 与 province slug 同名）
 * - label: 中文官方名称
 * - type: 行政单元类别
 *   - ProvinceType: municipality / province / autonomous_region
 *   - CityType: municipality / prefecture_city / autonomous_prefecture / prefecture / league
 * - order: 显示顺序（按官方编码升序）
 *
 * 注意：仅用于 seed 初始化和测试。不作为运行时校验源（P2 阶段 API 校验改用数据库）。
 */

export type ProvinceType = "municipality" | "province" | "autonomous_region";
export type CityType =
  | "municipality"
  | "prefecture_city"
  | "autonomous_prefecture"
  | "prefecture"
  | "league";

export interface ProvinceData {
  code: string;
  slug: string;
  label: string;
  type: ProvinceType;
  order: number;
}

export interface CityData {
  code: string;
  slug: string;
  label: string;
  provinceSlug: string;
  type: CityType;
  order: number;
}

// ────────────────────────────────────────────────────────────
// 31 个省级行政区（4 直辖市 + 22 省 + 5 自治区；不含港澳台）
// ────────────────────────────────────────────────────────────

export const MAINLAND_PROVINCES: ProvinceData[] = [
  // 直辖市
  { code: "110000", slug: "beijing", label: "北京市", type: "municipality", order: 1 },
  { code: "120000", slug: "tianjin", label: "天津市", type: "municipality", order: 2 },
  { code: "310000", slug: "shanghai", label: "上海市", type: "municipality", order: 3 },
  { code: "500000", slug: "chongqing", label: "重庆市", type: "municipality", order: 4 },
  // 省
  { code: "130000", slug: "hebei", label: "河北省", type: "province", order: 5 },
  { code: "140000", slug: "shanxi", label: "山西省", type: "province", order: 6 },
  { code: "150000", slug: "neimenggu", label: "内蒙古自治区", type: "autonomous_region", order: 7 },
  { code: "210000", slug: "liaoning", label: "辽宁省", type: "province", order: 8 },
  { code: "220000", slug: "jilin", label: "吉林省", type: "province", order: 9 },
  { code: "230000", slug: "heilongjiang", label: "黑龙江省", type: "province", order: 10 },
  { code: "320000", slug: "jiangsu", label: "江苏省", type: "province", order: 11 },
  { code: "330000", slug: "zhejiang", label: "浙江省", type: "province", order: 12 },
  { code: "340000", slug: "anhui", label: "安徽省", type: "province", order: 13 },
  { code: "350000", slug: "fujian", label: "福建省", type: "province", order: 14 },
  { code: "360000", slug: "jiangxi", label: "江西省", type: "province", order: 15 },
  { code: "370000", slug: "shandong", label: "山东省", type: "province", order: 16 },
  { code: "410000", slug: "henan", label: "河南省", type: "province", order: 17 },
  { code: "420000", slug: "hubei", label: "湖北省", type: "province", order: 18 },
  { code: "430000", slug: "hunan", label: "湖南省", type: "province", order: 19 },
  { code: "440000", slug: "guangdong", label: "广东省", type: "province", order: 20 },
  { code: "450000", slug: "guangxi", label: "广西壮族自治区", type: "autonomous_region", order: 21 },
  { code: "460000", slug: "hainan", label: "海南省", type: "province", order: 22 },
  { code: "510000", slug: "sichuan", label: "四川省", type: "province", order: 23 },
  { code: "520000", slug: "guizhou", label: "贵州省", type: "province", order: 24 },
  { code: "530000", slug: "yunnan", label: "云南省", type: "province", order: 25 },
  { code: "540000", slug: "xizang", label: "西藏自治区", type: "autonomous_region", order: 26 },
  { code: "610000", slug: "shaanxi", label: "陕西省", type: "province", order: 27 },
  { code: "620000", slug: "gansu", label: "甘肃省", type: "province", order: 28 },
  { code: "630000", slug: "qinghai", label: "青海省", type: "province", order: 29 },
  { code: "640000", slug: "ningxia", label: "宁夏回族自治区", type: "autonomous_region", order: 30 },
  { code: "650000", slug: "xinjiang", label: "新疆维吾尔自治区", type: "autonomous_region", order: 31 },
];

// ────────────────────────────────────────────────────────────
// 333 个地级行政单元
// - 4 直辖市：每市 1 条 municipality 城市（city.slug = province.slug）
// - 省/自治区：地级市 / 自治州 / 地区 / 盟
// ────────────────────────────────────────────────────────────

export const MAINLAND_CITIES: CityData[] = [
  // ── 北京市（municipality）──
  { code: "110100", slug: "beijing", label: "北京市", provinceSlug: "beijing", type: "municipality", order: 1 },

  // ── 天津市（municipality）──
  { code: "120100", slug: "tianjin", label: "天津市", provinceSlug: "tianjin", type: "municipality", order: 1 },

  // ── 上海市（municipality）──
  { code: "310100", slug: "shanghai", label: "上海市", provinceSlug: "shanghai", type: "municipality", order: 1 },

  // ── 重庆市（municipality）──
  { code: "500100", slug: "chongqing", label: "重庆市", provinceSlug: "chongqing", type: "municipality", order: 1 },

  // ── 河北省 ──
  { code: "130100", slug: "shijiazhuang", label: "石家庄市", provinceSlug: "hebei", type: "prefecture_city", order: 1 },
  { code: "130200", slug: "tangshan", label: "唐山市", provinceSlug: "hebei", type: "prefecture_city", order: 2 },
  { code: "130300", slug: "qinhuangdao", label: "秦皇岛市", provinceSlug: "hebei", type: "prefecture_city", order: 3 },
  { code: "130400", slug: "handan", label: "邯郸市", provinceSlug: "hebei", type: "prefecture_city", order: 4 },
  { code: "130500", slug: "xingtai", label: "邢台市", provinceSlug: "hebei", type: "prefecture_city", order: 5 },
  { code: "130600", slug: "baoding", label: "保定市", provinceSlug: "hebei", type: "prefecture_city", order: 6 },
  { code: "130700", slug: "zhangjiakou", label: "张家口市", provinceSlug: "hebei", type: "prefecture_city", order: 7 },
  { code: "130800", slug: "chengde", label: "承德市", provinceSlug: "hebei", type: "prefecture_city", order: 8 },
  { code: "130900", slug: "cangzhou", label: "沧州市", provinceSlug: "hebei", type: "prefecture_city", order: 9 },
  { code: "131000", slug: "langfang", label: "廊坊市", provinceSlug: "hebei", type: "prefecture_city", order: 10 },
  { code: "131100", slug: "hengshui", label: "衡水市", provinceSlug: "hebei", type: "prefecture_city", order: 11 },

  // ── 山西省 ──
  { code: "140100", slug: "taiyuan", label: "太原市", provinceSlug: "shanxi", type: "prefecture_city", order: 1 },
  { code: "140200", slug: "datong", label: "大同市", provinceSlug: "shanxi", type: "prefecture_city", order: 2 },
  { code: "140300", slug: "yangquan", label: "阳泉市", provinceSlug: "shanxi", type: "prefecture_city", order: 3 },
  { code: "140400", slug: "changzhi", label: "长治市", provinceSlug: "shanxi", type: "prefecture_city", order: 4 },
  { code: "140500", slug: "jincheng", label: "晋城市", provinceSlug: "shanxi", type: "prefecture_city", order: 5 },
  { code: "140600", slug: "shuozhou", label: "朔州市", provinceSlug: "shanxi", type: "prefecture_city", order: 6 },
  { code: "140700", slug: "xinzhou", label: "忻州市", provinceSlug: "shanxi", type: "prefecture_city", order: 7 },
  { code: "140800", slug: "linfen", label: "临汾市", provinceSlug: "shanxi", type: "prefecture_city", order: 8 },
  { code: "140900", slug: "lvliang", label: "吕梁市", provinceSlug: "shanxi", type: "prefecture_city", order: 9 },
  { code: "141000", slug: "jinzhong", label: "晋中市", provinceSlug: "shanxi", type: "prefecture_city", order: 10 },
  { code: "141100", slug: "yuncheng", label: "运城市", provinceSlug: "shanxi", type: "prefecture_city", order: 11 },

  // ── 内蒙古自治区 ──
  { code: "150100", slug: "huhehaote", label: "呼和浩特市", provinceSlug: "neimenggu", type: "prefecture_city", order: 1 },
  { code: "150200", slug: "baotou", label: "包头市", provinceSlug: "neimenggu", type: "prefecture_city", order: 2 },
  { code: "150300", slug: "wuhai", label: "乌海市", provinceSlug: "neimenggu", type: "prefecture_city", order: 3 },
  { code: "150400", slug: "chifeng", label: "赤峰市", provinceSlug: "neimenggu", type: "prefecture_city", order: 4 },
  { code: "150500", slug: "tongliao", label: "通辽市", provinceSlug: "neimenggu", type: "prefecture_city", order: 5 },
  { code: "150600", slug: "eerduosi", label: "鄂尔多斯市", provinceSlug: "neimenggu", type: "prefecture_city", order: 6 },
  { code: "150700", slug: "hulunbeier", label: "呼伦贝尔市", provinceSlug: "neimenggu", type: "prefecture_city", order: 7 },
  { code: "150800", slug: "bayannaoer", label: "巴彦淖尔市", provinceSlug: "neimenggu", type: "prefecture_city", order: 8 },
  { code: "150900", slug: "wulanchabu", label: "乌兰察布市", provinceSlug: "neimenggu", type: "prefecture_city", order: 9 },
  { code: "152200", slug: "xingan", label: "兴安盟", provinceSlug: "neimenggu", type: "league", order: 10 },
  { code: "152500", slug: "xilinguole", label: "锡林郭勒盟", provinceSlug: "neimenggu", type: "league", order: 11 },
  { code: "152900", slug: "alashan", label: "阿拉善盟", provinceSlug: "neimenggu", type: "league", order: 12 },

  // ── 辽宁省 ──
  { code: "210100", slug: "shenyang", label: "沈阳市", provinceSlug: "liaoning", type: "prefecture_city", order: 1 },
  { code: "210200", slug: "dalian", label: "大连市", provinceSlug: "liaoning", type: "prefecture_city", order: 2 },
  { code: "210300", slug: "anshan", label: "鞍山市", provinceSlug: "liaoning", type: "prefecture_city", order: 3 },
  { code: "210400", slug: "fushun", label: "抚顺市", provinceSlug: "liaoning", type: "prefecture_city", order: 4 },
  { code: "210500", slug: "benxi", label: "本溪市", provinceSlug: "liaoning", type: "prefecture_city", order: 5 },
  { code: "210600", slug: "dandong", label: "丹东市", provinceSlug: "liaoning", type: "prefecture_city", order: 6 },
  { code: "210700", slug: "jinzhou", label: "锦州市", provinceSlug: "liaoning", type: "prefecture_city", order: 7 },
  { code: "210800", slug: "yingkou", label: "营口市", provinceSlug: "liaoning", type: "prefecture_city", order: 8 },
  { code: "210900", slug: "fuxin", label: "阜新市", provinceSlug: "liaoning", type: "prefecture_city", order: 9 },
  { code: "211000", slug: "liaoyang", label: "辽阳市", provinceSlug: "liaoning", type: "prefecture_city", order: 10 },
  { code: "211100", slug: "panjin", label: "盘锦市", provinceSlug: "liaoning", type: "prefecture_city", order: 11 },
  { code: "211200", slug: "tieling", label: "铁岭市", provinceSlug: "liaoning", type: "prefecture_city", order: 12 },
  { code: "211300", slug: "chaoyang", label: "朝阳市", provinceSlug: "liaoning", type: "prefecture_city", order: 13 },
  { code: "211400", slug: "huludao", label: "葫芦岛市", provinceSlug: "liaoning", type: "prefecture_city", order: 14 },

  // ── 吉林省 ──
  { code: "220100", slug: "changchun", label: "长春市", provinceSlug: "jilin", type: "prefecture_city", order: 1 },
  { code: "220200", slug: "jilin", label: "吉林市", provinceSlug: "jilin", type: "prefecture_city", order: 2 },
  { code: "220300", slug: "siping", label: "四平市", provinceSlug: "jilin", type: "prefecture_city", order: 3 },
  { code: "220400", slug: "liaoyuan", label: "辽源市", provinceSlug: "jilin", type: "prefecture_city", order: 4 },
  { code: "220500", slug: "tonghua", label: "通化市", provinceSlug: "jilin", type: "prefecture_city", order: 5 },
  { code: "220600", slug: "baishan", label: "白山市", provinceSlug: "jilin", type: "prefecture_city", order: 6 },
  { code: "220700", slug: "songyuan", label: "松原市", provinceSlug: "jilin", type: "prefecture_city", order: 7 },
  { code: "220800", slug: "baicheng", label: "白城市", provinceSlug: "jilin", type: "prefecture_city", order: 8 },
  { code: "222400", slug: "yanbian", label: "延边朝鲜族自治州", provinceSlug: "jilin", type: "autonomous_prefecture", order: 9 },

  // ── 黑龙江省 ──
  { code: "230100", slug: "haerbin", label: "哈尔滨市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 1 },
  { code: "230200", slug: "qiqihaer", label: "齐齐哈尔市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 2 },
  { code: "230300", slug: "jixi", label: "鸡西市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 3 },
  { code: "230400", slug: "hegang", label: "鹤岗市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 4 },
  { code: "230500", slug: "shuangyashan", label: "双鸭山市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 5 },
  { code: "230600", slug: "daqing", label: "大庆市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 6 },
  { code: "230700", slug: "yichunhlj", label: "伊春市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 7 },
  { code: "230800", slug: "jiamusi", label: "佳木斯市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 8 },
  { code: "230900", slug: "qitaihe", label: "七台河市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 9 },
  { code: "231000", slug: "mudanjiang", label: "牡丹江市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 10 },
  { code: "231100", slug: "heihe", label: "黑河市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 11 },
  { code: "231200", slug: "suihua", label: "绥化市", provinceSlug: "heilongjiang", type: "prefecture_city", order: 12 },
  { code: "232700", slug: "daxinganling", label: "大兴安岭地区", provinceSlug: "heilongjiang", type: "prefecture", order: 13 },

  // ── 江苏省 ──
  { code: "320100", slug: "nanjing", label: "南京市", provinceSlug: "jiangsu", type: "prefecture_city", order: 1 },
  { code: "320200", slug: "wuxi", label: "无锡市", provinceSlug: "jiangsu", type: "prefecture_city", order: 2 },
  { code: "320300", slug: "xuzhou", label: "徐州市", provinceSlug: "jiangsu", type: "prefecture_city", order: 3 },
  { code: "320400", slug: "changzhou", label: "常州市", provinceSlug: "jiangsu", type: "prefecture_city", order: 4 },
  { code: "320500", slug: "suzhou", label: "苏州市", provinceSlug: "jiangsu", type: "prefecture_city", order: 5 },
  { code: "320600", slug: "nantong", label: "南通市", provinceSlug: "jiangsu", type: "prefecture_city", order: 6 },
  { code: "320700", slug: "lianyungang", label: "连云港市", provinceSlug: "jiangsu", type: "prefecture_city", order: 7 },
  { code: "320800", slug: "huaian", label: "淮安市", provinceSlug: "jiangsu", type: "prefecture_city", order: 8 },
  { code: "320900", slug: "yancheng", label: "盐城市", provinceSlug: "jiangsu", type: "prefecture_city", order: 9 },
  { code: "321000", slug: "yangzhou", label: "扬州市", provinceSlug: "jiangsu", type: "prefecture_city", order: 10 },
  { code: "321100", slug: "zhenjiang", label: "镇江市", provinceSlug: "jiangsu", type: "prefecture_city", order: 11 },
  { code: "321200", slug: "taizhou", label: "泰州市", provinceSlug: "jiangsu", type: "prefecture_city", order: 12 },
  { code: "321300", slug: "suqian", label: "宿迁市", provinceSlug: "jiangsu", type: "prefecture_city", order: 13 },

  // ── 浙江省 ──
  { code: "330100", slug: "hangzhou", label: "杭州市", provinceSlug: "zhejiang", type: "prefecture_city", order: 1 },
  { code: "330200", slug: "ningbo", label: "宁波市", provinceSlug: "zhejiang", type: "prefecture_city", order: 2 },
  { code: "330300", slug: "wenzhou", label: "温州市", provinceSlug: "zhejiang", type: "prefecture_city", order: 3 },
  { code: "330400", slug: "jiaxing", label: "嘉兴市", provinceSlug: "zhejiang", type: "prefecture_city", order: 4 },
  { code: "330500", slug: "huzhou", label: "湖州市", provinceSlug: "zhejiang", type: "prefecture_city", order: 5 },
  { code: "330600", slug: "shaoxing", label: "绍兴市", provinceSlug: "zhejiang", type: "prefecture_city", order: 6 },
  { code: "330700", slug: "jinhua", label: "金华市", provinceSlug: "zhejiang", type: "prefecture_city", order: 7 },
  { code: "330800", slug: "quzhou", label: "衢州市", provinceSlug: "zhejiang", type: "prefecture_city", order: 8 },
  { code: "330900", slug: "zhoushan", label: "舟山市", provinceSlug: "zhejiang", type: "prefecture_city", order: 9 },
  { code: "331000", slug: "taizhouzj", label: "台州市", provinceSlug: "zhejiang", type: "prefecture_city", order: 10 },
  { code: "331100", slug: "lishui", label: "丽水市", provinceSlug: "zhejiang", type: "prefecture_city", order: 11 },

  // ── 安徽省 ──
  { code: "340100", slug: "hefei", label: "合肥市", provinceSlug: "anhui", type: "prefecture_city", order: 1 },
  { code: "340200", slug: "wuhu", label: "芜湖市", provinceSlug: "anhui", type: "prefecture_city", order: 2 },
  { code: "340300", slug: "bengbu", label: "蚌埠市", provinceSlug: "anhui", type: "prefecture_city", order: 3 },
  { code: "340400", slug: "huainan", label: "淮南市", provinceSlug: "anhui", type: "prefecture_city", order: 4 },
  { code: "340500", slug: "maanshan", label: "马鞍山市", provinceSlug: "anhui", type: "prefecture_city", order: 5 },
  { code: "340600", slug: "huaibei", label: "淮北市", provinceSlug: "anhui", type: "prefecture_city", order: 6 },
  { code: "340700", slug: "tongling", label: "铜陵市", provinceSlug: "anhui", type: "prefecture_city", order: 7 },
  { code: "340800", slug: "anqing", label: "安庆市", provinceSlug: "anhui", type: "prefecture_city", order: 8 },
  { code: "341000", slug: "huangshan", label: "黄山市", provinceSlug: "anhui", type: "prefecture_city", order: 9 },
  { code: "341100", slug: "chuzhou", label: "滁州市", provinceSlug: "anhui", type: "prefecture_city", order: 10 },
  { code: "341200", slug: "fuyang", label: "阜阳市", provinceSlug: "anhui", type: "prefecture_city", order: 11 },
  { code: "341300", slug: "suzhouah", label: "宿州市", provinceSlug: "anhui", type: "prefecture_city", order: 12 },
  { code: "341500", slug: "liuan", label: "六安市", provinceSlug: "anhui", type: "prefecture_city", order: 13 },
  { code: "341600", slug: "bozhou", label: "亳州市", provinceSlug: "anhui", type: "prefecture_city", order: 14 },
  { code: "341700", slug: "chizhou", label: "池州市", provinceSlug: "anhui", type: "prefecture_city", order: 15 },
  { code: "341800", slug: "xuancheng", label: "宣城市", provinceSlug: "anhui", type: "prefecture_city", order: 16 },

  // ── 福建省 ──
  { code: "350100", slug: "fuzhou", label: "福州市", provinceSlug: "fujian", type: "prefecture_city", order: 1 },
  { code: "350200", slug: "xiamen", label: "厦门市", provinceSlug: "fujian", type: "prefecture_city", order: 2 },
  { code: "350300", slug: "putian", label: "莆田市", provinceSlug: "fujian", type: "prefecture_city", order: 3 },
  { code: "350400", slug: "sanming", label: "三明市", provinceSlug: "fujian", type: "prefecture_city", order: 4 },
  { code: "350500", slug: "quanzhou", label: "泉州市", provinceSlug: "fujian", type: "prefecture_city", order: 5 },
  { code: "350600", slug: "zhangzhou", label: "漳州市", provinceSlug: "fujian", type: "prefecture_city", order: 6 },
  { code: "350700", slug: "nanping", label: "南平市", provinceSlug: "fujian", type: "prefecture_city", order: 7 },
  { code: "350800", slug: "longyan", label: "龙岩市", provinceSlug: "fujian", type: "prefecture_city", order: 8 },
  { code: "350900", slug: "ningde", label: "宁德市", provinceSlug: "fujian", type: "prefecture_city", order: 9 },

  // ── 江西省 ──
  { code: "360100", slug: "nanchang", label: "南昌市", provinceSlug: "jiangxi", type: "prefecture_city", order: 1 },
  { code: "360200", slug: "jingdezhen", label: "景德镇市", provinceSlug: "jiangxi", type: "prefecture_city", order: 2 },
  { code: "360300", slug: "pingxiang", label: "萍乡市", provinceSlug: "jiangxi", type: "prefecture_city", order: 3 },
  { code: "360400", slug: "jiujiang", label: "九江市", provinceSlug: "jiangxi", type: "prefecture_city", order: 4 },
  { code: "360500", slug: "xinyu", label: "新余市", provinceSlug: "jiangxi", type: "prefecture_city", order: 5 },
  { code: "360600", slug: "yingtan", label: "鹰潭市", provinceSlug: "jiangxi", type: "prefecture_city", order: 6 },
  { code: "360700", slug: "ganzhou", label: "赣州市", provinceSlug: "jiangxi", type: "prefecture_city", order: 7 },
  { code: "360800", slug: "jian", label: "吉安市", provinceSlug: "jiangxi", type: "prefecture_city", order: 8 },
  { code: "360900", slug: "yichun", label: "宜春市", provinceSlug: "jiangxi", type: "prefecture_city", order: 9 },
  { code: "361000", slug: "fuzhoujx", label: "抚州市", provinceSlug: "jiangxi", type: "prefecture_city", order: 10 },
  { code: "361100", slug: "shangrao", label: "上饶市", provinceSlug: "jiangxi", type: "prefecture_city", order: 11 },

  // ── 山东省 ──
  { code: "370100", slug: "jinan", label: "济南市", provinceSlug: "shandong", type: "prefecture_city", order: 1 },
  { code: "370200", slug: "qingdao", label: "青岛市", provinceSlug: "shandong", type: "prefecture_city", order: 2 },
  { code: "370300", slug: "zibo", label: "淄博市", provinceSlug: "shandong", type: "prefecture_city", order: 3 },
  { code: "370400", slug: "zaozhuang", label: "枣庄市", provinceSlug: "shandong", type: "prefecture_city", order: 4 },
  { code: "370500", slug: "dongying", label: "东营市", provinceSlug: "shandong", type: "prefecture_city", order: 5 },
  { code: "370600", slug: "yantai", label: "烟台市", provinceSlug: "shandong", type: "prefecture_city", order: 6 },
  { code: "370700", slug: "weifang", label: "潍坊市", provinceSlug: "shandong", type: "prefecture_city", order: 7 },
  { code: "370800", slug: "jining", label: "济宁市", provinceSlug: "shandong", type: "prefecture_city", order: 8 },
  { code: "370900", slug: "taian", label: "泰安市", provinceSlug: "shandong", type: "prefecture_city", order: 9 },
  { code: "371000", slug: "weihai", label: "威海市", provinceSlug: "shandong", type: "prefecture_city", order: 10 },
  { code: "371100", slug: "rizhao", label: "日照市", provinceSlug: "shandong", type: "prefecture_city", order: 11 },
  { code: "371300", slug: "linyi", label: "临沂市", provinceSlug: "shandong", type: "prefecture_city", order: 12 },
  { code: "371400", slug: "dezhou", label: "德州市", provinceSlug: "shandong", type: "prefecture_city", order: 13 },
  { code: "371500", slug: "liaocheng", label: "聊城市", provinceSlug: "shandong", type: "prefecture_city", order: 14 },
  { code: "371600", slug: "binzhou", label: "滨州市", provinceSlug: "shandong", type: "prefecture_city", order: 15 },
  { code: "371700", slug: "heze", label: "菏泽市", provinceSlug: "shandong", type: "prefecture_city", order: 16 },

  // ── 河南省 ──
  { code: "410100", slug: "zhengzhou", label: "郑州市", provinceSlug: "henan", type: "prefecture_city", order: 1 },
  { code: "410200", slug: "kaifeng", label: "开封市", provinceSlug: "henan", type: "prefecture_city", order: 2 },
  { code: "410300", slug: "luoyang", label: "洛阳市", provinceSlug: "henan", type: "prefecture_city", order: 3 },
  { code: "410400", slug: "pingdingshan", label: "平顶山市", provinceSlug: "henan", type: "prefecture_city", order: 4 },
  { code: "410500", slug: "anyang", label: "安阳市", provinceSlug: "henan", type: "prefecture_city", order: 5 },
  { code: "410600", slug: "hebi", label: "鹤壁市", provinceSlug: "henan", type: "prefecture_city", order: 6 },
  { code: "410700", slug: "xinxiang", label: "新乡市", provinceSlug: "henan", type: "prefecture_city", order: 7 },
  { code: "410800", slug: "jiaozuo", label: "焦作市", provinceSlug: "henan", type: "prefecture_city", order: 8 },
  { code: "410900", slug: "puyang", label: "濮阳市", provinceSlug: "henan", type: "prefecture_city", order: 9 },
  { code: "411000", slug: "xuchang", label: "许昌市", provinceSlug: "henan", type: "prefecture_city", order: 10 },
  { code: "411100", slug: "luohe", label: "漯河市", provinceSlug: "henan", type: "prefecture_city", order: 11 },
  { code: "411200", slug: "sanmenxia", label: "三门峡市", provinceSlug: "henan", type: "prefecture_city", order: 12 },
  { code: "411300", slug: "nanyang", label: "南阳市", provinceSlug: "henan", type: "prefecture_city", order: 13 },
  { code: "411400", slug: "shangqiu", label: "商丘市", provinceSlug: "henan", type: "prefecture_city", order: 14 },
  { code: "411500", slug: "xinyang", label: "信阳市", provinceSlug: "henan", type: "prefecture_city", order: 15 },
  { code: "411600", slug: "zhoukou", label: "周口市", provinceSlug: "henan", type: "prefecture_city", order: 16 },
  { code: "411700", slug: "zhumadian", label: "驻马店市", provinceSlug: "henan", type: "prefecture_city", order: 17 },
  { code: "419000", slug: "jiyuan", label: "济源市", provinceSlug: "henan", type: "prefecture_city", order: 18 },

  // ── 湖北省 ──
  { code: "420100", slug: "wuhan", label: "武汉市", provinceSlug: "hubei", type: "prefecture_city", order: 1 },
  { code: "420200", slug: "huangshi", label: "黄石市", provinceSlug: "hubei", type: "prefecture_city", order: 2 },
  { code: "420300", slug: "shiyan", label: "十堰市", provinceSlug: "hubei", type: "prefecture_city", order: 3 },
  { code: "420500", slug: "yichang", label: "宜昌市", provinceSlug: "hubei", type: "prefecture_city", order: 4 },
  { code: "420600", slug: "xiangyang", label: "襄阳市", provinceSlug: "hubei", type: "prefecture_city", order: 5 },
  { code: "420700", slug: "ezhou", label: "鄂州市", provinceSlug: "hubei", type: "prefecture_city", order: 6 },
  { code: "420800", slug: "jingmen", label: "荆门市", provinceSlug: "hubei", type: "prefecture_city", order: 7 },
  { code: "420900", slug: "xiaogan", label: "孝感市", provinceSlug: "hubei", type: "prefecture_city", order: 8 },
  { code: "421000", slug: "jingzhou", label: "荆州市", provinceSlug: "hubei", type: "prefecture_city", order: 9 },
  { code: "421100", slug: "huanggang", label: "黄冈市", provinceSlug: "hubei", type: "prefecture_city", order: 10 },
  { code: "421200", slug: "xianning", label: "咸宁市", provinceSlug: "hubei", type: "prefecture_city", order: 11 },
  { code: "421300", slug: "suizhou", label: "随州市", provinceSlug: "hubei", type: "prefecture_city", order: 12 },
  { code: "422800", slug: "enshi", label: "恩施土家族苗族自治州", provinceSlug: "hubei", type: "autonomous_prefecture", order: 13 },
  { code: "429000", slug: "xiantao", label: "仙桃市", provinceSlug: "hubei", type: "prefecture_city", order: 14 },
  { code: "429004", slug: "qianjiang", label: "潜江市", provinceSlug: "hubei", type: "prefecture_city", order: 15 },
  { code: "429021", slug: "shennongjia", label: "神农架林区", provinceSlug: "hubei", type: "prefecture", order: 16 },
  { code: "429005", slug: "tianmen", label: "天门市", provinceSlug: "hubei", type: "prefecture_city", order: 17 },

  // ── 湖南省 ──
  { code: "430100", slug: "changsha", label: "长沙市", provinceSlug: "hunan", type: "prefecture_city", order: 1 },
  { code: "430200", slug: "zhuzhou", label: "株洲市", provinceSlug: "hunan", type: "prefecture_city", order: 2 },
  { code: "430300", slug: "xiangtan", label: "湘潭市", provinceSlug: "hunan", type: "prefecture_city", order: 3 },
  { code: "430400", slug: "hengyang", label: "衡阳市", provinceSlug: "hunan", type: "prefecture_city", order: 4 },
  { code: "430500", slug: "shaoyang", label: "邵阳市", provinceSlug: "hunan", type: "prefecture_city", order: 5 },
  { code: "430600", slug: "yueyang", label: "岳阳市", provinceSlug: "hunan", type: "prefecture_city", order: 6 },
  { code: "430700", slug: "changde", label: "常德市", provinceSlug: "hunan", type: "prefecture_city", order: 7 },
  { code: "430800", slug: "zhangjiajie", label: "张家界市", provinceSlug: "hunan", type: "prefecture_city", order: 8 },
  { code: "430900", slug: "yiyang", label: "益阳市", provinceSlug: "hunan", type: "prefecture_city", order: 9 },
  { code: "431000", slug: "chenzhou", label: "郴州市", provinceSlug: "hunan", type: "prefecture_city", order: 10 },
  { code: "431100", slug: "yongzhou", label: "永州市", provinceSlug: "hunan", type: "prefecture_city", order: 11 },
  { code: "431200", slug: "huaihua", label: "怀化市", provinceSlug: "hunan", type: "prefecture_city", order: 12 },
  { code: "431300", slug: "loudi", label: "娄底市", provinceSlug: "hunan", type: "prefecture_city", order: 13 },
  { code: "433100", slug: "xiangxi", label: "湘西土家族苗族自治州", provinceSlug: "hunan", type: "autonomous_prefecture", order: 14 },

  // ── 广东省 ──
  { code: "440100", slug: "guangzhou", label: "广州市", provinceSlug: "guangdong", type: "prefecture_city", order: 1 },
  { code: "440200", slug: "shaoguan", label: "韶关市", provinceSlug: "guangdong", type: "prefecture_city", order: 2 },
  { code: "440300", slug: "shenzhen", label: "深圳市", provinceSlug: "guangdong", type: "prefecture_city", order: 3 },
  { code: "440400", slug: "zhuhai", label: "珠海市", provinceSlug: "guangdong", type: "prefecture_city", order: 4 },
  { code: "440500", slug: "shantou", label: "汕头市", provinceSlug: "guangdong", type: "prefecture_city", order: 5 },
  { code: "440600", slug: "foshan", label: "佛山市", provinceSlug: "guangdong", type: "prefecture_city", order: 6 },
  { code: "440700", slug: "jiangmen", label: "江门市", provinceSlug: "guangdong", type: "prefecture_city", order: 7 },
  { code: "440800", slug: "zhanjiang", label: "湛江市", provinceSlug: "guangdong", type: "prefecture_city", order: 8 },
  { code: "440900", slug: "maoming", label: "茂名市", provinceSlug: "guangdong", type: "prefecture_city", order: 9 },
  { code: "441200", slug: "zhaoqing", label: "肇庆市", provinceSlug: "guangdong", type: "prefecture_city", order: 10 },
  { code: "441300", slug: "huizhou", label: "惠州市", provinceSlug: "guangdong", type: "prefecture_city", order: 11 },
  { code: "441400", slug: "meizhou", label: "梅州市", provinceSlug: "guangdong", type: "prefecture_city", order: 12 },
  { code: "441500", slug: "shanwei", label: "汕尾市", provinceSlug: "guangdong", type: "prefecture_city", order: 13 },
  { code: "441600", slug: "heyuan", label: "河源市", provinceSlug: "guangdong", type: "prefecture_city", order: 14 },
  { code: "441700", slug: "yangjiang", label: "阳江市", provinceSlug: "guangdong", type: "prefecture_city", order: 15 },
  { code: "441800", slug: "qingyuan", label: "清远市", provinceSlug: "guangdong", type: "prefecture_city", order: 16 },
  { code: "441900", slug: "dongguan", label: "东莞市", provinceSlug: "guangdong", type: "prefecture_city", order: 17 },
  { code: "442000", slug: "zhongshan", label: "中山市", provinceSlug: "guangdong", type: "prefecture_city", order: 18 },
  { code: "445100", slug: "chaozhou", label: "潮州市", provinceSlug: "guangdong", type: "prefecture_city", order: 19 },
  { code: "445200", slug: "jieyang", label: "揭阳市", provinceSlug: "guangdong", type: "prefecture_city", order: 20 },
  { code: "445300", slug: "yunfu", label: "云浮市", provinceSlug: "guangdong", type: "prefecture_city", order: 21 },

  // ── 广西壮族自治区 ──
  { code: "450100", slug: "nanning", label: "南宁市", provinceSlug: "guangxi", type: "prefecture_city", order: 1 },
  { code: "450200", slug: "liuzhou", label: "柳州市", provinceSlug: "guangxi", type: "prefecture_city", order: 2 },
  { code: "450300", slug: "guilin", label: "桂林市", provinceSlug: "guangxi", type: "prefecture_city", order: 3 },
  { code: "450400", slug: "wuzhou", label: "梧州市", provinceSlug: "guangxi", type: "prefecture_city", order: 4 },
  { code: "450500", slug: "beihai", label: "北海市", provinceSlug: "guangxi", type: "prefecture_city", order: 5 },
  { code: "450600", slug: "fangchenggang", label: "防城港市", provinceSlug: "guangxi", type: "prefecture_city", order: 6 },
  { code: "450700", slug: "qinzhou", label: "钦州市", provinceSlug: "guangxi", type: "prefecture_city", order: 7 },
  { code: "450800", slug: "guigang", label: "贵港市", provinceSlug: "guangxi", type: "prefecture_city", order: 8 },
  { code: "450900", slug: "yulin", label: "玉林市", provinceSlug: "guangxi", type: "prefecture_city", order: 9 },
  { code: "451000", slug: "baise", label: "百色市", provinceSlug: "guangxi", type: "prefecture_city", order: 10 },
  { code: "451100", slug: "hezhou", label: "贺州市", provinceSlug: "guangxi", type: "prefecture_city", order: 11 },
  { code: "451200", slug: "hechi", label: "河池市", provinceSlug: "guangxi", type: "prefecture_city", order: 12 },
  { code: "451300", slug: "laibin", label: "来宾市", provinceSlug: "guangxi", type: "prefecture_city", order: 13 },
  { code: "451400", slug: "chongzuo", label: "崇左市", provinceSlug: "guangxi", type: "prefecture_city", order: 14 },

  // ── 海南省 ──
  { code: "460100", slug: "haikou", label: "海口市", provinceSlug: "hainan", type: "prefecture_city", order: 1 },
  { code: "460200", slug: "sanya", label: "三亚市", provinceSlug: "hainan", type: "prefecture_city", order: 2 },
  { code: "460300", slug: "sansha", label: "三沙市", provinceSlug: "hainan", type: "prefecture_city", order: 3 },
  { code: "460400", slug: "danzhou", label: "儋州市", provinceSlug: "hainan", type: "prefecture_city", order: 4 },
  { code: "469000", slug: "qionghai", label: "琼海市", provinceSlug: "hainan", type: "prefecture_city", order: 5 },
  { code: "469001", slug: "wenchang", label: "文昌市", provinceSlug: "hainan", type: "prefecture_city", order: 6 },
  { code: "469002", slug: "wanning", label: "万宁市", provinceSlug: "hainan", type: "prefecture_city", order: 7 },
  { code: "469005", slug: "dongfang", label: "东方市", provinceSlug: "hainan", type: "prefecture_city", order: 8 },
  { code: "469006", slug: "dingan", label: "定安县", provinceSlug: "hainan", type: "prefecture_city", order: 9 },
  { code: "469007", slug: "tunchang", label: "屯昌县", provinceSlug: "hainan", type: "prefecture_city", order: 10 },
  { code: "469008", slug: "chengmai", label: "澄迈县", provinceSlug: "hainan", type: "prefecture_city", order: 11 },
  { code: "469009", slug: "lingaoshen", label: "临高县", provinceSlug: "hainan", type: "prefecture_city", order: 12 },
  { code: "469010", slug: "baisha", label: "白沙黎族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 13 },
  { code: "469011", slug: "changjiang", label: "昌江黎族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 14 },
  { code: "469012", slug: "ledong", label: "乐东黎族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 15 },
  { code: "469013", slug: "lingshui", label: "陵水黎族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 16 },
  { code: "469014", slug: "baoting", label: "保亭黎族苗族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 17 },
  { code: "469015", slug: "qiongzhong", label: "琼中黎族苗族自治县", provinceSlug: "hainan", type: "autonomous_prefecture", order: 18 },

  // ── 四川省 ──
  { code: "510100", slug: "chengdu", label: "成都市", provinceSlug: "sichuan", type: "prefecture_city", order: 1 },
  { code: "510300", slug: "zigong", label: "自贡市", provinceSlug: "sichuan", type: "prefecture_city", order: 2 },
  { code: "510400", slug: "panzhihua", label: "攀枝花市", provinceSlug: "sichuan", type: "prefecture_city", order: 3 },
  { code: "510500", slug: "luzhou", label: "泸州市", provinceSlug: "sichuan", type: "prefecture_city", order: 4 },
  { code: "510600", slug: "deyang", label: "德阳市", provinceSlug: "sichuan", type: "prefecture_city", order: 5 },
  { code: "510700", slug: "mianyang", label: "绵阳市", provinceSlug: "sichuan", type: "prefecture_city", order: 6 },
  { code: "510800", slug: "guangyuan", label: "广元市", provinceSlug: "sichuan", type: "prefecture_city", order: 7 },
  { code: "510900", slug: "suining", label: "遂宁市", provinceSlug: "sichuan", type: "prefecture_city", order: 8 },
  { code: "511000", slug: "neijiang", label: "内江市", provinceSlug: "sichuan", type: "prefecture_city", order: 9 },
  { code: "511100", slug: "leshan", label: "乐山市", provinceSlug: "sichuan", type: "prefecture_city", order: 10 },
  { code: "511300", slug: "nanchong", label: "南充市", provinceSlug: "sichuan", type: "prefecture_city", order: 11 },
  { code: "511400", slug: "meishan", label: "眉山市", provinceSlug: "sichuan", type: "prefecture_city", order: 12 },
  { code: "511500", slug: "yibin", label: "宜宾市", provinceSlug: "sichuan", type: "prefecture_city", order: 13 },
  { code: "511600", slug: "guangan", label: "广安市", provinceSlug: "sichuan", type: "prefecture_city", order: 14 },
  { code: "511700", slug: "dazhou", label: "达州市", provinceSlug: "sichuan", type: "prefecture_city", order: 15 },
  { code: "511800", slug: "yaan", label: "雅安市", provinceSlug: "sichuan", type: "prefecture_city", order: 16 },
  { code: "511900", slug: "bazhong", label: "巴中市", provinceSlug: "sichuan", type: "prefecture_city", order: 17 },
  { code: "512000", slug: "ziyang", label: "资阳市", provinceSlug: "sichuan", type: "prefecture_city", order: 18 },
  { code: "513200", slug: "abazhou", label: "阿坝藏族羌族自治州", provinceSlug: "sichuan", type: "autonomous_prefecture", order: 19 },
  { code: "513300", slug: "ganzizhou", label: "甘孜藏族自治州", provinceSlug: "sichuan", type: "autonomous_prefecture", order: 20 },
  { code: "513400", slug: "liangshan", label: "凉山彝族自治州", provinceSlug: "sichuan", type: "autonomous_prefecture", order: 21 },

  // ── 贵州省 ──
  { code: "520100", slug: "guiyang", label: "贵阳市", provinceSlug: "guizhou", type: "prefecture_city", order: 1 },
  { code: "520200", slug: "liupanshui", label: "六盘水市", provinceSlug: "guizhou", type: "prefecture_city", order: 2 },
  { code: "520300", slug: "zunyi", label: "遵义市", provinceSlug: "guizhou", type: "prefecture_city", order: 3 },
  { code: "520400", slug: "anshun", label: "安顺市", provinceSlug: "guizhou", type: "prefecture_city", order: 4 },
  { code: "520500", slug: "bijie", label: "毕节市", provinceSlug: "guizhou", type: "prefecture_city", order: 5 },
  { code: "520600", slug: "tongren", label: "铜仁市", provinceSlug: "guizhou", type: "prefecture_city", order: 6 },
  { code: "522300", slug: "qianxinan", label: "黔西南布依族苗族自治州", provinceSlug: "guizhou", type: "autonomous_prefecture", order: 7 },
  { code: "522600", slug: "qiandongnan", label: "黔东南苗族侗族自治州", provinceSlug: "guizhou", type: "autonomous_prefecture", order: 8 },
  { code: "522700", slug: "qiannan", label: "黔南布依族苗族自治州", provinceSlug: "guizhou", type: "autonomous_prefecture", order: 9 },

  // ── 云南省 ──
  { code: "530100", slug: "kunming", label: "昆明市", provinceSlug: "yunnan", type: "prefecture_city", order: 1 },
  { code: "530300", slug: "qujing", label: "曲靖市", provinceSlug: "yunnan", type: "prefecture_city", order: 2 },
  { code: "530400", slug: "yuxi", label: "玉溪市", provinceSlug: "yunnan", type: "prefecture_city", order: 3 },
  { code: "530500", slug: "baoshan", label: "保山市", provinceSlug: "yunnan", type: "prefecture_city", order: 4 },
  { code: "530600", slug: "zhaotong", label: "昭通市", provinceSlug: "yunnan", type: "prefecture_city", order: 5 },
  { code: "530700", slug: "lijiang", label: "丽江市", provinceSlug: "yunnan", type: "prefecture_city", order: 6 },
  { code: "530800", slug: "puer", label: "普洱市", provinceSlug: "yunnan", type: "prefecture_city", order: 7 },
  { code: "530900", slug: "lincang", label: "临沧市", provinceSlug: "yunnan", type: "prefecture_city", order: 8 },
  { code: "532300", slug: "chuxiong", label: "楚雄彝族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 9 },
  { code: "532500", slug: "honghe", label: "红河哈尼族彝族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 10 },
  { code: "532600", slug: "wenshan", label: "文山壮族苗族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 11 },
  { code: "532800", slug: "xishuangbanna", label: "西双版纳傣族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 12 },
  { code: "532900", slug: "dali", label: "大理白族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 13 },
  { code: "533100", slug: "dehong", label: "德宏傣族景颇族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 14 },
  { code: "533300", slug: "nujiang", label: "怒江傈僳族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 15 },
  { code: "533400", slug: "diqing", label: "迪庆藏族自治州", provinceSlug: "yunnan", type: "autonomous_prefecture", order: 16 },

  // ── 西藏自治区 ──
  { code: "540100", slug: "lasa", label: "拉萨市", provinceSlug: "xizang", type: "prefecture_city", order: 1 },
  { code: "540200", slug: "rikaze", label: "日喀则市", provinceSlug: "xizang", type: "prefecture_city", order: 2 },
  { code: "540300", slug: "changdu", label: "昌都市", provinceSlug: "xizang", type: "prefecture_city", order: 3 },
  { code: "540400", slug: "linzhi", label: "林芝市", provinceSlug: "xizang", type: "prefecture_city", order: 4 },
  { code: "540500", slug: "shannan", label: "山南市", provinceSlug: "xizang", type: "prefecture_city", order: 5 },
  { code: "540600", slug: "naqu", label: "那曲市", provinceSlug: "xizang", type: "prefecture_city", order: 6 },
  { code: "542500", slug: "ali", label: "阿里地区", provinceSlug: "xizang", type: "prefecture", order: 7 },

  // ── 陕西省 ──
  { code: "610100", slug: "xian", label: "西安市", provinceSlug: "shaanxi", type: "prefecture_city", order: 1 },
  { code: "610200", slug: "tongchuan", label: "铜川市", provinceSlug: "shaanxi", type: "prefecture_city", order: 2 },
  { code: "610300", slug: "baoji", label: "宝鸡市", provinceSlug: "shaanxi", type: "prefecture_city", order: 3 },
  { code: "610400", slug: "xianyang", label: "咸阳市", provinceSlug: "shaanxi", type: "prefecture_city", order: 4 },
  { code: "610500", slug: "weinan", label: "渭南市", provinceSlug: "shaanxi", type: "prefecture_city", order: 5 },
  { code: "610600", slug: "yanan", label: "延安市", provinceSlug: "shaanxi", type: "prefecture_city", order: 6 },
  { code: "610700", slug: "hanzhong", label: "汉中市", provinceSlug: "shaanxi", type: "prefecture_city", order: 7 },
  { code: "610800", slug: "yulinsx", label: "榆林市", provinceSlug: "shaanxi", type: "prefecture_city", order: 8 },
  { code: "610900", slug: "ankang", label: "安康市", provinceSlug: "shaanxi", type: "prefecture_city", order: 9 },
  { code: "611000", slug: "shangluo", label: "商洛市", provinceSlug: "shaanxi", type: "prefecture_city", order: 10 },

  // ── 甘肃省 ──
  { code: "620100", slug: "lanzhou", label: "兰州市", provinceSlug: "gansu", type: "prefecture_city", order: 1 },
  { code: "620200", slug: "jiayuguan", label: "嘉峪关市", provinceSlug: "gansu", type: "prefecture_city", order: 2 },
  { code: "620300", slug: "jinchang", label: "金昌市", provinceSlug: "gansu", type: "prefecture_city", order: 3 },
  { code: "620400", slug: "baiyin", label: "白银市", provinceSlug: "gansu", type: "prefecture_city", order: 4 },
  { code: "620500", slug: "tianshui", label: "天水市", provinceSlug: "gansu", type: "prefecture_city", order: 5 },
  { code: "620600", slug: "wuwei", label: "武威市", provinceSlug: "gansu", type: "prefecture_city", order: 6 },
  { code: "620700", slug: "zhangye", label: "张掖市", provinceSlug: "gansu", type: "prefecture_city", order: 7 },
  { code: "620800", slug: "pingliang", label: "平凉市", provinceSlug: "gansu", type: "prefecture_city", order: 8 },
  { code: "620900", slug: "jiuquan", label: "酒泉市", provinceSlug: "gansu", type: "prefecture_city", order: 9 },
  { code: "621000", slug: "qingyang", label: "庆阳市", provinceSlug: "gansu", type: "prefecture_city", order: 10 },
  { code: "621100", slug: "dingxi", label: "定西市", provinceSlug: "gansu", type: "prefecture_city", order: 11 },
  { code: "621200", slug: "longnan", label: "陇南市", provinceSlug: "gansu", type: "prefecture_city", order: 12 },
  { code: "622900", slug: "linxiazhou", label: "临夏回族自治州", provinceSlug: "gansu", type: "autonomous_prefecture", order: 13 },
  { code: "623000", slug: "gannan", label: "甘南藏族自治州", provinceSlug: "gansu", type: "autonomous_prefecture", order: 14 },

  // ── 青海省 ──
  { code: "630100", slug: "xining", label: "西宁市", provinceSlug: "qinghai", type: "prefecture_city", order: 1 },
  { code: "630200", slug: "haidong", label: "海东市", provinceSlug: "qinghai", type: "prefecture_city", order: 2 },
  { code: "632200", slug: "haibei", label: "海北藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 3 },
  { code: "632300", slug: "huangnan", label: "黄南藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 4 },
  { code: "632500", slug: "hainanzhou", label: "海南藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 5 },
  { code: "632600", slug: "guoluo", label: "果洛藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 6 },
  { code: "632700", slug: "yushu", label: "玉树藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 7 },
  { code: "632800", slug: "haixi", label: "海西蒙古族藏族自治州", provinceSlug: "qinghai", type: "autonomous_prefecture", order: 8 },

  // ── 宁夏回族自治区 ──
  { code: "640100", slug: "yinchuan", label: "银川市", provinceSlug: "ningxia", type: "prefecture_city", order: 1 },
  { code: "640200", slug: "shizuishan", label: "石嘴山市", provinceSlug: "ningxia", type: "prefecture_city", order: 2 },
  { code: "640300", slug: "wuzhong", label: "吴忠市", provinceSlug: "ningxia", type: "prefecture_city", order: 3 },
  { code: "640400", slug: "guyuan", label: "固原市", provinceSlug: "ningxia", type: "prefecture_city", order: 4 },
  { code: "640500", slug: "zhongwei", label: "中卫市", provinceSlug: "ningxia", type: "prefecture_city", order: 5 },

  // ── 新疆维吾尔自治区 ──
  { code: "650100", slug: "wulumuqi", label: "乌鲁木齐市", provinceSlug: "xinjiang", type: "prefecture_city", order: 1 },
  { code: "650200", slug: "kelamayi", label: "克拉玛依市", provinceSlug: "xinjiang", type: "prefecture_city", order: 2 },
  { code: "650400", slug: "turpan", label: "吐鲁番市", provinceSlug: "xinjiang", type: "prefecture_city", order: 3 },
  { code: "650500", slug: "hami", label: "哈密市", provinceSlug: "xinjiang", type: "prefecture_city", order: 4 },
  { code: "652300", slug: "changji", label: "昌吉回族自治州", provinceSlug: "xinjiang", type: "autonomous_prefecture", order: 5 },
  { code: "652700", slug: "boertala", label: "博尔塔拉蒙古自治州", provinceSlug: "xinjiang", type: "autonomous_prefecture", order: 6 },
  { code: "652800", slug: "bayinguoleng", label: "巴音郭楞蒙古自治州", provinceSlug: "xinjiang", type: "autonomous_prefecture", order: 7 },
  { code: "652900", slug: "akesu", label: "阿克苏地区", provinceSlug: "xinjiang", type: "prefecture", order: 8 },
  { code: "653000", slug: "kezilesu", label: "克孜勒苏柯尔克孜自治州", provinceSlug: "xinjiang", type: "autonomous_prefecture", order: 9 },
  { code: "653100", slug: "kashi", label: "喀什地区", provinceSlug: "xinjiang", type: "prefecture", order: 10 },
  { code: "653200", slug: "hetian", label: "和田地区", provinceSlug: "xinjiang", type: "prefecture", order: 11 },
  { code: "654000", slug: "yili", label: "伊犁哈萨克自治州", provinceSlug: "xinjiang", type: "autonomous_prefecture", order: 12 },
  { code: "654200", slug: "tacheng", label: "塔城地区", provinceSlug: "xinjiang", type: "prefecture", order: 13 },
  { code: "654300", slug: "aletai", label: "阿勒泰地区", provinceSlug: "xinjiang", type: "prefecture", order: 14 },
  { code: "659000", slug: "shihezi", label: "石河子市", provinceSlug: "xinjiang", type: "prefecture_city", order: 15 },
  { code: "659001", slug: "alaer", label: "阿拉尔市", provinceSlug: "xinjiang", type: "prefecture_city", order: 16 },
  { code: "659002", slug: "tumxuk", label: "图木舒克市", provinceSlug: "xinjiang", type: "prefecture_city", order: 17 },
  { code: "659003", slug: "wujiaqu", label: "五家渠市", provinceSlug: "xinjiang", type: "prefecture_city", order: 18 },
  { code: "659004", slug: "beitun", label: "北屯市", provinceSlug: "xinjiang", type: "prefecture_city", order: 19 },
  { code: "659005", slug: "tiemenguan", label: "铁门关市", provinceSlug: "xinjiang", type: "prefecture_city", order: 20 },
  { code: "659006", slug: "shuanghe", label: "双河市", provinceSlug: "xinjiang", type: "prefecture_city", order: 21 },
  { code: "659007", slug: "kokdala", label: "可克达拉市", provinceSlug: "xinjiang", type: "prefecture_city", order: 22 },
  { code: "659008", slug: "kunyu", label: "昆玉市", provinceSlug: "xinjiang", type: "prefecture_city", order: 23 },
  { code: "659009", slug: "xinhe", label: "新星市", provinceSlug: "xinjiang", type: "prefecture_city", order: 24 },
  { code: "659010", slug: "huyanghe", label: "胡杨河市", provinceSlug: "xinjiang", type: "prefecture_city", order: 25 },
  { code: "659011", slug: "baijiantan", label: "白杨市", provinceSlug: "xinjiang", type: "prefecture_city", order: 26 },
];

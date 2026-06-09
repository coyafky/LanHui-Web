/**
 * 蓝辉轻改 资质证书
 *
 * Phase 1：占位数据，等真实证书补全后替换 name / issuer / date / image。
 * 不要捏造权威机构名称（如「国家XX部」「中国XX协会」等）以免误导。
 */

export type Certification = {
  id: string;
  title: string;
  category: "营业执照" | "行业认证" | "门店资质" | "品牌合作";
  issuer: string; // 颁发方占位
  issuedAt: string; // 颁发日期占位（年/月）
  validUntil: string; // 有效期占位
  description: string;
  badge: string; // 用于占位徽章的 emoji / 文本
};

export const certifications: Certification[] = [
  {
    id: "business-license",
    title: "营业执照",
    category: "营业执照",
    issuer: "颁发方待补充（市场监督管理部门）",
    issuedAt: "2026 / 待补充",
    validUntil: "长期 / 待补充",
    description:
      "经营主体登记信息。门店信息以官方登记为准，详细编号后续补充。",
    badge: "📋",
  },
  {
    id: "automotive-aftermarket",
    title: "汽车后市场服务备案",
    category: "行业认证",
    issuer: "颁发方待补充（行业协会/地方商务部门）",
    issuedAt: "2026 / 待补充",
    validUntil: "待补充",
    description:
      "汽车后市场服务相关备案，象征品牌进入合规服务范围。",
    badge: "🛡️",
  },
  {
    id: "film-installer",
    title: "贴膜技师认证",
    category: "门店资质",
    issuer: "颁发方待补充（培训机构 / 设备厂商）",
    issuedAt: "2026 / 待补充",
    validUntil: "待补充",
    description:
      "门店核心施工人员的贴膜岗位培训记录，按批次更新。",
    badge: "🎓",
  },
  {
    id: "tpu-supplier",
    title: "TPU 原料合作备忘录",
    category: "品牌合作",
    issuer: "合作方待补充",
    issuedAt: "2026 / 待补充",
    validUntil: "待补充",
    description:
      "与上游原料供应商的合作框架，材料来源可在门店主动出示。",
    badge: "🤝",
  },
  {
    id: "consumer-association",
    title: "消费者权益保护承诺",
    category: "行业认证",
    issuer: "颁发方待补充（消协 / 行业自律组织）",
    issuedAt: "2026 / 待补充",
    validUntil: "待补充",
    description:
      "接受消费监督的自律承诺，强调明码标价、售后可追溯。",
    badge: "⚖️",
  },
  {
    id: "store-permit",
    title: "门店经营场所证明",
    category: "门店资质",
    issuer: "颁发方待补充（场地出租方 / 物业）",
    issuedAt: "2026 / 待补充",
    validUntil: "待补充",
    description:
      "顺德大良店实际经营场所的合法性证明，门店主动出示。",
    badge: "🏪",
  },
];

export function getCertification(id: string): Certification | undefined {
  return certifications.find((c) => c.id === id);
}

export const certCategories: { id: Certification["category"]; label: string; description: string }[] = [
  {
    id: "营业执照",
    label: "营业执照",
    description: "经营主体登记信息",
  },
  {
    id: "行业认证",
    label: "行业认证",
    description: "汽车后市场、消费者权益等",
  },
  {
    id: "门店资质",
    label: "门店资质",
    description: "贴膜技师、场所证明等",
  },
  {
    id: "品牌合作",
    label: "品牌合作",
    description: "原料供应等合作记录",
  },
];

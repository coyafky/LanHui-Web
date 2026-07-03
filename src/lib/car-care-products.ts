/**
 * 洗美养护专题静态数据 — TypeScript literal types 防止规格漂移。
 */

export type CarCareServiceItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: readonly string[];
};

export type CarCareValue = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type CarCareProcessStep = {
  step: string;
  title: string;
  description: string;
};

export const carCareValues: readonly CarCareValue[] = [
  { id: "professional", icon: "Droplets", title: "专业洗护", description: "采用中性洗车液配合两桶水洗车法，避免泥沙划伤漆面，车身缝隙、门边等死角也逐一清洁到位。" },
  { id: "deep-clean", icon: "Sparkles", title: "深度清洁", description: "针对座椅缝隙、空调出风口、门槛等死角做蒸汽消毒与臭氧除味，深度清洁内饰空间。" },
  { id: "eco-friendly", icon: "Leaf", title: "环保用料", description: "选用可生物降解洗车液与中性内饰清洁剂，保护车漆和内饰材质，减少对环境和人体的影响。" },
  { id: "convenient", icon: "Clock", title: "到店便捷", description: "顺德大良门店，提前预约到店即洗，施工过程透明可见，支持洗车后存放代取。" },
] as const;

export const carCareServices: readonly CarCareServiceItem[] = [
  {
    id: "exterior-wash", title: "专业精洗", subtitle: "EXTERIOR WASH",
    description: "从预洗到擦干，覆盖车身漆面、轮毂、玻璃、发动机舱表面等区域的外表清洁。",
    highlights: ["中性洗车液预洗 + 正洗两桶水法", "轮毂与刹车粉尘专项清洁", "车身缝隙气枪吹水", "玻璃油膜去除（选配）"],
  },
  {
    id: "interior-detailing", title: "内饰深度清洁", subtitle: "INTERIOR DETAILING",
    description: "对座舱内部进行系统清洁与养护，覆盖座椅、地毯、仪表台、门板等区域。",
    highlights: ["座椅与地毯蒸汽清洁", "仪表台 / 门板除尘上光", "空调出风口专项清洁", "臭氧消毒 + 异味去除"],
  },
] as const;

export const carCareProcess: readonly CarCareProcessStep[] = [
  { step: "01", title: "预约到店", description: "电话或微信提前预约，确认车型、服务项目和到店时间。" },
  { step: "02", title: "车辆检查", description: "到店后进行车况检查，确认漆面、内饰、轮毂状态并与客户确认服务范围。" },
  { step: "03", title: "分区施工", description: "按车身分区依次进行预洗、正洗、擦干或内饰蒸汽清洁、死角处理。" },
  { step: "04", title: "交付验收", description: "施工后逐一检查清洁效果，展示施工成果，确认无误后交付车辆。" },
] as const;

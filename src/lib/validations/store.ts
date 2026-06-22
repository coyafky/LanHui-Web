import { z } from "zod";

/** URL 标识格式：小写字母、数字、连字符；不允许连续连字符 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** PRD 一期：联系电话只接受中国大陆 11 位数字 */
export const PHONE_REGEX = /^\d{11}$/;

export const STORE_STATUSES = [
  "pending",
  "active",
  "suspended",
  "terminated",
] as const;

export type StoreStatus = (typeof STORE_STATUSES)[number];

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  pending: "待发布",
  active: "营业中",
  suspended: "暂停合作",
  terminated: "终止合作",
};

export const STORE_LEVELS = [
  "flagship",
  "premium",
  "specialty",
  "member",
] as const;

export type StoreLevel = (typeof STORE_LEVELS)[number];

export const STORE_LEVEL_LABELS: Record<StoreLevel, string> = {
  flagship: "星辉旗舰店",
  premium: "星耀尊享店",
  specialty: "星辰专营店",
  member: "星光会员店",
};

/** 等级排序权重(数字越小越靠前,旗舰优先) */
export const STORE_LEVEL_SORT_WEIGHTS: Record<StoreLevel, number> = {
  flagship: 1,
  premium: 2,
  specialty: 3,
  member: 4,
};

/** 给 sort by level asc 排序用 */
export function compareStoreLevel(a: StoreLevel, b: StoreLevel): number {
  return STORE_LEVEL_SORT_WEIGHTS[a] - STORE_LEVEL_SORT_WEIGHTS[b];
}

export function statusToIsActive(status: StoreStatus): boolean {
  return status === "active";
}

export function isActiveToStatus(isActive: boolean): StoreStatus {
  return isActive ? "active" : "suspended";
}

export function resolveStoreStatus(input: {
  status?: StoreStatus;
  isActive?: boolean;
}, fallback: StoreStatus = "pending"): StoreStatus {
  if (input.status) return input.status;
  if (typeof input.isActive === "boolean") return isActiveToStatus(input.isActive);
  return fallback;
}

export const StoreCreateSchema = z.object({
  slug: z
    .string()
    .max(60, "URL标识不能超过 60 个字符")
    .regex(SLUG_REGEX, "URL标识只能包含小写字母、数字和连字符")
    .optional()
    .nullable()
    .or(z.literal("")),
  name: z
    .string()
    .min(1, "门店名称不能为空")
    .max(80, "门店名称不能超过 80 个字符"),
  provinceSlug: z.string().min(1, "请选择省份"),
  /**
   * label 由 API 从数据库权威同步（AC-5：不信任客户端 label）。
   * 客户端可省略；服务端会用 prisma.province.label 覆盖。
   */
  provinceLabel: z.string().optional(),
  citySlug: z.string().min(1, "请选择城市"),
  cityLabel: z.string().optional(),
  district: z.string().max(40, "区域名称不能超过 40 个字符").optional(),
  address: z
    .string()
    .min(1, "详细地址不能为空")
    .max(200, "详细地址不能超过 200 个字符"),
  phone: z
    .string()
    .trim()
    .min(1, "联系电话不能为空")
    .regex(PHONE_REGEX, "联系电话必须为 11 位数字"),
  /**
   * phoneTel 由表单 useEffect 从 phone 自动派生，不作为必填输入。
   * 保留字段以兼容旧数据与 API。
   */
  phoneTel: z.string().optional(),
  businessHours: z.string().max(50, "营业时间过长").optional(),
  description: z.string().max(500, "描述不能超过 500 字").optional(),
  /** 新主字段：相对 public/ 的上传路径，如 /uploads/stores/abc.jpg */
  imagePath: z.string().max(255).optional().nullable(),
  /** PRD 状态机主字段；省略时由 API 按创建/兼容规则补齐。 */
  status: z.enum(STORE_STATUSES).optional(),
  statusReason: z.string().max(200, "状态原因不能超过 200 字").optional().nullable(),
  /** 兼容旧表单/API；服务端最终由 status 派生。 */
  isActive: z.boolean().optional(),
  /** 门店等级；新建待发布时可不填,发布动作在 API 层校验必填。 */
  level: z.enum(STORE_LEVELS).optional(),
});

export const StoreUpdateSchema = StoreCreateSchema.partial();

import { z } from "zod";

/** URL 标识格式：小写字母、数字、连字符；不允许连续连字符 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 电话号码格式：数字、空格、连字符、加号、括号 */
export const PHONE_REGEX = /^[\d\s\-+()]+$/;

export const StoreCreateSchema = z.object({
  slug: z
    .string()
    .min(1, "URL标识不能为空")
    .max(60, "URL标识不能超过 60 个字符")
    .regex(SLUG_REGEX, "URL标识只能包含小写字母、数字和连字符"),
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
    .min(1, "联系电话不能为空")
    .regex(PHONE_REGEX, "电话格式不正确")
    .max(30, "电话不能超过 30 个字符"),
  /**
   * phoneTel 由表单 useEffect 从 phone 自动派生，不作为必填输入。
   * 保留字段以兼容旧数据与 API。
   */
  phoneTel: z.string().optional(),
  businessHours: z.string().max(50, "营业时间过长").optional(),
  description: z.string().max(500, "描述不能超过 500 字").optional(),
  /** 新主字段：相对 public/ 的上传路径，如 /uploads/stores/abc.jpg */
  imagePath: z.string().max(255).optional().nullable(),
  /**
   * 营业状态。省略时默认 true（营业中）。
   * 后台可切换为 false（下架），前台 /api/stores 将不再返回该门店。
   */
  isActive: z.boolean().optional().default(true),
});

export const StoreUpdateSchema = StoreCreateSchema.partial();
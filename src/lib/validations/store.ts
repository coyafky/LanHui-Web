import { z } from "zod";

export const StoreCreateSchema = z.object({
  slug: z.string().min(1, "slug不能为空"),
  name: z.string().min(1, "门店名称不能为空"),
  provinceSlug: z.string().min(1),
  provinceLabel: z.string().min(1),
  citySlug: z.string().min(1),
  cityLabel: z.string().min(1),
  district: z.string().optional(),
  address: z.string().min(1, "地址不能为空"),
  phone: z.string().min(1, "电话不能为空"),
  phoneTel: z.string().min(1),
  businessHours: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const StoreUpdateSchema = StoreCreateSchema.partial();

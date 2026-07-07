import "server-only";

import { prisma } from "@/lib/prisma";

export interface FlagshipConflict {
  id: string;
  name: string;
}

export interface FlagshipCheckResult {
  ok: boolean;
  conflict?: FlagshipConflict;
}

/**
 * 检查目标城市是否已存在非终止状态的星辉旗舰店。
 *
 * @param provinceSlug - 省份 slug
 * @param citySlug - 城市 slug
 * @param level - 门店等级；非 "flagship" 直接通过
 * @param excludeStoreId - 编辑时排除当前门店自身
 */
export async function checkFlagshipPerCity(params: {
  provinceSlug: string;
  citySlug: string;
  level: string;
  excludeStoreId?: string;
}): Promise<FlagshipCheckResult> {
  const { provinceSlug, citySlug, level, excludeStoreId } = params;

  // 只有旗舰店触发校验
  if (level !== "flagship") {
    return { ok: true };
  }

  const existing = await prisma.store.findFirst({
    where: {
      provinceSlug,
      citySlug,
      level: "flagship",
      status: { not: "terminated" },
      ...(excludeStoreId ? { id: { not: excludeStoreId } } : {}),
    },
    select: { id: true, name: true },
  });

  if (existing) {
    return { ok: false, conflict: { id: existing.id, name: existing.name } };
  }

  return { ok: true };
}

/** API 统一错误响应体 */
export const FLAGSHIP_CONFLICT_RESPONSE = {
  success: false as const,
  error: "该城市已存在星辉旗舰店",
  details: { level: ["每个城市最多只能设置一个星辉旗舰店"] },
};

/** HTTP 409 状态码 */
export const FLAGSHIP_CONFLICT_STATUS = 409;

/**
 * 检测 Prisma P2002 错误是否与旗舰店唯一索引冲突有关。
 * Prisma 7 + driver adapter 的 P2002 可能不含 meta.target，
 * 需要检查约束名称或 driverAdapterError 中的信息。
 */
export function isFlagshipConflictError(error: unknown): boolean {
  if (!error || typeof error !== "object" || (error as { code?: string }).code !== "P2002") {
    return false;
  }

  const prismaErr = error as {
    meta?: {
      modelName?: string;
      constraint_name?: string;
      driverAdapterError?: {
        cause?: {
          originalCode?: string;
          kind?: string;
          constraint?: { fields?: string[]; constraint_name?: string };
        };
      };
      target?: string[];
    };
  };

  // 检查约束名称
  const constraintName =
    prismaErr.meta?.constraint_name ??
    prismaErr.meta?.driverAdapterError?.cause?.constraint?.constraint_name;
  if (constraintName === "store_one_flagship_per_city_idx") {
    return true;
  }

  // 检查字段组合 (provinceSlug + citySlug 同时出现时可能是旗舰冲突)
  const fields =
    prismaErr.meta?.driverAdapterError?.cause?.constraint?.fields ??
    prismaErr.meta?.target;
  if (
    fields?.includes("provinceSlug") &&
    fields?.includes("citySlug") &&
    // 排除 slug 唯一约束
    !fields.includes("slug")
  ) {
    return true;
  }

  return false;
}

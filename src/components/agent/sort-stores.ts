import type { Store } from "@/lib/store";
import {
  compareStoreLevel,
  type StoreLevel,
} from "@/lib/validations/store";

/**
 * 公开站门店排序：默认按等级升序（旗舰优先）。
 *
 * 实现：
 *   1. level asc —— 复用 `compareStoreLevel`（STORE_LEVEL_SORT_WEIGHTS）
 *   2. 同等级内 fallback 用 store.id 字典序，保证 SSG/CSR 输出稳定
 *
 * 不做 status 二次排序：公开 `/api/stores` 列表已过滤 status=active，
 * 公开站不会展示 pending/suspended/terminated，故 statusWeight 都一致。
 */
export function sortStoresByLevel(stores: Store[]): Store[] {
  return [...stores].sort((a, b) => {
    const levelDiff = compareStoreLevel(
      (a.level ?? "flagship") as StoreLevel,
      (b.level ?? "flagship") as StoreLevel,
    );
    if (levelDiff !== 0) return levelDiff;
    return a.id.localeCompare(b.id);
  });
}
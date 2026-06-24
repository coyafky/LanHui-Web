import {
  STORE_STATUSES,
  type StoreStatus,
} from "@/lib/validations/store";

/**
 * 门店状态机：允许的转移表。
 *
 * pending    → active / terminated
 * active     → suspended
 * suspended  → active / terminated
 * terminated → ∅ （终态）
 */
export const ALLOWED_TRANSITIONS: Record<StoreStatus, StoreStatus[]> = {
  pending: ["active", "terminated"],
  active: ["suspended"],
  suspended: ["active", "terminated"],
  terminated: [],
};

export function canTransition(from: StoreStatus, to: StoreStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export type StoreAction = "publish" | "suspend" | "resume" | "terminate";

export interface ActionTarget {
  from: StoreStatus | StoreStatus[];
  to: StoreStatus;
  label: string;
  destructive: boolean;
}

/**
 * 状态动作 → 目标状态 + UI 提示
 * - `from` 为数组时表示该动作支持多种起始状态（例如 terminate 可从 pending 或 suspended 发起）
 */
export const ACTION_TARGET: Record<StoreAction, ActionTarget> = {
  publish: { from: "pending", to: "active", label: "发布门店", destructive: false },
  suspend: { from: "active", to: "suspended", label: "暂停合作", destructive: true },
  resume: { from: "suspended", to: "active", label: "恢复营业", destructive: false },
  terminate: {
    from: ["pending", "suspended"],
    to: "terminated",
    label: "终止合作",
    destructive: true,
  },
};

/**
 * 列出当前状态下可执行的动作。
 * 单个动作即可直接返回；多动作时按 UI 常用顺序：publish / resume / suspend / terminate。
 */
export function availableActionsFor(status: StoreStatus): StoreAction[] {
  const result: StoreAction[] = [];
  for (const action of Object.keys(ACTION_TARGET) as StoreAction[]) {
    const target = ACTION_TARGET[action];
    const fromList = Array.isArray(target.from) ? target.from : [target.from];
    if (fromList.includes(status)) result.push(action);
  }
  return result;
}

/**
 * 找出能产生指定目标状态的动作；若不存在则返回 null。
 */
export function actionForTarget(to: StoreStatus): StoreAction | null {
  for (const action of Object.keys(ACTION_TARGET) as StoreAction[]) {
    if (ACTION_TARGET[action].to === to) return action;
  }
  return null;
}

/** Re-export 状态枚举，便于调用方一处 import。 */
export { STORE_STATUSES, type StoreStatus };

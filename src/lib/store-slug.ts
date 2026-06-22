/**
 * 门店 slug 系统自动生成
 *
 * 算法:
 *  1. name -> 转拼音(用 pinyin-pro,带 tone 风格)
 *  2. 转小写、替换非 [a-z0-9]+ 为 -,去除首尾 -,限制 60 字符
 *  3. 若转换后为空(纯特殊字符/中文标点等),fallback 到 cuid
 *  4. 与 existingSlugs 比对: 重名追加 -2, -3, ..., -99
 *  5. 重试 5 次失败后 fallback cuid 后缀
 */

import { pinyin } from "pinyin-pro";
import { createId } from "@paralleldrive/cuid2";
import { SLUG_REGEX } from "./validations/store";

const MAX_SLUG_LENGTH = 60;
const MAX_ATTEMPTS = 5;

/** 拼音化并归一化为 URL slug;若不可转则返回 cuid fallback */
export function toBaseSlug(name: string): string {
  const raw = pinyin(name, { toneType: "none", nonZh: "consecutive" });
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);

  if (!cleaned || !SLUG_REGEX.test(cleaned)) {
    return createId().toLowerCase().slice(0, 12);
  }
  return cleaned;
}

/** 生成不与 existingSlugs 冲突的唯一 slug;最多 5 次重试,之后 fallback cuid 后缀 */
export function generateStoreSlug(
  name: string,
  existingSlugs: ReadonlyArray<string>,
  maxAttempts: number = MAX_ATTEMPTS
): string {
  const base = toBaseSlug(name);
  if (!existingSlugs.includes(base)) return base;

  for (let i = 2; i <= 2 + maxAttempts; i++) {
    const candidate = `${base}-${i}`;
    if (candidate.length <= MAX_SLUG_LENGTH && !existingSlugs.includes(candidate)) {
      return candidate;
    }
  }
  // 兜底 cuid 后缀;截断 base 保证总长度 ≤ 60
  const cuidTail = createId().toLowerCase().slice(0, 8);
  const prefixMax = MAX_SLUG_LENGTH - cuidTail.length - 1;
  return `${base.slice(0, prefixMax)}-${cuidTail}`;
}

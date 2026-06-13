import type { QuotaColorResult } from "~/types/quota";

export const UNIT = {
  FIVE_HOUR: 3,
  WEEKLY: 6,
  MCP_MONTHLY: 5,
} as const;

export const AUTO_REFRESH_MS = 5 * 60 * 1000;

export const MCP_NAME_MAP: Record<string, string> = {
  "search-prime": "联网搜索",
  "web-reader": "网页读取",
  zread: "开源仓库",
};

export const LEVEL_BADGE_MAP: Record<string, { cls: string; label: string }> = {
  max: { cls: "text-amber-600 border-amber-600", label: "MAX" },
  pro: { cls: "text-teal-600 border-teal-600", label: "PRO" },
  lite: { cls: "text-slate-400 border-slate-400", label: "LITE" },
};
export const LEVEL_BADGE_DEFAULT = { cls: "text-slate-400 border-slate-400", label: "" };

const QUOTA_THRESHOLDS: { min: number; bar: string; text: string }[] = [
  { min: 90, bar: "#dc2626", text: "text-red-600" },
  { min: 70, bar: "#ea580c", text: "text-orange-600" },
  { min: 50, bar: "#ca8a04", text: "text-yellow-600" },
];

const QUOTA_DEFAULT_COLOR: QuotaColorResult = { bar: "#16a34a", text: "text-green-600" };

export function getQuotaColor(pct: number): QuotaColorResult {
  for (const t of QUOTA_THRESHOLDS) {
    if (pct >= t.min) return { bar: t.bar, text: t.text };
  }
  return QUOTA_DEFAULT_COLOR;
}

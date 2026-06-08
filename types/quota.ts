export interface Account {
  name: string;
  token: string;
}

export interface UsageDetail {
  modelCode: string;
  usage: number;
}

export interface QuotaLimit {
  type: "TOKENS_LIMIT" | "TIME_LIMIT";
  unit: number;
  number: number;
  percentage: number;
  nextResetTime: number;
  usage?: number;
  currentValue?: number;
  remaining?: number;
  usageDetails?: UsageDetail[];
}

export interface QuotaData {
  limits: QuotaLimit[];
  level: string;
}

export interface QuotaResponse {
  code: number;
  msg: string;
  data: QuotaData | null;
  success: boolean;
}

export interface ModelUsageResponse {
  code: number;
  msg: string;
  data: {
    totalUsage: {
      totalModelCallCount: number;
      totalTokensUsage: number;
    };
    tokensUsage: number[];
  } | null;
  success: boolean;
}

export interface AccountUsageResult {
  name: string;
  totalTokens: number;
  totalCalls: number;
  hourlyTokens: number[];
  error?: string;
}

export interface AccountQuotaResult {
  name: string;
  level: string;
  expired: boolean;
  fiveHour?: {
    percentage: number;
    nextResetTime: number;
  };
  weekly?: {
    percentage: number;
    nextResetTime: number;
  };
  mcp?: {
    usage: number;
    total: number;
    remaining: number;
    percentage: number;
    nextResetTime: number;
    details: UsageDetail[];
  };
  error?: string;
}

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

export interface QuotaColorResult {
  bar: string;
  text: string;
}

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

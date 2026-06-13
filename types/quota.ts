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

export interface QuotaColorResult {
  bar: string;
  text: string;
}

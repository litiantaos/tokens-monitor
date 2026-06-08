import type { Account, QuotaResponse, AccountQuotaResult, ModelUsageResponse, AccountUsageResult } from "~/types/quota";
import { UNIT } from "~/types/quota";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

let accountsLock: Promise<void> = Promise.resolve();

export function getAccountsPath() {
  return join(process.cwd(), "accounts.json");
}

export async function readAccounts(): Promise<Account[]> {
  try {
    const raw = await readFile(getAccountsPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeAccounts(accounts: Account[]) {
  await writeFile(getAccountsPath(), JSON.stringify(accounts, null, 2), "utf-8");
}

export async function withAccountsLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = accountsLock;
  let resolve!: () => void;
  accountsLock = new Promise((r) => {
    resolve = r;
  });
  await prev;
  try {
    return await fn();
  } finally {
    resolve();
  }
}

export async function fetchQuotaAPI(token: string): Promise<QuotaResponse> {
  return await $fetch<QuotaResponse>("https://bigmodel.cn/api/monitor/usage/quota/limit", {
    headers: {
      authorization: token,
      accept: "application/json, text/plain, */*",
      referer: "https://bigmodel.cn/coding-plan/personal/usage",
    },
  });
}

export async function fetchQuotaForAccount(account: Account): Promise<AccountQuotaResult> {
  try {
    const res = await fetchQuotaAPI(account.token);

    if (!res.success || !res.data) {
      return {
        name: account.name,
        level: "unknown",
        expired: res.code === 1001,
        error: res.msg || "请求失败",
      };
    }

    const data = res.data;
    const result: AccountQuotaResult = {
      name: account.name,
      level: data.level,
      expired: false,
    };

    for (const limit of data.limits) {
      if (limit.type === "TOKENS_LIMIT") {
        if (limit.unit === UNIT.FIVE_HOUR) {
          result.fiveHour = {
            percentage: limit.percentage,
            nextResetTime: limit.nextResetTime,
          };
        } else if (limit.unit === UNIT.WEEKLY) {
          result.weekly = {
            percentage: limit.percentage,
            nextResetTime: limit.nextResetTime,
          };
        }
      } else if (limit.type === "TIME_LIMIT" && limit.unit === UNIT.MCP_MONTHLY) {
        result.mcp = {
          usage: limit.currentValue ?? 0,
          total: limit.usage ?? 0,
          remaining: limit.remaining ?? 0,
          percentage: limit.percentage,
          nextResetTime: limit.nextResetTime,
          details: limit.usageDetails ?? [],
        };
      }
    }

    return result;
  } catch (e: any) {
    const isAuthError = e?.response?._data?.code === 1001 || e?.statusCode === 401;
    return {
      name: account.name,
      level: "unknown",
      expired: isAuthError,
      error: isAuthError ? "API Key 无效" : String(e?.message || e),
    };
  }
}

export async function fetchModelUsageAPI(token: string): Promise<ModelUsageResponse> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return await $fetch<ModelUsageResponse>("https://bigmodel.cn/api/monitor/usage/model-usage", {
    params: { startTime: fmt(start), endTime: fmt(now) },
    headers: {
      authorization: token,
      accept: "application/json, text/plain, */*",
      referer: "https://bigmodel.cn/coding-plan/personal/usage",
    },
  });
}

export async function fetchModelUsageForAccount(account: Account): Promise<AccountUsageResult> {
  try {
    const res = await fetchModelUsageAPI(account.token);
    if (!res.success || !res.data) {
      return { name: account.name, totalTokens: 0, totalCalls: 0, hourlyTokens: [], error: res.msg || "请求失败" };
    }
    return {
      name: account.name,
      totalTokens: res.data.totalUsage.totalTokensUsage,
      totalCalls: res.data.totalUsage.totalModelCallCount,
      hourlyTokens: res.data.tokensUsage,
    };
  } catch (e: any) {
    return { name: account.name, totalTokens: 0, totalCalls: 0, hourlyTokens: [], error: e?.message || "请求失败" };
  }
}

export async function fetchAllModelUsage(): Promise<AccountUsageResult[]> {
  const accounts = await readAccounts();
  if (!accounts.length) return [];

  const results = await Promise.allSettled(accounts.map((acc) => fetchModelUsageForAccount(acc)));

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { name: accounts[i]!.name, totalTokens: 0, totalCalls: 0, hourlyTokens: [], error: "请求失败" },
  );
}

export async function fetchAllQuotas(): Promise<AccountQuotaResult[]> {
  const accounts = await readAccounts();
  if (!accounts.length) return [];

  const results = await Promise.allSettled(accounts.map((acc) => fetchQuotaForAccount(acc)));

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          name: accounts[i]!.name,
          level: "unknown" as const,
          expired: false,
          error: r.reason instanceof Error ? r.reason.message : "请求失败",
        },
  );
}

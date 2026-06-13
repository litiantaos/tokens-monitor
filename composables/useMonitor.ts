import type { AccountQuotaResult, AccountUsageResult } from "~/types/quota";

interface QuotaPayload {
  accounts: AccountQuotaResult[];
  error?: string;
  timestamp?: number;
}

interface UsagePayload {
  accounts: AccountUsageResult[];
  error?: string;
  timestamp?: number;
}

type FetchStatus = "idle" | "pending" | "success" | "error";

export function useMonitor() {
  const quota = useState<QuotaPayload>("monitor:quota", () => ({ accounts: [] }));
  const usage = useState<UsagePayload>("monitor:usage", () => ({ accounts: [] }));
  const quotaStatus = useState<FetchStatus>("monitor:quotaStatus", () => "idle");
  const usageStatus = useState<FetchStatus>("monitor:usageStatus", () => "idle");

  async function fetchQuota() {
    if (quotaStatus.value === "pending") return;
    quotaStatus.value = "pending";
    try {
      quota.value = await $fetch<QuotaPayload>("/api/quota");
      quotaStatus.value = "success";
    } catch {
      quotaStatus.value = "error";
    }
  }

  async function fetchUsage() {
    if (usageStatus.value === "pending") return;
    usageStatus.value = "pending";
    try {
      usage.value = await $fetch<UsagePayload>("/api/usage");
      usageStatus.value = "success";
    } catch {
      usageStatus.value = "error";
    }
  }

  async function refreshAll() {
    await Promise.all([fetchQuota(), fetchUsage()]);
  }

  const isRefreshing = computed(
    () => quotaStatus.value === "pending" || usageStatus.value === "pending",
  );

  return {
    quota,
    usage,
    quotaStatus,
    usageStatus,
    isRefreshing,
    fetchQuota,
    fetchUsage,
    refreshAll,
  };
}

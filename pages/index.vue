<script setup lang="ts">
import type { AccountQuotaResult, AccountUsageResult } from "~/types/quota";
import { AUTO_REFRESH_MS, MCP_NAME_MAP, LEVEL_BADGE_MAP, LEVEL_BADGE_DEFAULT } from "~/types/quota";

const { data: quotaData, refresh: refreshQuota } = await useFetch<{
  accounts: AccountQuotaResult[];
  error?: string;
  timestamp?: number;
}>("/api/quota", { key: "quota" });

const { data: usageData, refresh: refreshUsage } = await useFetch<{
  accounts: AccountUsageResult[];
  error?: string;
  timestamp?: number;
}>("/api/usage", { key: "usage" });

function getUsageForAccount(name: string): AccountUsageResult | undefined {
  return usageData.value?.accounts?.find((a) => a.name === name);
}

const globalMax = computed(() => {
  const accounts = usageData.value?.accounts;
  if (!accounts?.length) return 1;
  let max = 1;
  for (const acc of accounts) {
    for (const v of acc.hourlyTokens) {
      if (v > max) max = v;
    }
  }
  return max;
});

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatCalls(n: number): string {
  return n.toLocaleString();
}

const countdowns = ref<Record<string, string>>({});
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

function formatCountdown(ms: number | undefined): string {
  if (!ms || isNaN(ms)) return "-";
  const diff = ms - Date.now();
  if (diff <= 0) return "soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function updateCountdowns() {
  if (!quotaData.value?.accounts) return;
  for (const acc of quotaData.value.accounts) {
    if (acc.fiveHour)
      countdowns.value[`${acc.name}-5h`] = formatCountdown(acc.fiveHour.nextResetTime);
    if (acc.weekly) countdowns.value[`${acc.name}-w`] = formatCountdown(acc.weekly.nextResetTime);
    if (acc.mcp) countdowns.value[`${acc.name}-mcp`] = formatCountdown(acc.mcp.nextResetTime);
  }
}

function getBadge(level: string) {
  return (
    LEVEL_BADGE_MAP[level.toLowerCase()] || { ...LEVEL_BADGE_DEFAULT, label: level.toUpperCase() }
  );
}

const displayTimestamp = computed(() => {
  const ts = quotaData.value?.timestamp;
  return ts ? new Date(ts).toLocaleTimeString() : "-";
});

onMounted(() => {
  updateCountdowns();
  countdownTimer = setInterval(updateCountdowns, 1000);
  autoRefreshTimer = setInterval(() => {
    refreshQuota();
    refreshUsage();
  }, AUTO_REFRESH_MS);
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold tracking-tight">Tokens Monitor</h1>
      <AppButton icon="ri-settings-3-line text-sm" title="设置" @click="navigateTo('/settings')" />
    </div>

    <p class="mb-6 text-xs text-stone-400">
      GLM Coding Plan Usage ｜ 更新于 {{ displayTimestamp }}
    </p>

    <div
      v-if="quotaData?.error && !quotaData.accounts?.length"
      class="card p-3 text-sm text-red-600"
    >
      <i class="ri-error-warning-line mr-1"></i>{{ quotaData.error }}
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="acc in quotaData?.accounts" :key="acc.name" class="card">
        <div class="card-header">
          <span class="truncate">{{ acc.name }}</span>
          <span
            v-if="acc.level && acc.level !== 'unknown'"
            class="text-2xs ml-2 border px-1.5 font-bold tracking-wider uppercase"
            :class="getBadge(acc.level).cls"
          >
            {{ getBadge(acc.level).label }}
          </span>
        </div>

        <div v-if="acc.expired || acc.error" class="p-6 text-center">
          <i class="ri-error-warning-line mb-2 text-2xl text-red-600"></i>
          <p class="text-sm text-red-600">{{ acc.error || "API Key 无效" }}</p>
          <NuxtLink to="/settings" class="mt-1 inline-block text-xs text-blue-600 hover:underline"
            >settings &rarr;</NuxtLink
          >
        </div>

        <template v-else>
          <div class="space-y-4 p-4">
            <QuotaBar
              label="5h"
              :percentage="acc.fiveHour?.percentage ?? 0"
              :countdown="countdowns[`${acc.name}-5h`]"
            />
            <QuotaBar
              label="weekly"
              :percentage="acc.weekly?.percentage ?? 0"
              :countdown="countdowns[`${acc.name}-w`]"
            />

            <div v-if="getUsageForAccount(acc.name)" class="border-t border-gray-100 pt-3">
              <div class="mb-4 flex items-center justify-between text-xs">
                <span class="text-stone-500">7d usage</span>
                <span class="text-stone-400 tabular-nums">
                  {{ formatCalls(getUsageForAccount(acc.name)!.totalCalls) }} calls ·
                  {{ formatTokens(getUsageForAccount(acc.name)!.totalTokens) }} tokens
                </span>
              </div>
              <SparkLine :data="getUsageForAccount(acc.name)!.hourlyTokens" :max="globalMax" />
            </div>

            <div v-if="acc.mcp" class="border-t border-gray-100 pt-3">
              <div class="mb-2 flex items-center justify-between text-xs">
                <span class="text-stone-500">mcp/month</span>
                <span class="text-stone-400 tabular-nums">
                  {{ acc.mcp.usage }}/{{ acc.mcp.total }}
                </span>
              </div>
              <div
                v-for="detail in acc.mcp.details"
                :key="detail.modelCode"
                class="flex items-center justify-between py-0.5 text-xs text-stone-400"
              >
                <span>{{ MCP_NAME_MAP[detail.modelCode] || detail.modelCode }}</span>
                <span class="tabular-nums">{{ detail.usage }}</span>
              </div>
              <div class="countdown-text mt-1 text-right">
                {{ countdowns[`${acc.name}-mcp`] || "-" }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

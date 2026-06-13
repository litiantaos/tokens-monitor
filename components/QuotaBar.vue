<script setup lang="ts">
import { getQuotaColor } from "~/utils/quota";

const props = defineProps<{
  label: string;
  percentage: number;
  countdown?: string;
}>();

const colors = computed(() => getQuotaColor(props.percentage));

const barStyle = computed(() => ({
  width: Math.min(props.percentage, 100) + "%",
  minWidth: props.percentage > 0 ? "4px" : "0",
  background: colors.value.bar,
}));
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between text-xs">
      <span class="text-stone-500">{{ label }}</span>
      <span class="font-bold tabular-nums" :class="colors.text"> {{ percentage }}% </span>
    </div>
    <div class="h-1.5 w-full bg-gray-100">
      <div class="h-full transition-all duration-500" :style="barStyle" />
    </div>
    <div class="countdown-text mt-1 text-right">
      {{ countdown || "-" }}
    </div>
  </div>
</template>

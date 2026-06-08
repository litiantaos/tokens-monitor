<script setup lang="ts">
const props = defineProps<{
  data: number[];
  height?: number;
  max?: number;
}>();

const h = computed(() => props.height ?? 32);

const viewBoxW = computed(() => Math.max(props.data.length - 1, 1));
const viewBoxH = computed(() => h.value);

const path = computed(() => {
  const d = props.data;
  if (d.length < 2) return "";
  const max = props.max ?? Math.max(...d, 1);
  const ht = viewBoxH.value;

  const points = d.map((v, i) => ({
    x: i,
    y: ht - (v / max) * (ht - 2) - 1,
  }));

  let p = `M${points[0]!.x},${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpx = (prev.x + curr.x) / 2;
    p += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return p;
});

const areaPath = computed(() => {
  const p = path.value;
  if (!p) return "";
  const ht = viewBoxH.value;
  const lastX = viewBoxW.value;
  return `${p} L${lastX},${ht} L0,${ht} Z`;
});
</script>

<template>
  <svg
    v-if="data.length > 1"
    :viewBox="`0 0 ${viewBoxW} ${viewBoxH}`"
    :height="h"
    preserveAspectRatio="none"
    class="w-full"
  >
    <defs>
      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#16a34a" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#16a34a" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="areaPath" fill="url(#sparkFill)" />
    <path
      :d="path"
      fill="none"
      stroke="#16a34a"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>

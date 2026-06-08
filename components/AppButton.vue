<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    danger?: boolean;
    variant?: "ghost" | "solid";
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    variant: "ghost",
  },
);

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    :title="title"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-1 border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      variant === 'solid'
        ? 'border-stone-600 bg-stone-600 font-semibold text-white hover:opacity-85'
        : danger
          ? 'border-dashed border-gray-300 font-medium text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
          : 'border-dashed border-gray-300 font-medium text-stone-600 hover:bg-zinc-50',
      $slots.default ? (block ? 'w-full py-3 text-xs' : 'px-4 py-1.5 text-xs') : 'h-8 w-8',
    ]"
    @click="$emit('click')"
  >
    <i v-if="icon" :class="icon" />
    <slot />
  </button>
</template>

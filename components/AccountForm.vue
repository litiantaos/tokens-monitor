<script setup lang="ts">
const props = defineProps<{
  mode: "add" | "edit";
  initialName?: string;
  initialToken?: string;
  tokenRequired?: boolean;
  tokenPlaceholder?: string;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [data: { name: string; token: string }];
  cancel: [];
}>();

const name = ref(props.initialName ?? "");
const token = ref(props.initialToken ?? "");
const testResult = ref<{
  valid: boolean;
  level?: string;
  error?: string;
} | null>(null);
const testing = ref(false);
const submitting = ref(false);

async function testToken() {
  if (!token.value) return;
  testing.value = true;
  try {
    testResult.value = await $fetch<{
      valid: boolean;
      level?: string;
      error?: string;
    }>("/api/accounts/test", {
      method: "POST",
      body: { token: token.value },
    });
  } catch (e: any) {
    testResult.value = { valid: false, error: e?.data?.message || "测试失败" };
  }
  testing.value = false;
}

const canSubmit = computed(() => {
  if (!name.value) return false;
  if (props.tokenRequired && !token.value) return false;
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  emit("submit", { name: name.value, token: token.value });
  await nextTick();
  setTimeout(() => {
    submitting.value = false;
  }, 1000);
}

function handleCancel() {
  name.value = props.initialName ?? "";
  token.value = "";
  testResult.value = null;
  emit("cancel");
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="mb-1 block text-xs text-stone-500">
        name <span v-if="tokenRequired" class="text-red-600">*</span>
      </label>
      <input
        v-model="name"
        type="text"
        :placeholder="mode === 'add' ? 'e.g. account1-max' : ''"
        class="input"
      />
    </div>

    <div>
      <label class="mb-1 block text-xs text-stone-500">
        api key <span v-if="tokenRequired" class="text-red-600">*</span>
      </label>
      <div class="flex gap-2">
        <input
          v-model="token"
          type="text"
          :placeholder="tokenPlaceholder || 'paste key here'"
          class="input"
        />
        <AppButton :disabled="!token || testing" @click="testToken">
          <i v-if="testing" class="ri-loader-4-line animate-spin"></i>
          <i v-else class="ri-flashlight-line"></i>
          test
        </AppButton>
      </div>
    </div>

    <div v-if="testResult" class="text-xs">
      <span v-if="testResult.valid" class="text-green-600">
        <i class="ri-checkbox-circle-line"></i> ok - {{ testResult.level }}
      </span>
      <span v-else class="text-red-600">
        <i class="ri-close-circle-line"></i> {{ testResult.error }}
      </span>
    </div>

    <div class="flex gap-2">
      <AppButton variant="solid" :disabled="submitting || !canSubmit" @click="handleSubmit">
        <i v-if="submitting" class="ri-loader-4-line animate-spin"></i>
        {{ submitLabel || (mode === "add" ? "add" : "save") }}
      </AppButton>
      <AppButton @click="handleCancel">cancel</AppButton>
    </div>
  </div>
</template>

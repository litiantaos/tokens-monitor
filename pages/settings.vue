<script setup lang="ts">
interface AccountView {
  name: string;
  tokenPreview: string;
  token: string;
}

const { data: accountsData, refresh: refreshAccounts } = await useFetch<{
  accounts: AccountView[];
}>("/api/accounts");

const showAddForm = ref(false);

async function handleAdd(data: { name: string; token: string }) {
  await $fetch("/api/accounts", {
    method: "POST",
    body: { name: data.name, token: data.token },
  });
  showAddForm.value = false;
  await refreshAccounts();
}

async function removeAccount(index: number) {
  const acc = accountsData.value?.accounts?.[index];
  if (!confirm(`确定要删除账号「${acc?.name}」吗？`)) return;
  await $fetch("/api/accounts", {
    method: "DELETE",
    body: { index },
  });
  await refreshAccounts();
}

const editingIndex = ref(-1);

function startEdit(index: number) {
  editingIndex.value = index;
}

function cancelEdit() {
  editingIndex.value = -1;
}

async function handleEdit(data: { name: string; token: string }) {
  await $fetch("/api/accounts", {
    method: "PUT",
    body: {
      index: editingIndex.value,
      account: {
        name: data.name,
        token: data.token || undefined,
      },
    },
  });
  editingIndex.value = -1;
  await refreshAccounts();
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center gap-4">
      <AppButton icon="ri-arrow-left-s-line text-base" title="返回" @click="navigateTo('/')" />
      <h1 class="text-lg font-bold tracking-tight">Settings</h1>
    </div>

    <div class="space-y-8">
      <section class="card">
        <div class="section-header">accounts</div>
        <div v-if="!accountsData?.accounts?.length" class="p-4 text-center">
          <p class="text-xs text-stone-400">no accounts configured</p>
        </div>
        <div v-else>
          <div
            v-for="(acc, i) in accountsData?.accounts"
            :key="i"
            class="border-t border-gray-100 first:border-t-0"
          >
            <template v-if="editingIndex === i">
              <div class="p-4">
                <AccountForm
                  mode="edit"
                  :initial-name="acc.name"
                  :initial-token="acc.token"
                  @submit="handleEdit"
                  @cancel="cancelEdit"
                />
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between px-4 py-3">
                <div class="min-w-0 flex-1">
                  <div class="truncate text-xs font-semibold">{{ acc.name }}</div>
                  <div class="text-2xs mt-0.5 truncate text-stone-400">{{ acc.tokenPreview }}</div>
                </div>
                <div class="ml-3 flex shrink-0 items-center gap-2">
                  <AppButton icon="ri-pencil-line text-xs" title="编辑" @click="startEdit(i)" />
                  <AppButton
                    icon="ri-delete-bin-7-line text-xs"
                    title="删除"
                    danger
                    @click="removeAccount(i)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <section>
        <template v-if="!showAddForm">
          <AppButton block @click="showAddForm = true">+ add account</AppButton>
        </template>
        <div v-else class="card">
          <div class="section-header">new account</div>
          <div class="p-4">
            <AccountForm
              mode="add"
              :token-required="true"
              submit-label="add"
              @submit="handleAdd"
              @cancel="showAddForm = false"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

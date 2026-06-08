export default defineEventHandler(async () => {
  const accounts = await readAccounts();
  if (!accounts.length) {
    return { accounts: [], error: "accounts.json 中没有配置账号" };
  }

  const data = await fetchAllModelUsage();
  return { accounts: data, timestamp: Date.now() };
});

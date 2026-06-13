import type { Account } from "~/types/quota";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ index: number; account: Account }>(event);
  if (typeof body.index !== "number") {
    throw createError({ statusCode: 400, message: "index 必填" });
  }
  return withAccountsLock(async () => {
    const accounts = await readAccounts();
    if (body.index < 0 || body.index >= accounts.length) {
      throw createError({ statusCode: 400, message: "无效的索引" });
    }
    const acc = body.account;
    if (!acc.name) {
      throw createError({ statusCode: 400, message: "name 必填" });
    }
    accounts[body.index] = { name: acc.name, token: acc.token || accounts[body.index]!.token };
    await writeAccounts(accounts);
    return { success: true };
  });
});

import type { Account } from "~/types/quota";

export default defineEventHandler(async (event) => {
  const body = await readBody<Account>(event);
  if (!body.name || !body.token) {
    throw createError({ statusCode: 400, message: "name 和 token 必填" });
  }
  return withAccountsLock(async () => {
    const accounts = await readAccounts();
    accounts.push({ name: body.name, token: body.token });
    await writeAccounts(accounts);
    return { success: true };
  });
});

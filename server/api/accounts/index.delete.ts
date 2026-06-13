export default defineEventHandler(async (event) => {
  const body = await readBody<{ index: number }>(event);
  return withAccountsLock(async () => {
    const accounts = await readAccounts();
    if (typeof body.index !== "number" || body.index < 0 || body.index >= accounts.length) {
      throw createError({ statusCode: 400, message: "无效的索引" });
    }
    accounts.splice(body.index, 1);
    await writeAccounts(accounts);
    return { success: true };
  });
});

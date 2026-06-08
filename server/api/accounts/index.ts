import type { Account } from "~/types/quota";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const accounts = await readAccounts();
    return {
      accounts: accounts.map((a) => ({
        name: a.name,
        tokenPreview: a.token ? a.token.slice(0, 20) + "..." : "",
        token: a.token || "",
      })),
    };
  }

  if (method === "POST") {
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
  }

  if (method === "PUT") {
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
  }

  if (method === "DELETE") {
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
  }

  throw createError({ statusCode: 405, message: "Method not allowed" });
});

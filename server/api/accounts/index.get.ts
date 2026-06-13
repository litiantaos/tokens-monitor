export default defineEventHandler(async () => {
  const accounts = await readAccounts();
  return {
    accounts: accounts.map((a) => ({
      name: a.name,
      tokenPreview: a.token ? a.token.slice(0, 20) + "..." : "",
      token: a.token || "",
    })),
  };
});

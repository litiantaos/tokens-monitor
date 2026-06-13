export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string }>(event);
  if (!body.token) {
    throw createError({ statusCode: 400, message: "token 不能为空" });
  }

  try {
    const res = await fetchQuotaAPI(body.token);

    if (res.success && res.data) {
      return {
        valid: true,
        level: res.data.level,
      };
    }
    return {
      valid: false,
      error: res.msg || "验证失败",
    };
  } catch (e) {
    const err = e as { response?: { _data?: { code?: number } }; message?: string };
    const data = err?.response?._data;
    if (data?.code === 1001) {
      return { valid: false, error: "API Key 无效" };
    }
    return { valid: false, error: err?.message || "连接失败" };
  }
});

export default defineNuxtPlugin(async () => {
  const { fetchQuota, fetchUsage } = useMonitor();
  await Promise.all([fetchQuota(), fetchUsage()]);
});

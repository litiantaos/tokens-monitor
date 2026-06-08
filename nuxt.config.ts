import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-06-05",
  devtools: { enabled: false },
  css: ["remixicon/fonts/remixicon.css", "~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: "Tokens Monitor",
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ВАЖНО: Замени на название своего репозитория!
// Если репозиторий https://github.com/user/my-app, то пиши "/my-app/"
const REPO_NAME = "/rip_frontend";

export default defineConfig({
  // Базовый путь: в продакшене (GH Pages) используем имя репо, локально - корень
  base: process.env.NODE_ENV === "production" ? REPO_NAME : "/",

  server: {
    // УБРАЛИ БЛОК HTTPS

    // Прокси оставляем, чтобы локально работать с бэкендом
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      "/images": {
        target: "http://127.0.0.1:9000",
        changeOrigin: true,
        secure: false,
      },
    },
    port: 3000,
    host: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // Включаем PWA на localhost для теста
      },
      manifest: {
        name: "Прогноз Растворимости",
        short_name: "Lab 6",
        // start_url должен учитывать имя репозитория в продакшене
        start_url: process.env.NODE_ENV === "production" ? REPO_NAME : "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2e805e",
        orientation: "portrait-primary",
        icons: [
          {
            src: "logo192.png", // Убедись, что картинки есть в папке public
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
      },
    }),
  ],
});

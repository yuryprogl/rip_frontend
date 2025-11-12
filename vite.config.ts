import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      // Прокси для API-запросов к Django
      "/api": {
        target: "http://127.0.0.1:8000", // Адрес вашего Django-бэкенда
        changeOrigin: true,
        secure: false, // Важно для локальной разработки
      },
      // Прокси для изображений из Minio
      "/images": {
        target: "http://127.0.0.1:9000", // Адрес вашего Minio
        changeOrigin: true,
        secure: false,
      },
    },
    port: 3000,
    host: true, // Обязательно для корректной работы в Docker
  },
  plugins: [react()],
});

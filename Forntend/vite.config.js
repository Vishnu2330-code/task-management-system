import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const frontendPort = Number(env.VITE_PORT || 5173);
  const apiBaseUrl = (env.VITE_API_BASE_URL || "http://localhost:5000/api")
    .replace(/\/+$/, "");
  const proxyTarget = apiBaseUrl.replace(/\/api$/, "") || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      strictPort: false,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

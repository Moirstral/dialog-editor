import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: "./cert/localhost-key.pem",
      cert: "./cert/localhost.pem",
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    visualizer({ open: true }),
  ],
  base: "./", // 设置相对路径
});

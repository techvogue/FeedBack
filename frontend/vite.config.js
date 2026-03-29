import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("survey-core") || id.includes("survey-react-ui")) {
            return "survey-vendor";
          }

          if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
            return "chart-vendor";
          }

          if (id.includes("@mui") || id.includes("@emotion")) {
            return "mui-vendor";
          }

          if (id.includes("react-router")) {
            return "router-vendor";
          }

          if (id.includes("redux") || id.includes("@reduxjs")) {
            return "redux-vendor";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
});

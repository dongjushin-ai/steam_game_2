import { defineConfig } from "vite";

// GitHub Pages serves the site from /<repo>/, so build with relative asset paths.
export default defineConfig({
  base: "./",
  build: { target: "es2020", outDir: "dist" },
});

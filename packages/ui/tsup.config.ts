import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "next"],
  esbuildOptions(options) {
     options.banner = {
      js: '"use client";',
    };
    options.alias = {
      "@repo/ui": "./src",  // mirrors your tsconfig paths
    };
  },
});
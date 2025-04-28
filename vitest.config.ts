import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["./src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["./src/**/*.e2e.{test,spec}.{ts,tsx}", "./node_modules/**/*"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/**",
          "src/test/**",
          "**/*.d.ts",
          "**/*.config.{js,ts}",
          "**/vite-env.d.ts",
        ],
      },
    },
  })
);

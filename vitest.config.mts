import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    execArgv: ["--no-experimental-webstorage"],
    environmentOptions: {
      jsdom: { url: "http://localhost:3000" },
    },
  },
  resolve: {
    alias: {
      "@": path.join(rootDirectory, "src"),
      "server-only": path.join(rootDirectory, "src/test/server-only.ts"),
    },
  },
});

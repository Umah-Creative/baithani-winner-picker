import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const standaloneRoot = join(projectRoot, ".next", "standalone");
const serverPath = join(standaloneRoot, "server.js");

config({
  path: [join(projectRoot, ".env.local"), join(projectRoot, ".env")],
  quiet: true,
});

if (!existsSync(serverPath)) {
  console.error("Standalone build not found. Run `pnpm build` first.");
  process.exit(1);
}

function replaceDirectory(source, destination) {
  if (!existsSync(source)) return;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

replaceDirectory(join(projectRoot, "public"), join(standaloneRoot, "public"));
replaceDirectory(
  join(projectRoot, ".next", "static"),
  join(standaloneRoot, ".next", "static")
);

const projectNodeModules = join(projectRoot, "node_modules");
const standaloneNodeModules = join(standaloneRoot, "node_modules");
if (!existsSync(projectNodeModules)) {
  console.error("Project dependencies not found. Run `pnpm install` first.");
  process.exit(1);
}
rmSync(standaloneNodeModules, { recursive: true, force: true });
symlinkSync(
  projectNodeModules,
  standaloneNodeModules,
  process.platform === "win32" ? "junction" : "dir"
);

const server = spawn(process.execPath, [serverPath], {
  cwd: standaloneRoot,
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("error", (error) => {
  console.error("Standalone server failed to start.", error);
  process.exitCode = 1;
});

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});

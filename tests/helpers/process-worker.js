import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Real UCI engine over stdio; mirrors the browser worker's message interface.
export function processWorker() {
  const child = spawn(
    process.execPath,
    [require("stockfish").findEngine("lite-single")],
    { stdio: ["pipe", "pipe", "pipe"] },
  );
  const listeners = new Map();
  const emit = (name, event) => {
    for (const fn of listeners.get(name) || []) fn(event);
  };
  const lines = createInterface({ input: child.stdout });
  lines.on("line", (line) => emit("message", { data: line }));
  child.on("error", (error) => emit("error", error));
  child.stderr.on("data", () => {});
  return {
    addEventListener(name, fn) {
      const list = listeners.get(name) || [];
      list.push(fn);
      listeners.set(name, list);
    },
    postMessage(command) {
      if (!child.killed) child.stdin.write(command + "\n");
    },
    terminate() {
      lines.close();
      child.kill();
    },
  };
}

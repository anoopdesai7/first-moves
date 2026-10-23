import { test } from "node:test";
import assert from "node:assert/strict";
import { StockfishClient } from "../src/stockfish.js";

class FakeWorker {
  listeners = new Map();
  commands = [];
  terminated = false;
  addEventListener(name, fn) {
    const list = this.listeners.get(name) || [];
    list.push(fn);
    this.listeners.set(name, list);
  }
  emit(data) {
    for (const fn of this.listeners.get("message") || []) fn({ data });
  }
  postMessage(command) {
    this.commands.push(command);
    if (command === "uci") queueMicrotask(() => this.emit("uciok"));
    if (command === "isready") queueMicrotask(() => this.emit("readyok"));
    if (command.startsWith("go ")) this.onGo?.();
  }
  terminate() {
    this.terminated = true;
  }
  nextGo() {
    return new Promise((resolve) => {
      this.onGo = () => {
        this.onGo = null;
        resolve();
      };
    });
  }
}

test("cancelled searches drain before the next position, so stale output cannot leak", async () => {
  const worker = new FakeWorker(),
    client = new StockfishClient(worker);
  try {
    await client.ready;
    const abort = new AbortController(),
      started = worker.nextGo();
    const first = client.analyze(
      { fen: "first position" },
      { signal: abort.signal },
    );
    const rejected = assert.rejects(first, { name: "AbortError" });
    await started;
    worker.emit("info depth 12 score cp 999 pv e2e4");
    abort.abort();
    const nextStarted = worker.nextGo();
    const second = client.analyze({ fen: "second position" });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(worker.commands.filter((c) => c.startsWith("go ")).length, 1);
    assert.ok(worker.commands.includes("stop"));
    worker.emit("bestmove e2e4");
    await rejected;
    await nextStarted;
    worker.emit("info depth 10 score cp -25 pv e7e5");
    worker.emit("bestmove e7e5");
    const answer = await second;
    assert.equal(answer.score.value, -25);
    assert.equal(answer.bestmove, "e7e5");
  } finally {
    client.dispose();
  }
});

test("complete results are cached and forced-move searches stay separate", async () => {
  const worker = new FakeWorker(),
    client = new StockfishClient(worker);
  try {
    await client.ready;
    const position = { fen: "position" },
      started = worker.nextGo(),
      pending = client.analyze(position);
    await started;
    worker.emit("info depth 14 score cp 32 pv e2e4");
    worker.emit("bestmove e2e4");
    assert.equal((await pending).score.value, 32);
    assert.equal((await client.analyze(position)).score.value, 32);
    assert.equal(worker.commands.filter((c) => c.startsWith("go ")).length, 1);
    const next = worker.nextGo(),
      forced = client.analyze(position, { searchMove: "d2d4" });
    await next;
    assert.match(worker.commands.at(-1), /searchmoves d2d4$/);
    worker.emit("info depth 13 score cp 15 pv d2d4");
    worker.emit("bestmove d2d4");
    assert.equal((await forced).score.value, 15);
  } finally {
    client.dispose();
  }
});

test("initialization failure and worker shutdown reject pending work", async () => {
  const worker = new FakeWorker(),
    client = new StockfishClient(worker);
  await client.ready;
  const started = worker.nextGo(),
    pending = client.analyze({ fen: "position" });
  const rejected = assert.rejects(pending, /could not load/);
  await started;
  for (const handler of worker.listeners.get("error"))
    handler({ message: "network error" });
  await rejected;
  assert.equal(worker.terminated, true);
  await assert.rejects(client.analyze({ fen: "later position" }), /stopped/);
});

test("a worker startup error rejects initialization and cleans up its timer", async () => {
  const worker = new FakeWorker(),
    client = new StockfishClient(worker);
  const rejected = assert.rejects(client.ready, /could not load/);
  for (const handler of worker.listeners.get("error"))
    handler({ message: "WebAssembly unsupported" });
  await rejected;
  assert.equal(client.disposed, true);
  assert.equal(worker.terminated, true);
});

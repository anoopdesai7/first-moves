import {
  ENGINE_DEPTH,
  ENGINE_MOVE_TIME,
  parseEngineInfo,
  positionCommand,
} from "./scoring.js";

export function abortError() {
  return new DOMException("Analysis cancelled", "AbortError");
}

// One UCI worker, one search at a time. A cancelled search is drained through
// bestmove before the next request starts, so late output cannot score a new board.
export class StockfishClient {
  constructor(worker, { startupTimeout = 45000, searchTimeout = 12000 } = {}) {
    this.worker = worker;
    this.searchTimeout = searchTimeout;
    this.queue = Promise.resolve();
    this.cache = new Map();
    this.active = null;
    this.disposed = false;
    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    // The UI may unmount before initialization completes.
    this.ready.catch(() => {});
    this.startupTimer = setTimeout(
      () =>
        this.fail(new Error("Stockfish took too long to load. Please retry.")),
      startupTimeout,
    );
    worker.addEventListener("message", (event) => {
      for (const line of String(event.data).split("\n"))
        this.receive(line.trim());
    });
    worker.addEventListener("error", () =>
      this.fail(
        new Error(
          "Stockfish could not load. Check that this browser supports WebAssembly, then retry.",
        ),
      ),
    );
    worker.addEventListener("messageerror", () =>
      this.fail(
        new Error("Stockfish sent an unreadable response. Please retry."),
      ),
    );
    this.send("uci");
  }

  send(command) {
    if (!this.disposed) this.worker.postMessage(command);
  }

  receive(line) {
    if (this.disposed) return;
    if (line === "uciok") {
      this.send("setoption name Hash value 32");
      this.send("setoption name MultiPV value 1");
      this.send("isready");
    }
    if (line === "readyok") {
      clearTimeout(this.startupTimer);
      this.resolveReady();
    }
    const active = this.active;
    if (!active) return;
    const info = parseEngineInfo(line);
    if (info && (!active.info || info.depth >= active.info.depth))
      active.info = info;
    if (line.startsWith("bestmove ")) {
      const bestmove = line.split(/\s+/)[1];
      this.active = null;
      clearTimeout(active.timer);
      active.signal?.removeEventListener("abort", active.onAbort);
      if (active.signal?.aborted) {
        active.reject(abortError());
        return;
      }
      if (!active.info) {
        active.reject(
          new Error("Stockfish could not score this position. Please retry."),
        );
        return;
      }
      const result = {
        ...active.info,
        bestmove: /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bestmove)
          ? bestmove
          : null,
      };
      this.cache.set(active.key, result);
      if (this.cache.size > 96)
        this.cache.delete(this.cache.keys().next().value);
      active.resolve(result);
    }
  }

  analyze(
    position,
    {
      signal,
      searchMove,
      depth = ENGINE_DEPTH,
      movetime = ENGINE_MOVE_TIME,
    } = {},
  ) {
    const key = `${positionCommand(position)}|${searchMove || "*"}|${depth}|${movetime}`;
    const run = async () => {
      if (signal?.aborted) throw abortError();
      await this.ready;
      if (signal?.aborted) throw abortError();
      if (this.disposed) throw new Error("Stockfish is stopped. Please retry.");
      if (this.cache.has(key)) return this.cache.get(key);
      return new Promise((resolve, reject) => {
        const onAbort = () => this.send("stop");
        const timer = setTimeout(
          () => this.fail(new Error("Analysis timed out. Please retry.")),
          this.searchTimeout,
        );
        this.active = {
          key,
          resolve,
          reject,
          timer,
          signal,
          onAbort,
          info: null,
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        this.send("setoption name Clear Hash");
        this.send(positionCommand(position));
        this.send(
          `go depth ${depth} movetime ${movetime}${searchMove ? ` searchmoves ${searchMove}` : ""}`,
        );
      });
    };
    const result = this.queue.then(run);
    this.queue = result.catch(() => {});
    return result;
  }

  fail(error) {
    if (this.disposed) return;
    this.disposed = true;
    clearTimeout(this.startupTimer);
    this.rejectReady(error);
    if (this.active) {
      clearTimeout(this.active.timer);
      this.active.signal?.removeEventListener("abort", this.active.onAbort);
      this.active.reject(error);
      this.active = null;
    }
    this.worker.terminate();
  }

  dispose() {
    this.fail(abortError());
    this.cache.clear();
  }
}

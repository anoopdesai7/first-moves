import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { StockfishClient } from "../src/stockfish.js";
import {
  gradeMove,
  moveUci,
  positionSpec,
  whiteScore,
} from "../src/scoring.js";
import { analyzeTarget } from "../src/useStockfish.js";
import { processWorker } from "./helpers/process-worker.js";

let client;
before(async () => {
  client = new StockfishClient(processWorker());
  await client.ready;
});
after(() => client?.dispose());

test("the shipped Stockfish binary evaluates a real starting position", async () => {
  const result = await client.analyze(positionSpec(new Chess()), {
    depth: 10,
    movetime: 1000,
  });
  assert.equal(result.score.kind, "cp");
  assert.ok(Number.isFinite(result.score.value));
  assert.ok(result.depth >= 8);
  assert.match(result.bestmove, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
});

test("the engine identifies an actual move that allows Fool’s Mate as a blunder", async () => {
  const game = new Chess();
  game.move("f3");
  game.move("e5");
  const position = positionSpec(game),
    move = game.move("g4"),
    uci = moveUci(move);
  const best = await client.analyze(position, { depth: 12, movetime: 1000 });
  const played = await client.analyze(position, {
    depth: 12,
    movetime: 1000,
    searchMove: uci,
  });
  assert.equal(played.score.kind, "mate");
  assert.ok(played.score.value < 0);
  assert.equal(
    gradeMove(best, played, uci, new Chess(move.before).moves().length).label,
    "Blunder",
  );
  const reply = await client.analyze(positionSpec(game), {
    depth: 10,
    movetime: 1000,
  });
  assert.equal(reply.bestmove, "d8h4");
  assert.equal(reply.score.kind, "mate");
  assert.equal(whiteScore(reply.score, "b").winner, "b");
});

test("a rejected practice attempt is scored hypothetically without changing the board", async () => {
  const game = new Chess(),
    before = positionSpec(game),
    copy = new Chess(),
    move = copy.move("a3");
  const answer = await analyzeTarget(
    client,
    game,
    { position: before, move, committed: false },
    new AbortController().signal,
  );
  assert.equal(game.fen(), before.fen);
  assert.equal(answer.review.san, "a3");
  assert.equal(answer.review.committed, false);
  assert.equal(answer.position.white.kind, "cp");
  assert.ok(Number.isFinite(answer.review.lossCp));
});

test("a legal mating move produces exact terminal evaluation without a second search", async () => {
  const game = new Chess();
  for (const san of ["f3", "e5", "g4"]) game.move(san);
  const before = positionSpec(game),
    move = game.move("Qh4#");
  const answer = await analyzeTarget(
    client,
    game,
    { position: before, move, committed: true },
    new AbortController().signal,
  );
  assert.equal(answer.position.terminal, true);
  assert.equal(answer.position.white.winner, "b");
  assert.equal(answer.review.label, "Best");
});

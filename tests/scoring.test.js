import { test } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  formatEvaluation,
  gradeMove,
  moveUci,
  parseEngineInfo,
  positionCommand,
  positionSpec,
  sanContinuation,
  terminalEvaluation,
  whiteScore,
} from "../src/scoring.js";

const cp = (value) => ({ kind: "cp", value });
const mate = (value) => ({ kind: "mate", value });
const result = (score, bestmove = "e2e4") => ({
  score,
  bestmove,
  depth: 14,
  pv: [bestmove],
});

test("UCI parsing accepts exact scores, depths, promotions, and principal variations", () => {
  assert.deepEqual(
    parseEngineInfo(
      "info depth 14 seldepth 19 multipv 1 score cp -38 nodes 1000 pv e7e5 g1f3",
    ),
    { depth: 14, score: cp(-38), pv: ["e7e5", "g1f3"] },
  );
  assert.deepEqual(
    parseEngineInfo("info depth 9 score mate -2 pv a7a8q").score,
    mate(-2),
  );
  for (const line of [
    "uciok",
    "info string NNUE enabled",
    "info depth 3 score cp 100 lowerbound pv e2e4",
    "info depth 5 multipv 2 score cp 15 pv d2d4",
    "info score cp 50",
  ])
    assert.equal(parseEngineInfo(line), null);
});

test("White and Black scores normalize to the same fixed display perspective", () => {
  assert.deepEqual(whiteScore(cp(125), "w"), cp(125));
  assert.deepEqual(whiteScore(cp(125), "b"), cp(-125));
  assert.equal(formatEvaluation(whiteScore(cp(125), "b")), "−1.25");
  assert.equal(formatEvaluation(cp(0)), "0.00");
  assert.equal(formatEvaluation(cp(40)), "+0.40");
  assert.equal(formatEvaluation(whiteScore(mate(3), "b")), "−M3");
  assert.equal(formatEvaluation(whiteScore(mate(-2), "b")), "M2");
  assert.equal(formatEvaluation(whiteScore(mate(0), "w")), "0–1");
  assert.equal(formatEvaluation(whiteScore(mate(0), "b")), "1–0");
});

test("move-quality boundaries use loss from the mover’s perspective", () => {
  for (const [loss, label] of [
    [0, "Excellent"],
    [20, "Excellent"],
    [21, "Good"],
    [50, "Good"],
    [51, "Inaccuracy"],
    [100, "Inaccuracy"],
    [101, "Mistake"],
    [200, "Mistake"],
    [201, "Blunder"],
  ]) {
    const grade = gradeMove(
      result(cp(50)),
      result(cp(50 - loss), "d2d4"),
      "d2d4",
      20,
    );
    assert.equal(grade.label, label);
    assert.equal(grade.lossCp, loss);
  }
  assert.equal(
    gradeMove(result(cp(-150)), result(cp(-450), "d2d4"), "d2d4", 20).lossCp,
    300,
  );
  assert.equal(
    gradeMove(result(cp(10)), result(cp(25), "d2d4"), "d2d4", 20).lossCp,
    0,
  );
  assert.equal(
    gradeMove(result(cp(50)), result(cp(50)), "e2e4", 20).label,
    "Best",
  );
  assert.equal(
    gradeMove(result(cp(50)), result(cp(50)), "e2e4", 1).label,
    "Forced",
  );
});

test("mate scores are classified separately, never converted into centipawns", () => {
  const winning = gradeMove(
    result(mate(2)),
    result(mate(4), "d2d4"),
    "d2d4",
    20,
  );
  assert.equal(winning.label, "Winning");
  assert.equal(winning.lossCp, null);
  assert.equal(
    gradeMove(result(mate(2)), result(cp(300), "d2d4"), "d2d4", 20).label,
    "Missed mate",
  );
  const blunder = gradeMove(
    result(cp(10)),
    result(mate(-1), "d2d4"),
    "d2d4",
    20,
  );
  assert.equal(blunder.label, "Blunder");
  assert.equal(blunder.lossCp, null);
  assert.equal(
    gradeMove(result(mate(-3)), result(mate(-1), "d2d4"), "d2d4", 20).label,
    "Losing position",
  );
});

test("terminal evaluations correctly report mate-zero and exact draws", () => {
  const game = new Chess();
  for (const move of ["f3", "e5", "g4", "Qh4#"]) game.move(move);
  assert.deepEqual(terminalEvaluation(game).white, {
    kind: "mate",
    value: 0,
    winner: "b",
  });
  assert.equal(
    terminalEvaluation(new Chess("7k/5K2/6Q1/8/8/8/8/8 b - - 0 1")).status,
    "Draw",
  );
  assert.equal(terminalEvaluation(new Chess()), null);
});

test("position commands preserve move history for repetition and castling", () => {
  const game = new Chess();
  for (const move of ["Nf3", "Nf6", "Ng1", "Ng8"]) game.move(move);
  assert.equal(
    positionCommand(positionSpec(game)),
    "position startpos moves g1f3 g8f6 f3g1 f6g8",
  );
  assert.equal(positionCommand(positionSpec(new Chess())), "position startpos");
  assert.equal(positionCommand({ fen: "test fen" }), "position fen test fen");
  assert.equal(moveUci({ from: "a7", to: "a8", promotion: "n" }), "a7a8n");
});

test("principal variations render legal SAN and stop at invalid stale moves", () => {
  const fen = new Chess().fen();
  assert.deepEqual(sanContinuation(fen, ["e2e4", "e7e5", "g1f3"]), [
    "e4",
    "e5",
    "Nf3",
  ]);
  assert.deepEqual(sanContinuation(fen, ["e2e4", "a1a8", "g1f3"]), ["e4"]);
});

test("allowing mate takes priority even when the mover missed its own mating line", () => {
  assert.equal(
    gradeMove(result(mate(2)), result(mate(-1), "d2d4"), "d2d4", 20).label,
    "Blunder",
  );
});

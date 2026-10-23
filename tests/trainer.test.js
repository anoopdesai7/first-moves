import { test } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { openings, getOpening } from "../src/openings.js";
import {
  checkAttempt,
  expectedMove,
  gameStatus,
  positionAt,
  safeReadProgress,
} from "../src/trainer.js";

test("curriculum has exactly 5 beginner and 5 intermediate openings, including both requested openings", () => {
  assert.equal(openings.length, 10);
  assert.equal(openings.filter((o) => o.level === "Beginner").length, 5);
  assert.equal(openings.filter((o) => o.level === "Intermediate").length, 5);
  assert.ok(openings.some((o) => o.id === "queens-gambit"));
  assert.ok(openings.some((o) => o.id === "london"));
  assert.equal(new Set(openings.map((o) => o.id)).size, 10);
  for (const level of ["Beginner", "Intermediate"]) {
    assert.ok(openings.some((o) => o.level === level && o.side === "w"));
    assert.ok(openings.some((o) => o.level === level && o.side === "b"));
  }
});

for (const opening of openings) {
  for (const line of opening.lines) {
    test(`${opening.name} / ${line.name}: all moves are legal and annotated`, () => {
      assert.equal(line.moves.length, line.notes.length);
      assert.ok(line.moves.length >= 12);
      assert.ok(
        line.notes.every(
          (note) => typeof note === "string" && note.length > 15,
        ),
      );
      const game = positionAt(line.moves);
      assert.equal(game.history().length, line.moves.length);
      assert.equal(game.isGameOver(), false);
      assert.equal(expectedMove(line.moves, line.moves.length), null);
      assert.equal(
        new Set(opening.lines.map((l) => l.id)).size,
        opening.lines.length,
      );
    });
    for (const side of ["w", "b"]) {
      test(`${opening.name} / ${line.name}: practice can complete as ${side === "w" ? "White" : "Black"}`, () => {
        const moves = line.moves;
        let cursor = 0,
          userMoves = 0,
          replies = 0;
        while (cursor < moves.length) {
          const position = positionAt(moves, cursor);
          const move = expectedMove(moves, cursor);
          if (position.turn() === side) {
            const before = position.fen();
            const result = checkAttempt(
              moves,
              cursor,
              move.from,
              move.to,
              move.promotion,
            );
            assert.equal(result.kind, "correct");
            assert.equal(result.move.san, moves[cursor]);
            assert.equal(
              position.fen(),
              before,
              "validation must not mutate the board",
            );
            userMoves++;
          } else replies++;
          cursor++;
        }
        assert.equal(cursor, moves.length);
        assert.ok(userMoves >= 6 && replies >= 6);
      });
    }
  }
}

test("legal alternatives are distinguished from illegal moves and do not change the lesson", () => {
  const moves = openings[0].lines[0].moves;
  const result = checkAttempt(moves, 0, "e2", "e4");
  assert.equal(result.kind, "different");
  assert.equal(result.move.san, "e4");
  assert.equal(result.expected.san, "d4");
  assert.equal(checkAttempt(moves, 0, "d2", "d5").kind, "illegal");
  assert.equal(checkAttempt(moves, 0, "e7", "e5").kind, "illegal");
  assert.equal(positionAt(moves, 0).fen(), new Chess().fen());
});

test("castling relocates both king and rook and takes king safety into account", () => {
  const game = positionAt("e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Nf6 O-O".split(" "));
  assert.equal(game.get("g1").type, "k");
  assert.equal(game.get("f1").type, "r");
  assert.equal(game.get("e1"), undefined);
  assert.equal(game.get("h1"), undefined);
  assert.throws(() => new Chess().move({ from: "e1", to: "g1" }));
});

test("sandbox rules support en passant and every promotion choice", () => {
  const game = positionAt("e4 a6 e5 d5 exd6".split(" "));
  assert.equal(game.get("d6").color, "w");
  assert.equal(game.get("d5"), undefined);
  assert.equal(game.history({ verbose: true }).at(-1).isEnPassant(), true);
  for (const promotion of ["q", "r", "b", "n"]) {
    const promotionGame = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    promotionGame.move({ from: "a7", to: "a8", promotion });
    assert.equal(promotionGame.get("a8").type, promotion);
  }
});

test("sandbox reports checkmate, stalemate, and check", () => {
  const mate = positionAt("f3 e5 g4 Qh4#".split(" "));
  assert.equal(gameStatus(mate), "Checkmate. Black wins.");
  const stale = new Chess("7k/5K2/6Q1/8/8/8/8/8 b - - 0 1");
  assert.equal(gameStatus(stale), "Draw by stalemate.");
  assert.match(gameStatus(positionAt("e4 d5 Bb5+".split(" "))), /Check/);
});

test("progress safely recovers from blocked, malformed, and invalid storage", () => {
  assert.deepEqual(
    safeReadProgress({
      getItem() {
        throw new Error("blocked");
      },
    }),
    {},
  );
  for (const value of [
    "bad json",
    "null",
    "[]",
    "3",
    '{"line":null}',
    '{"line":{"side":"q"}}',
  ]) {
    assert.deepEqual(safeReadProgress({ getItem: () => value }), {});
  }
  const valid = {
    "queens-gambit/declined/w": {
      completedAt: 123,
      side: "w",
      hints: 0,
      mistakes: 0,
    },
  };
  assert.deepEqual(
    safeReadProgress({ getItem: () => JSON.stringify(valid) }),
    valid,
  );
});

test("unknown links recover to the default opening", () => {
  assert.equal(getOpening("missing").id, openings[0].id);
});

test("every lesson exports PGN that round-trips to the correct final position", () => {
  for (const opening of openings)
    for (const line of opening.lines) {
      const game = positionAt(line.moves);
      game.header("Opening", opening.name, "Variation", line.name);
      const imported = new Chess();
      imported.loadPgn(game.pgn());
      assert.equal(imported.fen(), game.fen());
    }
});

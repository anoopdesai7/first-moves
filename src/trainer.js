import { Chess } from "chess.js";

export const pieceNames = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};
export const colorName = (color) => (color === "w" ? "White" : "Black");

export function positionAt(moves, cursor = moves.length) {
  const game = new Chess();
  for (const move of moves.slice(0, cursor)) game.move(move);
  return game;
}

export function expectedMove(moves, cursor) {
  if (cursor >= moves.length) return null;
  const game = positionAt(moves, cursor);
  return game.move(moves[cursor]);
}

// Guided practice checks the selected line, not engine strength.
export function checkAttempt(moves, cursor, from, to, promotion = "q") {
  const game = positionAt(moves, cursor);
  let move;
  try {
    move = game.move({ from, to, promotion });
  } catch {
    return { kind: "illegal" };
  }
  if (!move) return { kind: "illegal" };
  const expected = expectedMove(moves, cursor);
  return {
    kind: expected?.san === move.san ? "correct" : "different",
    move,
    expected,
  };
}

export function safeReadProgress(storage) {
  try {
    const value = JSON.parse(
      storage.getItem("first-moves-progress-v1") || "{}",
    );
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, record]) =>
          record &&
          typeof record === "object" &&
          Number.isFinite(record.completedAt) &&
          ["w", "b"].includes(record.side) &&
          Number.isInteger(record.hints) &&
          record.hints >= 0,
      ),
    );
  } catch {
    return {};
  }
}

export function gameStatus(game) {
  if (game.isCheckmate())
    return `Checkmate. ${colorName(game.turn() === "w" ? "b" : "w")} wins.`;
  if (game.isStalemate()) return "Draw by stalemate.";
  if (game.isThreefoldRepetition()) return "Draw by threefold repetition.";
  if (game.isInsufficientMaterial()) return "Draw by insufficient material.";
  if (game.isDraw()) return "Draw by the fifty-move rule.";
  return `${colorName(game.turn())} to move${game.isCheck() ? " · Check!" : ""}`;
}

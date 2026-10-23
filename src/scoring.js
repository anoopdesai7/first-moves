import { Chess } from "chess.js";

export const ENGINE_VERSION = "19";
export const ENGINE_DEPTH = 14;
export const ENGINE_MOVE_TIME = 700;
export const GRADING_THRESHOLDS = [
  { max: 20, label: "Excellent", tone: "good" },
  { max: 50, label: "Good", tone: "good" },
  { max: 100, label: "Inaccuracy", tone: "warning" },
  { max: 200, label: "Mistake", tone: "warning" },
  { max: Infinity, label: "Blunder", tone: "bad" },
];

export const moveUci = (move) =>
  `${move.from}${move.to}${move.promotion || ""}`;
export const otherSide = (side) => (side === "w" ? "b" : "w");

export function positionSpec(game) {
  return {
    fen: game.fen(),
    moves: game.history({ verbose: true }).map(moveUci),
  };
}

export function positionCommand(position) {
  return Array.isArray(position.moves)
    ? `position startpos${position.moves.length ? ` moves ${position.moves.join(" ")}` : ""}`
    : `position fen ${position.fen}`;
}

export function parseEngineInfo(line) {
  if (!line.startsWith("info ") || /\b(?:lowerbound|upperbound)\b/.test(line))
    return null;
  const depth = line.match(/\bdepth (\d+)/);
  const score = line.match(/\bscore (cp|mate) (-?\d+)/);
  const multipv = line.match(/\bmultipv (\d+)/);
  if (!depth || !score || (multipv && Number(multipv[1]) !== 1)) return null;
  const pv = line.match(/\bpv (.+)$/);
  return {
    depth: Number(depth[1]),
    score: { kind: score[1], value: Number(score[2]) },
    pv: pv
      ? pv[1]
          .trim()
          .split(/\s+/)
          .filter((move) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))
      : [],
  };
}

// UCI scores are for the side to move at the search root. All displayed scores
// are normalized to White, regardless of orientation or the user's color.
export function whiteScore(score, rootSide) {
  if (score.kind === "cp")
    return { kind: "cp", value: score.value * (rootSide === "w" ? 1 : -1) };
  return {
    kind: "mate",
    value: Math.abs(score.value),
    winner: score.value > 0 ? rootSide : otherSide(rootSide),
  };
}

export function terminalEvaluation(game) {
  if (!game.isGameOver()) return null;
  return {
    depth: null,
    bestmove: null,
    pv: [],
    terminal: true,
    score: game.isCheckmate()
      ? { kind: "mate", value: 0 }
      : { kind: "cp", value: 0 },
    white: game.isCheckmate()
      ? { kind: "mate", value: 0, winner: otherSide(game.turn()) }
      : { kind: "cp", value: 0 },
    status: game.isCheckmate() ? "Checkmate" : "Draw",
  };
}

export function formatEvaluation(score) {
  if (!score) return "—";
  if (score.kind === "mate")
    return score.value === 0
      ? score.winner === "w"
        ? "1–0"
        : "0–1"
      : `${score.winner === "b" ? "−" : ""}M${score.value}`;
  if (Math.abs(score.value) < 0.5) return "0.00";
  return `${score.value > 0 ? "+" : "−"}${(Math.abs(score.value) / 100).toFixed(2)}`;
}

export function describeEvaluation(score) {
  if (score.kind === "mate") {
    const side = score.winner === "w" ? "White" : "Black";
    return score.value === 0
      ? `${side} wins by checkmate`
      : `${side} has a mating line`;
  }
  if (Math.abs(score.value) <= 20) return "A balanced position";
  const side = score.value > 0 ? "White" : "Black";
  if (Math.abs(score.value) <= 80) return `${side} has a small edge`;
  return `${side} has the advantage`;
}

export function gradeMove(best, played, uci, legalCount) {
  const base = { lossCp: null, bestmove: best.bestmove };
  if (legalCount === 1)
    return {
      ...base,
      lossCp: 0,
      label: "Forced",
      tone: "good",
      explanation: "This was the only legal move.",
    };
  if (best.bestmove === uci)
    return {
      ...base,
      lossCp: 0,
      label: "Best",
      tone: "good",
      explanation:
        "This matches the engine’s preferred move at this search depth.",
    };
  if (played.score.kind === "mate" && played.score.value > 0)
    return {
      ...base,
      label: "Winning",
      tone: "good",
      explanation: "Your move keeps a forced mating line.",
    };
  if (played.score.kind === "mate" && played.score.value <= 0) {
    return best.score.kind === "mate" && best.score.value <= 0
      ? {
          ...base,
          label: "Losing position",
          tone: "warning",
          explanation:
            "The engine finds a mating line for the opponent even with its preferred move.",
        }
      : {
          ...base,
          label: "Blunder",
          tone: "bad",
          explanation:
            "This move allows a forced mating line for your opponent.",
        };
  }
  if (best.score.kind === "mate" && best.score.value > 0)
    return {
      ...base,
      label: "Missed mate",
      tone: "warning",
      explanation: "The engine found a mating line with a different move.",
    };
  // Scores from bounded searches can improve when a move is searched alone.
  // Clamp negative loss to zero instead of presenting it as a gain or accuracy.
  if (best.score.kind !== "cp")
    return {
      ...base,
      label: "Uncertain",
      tone: "neutral",
      explanation:
        "The two searches disagree about a mating line. Try a different position before drawing conclusions.",
    };
  const lossCp = Math.max(0, best.score.value - played.score.value);
  const quality = GRADING_THRESHOLDS.find((item) => lossCp <= item.max);
  return {
    ...base,
    ...quality,
    lossCp,
    explanation:
      lossCp === 0
        ? "This move preserves the evaluation found in the comparison search."
        : `About ${(lossCp / 100).toFixed(2)} in evaluation lost compared with the engine’s preferred move.`,
  };
}

export function sanContinuation(fen, pv, limit = 4) {
  const game = new Chess(fen),
    moves = [];
  for (const uci of pv.slice(0, limit)) {
    try {
      const move = game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      });
      if (!move) break;
      moves.push(move.san);
    } catch {
      break;
    }
  }
  return moves;
}

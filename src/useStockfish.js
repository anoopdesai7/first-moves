import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { StockfishClient } from "./stockfish.js";
import {
  gradeMove,
  moveUci,
  positionSpec,
  terminalEvaluation,
  whiteScore,
} from "./scoring.js";

function rootGame(position) {
  const game = Array.isArray(position.moves)
    ? new Chess()
    : new Chess(position.fen);
  if (Array.isArray(position.moves))
    for (const uci of position.moves)
      game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      });
  return game;
}

export async function analyzeTarget(
  client,
  game,
  review,
  signal,
  onReview = () => {},
) {
  let report = null,
    baseline = null,
    after = null,
    played = null;
  if (review) {
    const root = rootGame(review.position);
    const uci = moveUci(review.move);
    baseline = await client.analyze(review.position, { signal });
    after = rootGame(review.position);
    after.move({
      from: review.move.from,
      to: review.move.to,
      promotion: review.move.promotion,
    });
    const terminal = terminalEvaluation(after);
    if (terminal) {
      played = {
        ...terminal,
        bestmove: uci,
        pv: [uci],
        score:
          terminal.white.kind === "mate"
            ? { kind: "mate", value: 1 }
            : { kind: "cp", value: 0 },
      };
    } else
      played =
        baseline.bestmove === uci
          ? baseline
          : await client.analyze(review.position, { signal, searchMove: uci });
    if (signal.aborted)
      throw new DOMException("Analysis cancelled", "AbortError");
    report = {
      ...gradeMove(baseline, played, uci, root.moves().length),
      san: review.move.san,
      side: review.move.color,
      committed: review.committed !== false,
      before: whiteScore(baseline.score, root.turn()),
      after: whiteScore(played.score, root.turn()),
      bestSan: baseline.bestmove
        ? (() => {
            try {
              return root.move({
                from: baseline.bestmove.slice(0, 2),
                to: baseline.bestmove.slice(2, 4),
                promotion: baseline.bestmove[4],
              }).san;
            } catch {
              return null;
            }
          })()
        : null,
      depth:
        played.depth == null
          ? baseline.depth
          : Math.min(baseline.depth, played.depth),
    };
    onReview(report);
  }
  let position = terminalEvaluation(game);
  if (!position) {
    if (review && game.fen() === review.position.fen) {
      position = {
        ...baseline,
        white: whiteScore(baseline.score, game.turn()),
      };
    } else {
      const result = await client.analyze(positionSpec(game), { signal });
      position = { ...result, white: whiteScore(result.score, game.turn()) };
    }
  }
  return { position, review: report };
}

export default function useStockfish({ game, review, enabled, context }) {
  const clientRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({ status: "loading", key: null });
  const key = JSON.stringify([
    context,
    game.fen(),
    game.history(),
    review?.position.moves,
    review?.move.before,
    review?.move.san,
    review?.committed,
    retryCount,
  ]);

  useEffect(
    () => () => {
      clientRef.current?.dispose();
      clientRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    if (!enabled) {
      clientRef.current?.dispose();
      clientRef.current = null;
      return () => controller.abort();
    }
    const update = (value) => {
      if (!controller.signal.aborted) setState({ key, ...value });
    };
    update({ status: "loading" });
    async function run() {
      try {
        if (!clientRef.current || clientRef.current.disposed) {
          const url = new URL(
            `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
            document.baseURI,
          );
          clientRef.current = new StockfishClient(new Worker(url));
        }
        const client = clientRef.current;
        await client.ready;
        if (controller.signal.aborted) return;
        update({ status: "analyzing" });
        const result = await analyzeTarget(
          client,
          game,
          review,
          controller.signal,
          (report) => update({ status: "analyzing", review: report }),
        );
        update({ status: "ready", ...result });
      } catch (error) {
        if (error.name !== "AbortError")
          update({ status: "error", error: error.message });
      }
    }
    void run();
    return () => controller.abort();
    // The key captures the complete position/history and attempted move, avoiding
    // new searches when an unrelated control (selection, dialog, sound) changes.
  }, [key, enabled]);

  return {
    ...(enabled
      ? state.key === key
        ? state
        : { status: "loading" }
      : { status: "off" }),
    retry: () => setRetryCount((count) => count + 1),
  };
}

import React, { useEffect, useState } from "react";
import { Cpu, ChevronDown, CircleHelp, RefreshCw } from "lucide-react";
import {
  describeEvaluation,
  formatEvaluation,
  sanContinuation,
} from "../scoring.js";

export default function EnginePanel({
  analysis,
  enabled,
  onToggle,
  mode,
  fen,
  onHelp,
}) {
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  useEffect(() => setSuggestionVisible(false), [fen, mode]);
  const position = analysis.position;
  const report = analysis.review;
  const busy = ["loading", "analyzing"].includes(analysis.status);
  const continuation = position ? sanContinuation(fen, position.pv) : [];
  const fraction =
    position?.white.kind === "mate"
      ? position.white.winner === "w"
        ? 1
        : 0
      : position
        ? 1 / (1 + Math.exp(-position.white.value / 180))
        : 0.5;

  return (
    <section
      className="engine-panel"
      aria-label="Stockfish move scoring"
      aria-busy={busy}
    >
      <div className="engine-heading">
        <span className="engine-logo">
          <Cpu size={17} />
        </span>
        <div>
          <h3>
            Stockfish <span>19 · Lite</span>
          </h3>
          <p>See what each move changes.</p>
        </div>
        <button
          className="engine-help"
          onClick={onHelp}
          aria-label="How Stockfish scoring works"
        >
          <CircleHelp size={15} />
        </button>
        <button
          className={`engine-switch ${enabled ? "on" : ""}`}
          role="switch"
          aria-checked={enabled}
          aria-label="Enable Stockfish scoring"
          onClick={onToggle}
        >
          <span />
        </button>
      </div>
      {analysis.status === "off" ? (
        <p className="engine-off">
          Scoring is paused. Switch it on whenever you want a second opinion.
        </p>
      ) : (
        <>
          {busy && (
            <div className="engine-loading" role="status">
              <span className="engine-spinner" />
              {analysis.status === "loading"
                ? "Loading Stockfish…"
                : "Analyzing the position…"}
              <span>Your board is ready to play.</span>
            </div>
          )}
          {analysis.status === "error" && (
            <div className="engine-error" role="status">
              <p>{analysis.error}</p>
              <button onClick={analysis.retry}>
                <RefreshCw size={13} />
                Retry analysis
              </button>
              <small>
                The lessons and board still work without engine scoring.
              </small>
            </div>
          )}
          {position && (
            <div className="engine-position">
              <div className="engine-eval">
                <strong>{formatEvaluation(position.white)}</strong>
                <span>
                  {position.terminal
                    ? position.status
                    : describeEvaluation(position.white)}
                  <small>
                    Position on the board · White’s perspective
                    {position.depth ? ` · depth ${position.depth}` : ""}
                  </small>
                </span>
              </div>
              <div
                className="evaluation-meter"
                role="img"
                aria-label={`Position evaluation ${formatEvaluation(position.white)}, ${describeEvaluation(position.white)}`}
              >
                <span
                  style={{
                    width: `${Math.max(2, Math.min(98, fraction * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
          {report && (
            <div className={`move-review ${report.tone}`} role="status">
              <div className="review-title">
                <span className="move-quality">{report.label}</span>
                <strong>{report.san}</strong>
                <span className="review-side">
                  {report.side === "w" ? "White" : "Black"}
                  {!report.committed && " · attempted, not played"}
                </span>
              </div>
              <p>{report.explanation}</p>
              <div className="review-scores">
                <span>
                  Best choice <b>{formatEvaluation(report.before)}</b>
                </span>
                <span>
                  {report.committed ? "Move score" : "Attempt score"}{" "}
                  <b>{formatEvaluation(report.after)}</b>
                </span>
                {report.lossCp !== null && (
                  <span>
                    Loss <b>{report.lossCp} cp</b>
                  </span>
                )}
              </div>
              <small>
                Move comparison · depth {report.depth}
                {report.bestSan &&
                (mode !== "practice" ||
                  report.committed ||
                  suggestionVisible) &&
                report.label !== "Best" &&
                report.label !== "Forced"
                  ? ` · Engine preferred ${report.bestSan}`
                  : ""}
              </small>
            </div>
          )}
          {continuation.length > 0 && (
            <div className="engine-continuation">
              {mode === "practice" && !suggestionVisible ? (
                <button
                  className="reveal-engine"
                  onClick={() => setSuggestionVisible(true)}
                >
                  Show engine suggestion
                  <ChevronDown size={13} />
                </button>
              ) : (
                <>
                  <span>Engine continuation</span>
                  <strong>{continuation.join(" · ")}</strong>
                </>
              )}
            </div>
          )}
          {(position || report) && (
            <p className="engine-footnote">
              A quick engine estimate, not a verdict. Lesson moves can differ
              from the engine’s choice.
            </p>
          )}
        </>
      )}
    </section>
  );
}

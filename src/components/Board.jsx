import React, { useRef } from "react";
import Piece from "./Piece.jsx";
import { colorName, pieceNames } from "../trainer.js";

export default function Board({
  game,
  flipped,
  selected,
  onSelect,
  onMove,
  lastMove,
  hint,
  disabled,
}) {
  const boardRef = useRef(null);
  const files = (flipped ? "hgfedcba" : "abcdefgh").split("");
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const legal = selected ? game.moves({ square: selected, verbose: true }) : [];
  const squarePoint = (square) => ({
    x: files.indexOf(square[0]) * 100 + 50,
    y: ranks.indexOf(Number(square[1])) * 100 + 50,
  });
  const start = hint && squarePoint(hint.from);
  const end = hint && squarePoint(hint.to);
  function onKey(event, index) {
    const offsets = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 8, ArrowUp: -8 };
    if (event.key in offsets) {
      event.preventDefault();
      boardRef.current
        ?.querySelectorAll(".square")
        [Math.max(0, Math.min(63, index + offsets[event.key]))]?.focus();
    }
  }
  return (
    <div className="board-frame">
      <div
        className="board"
        role="group"
        aria-label={`Interactive chessboard, ${flipped ? "Black" : "White"} at bottom. Select a piece, then its destination. Arrow keys navigate squares.`}
        ref={boardRef}
      >
        {ranks.flatMap((rank, row) =>
          files.map((file, col) => {
            const square = `${file}${rank}`;
            const piece = game.get(square);
            const dark = ("abcdefgh".indexOf(file) + rank) % 2 === 0;
            const target = legal.some((move) => move.to === square);
            const isLast = lastMove?.from === square || lastMove?.to === square;
            const check =
              piece?.type === "k" &&
              piece.color === game.turn() &&
              game.isCheck();
            return (
              <button
                key={square}
                className={`square ${dark ? "dark" : "light"} ${selected === square ? "selected" : ""} ${isLast ? "last-move" : ""} ${check ? "in-check" : ""}`}
                aria-label={`${square}${piece ? `: ${colorName(piece.color)} ${pieceNames[piece.type]}` : ": empty"}${target ? ", legal destination" : ""}`}
                aria-pressed={selected === square}
                aria-disabled={disabled}
                onClick={() => !disabled && onSelect(square)}
                onKeyDown={(e) => onKey(e, row * 8 + col)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = e.dataTransfer.getData("text/plain");
                  if (!disabled && /^[a-h][1-8]$/.test(from))
                    onMove(from, square);
                }}
              >
                {col === 0 && <span className="rank-label">{rank}</span>}
                {row === 7 && <span className="file-label">{file}</span>}
                {piece && (
                  <span
                    className="piece-wrap"
                    draggable={!disabled && piece.color === game.turn()}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", square);
                      e.dataTransfer.effectAllowed = "move";
                      onSelect(square, true);
                    }}
                  >
                    <Piece type={piece.type} color={piece.color} />
                  </span>
                )}
                {target && (
                  <span className={`legal-dot ${piece ? "capture" : ""}`} />
                )}
              </button>
            );
          }),
        )}
        {hint && (
          <svg
            className="board-arrows"
            viewBox="0 0 800 800"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="hint-arrow"
                markerWidth="3"
                markerHeight="3"
                refX="2.2"
                refY="1.5"
                orient="auto"
              >
                <path d="M0 0 L3 1.5 L0 3Z" fill="#cf9536" />
              </marker>
            </defs>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x - Math.sign(end.x - start.x) * 16}
              y2={end.y - Math.sign(end.y - start.y) * 16}
              stroke="#cf9536"
              strokeWidth="17"
              strokeLinecap="round"
              opacity=".9"
              markerEnd="url(#hint-arrow)"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

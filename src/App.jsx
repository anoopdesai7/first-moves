import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Flag,
  GraduationCap,
  Layers3,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Board from "./components/Board.jsx";
import Piece from "./components/Piece.jsx";
import { openings, getOpening } from "./openings.js";
import {
  checkAttempt,
  colorName,
  expectedMove,
  gameStatus,
  pieceNames,
  positionAt,
  safeReadProgress,
} from "./trainer.js";

function locationSelection() {
  const [id, lineId] = window.location.hash.slice(1).split("/");
  const opening = getOpening(id);
  return {
    id: opening.id,
    lineId: opening.lines.some((l) => l.id === lineId)
      ? lineId
      : opening.lines[0].id,
  };
}
const initial = locationSelection();
const progressKey = "first-moves-progress-v1";
const totalLines = openings.reduce((sum, o) => sum + o.lines.length, 0);

function IconButton({ label, children, ...props }) {
  return (
    <button className="icon-button" title={label} aria-label={label} {...props}>
      {children}
    </button>
  );
}

function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-title">
        <h2>{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}

export default function App() {
  const [openingId, setOpeningId] = useState(initial.id);
  const [lineId, setLineId] = useState(initial.lineId);
  const opening = getOpening(openingId);
  const line = opening.lines.find((l) => l.id === lineId) || opening.lines[0];
  const [mode, setMode] = useState("learn");
  const [cursor, setCursor] = useState(window.location.hash ? 0 : 3);
  const [playerSide, setPlayerSide] = useState(opening.side);
  const [flipped, setFlipped] = useState(opening.side === "b");
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [freeMoves, setFreeMoves] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [level, setLevel] = useState("All");
  const [sideFilter, setSideFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [sound, setSound] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [storageWarning, setStorageWarning] = useState(false);
  const [progress, setProgress] = useState(() => {
    try {
      return safeReadProgress(window.localStorage);
    } catch {
      return {};
    }
  });
  const soundContext = useRef(null);
  const lastSoundPosition = useRef(null);
  const boardArea = useRef(null);

  const game = useMemo(
    () =>
      positionAt(
        mode === "explore" ? freeMoves : line.moves,
        mode === "explore" ? freeMoves.length : cursor,
      ),
    [mode, freeMoves, line, cursor],
  );
  const history = game.history({ verbose: true });
  const lastMove = history.at(-1);
  const nextMove = mode === "explore" ? null : expectedMove(line.moves, cursor);
  const finished = mode !== "explore" && cursor === line.moves.length;
  const thinking =
    mode === "practice" && !finished && game.turn() !== playerSide;
  const completedKeys = new Set(
    Object.keys(progress).map((key) => key.split("/").slice(0, 2).join("/")),
  );
  const completedCount = openings.reduce(
    (sum, o) =>
      sum + o.lines.filter((l) => completedKeys.has(`${o.id}/${l.id}`)).length,
    0,
  );
  const filtered = openings.filter(
    (o) =>
      (level === "All" || o.level === level) &&
      (sideFilter === "all" || o.side === sideFilter) &&
      `${o.name} ${o.tag}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  function clearInteraction() {
    setSelected(null);
    setHint(null);
    setFeedback(null);
    setPromotion(null);
  }
  function resetRun() {
    setHintsUsed(0);
    setMistakes(0);
  }

  function chooseOpening(id, targetLine) {
    const next = getOpening(id);
    setOpeningId(id);
    setLineId(targetLine || next.lines[0].id);
    setCursor(0);
    setMode("learn");
    setPlayerSide(next.side);
    setFlipped(next.side === "b");
    setAutoplay(false);
    clearInteraction();
    resetRun();
    setModal(null);
    window.history.replaceState(
      null,
      "",
      `#${id}/${targetLine || next.lines[0].id}`,
    );
  }

  useEffect(() => {
    const listener = () => {
      const requested = window.location.hash.slice(1).split("/")[0];
      if (requested && !openings.some((o) => o.id === requested)) return;
      const choice = locationSelection();
      chooseOpening(choice.id, choice.lineId);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);

  function changeLine(id) {
    setLineId(id);
    setCursor(0);
    setFreeMoves([]);
    setAutoplay(false);
    clearInteraction();
    resetRun();
    window.history.replaceState(null, "", `#${opening.id}/${id}`);
  }

  function switchMode(next) {
    if (next === mode) return;
    setAutoplay(false);
    clearInteraction();
    if (next === "explore") setFreeMoves(game.history());
    if (next === "practice") {
      setCursor(0);
      resetRun();
      setFlipped(playerSide === "b");
    }
    if (next === "learn" && mode === "explore")
      setCursor(Math.min(cursor, line.moves.length));
    setMode(next);
  }

  function restart() {
    setCursor(0);
    setFreeMoves([]);
    setAutoplay(false);
    clearInteraction();
    resetRun();
  }

  useEffect(() => {
    if (!thinking) return;
    const timer = setTimeout(() => {
      setCursor((c) => c + 1);
      setSelected(null);
      setHint(null);
    }, 650);
    return () => clearTimeout(timer);
  }, [thinking, cursor, openingId, lineId, playerSide]);

  useEffect(() => {
    if (!autoplay || mode !== "learn" || finished) {
      if (finished) setAutoplay(false);
      return;
    }
    const timer = setTimeout(() => {
      setCursor((c) => c + 1);
      clearInteraction();
    }, 1500);
    return () => clearTimeout(timer);
  }, [autoplay, mode, cursor, finished]);

  useEffect(() => {
    if (mode !== "practice" || !finished) return;
    const key = `${opening.id}/${line.id}/${playerSide}`;
    setProgress((previous) => {
      const next = {
        ...previous,
        [key]: {
          completedAt: Date.now(),
          side: playerSide,
          hints: hintsUsed,
          mistakes,
        },
      };
      try {
        window.localStorage.setItem(progressKey, JSON.stringify(next));
      } catch {
        setStorageWarning(true);
      }
      return next;
    });
  }, [mode, finished, opening.id, line.id, playerSide, hintsUsed, mistakes]);

  useEffect(() => {
    const fen = game.fen();
    if (
      sound &&
      lastSoundPosition.current &&
      lastSoundPosition.current !== fen
    ) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (Audio) {
          const ctx =
            soundContext.current || (soundContext.current = new Audio());
          void ctx.resume();
          const oscillator = ctx.createOscillator(),
            gain = ctx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(
            lastMove?.isCapture() ? 280 : 420,
            ctx.currentTime,
          );
          gain.gain.setValueAtTime(0.065, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.1);
        }
      } catch {
        /* Sound is optional; the trainer works without browser audio. */
      }
    }
    lastSoundPosition.current = fen;
  }, [game, sound]);

  const step = useCallback(
    (delta) => {
      if (mode !== "learn") return;
      setAutoplay(false);
      setCursor((c) => Math.max(0, Math.min(line.moves.length, c + delta)));
      setSelected(null);
      setHint(null);
      setFeedback(null);
    },
    [mode, line.moves.length],
  );

  useEffect(() => {
    const listener = (e) => {
      if (
        modal ||
        promotion ||
        /INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [step, modal, promotion]);

  function attemptMove(from, to, promote) {
    if (thinking || autoplay || (finished && mode !== "explore")) return;
    const legal = game
      .moves({ square: from, verbose: true })
      .filter((move) => move.to === to);
    if (!promote && legal.some((move) => move.promotion)) {
      setPromotion({ from, to });
      return;
    }
    if (mode === "explore") {
      const move = legal.find(
        (m) => !m.promotion || m.promotion === (promote || "q"),
      );
      if (!move) {
        setFeedback({
          type: "warning",
          text: "That move isn’t legal here. Select a highlighted destination.",
        });
        return;
      }
      setFreeMoves((moves) => [...moves, move.san]);
      clearInteraction();
      return;
    }
    const result = checkAttempt(line.moves, cursor, from, to, promote);
    if (result.kind === "correct") {
      setCursor((c) => c + 1);
      setSelected(null);
      setHint(null);
      setFeedback({
        type: "success",
        text: `${result.move.san} — exactly. ${line.notes[cursor]}`,
      });
    } else if (result.kind === "different") {
      setMistakes((m) => m + 1);
      setSelected(null);
      setFeedback({
        type: "warning",
        text: `${result.move.san} is legal. This lesson follows a different plan; try again or ask for a hint. A different move isn’t necessarily a bad move.`,
      });
    } else
      setFeedback({
        type: "warning",
        text: "That move isn’t legal here. Select one of the highlighted destinations.",
      });
  }

  function selectSquare(square, dragging = false) {
    if (thinking || autoplay || finished || game.isGameOver()) return;
    const piece = game.get(square);
    if (!dragging && selected === square) {
      setSelected(null);
      return;
    }
    if (piece?.color === game.turn()) {
      setSelected(square);
      setFeedback(null);
      return;
    }
    if (selected) attemptMove(selected, square);
  }

  function showHint() {
    if (!nextMove || thinking) return;
    if (!hint) setHintsUsed((n) => n + 1);
    setHint(nextMove);
    setSelected(nextMove.from);
    setFeedback({
      type: "hint",
      text: `Try ${nextMove.san}: move the ${pieceNames[nextMove.piece]} from ${nextMove.from} to ${nextMove.to}.`,
    });
  }

  function undo() {
    setAutoplay(false);
    clearInteraction();
    if (mode === "explore") setFreeMoves((moves) => moves.slice(0, -1));
    else if (mode === "practice")
      setCursor((c) =>
        Math.max(
          playerSide === "b" ? 1 : 0,
          c - (finished && game.turn() !== playerSide ? 1 : 2),
        ),
      );
    else step(-1);
  }

  function downloadPgn() {
    const exportGame = positionAt(mode === "explore" ? freeMoves : line.moves);
    exportGame.header(
      "Event",
      "First Moves — Opening Lab",
      "White",
      mode === "explore" ? "Exploration" : "White repertoire",
      "Black",
      "Black repertoire",
      "Opening",
      opening.name,
      "Variation",
      line.name,
      "Result",
      "*",
    );
    const blob = new Blob([exportGame.pgn()], {
      type: "application/x-chess-pgn",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${opening.id}-${mode === "explore" ? "exploration" : line.id}.pgn`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function playerBar(color) {
    const isTurn = game.turn() === color && !game.isGameOver() && !finished;
    return (
      <div className={`player-bar ${isTurn ? "current" : ""}`}>
        <span
          className={`player-avatar ${color === "b" ? "black-avatar" : ""}`}
        >
          <Piece type="k" color={color} />
        </span>
        <span className="player-name">
          {colorName(color)}
          <small>
            {mode === "practice"
              ? color === playerSide
                ? "You’re playing"
                : "Automatic replies"
              : color === opening.side
                ? "Featured repertoire"
                : "The other perspective"}
          </small>
        </span>
        {isTurn && (
          <span className="turn-pill">
            <i />
            {thinking ? "Thinking…" : "To move"}
          </span>
        )}
      </div>
    );
  }

  const displayMoves = mode === "explore" ? freeMoves : line.moves;
  const displayCursor = mode === "explore" ? freeMoves.length : cursor;
  const activeNote = cursor > 0 ? line.notes[cursor - 1] : opening.idea;
  const displayedNote =
    mode === "practice" && !finished
      ? thinking
        ? "Your opponent is following the selected line. Get ready for your next move."
        : line.notes[cursor]
      : activeNote;

  return (
    <>
      <a
        href="#trainer"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          boardArea.current?.focus();
          boardArea.current?.scrollIntoView();
        }}
      >
        Skip to chessboard
      </a>
      <header className="site-header">
        <a
          href="#"
          className="brand"
          aria-label="First Moves home"
          onClick={(e) => {
            e.preventDefault();
            chooseOpening("queens-gambit");
          }}
        >
          <span className="brand-mark">
            <Piece type="r" color="b" />
          </span>
          <span>
            first<span className="brand-light">moves</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a
            href="#opening-library"
            className="nav-active"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("opening-library")?.scrollIntoView();
            }}
          >
            <BookOpen size={16} />
            Opening lab
          </a>
          <button onClick={() => setModal("progress")}>
            <Trophy size={16} />
            My progress
          </button>
          <button onClick={() => setModal("guide")}>
            <CircleHelp size={16} />
            How it works
          </button>
        </nav>
        <button
          className="header-progress"
          onClick={() => setModal("progress")}
        >
          <span
            className="tiny-progress"
            style={{
              "--progress": `${(completedCount / totalLines) * 360}deg`,
            }}
          />
          <span>
            <b>{completedCount}</b> / {totalLines}
            <span className="header-progress-label"> lines practiced</span>
          </span>
        </button>
      </header>

      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> A LITTLE THEORY. A LOT OF PLAY.
            </div>
            <h1>
              Good games start here<span>.</span>
            </h1>
            <p>
              Learn the ideas behind the openings. Then make the moves your own.
            </p>
          </div>
          <div className="intro-note">
            <div className="intro-pieces">
              <Piece type="p" color="w" />
              <Piece type="p" color="b" />
            </div>
            <span>
              Two sides of the board.
              <br />
              <strong>Ten ways to begin.</strong>
            </span>
          </div>
        </section>

        <div className="workspace">
          <aside
            className="library"
            id="opening-library"
            aria-label="Opening library"
          >
            <div className="section-label">
              <Layers3 size={16} />
              <span>THE REPERTOIRE</span>
              <span className="count-label">10</span>
            </div>
            <div className="level-tabs" aria-label="Filter by level">
              {["All", "Beginner", "Intermediate"].map((l) => (
                <button
                  key={l}
                  aria-pressed={level === l}
                  className={level === l ? "active" : ""}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find an opening…"
                aria-label="Search openings"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={13} />
                </button>
              )}
            </label>
            <div className="side-filter">
              <span>Play as</span>
              <div>
                {[
                  ["all", "Either"],
                  ["w", "White"],
                  ["b", "Black"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    aria-pressed={sideFilter === value}
                    onClick={() => setSideFilter(value)}
                    className={sideFilter === value ? "active" : ""}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="opening-list">
              {["Beginner", "Intermediate"].map((group) => {
                const groupItems = filtered.filter((o) => o.level === group);
                return (
                  groupItems.length > 0 && (
                    <div className="opening-group" key={group}>
                      <h3>
                        {group}
                        <span>{groupItems.length}</span>
                      </h3>
                      {groupItems.map((o) => {
                        const count = o.lines.filter((l) =>
                          completedKeys.has(`${o.id}/${l.id}`),
                        ).length;
                        return (
                          <button
                            key={o.id}
                            className={`opening-item ${openingId === o.id ? "active" : ""}`}
                            aria-current={
                              openingId === o.id ? "true" : undefined
                            }
                            onClick={() => chooseOpening(o.id)}
                          >
                            <span className="opening-piece">
                              <Piece type={o.icon} color={o.side} />
                            </span>
                            <span className="opening-item-copy">
                              <strong>{o.short}</strong>
                              <small>
                                <span
                                  className={`side-dot ${o.side === "b" ? "black" : ""}`}
                                />
                                {colorName(o.side)}
                                <span className="meta-dot">·</span>2 lines
                              </small>
                            </span>
                            {count === 2 ? (
                              <Check size={15} className="completed-check" />
                            ) : (
                              <ChevronRight
                                size={15}
                                className="opening-chevron"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )
                );
              })}
              {filtered.length === 0 && (
                <div className="empty-state">
                  <Search size={24} />
                  <p>No openings found.</p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setLevel("All");
                      setSideFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            <div className="library-footnote">
              <span className="little-star">✦</span>
              <p>
                Learn a plan,
                <br />
                <strong>not just a move.</strong>
              </p>
              <ArrowUpRight size={22} />
            </div>
          </aside>

          <section
            className="trainer"
            id="trainer"
            aria-label={`${opening.name} trainer`}
            ref={boardArea}
            tabIndex={-1}
          >
            <div className="trainer-heading">
              <div>
                <div className="opening-meta">
                  <span
                    className={`level-badge ${opening.level === "Intermediate" ? "intermediate" : ""}`}
                  >
                    {opening.level}
                  </span>
                  <span>2 guided lines</span>
                </div>
                <h2>{opening.name}</h2>
              </div>
              <IconButton
                label="About this opening"
                onClick={() => setModal("opening")}
              >
                <CircleHelp size={20} />
              </IconButton>
            </div>
            <div
              className="trainer-mode"
              role="group"
              aria-label="Training mode"
            >
              {[
                ["learn", BookOpen, "Learn"],
                ["practice", GraduationCap, "Practice"],
                ["explore", Shuffle, "Explore"],
              ].map(([value, Icon, label]) => (
                <button
                  key={value}
                  className={mode === value ? "active" : ""}
                  aria-pressed={mode === value}
                  onClick={() => switchMode(value)}
                >
                  <Icon size={16} />
                  {label}
                  {value === "learn" && <span>step by step</span>}
                </button>
              ))}
            </div>
            <div className="board-section">
              {playerBar(flipped ? "w" : "b")}
              <Board
                game={game}
                flipped={flipped}
                selected={selected}
                onSelect={selectSquare}
                onMove={attemptMove}
                lastMove={lastMove}
                hint={hint}
                disabled={thinking || autoplay || finished || game.isGameOver()}
              />
              {playerBar(flipped ? "b" : "w")}
            </div>
            <div className="board-toolbar">
              <div className="board-transport">
                <IconButton
                  label="Restart from the beginning"
                  onClick={restart}
                >
                  <RotateCcw size={17} />
                </IconButton>
                <span className="toolbar-divider" />
                <IconButton
                  label={
                    mode === "learn"
                      ? "Previous move"
                      : "Take back your last move"
                  }
                  onClick={undo}
                  disabled={
                    thinking ||
                    displayCursor === 0 ||
                    (mode === "practice" && playerSide === "b" && cursor <= 1)
                  }
                >
                  <ChevronLeft size={22} />
                </IconButton>
                {mode === "practice" && (
                  <IconButton
                    label="Show the next move hint"
                    onClick={showHint}
                    disabled={thinking || finished}
                  >
                    <Lightbulb size={17} />
                  </IconButton>
                )}
                {mode === "learn" && (
                  <>
                    <IconButton
                      label={autoplay ? "Pause autoplay" : "Autoplay the line"}
                      onClick={() => {
                        clearInteraction();
                        setAutoplay(!autoplay);
                      }}
                      disabled={finished}
                    >
                      {autoplay ? <Pause size={17} /> : <Play size={17} />}
                    </IconButton>
                    <IconButton
                      label="Next move"
                      onClick={() => step(1)}
                      disabled={finished}
                    >
                      <ChevronRight size={22} />
                    </IconButton>
                  </>
                )}
              </div>
              <span className="move-counter">
                {mode === "explore" ? (
                  `${displayCursor} turns played`
                ) : (
                  <>
                    <b>{cursor}</b> / {line.moves.length} steps
                  </>
                )}
              </span>
              <div className="board-options">
                <IconButton
                  label="Flip board"
                  onClick={() => setFlipped((f) => !f)}
                >
                  <RotateCcw size={17} className="flip-icon" />
                </IconButton>
                <IconButton
                  label={sound ? "Mute move sounds" : "Enable move sounds"}
                  aria-pressed={sound}
                  onClick={() => setSound((s) => !s)}
                >
                  {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
                </IconButton>
              </div>
            </div>
            <div className="board-status" role="status" aria-live="polite">
              <span className={`status-dot ${game.isCheck() ? "check" : ""}`} />
              {finished
                ? mode === "practice"
                  ? "Line complete. Nicely played."
                  : "You’ve reached the end of this line."
                : feedback?.type === "warning"
                  ? "Try the lesson’s plan, or use a hint."
                  : gameStatus(game)}
              <span className="status-instruction">
                {!finished &&
                  !thinking &&
                  !game.isGameOver() &&
                  "Click or drag a piece to play."}
              </span>
            </div>
          </section>

          <aside className="lesson-panel" aria-label="Opening lesson">
            <div className="lesson-kicker">
              <span className="line-icon">
                <BookOpen size={18} />
              </span>
              <span>INSIDE THE OPENING</span>
              <span className="lesson-number">
                {String(
                  openings.findIndex((o) => o.id === opening.id) + 1,
                ).padStart(2, "0")}{" "}
                / 10
              </span>
            </div>
            <h3>
              {opening.tag}
              <span>.</span>
            </h3>
            <p className="lesson-description">{opening.description}</p>
            <div className="line-select-wrap">
              <label htmlFor="line-select">YOUR LINE</label>
              <div className="select-wrap">
                <select
                  id="line-select"
                  value={line.id}
                  onChange={(e) => changeLine(e.target.value)}
                >
                  {opening.lines.map((l, i) => (
                    <option key={l.id} value={l.id}>
                      {i + 1}. {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            <div className="perspective-picker">
              <span>Practice as</span>
              <div>
                {["w", "b"].map((s) => (
                  <button
                    key={s}
                    aria-pressed={playerSide === s}
                    className={playerSide === s ? "active" : ""}
                    onClick={() => {
                      setPlayerSide(s);
                      setFlipped(s === "b");
                      clearInteraction();
                      if (mode === "practice") {
                        setCursor(0);
                        resetRun();
                      }
                    }}
                  >
                    <span className={`side-dot ${s === "b" ? "black" : ""}`} />
                    {colorName(s)}
                  </button>
                ))}
              </div>
            </div>

            {finished ? (
              <div className="completion-card">
                <span className="completion-icon">
                  {mode === "practice" ? (
                    <Trophy size={27} />
                  ) : (
                    <Flag size={25} />
                  )}
                </span>
                <div className="eyebrow">
                  {mode === "practice" ? "LINE PRACTICED" : "THE IDEA IS YOURS"}
                </div>
                <h4>
                  {mode === "practice"
                    ? "A good start, well played."
                    : "Now make it stick."}
                </h4>
                <p>
                  {mode === "practice"
                    ? `${hintsUsed} ${hintsUsed === 1 ? "hint" : "hints"} · ${mistakes} ${mistakes === 1 ? "retry" : "retries"}. Try the other side, or explore the next line.`
                    : "Play your side from memory. We’ll take care of the replies."}
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (mode === "practice") restart();
                    else switchMode("practice");
                  }}
                >
                  {mode === "practice"
                    ? "Practice again"
                    : "Practice this line"}
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`explanation-card ${mode === "practice" ? "practice-card" : ""}`}
              >
                <div className="explanation-label">
                  <Lightbulb size={15} />
                  <span>
                    {mode === "explore"
                      ? "YOUR CHESS SANDBOX"
                      : mode === "practice"
                        ? thinking
                          ? "OPPONENT’S TURN"
                          : "PUT THE IDEA INTO PLAY"
                        : cursor === 0
                          ? "THE BIG IDEA"
                          : `MOVE ${Math.ceil(cursor / 2)}${cursor % 2 === 0 ? " · BLACK" : " · WHITE"}`}
                  </span>
                  {mode !== "explore" && cursor > 0 && mode === "learn" && (
                    <b>{line.moves[cursor - 1]}</b>
                  )}
                </div>
                <h4>
                  {mode === "explore"
                    ? "Follow your curiosity."
                    : mode === "practice"
                      ? thinking
                        ? "The reply is coming…"
                        : "Your move."
                      : cursor === 0
                        ? "Start with a plan."
                        : "The idea behind the move"}
                </h4>
                <p>
                  {mode === "explore"
                    ? "Play any legal move for either side. There’s no automatic opponent here; you control both colors. Try a different plan and see what changes."
                    : displayedNote}
                </p>
                {mode === "learn" && (
                  <button className="text-button" onClick={() => step(1)}>
                    Next move
                    <ArrowRight size={15} />
                  </button>
                )}
                {mode === "practice" && (
                  <button
                    className="text-button"
                    onClick={showHint}
                    disabled={thinking}
                  >
                    <Lightbulb size={15} />
                    Give me a hint
                  </button>
                )}
              </div>
            )}
            {feedback && (
              <div className={`feedback ${feedback.type}`} role="status">
                {feedback.type === "success" ? (
                  <Check size={16} />
                ) : (
                  <Lightbulb size={16} />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="notation-heading">
              <span>
                {mode === "explore" ? "YOUR EXPLORATION" : "THE MOVE MAP"}
              </span>
              <button
                onClick={downloadPgn}
                title={
                  mode === "explore"
                    ? "Download your exploration as PGN"
                    : "Download complete lesson line as PGN"
                }
                aria-label="Download PGN"
              >
                <ArrowDownToLine size={15} />
                <span>PGN</span>
              </button>
            </div>
            <div className="move-map" aria-label="Move list">
              {Array.from(
                { length: Math.ceil(displayMoves.length / 2) },
                (_, i) => (
                  <div className="move-row" key={i}>
                    <span className="move-number">{i + 1}.</span>
                    {[i * 2, i * 2 + 1].map((index) => {
                      if (!displayMoves[index]) return <span key={index} />;
                      const masked = mode === "practice" && index >= cursor;
                      return (
                        <button
                          key={index}
                          className={`${displayCursor === index + 1 ? "current-move" : ""} ${index < displayCursor ? "played" : ""}`}
                          disabled={mode !== "learn"}
                          aria-label={
                            masked
                              ? `Move ${i + 1}, ${index % 2 ? "Black" : "White"}, hidden`
                              : `Go to ${i + 1}${index % 2 ? "..." : "."} ${displayMoves[index]}`
                          }
                          aria-current={
                            displayCursor === index + 1 ? "step" : undefined
                          }
                          onClick={() => {
                            setCursor(index + 1);
                            setAutoplay(false);
                            clearInteraction();
                          }}
                        >
                          {masked ? "•••" : displayMoves[index]}
                          {displayCursor === index + 1 && (
                            <span className="notation-active-dot" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ),
              )}
              {mode === "explore" && displayMoves.length === 0 && (
                <p className="notation-empty">Your moves will appear here.</p>
              )}
            </div>
            <div className="line-progress">
              <span
                style={{
                  width: `${Math.min(100, (displayCursor / line.moves.length) * 100)}%`,
                }}
              />
            </div>
            <div className="lesson-action">
              {mode === "learn" ? (
                <button
                  className="primary-button"
                  onClick={() => switchMode("practice")}
                >
                  <GraduationCap size={18} />
                  Practice this opening
                  <ArrowRight size={17} />
                </button>
              ) : mode === "practice" ? (
                <button
                  className="secondary-button"
                  onClick={() => switchMode("learn")}
                >
                  <BookOpen size={16} />
                  Back to the lesson
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() => switchMode("learn")}
                >
                  <BookOpen size={16} />
                  Return to the guided line
                </button>
              )}
              <p>
                {mode === "learn"
                  ? "You make the moves. We play the replies."
                  : mode === "practice"
                    ? "Only completed practice lines count toward progress."
                    : "Explore freely. Use the back arrow to take a move back."}
              </p>
            </div>
          </aside>
        </div>

        <section className="principles" aria-label="Opening principles">
          <div className="principles-heading">
            <span className="eyebrow">BEFORE YOU MEMORIZE</span>
            <h2>Three ideas. Every opening.</h2>
          </div>
          <div>
            <span className="principle-number">01</span>
            <span>
              <h3>Claim the center</h3>
              <p>Give your pieces room to work.</p>
            </span>
          </div>
          <div>
            <span className="principle-number">02</span>
            <span>
              <h3>Bring your pieces out</h3>
              <p>Every move should have a purpose.</p>
            </span>
          </div>
          <div>
            <span className="principle-number">03</span>
            <span>
              <h3>Keep your king safe</h3>
              <p>Build a home before an attack.</p>
            </span>
          </div>
        </section>
        <footer>
          <span>
            firstmoves<span className="brand-period">.</span>
            <small>Made for the love of the game.</small>
          </span>
          <div>
            <button onClick={() => setModal("sources")}>
              About & sources
              <ArrowUpRight size={13} />
            </button>
            <span className="footer-version">
              V1.0 · 10 openings · 20 lines
            </span>
          </div>
        </footer>
      </main>
      {storageWarning && (
        <div className="storage-warning" role="status">
          Progress is saved for this visit, but this browser couldn’t store it
          for later.
          <button
            onClick={() => setStorageWarning(false)}
            aria-label="Dismiss storage notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {modal === "guide" && (
        <Modal
          title="A few moves to get you started"
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            Pick an opening. Understand its plan. Put it into practice.
          </p>
          <div className="guide-steps">
            <div>
              <span>01</span>
              <div>
                <h3>Learn the idea</h3>
                <p>
                  Use the arrows, click a move in the move map, or press play to
                  watch the line. You can also play the expected move on the
                  board.
                </p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Play your side</h3>
                <p>
                  Choose White or Black, then Practice. Click a piece and its
                  destination, or drag it. We play the other side. Need a nudge?
                  Use a hint.
                </p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <h3>Try another possibility</h3>
                <p>
                  Explore starts from your current position. Play both sides
                  freely, including castling, en passant, and promotion. It’s a
                  sandbox, so there is no computer opponent.
                </p>
              </div>
            </div>
          </div>
          <div className="modal-callout">
            <Lightbulb size={20} />
            <p>
              These are teaching lines, not forced sequences. Real opponents can
              choose other moves. The goal is to understand the plans.
            </p>
          </div>
          <div className="keyboard-note">
            <span>Keyboard</span>
            <p>
              Tab to a board square, use arrow keys to navigate, and Enter or
              Space to select. Outside controls, ← and → step through Learn
              mode.
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal(null)}>
            Let’s play
            <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {modal === "opening" && (
        <Modal title={opening.name} onClose={() => setModal(null)}>
          <div className="modal-signature">{opening.signature}</div>
          <p className="modal-intro">{opening.idea}</p>
          <div className="plan-card">
            <span className="side-dot" />
            <div>
              <h3>White’s plan</h3>
              <p>{opening.whitePlan}</p>
            </div>
          </div>
          <div className="plan-card">
            <span className="side-dot black" />
            <div>
              <h3>Black’s plan</h3>
              <p>{opening.blackPlan}</p>
            </div>
          </div>
          <div className="modal-callout">
            <Lightbulb size={20} />
            <p>{opening.watchout}</p>
          </div>
          <p className="source-link">
            Explore further on{" "}
            <a href={opening.source} target="_blank" rel="noreferrer">
              Chess.com <ExternalLink size={12} />
            </a>
          </p>
        </Modal>
      )}
      {modal === "progress" && (
        <Modal
          title="Your repertoire, taking shape"
          onClose={() => setModal(null)}
          className="progress-modal"
        >
          <div className="progress-summary">
            <Trophy size={34} />
            <div>
              <strong>
                {completedCount}
                <span> / {totalLines}</span>
              </strong>
              <p>lines practiced · saved on this browser</p>
            </div>
          </div>
          <p className="modal-intro">
            Finish a line in Practice to add it here. Try both colors to see the
            whole picture.
          </p>
          <div className="progress-list">
            {openings.map((o) => (
              <div key={o.id}>
                <h3>
                  {o.name}
                  <small>{o.level}</small>
                </h3>
                {o.lines.map((l) => (
                  <button key={l.id} onClick={() => chooseOpening(o.id, l.id)}>
                    <span>{l.name}</span>
                    <span className="side-completions">
                      {["w", "b"].map((s) => (
                        <span
                          key={s}
                          className={
                            progress[`${o.id}/${l.id}/${s}`] ? "done" : ""
                          }
                          title={`${colorName(s)} ${progress[`${o.id}/${l.id}/${s}`] ? "practiced" : "not practiced yet"}`}
                        >
                          {progress[`${o.id}/${l.id}/${s}`] ? (
                            <Check size={11} />
                          ) : null}
                          {colorName(s)}
                        </span>
                      ))}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            ))}
          </div>
          {completedCount > 0 && (
            <button
              className="reset-progress-button"
              onClick={() => setModal("reset-progress")}
            >
              Reset saved progress
            </button>
          )}
        </Modal>
      )}
      {modal === "reset-progress" && (
        <Modal
          title="Start your progress afresh?"
          onClose={() => setModal("progress")}
        >
          <p className="modal-intro">
            This clears the practice records saved in this browser. Your opening
            lessons will still be here.
          </p>
          <div className="reset-progress-actions">
            <button
              className="secondary-button"
              onClick={() => setModal("progress")}
            >
              Keep my progress
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setProgress({});
                try {
                  window.localStorage.removeItem(progressKey);
                } catch {
                  setStorageWarning(true);
                }
                setModal("progress");
              }}
            >
              Reset progress
            </button>
          </div>
        </Modal>
      )}
      {modal === "sources" && (
        <Modal
          title="A little more about First Moves"
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            Ten classic openings. Twenty short teaching lines. A place to
            understand the first phase of a chess game, one move at a time.
          </p>
          <p>
            Beginner and intermediate labels describe the depth of these
            lessons, not a rating requirement. Each opening can be studied from
            either side.
          </p>
          <h3 className="sources-heading">Opening references</h3>
          <p>
            Teaching notes are written for this trainer. Opening families and
            core ideas were checked against these Chess.com references; the
            chess.js rules library validates the moves.
          </p>
          <div className="sources-grid">
            {openings.map((o) => (
              <a key={o.id} href={o.source} target="_blank" rel="noreferrer">
                {o.name}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </div>
          <div className="modal-callout">
            <BookOpen size={20} />
            <p>
              Free to use. No account, engine service, or API key required.
              Practice progress stays in this browser and does not sync between
              devices.
            </p>
          </div>
          <p className="source-link">
            <a
              href="https://github.com/jhlywa/chess.js"
              target="_blank"
              rel="noreferrer"
            >
              chess.js <ExternalLink size={12} />
            </a>{" "}
            ·{" "}
            <a
              href="https://lucide.dev/license"
              target="_blank"
              rel="noreferrer"
            >
              Lucide icons <ExternalLink size={12} />
            </a>
          </p>
        </Modal>
      )}
      {promotion && (
        <Modal title="Choose your promotion" onClose={() => setPromotion(null)}>
          <p className="modal-intro">
            Your pawn reached the final rank. Choose its new piece.
          </p>
          <div className="promotion-choices">
            {["q", "r", "b", "n"].map((type) => (
              <button
                key={type}
                aria-label={`Promote to ${pieceNames[type]}`}
                onClick={() => {
                  const { from, to } = promotion;
                  setPromotion(null);
                  attemptMove(from, to, type);
                }}
              >
                <Piece type={type} color={game.turn()} />
                <span>{pieceNames[type]}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

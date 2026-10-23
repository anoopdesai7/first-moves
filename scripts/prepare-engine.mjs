import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pkg = path.join(root, "node_modules/stockfish");
const out = path.join(root, "public/engine");
const metadata = JSON.parse(
  await readFile(path.join(pkg, "package.json"), "utf8"),
);
if (metadata.version !== "19.0.1")
  throw new Error(
    "Review Stockfish assets and matching source before changing engine version.",
  );
const assets = [
  [
    "bin/stockfish-19-lite-single.js",
    "ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a",
  ],
  [
    "bin/stockfish-19-lite-single.wasm",
    "ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de",
  ],
];
await mkdir(out, { recursive: true });
for (const [name, expected] of assets) {
  const source = path.join(pkg, name),
    data = await readFile(source);
  if (createHash("sha256").update(data).digest("hex") !== expected)
    throw new Error(`Unexpected Stockfish asset: ${name}`);
  await copyFile(source, path.join(out, path.basename(name)));
}
const archive = path.join(root, "vendor/stockfish-19.0.1-source.tar.gz");
if (
  createHash("sha256")
    .update(await readFile(archive))
    .digest("hex") !==
  "a18aa8a871f5265014b110b3e07804ff3637899d2e189be6ded2b99e2c17a10e"
)
  throw new Error("Stockfish source archive checksum mismatch.");
await copyFile(archive, path.join(out, "stockfish-19.0.1-source.tar.gz"));
const net = path.join(root, "vendor/nn-61e7af4bb97d.nnue");
if (
  createHash("sha256")
    .update(await readFile(net))
    .digest("hex") !==
  "61e7af4bb97d51eeeb25d322916f86513b5cd3a827ce189c98c6e31946f99e5b"
)
  throw new Error("Stockfish neural network checksum mismatch.");
await copyFile(net, path.join(out, "nn-61e7af4bb97d.nnue"));
await copyFile(path.join(pkg, "Copying.txt"), path.join(out, "COPYING.txt"));
await writeFile(
  path.join(out, "README.txt"),
  `FIRST MOVES — STOCKFISH ENGINE\n\nUnmodified Stockfish.js 19 Lite, single-threaded, from npm stockfish@19.0.1.\nRuns as a separate Web Worker communicating through the standard UCI protocol.\nEngine copyright: Stockfish contributors, Chess.com LLC, Nathan Rugg.\nNeural network: Chris Bao (sscg13), nn-61e7af4bb97d.nnue.\nLicense: GNU GPL version 3; see COPYING.txt beside this file.\n\nMatching engine source and build scripts (v19.0.1):\n  stockfish-19.0.1-source.tar.gz (beside this file)\nMatching lite neural network, also provided beside this file:\n  nn-61e7af4bb97d.nnue\nBuild instructions: extract source, place the net in src/, follow README.md,\ninstall the documented Emscripten toolchain, then run:\n  node build.js --single-threaded --lite -f\n\nUpstream source: https://github.com/nmrugg/stockfish.js/tree/v19.0.1\nUpstream release: https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1\nEngine protocol and scoring: https://official-stockfish.github.io/docs/\nThe app's move-quality thresholds are teaching heuristics, not official\nStockfish accuracy ratings. First Moves does not modify the engine.\n`,
);
console.log("Prepared Stockfish 19 Lite, license, source, and neural network.");

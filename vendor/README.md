# Matching Stockfish source and neural network

These are unmodified upstream resources distributed alongside the Stockfish.js 19 Lite browser engine under GPLv3. `scripts/prepare-engine.mjs` copies them into the published `engine/` directory, together with the upstream license and rebuild directions.

- `stockfish-19.0.1-source.tar.gz`: source, build scripts, and documentation from <https://codeload.github.com/nmrugg/stockfish.js/tar.gz/refs/tags/v19.0.1>. SHA-256: `a18aa8a871f5265014b110b3e07804ff3637899d2e189be6ded2b99e2c17a10e`.
- `nn-61e7af4bb97d.nnue`: Chris Bao’s matching lite network from <https://tests.stockfishchess.org/api/nn/nn-61e7af4bb97d.nnue>. SHA-256: `61e7af4bb97d51eeeb25d322916f86513b5cd3a827ce189c98c6e31946f99e5b`.

Browser binary provenance: npm `stockfish@19.0.1` and the corresponding [upstream release](https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1). Engine files are copied unchanged, with their license header intact. The source and network are not imported into the application JavaScript; they are available as explicit downloads in the engine’s source information.

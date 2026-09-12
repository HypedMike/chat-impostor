# Chat Impostor

![](https://images.pexels.com/photos/7360389/pexels-photo-7360389.jpeg)

**Play it here: [hypedmike.github.io/chat-impostor](https://hypedmike.github.io/chat-impostor/)**

Chat-alayzer is a party game in the "impostor" family (à la Spyfall/Undercover). Instead of using a fixed word list, it mines the secret word from a WhatsApp chat export you provide: it counts word frequencies across the chat and picks the game's secret word (and, separately, the impostors' word) weighted by how often each word was actually used in that conversation.

The game runs entirely in the browser. There is no backend server — the chat export never leaves the device. The text analysis (parsing, word counting, stopword filtering, weighted picking) is implemented in Rust and compiled to WebAssembly, which the React frontend loads and calls directly.

## How the game works

1. Import a WhatsApp chat export (`.txt`).
2. Add player names (2+).
3. Configure how many impostors there are, and whether impostors are told they're impostors.
4. Start the game. The app analyzes the chat, picks a "civilian" word and a (usually different) "impostor" word.
5. Pass the device around: each player taps to reveal their word. Impostors either see a different word or a "you are the impostor" message, depending on config.
6. Once everyone has seen their word, play out the round off-app; "Play again" resets state (players are kept, roles/words are cleared).

## Repository layout

```
.
├── app/               React + TypeScript + Vite frontend (see app/README.md)
│   └── src/wasm/      Generated wasm-bindgen output — build artifact, not hand-written
└── rust-analyzer/     Rust crate compiled to WASM: the text-analysis engine (see rust-analyzer/README.md)
```

The two halves are wired together by a build step: `rust-analyzer` compiles to a `.wasm` binary plus JS/TS glue, which `build-wasm.sh` copies into `app/src/wasm/`. The frontend imports that generated module like any other TS module — there's no network call or IPC involved.

## Working on this project

Day to day you'll usually only touch `app/` (UI, game logic, state). You only need to touch `rust-analyzer/` when changing how chat text is parsed/scored, and you must rebuild the wasm bundle afterwards:

```bash
# 1. Rebuild the wasm engine after changing rust-analyzer/src/lib.rs
cd rust-analyzer
./build-wasm.sh            # requires: rustup target add wasm32-unknown-unknown, and wasm-bindgen-cli installed

# 2. Run the frontend
cd ../app
pnpm install
pnpm dev
```

Requirements: Rust toolchain with the `wasm32-unknown-unknown` target, `wasm-bindgen-cli` (version matching the `wasm-bindgen` crate in `rust-analyzer/Cargo.toml`), Node.js, and `pnpm`.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand for state.
- Engine: Rust, compiled to WebAssembly via `wasm-bindgen`.
- No database, no server, no external API calls — everything is local to the browser session.

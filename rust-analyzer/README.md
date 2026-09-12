# Chat-alayzer — Engine (Rust → WASM)

This crate is the game's "server-side" logic — except it doesn't run on a server. It's a small Rust library compiled to WebAssembly and loaded directly by the frontend ([app/README.md](../app/README.md)), so all chat parsing and word analysis happens locally in the player's browser; the chat export is never sent anywhere.

## What it does

Given the raw text of a WhatsApp chat export, it:

1. **Parses messages** out of export lines. Each line is expected in WhatsApp's `<date/time> - <sender>: <message>` format (or `<date/time> - <system message>` for join/leave/group-created lines, which have no `: `). Only the message portion is kept.
2. **Counts word frequency** across all messages, lowercased, with leading/trailing non-alphanumeric characters stripped from each word (so punctuation attached to a word doesn't create a separate entry).
3. **Filters and ranks** the resulting map: drops words of length ≤ 3 and drops Italian stopwords (embedded from `assets/it.json`), then sorts descending by count.
4. **Picks a word** from that ranked list, weighted by frequency — a word used 10 times is 10x more likely to be picked than a word used once — using a caller-supplied random unit `[0, 1)`.

The stopword list and the length cutoff mean the engine is currently tuned for **Italian-language** chat exports; analyzing other languages will still run but won't filter filler words correctly.

## Public API (`wasm_bindgen` exports)

```rust
pub fn import_chat(content: &str);
pub fn pick_word() -> Option<String>;
```

- `import_chat(content)` — parses `content` and stores the ranked word-frequency table in thread-local state (`ENTRIES`), replacing whatever was stored before. Must be called before `pick_word`.
- `pick_word()` — draws one word from the currently stored table, weighted by frequency (using `js_sys::Math::random()` for the random draw). Returns `None` if nothing has been imported or the imported chat had no qualifying words. Calling it repeatedly re-rolls independently each time — it does not remove the picked word from the pool, so the frontend (`game_store.ts`) is responsible for retrying if it needs two *different* words.

There is no other state or configuration; each `import_chat` call fully replaces the previous table (single "current chat" at a time).

## Building

```bash
./build-wasm.sh
```

This compiles the crate for `wasm32-unknown-unknown` in release mode, then runs `wasm-bindgen --target web` to generate the JS/TS glue, writing everything directly into `../app/src/wasm/`:

- `chat_alayzer.js` / `chat_alayzer.d.ts` — the JS module and its types the frontend imports (`import init, { import_chat, pick_word } from "../../wasm/chat_alayzer"`)
- `chat_alayzer_bg.wasm` / `chat_alayzer_bg.wasm.d.ts` — the compiled binary and its types

These generated files are build output, not source — re-run `build-wasm.sh` after any change to `src/lib.rs` or `assets/it.json`, and don't hand-edit files under `app/src/wasm/`.

Requirements: Rust with the `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`) and `wasm-bindgen-cli` installed at a version matching the `wasm-bindgen` crate version pinned in `Cargo.toml`.

## Testing

```bash
cargo test
```

Runs the native (non-wasm) unit tests in `src/lib.rs` against the internal, non-`wasm_bindgen` functions (`parse_messages`, `generate_words_map`, `order_and_clean_map`, `pick_by_probability`). They cover: message extraction from mixed system/sender lines, case-insensitive counting, stopword/short-word filtering, and that weighted picking actually respects the random roll (including the empty-input case).

## Changing the stopword list or language

Stopwords are embedded at compile time from `assets/it.json` (a flat JSON array of lowercase words) via `include_str!`, so editing that file requires a rebuild (`cargo build`/`./build-wasm.sh`), not just a restart. To support another language, swap in a different word list and adjust the `include_str!` path in `stopwords()`.

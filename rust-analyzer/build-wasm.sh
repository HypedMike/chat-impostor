#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

cargo build --target wasm32-unknown-unknown --release

wasm-bindgen \
  --target web \
  --out-dir ../app/src/wasm \
  --out-name chat_alayzer \
  target/wasm32-unknown-unknown/release/chat_alayzer.wasm

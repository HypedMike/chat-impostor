import init, { import_chat, pick_word } from "../../wasm/chat_alayzer";

let ready: Promise<unknown> | null = null;

function ensureReady() {
  if (!ready) ready = init();
  return ready;
}

export async function importChatExport(content: string): Promise<void> {
  await ensureReady();
  import_chat(content);
}

export async function pickWord(): Promise<string | undefined> {
  await ensureReady();
  return pick_word();
}

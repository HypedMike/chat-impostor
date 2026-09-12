import { unzipSync } from "fflate";
import { useState, type ChangeEvent } from "react";

interface IImportChatProps {
  imported: boolean;
  importChatExport: (content: string) => Promise<void>;
}

async function readChatFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".zip")) {
    return file.text();
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(buffer);
  const txtName = Object.keys(entries).find((name) =>
    name.toLowerCase().endsWith(".txt"),
  );
  if (!txtName) {
    throw new Error("No .txt file found in the zip archive");
  }

  return new TextDecoder().decode(entries[txtName]);
}

export function ImportChat(props: IImportChatProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readChatFile(file);
      setError(null);
      await props.importChatExport(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
    }
  }

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-slate-400">
        Import a chat export
      </label>
      <input
        type="file"
        accept=".txt,.zip"
        onChange={handleFileChange}
        className="w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-indigo-500"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && props.imported && (
        <p className="mt-1 text-xs text-emerald-400">Chat imported</p>
      )}
    </div>
  );
}

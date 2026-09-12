import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { Player } from "../models/player";

interface IAddPlayersProps {
  addPlayer: (player: Player) => void;
}

export function AddPlayers(props: IAddPlayersProps) {
  const [name, setName] = useState("");

  function handleOnChange(input: ChangeEvent<HTMLInputElement>) {
    setName(input.target.value);
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    props.addPlayer({ id: crypto.randomUUID(), name: trimmed });
    setName("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAdd();
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
        placeholder="Player name"
        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
      />
      <button
        onClick={handleAdd}
        disabled={!name.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add
      </button>
    </div>
  );
}

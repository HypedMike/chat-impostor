import { useState } from "react";
import type { Player } from "../models/player";

interface IShowResultsProps {
  word: string;
  impostorWord: string;
  impostorsKnow: boolean;
  players: (Player & { impostor: boolean })[];
  resetGame: () => void;
}

export function ShowResults(props: IShowResultsProps) {
  const { word, impostorWord, impostorsKnow, players, resetGame } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lifted, setLifted] = useState(false);

  const currentPlayer = players[currentIndex];
  const revealAsImpostor = impostorsKnow && currentPlayer?.impostor;

  function handleNextPlayer() {
    setLifted(false);
    setCurrentIndex((prev) => prev + 1);
  }

  if (!currentPlayer) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 text-center shadow-xl">
        <p className="mb-6 text-lg font-semibold">
          Everyone has seen their word.
        </p>
        <button
          onClick={resetGame}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500"
        >
          Play again
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-slate-900 p-6 shadow-xl">
      <span className="text-sm text-slate-400">
        Player {currentIndex + 1} of {players.length}
      </span>

      <h2 className="text-xl font-bold">{currentPlayer.name}</h2>

      <button
        onClick={() => setLifted(true)}
        disabled={lifted}
        className={`flex h-40 w-full items-center justify-center rounded-xl border-2 px-4 text-center text-lg font-medium transition-all duration-300 ${
          lifted
            ? revealAsImpostor
              ? "border-red-500 bg-red-950 text-red-300"
              : "border-emerald-500 bg-emerald-950 text-emerald-200"
            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-indigo-500 hover:text-slate-200"
        }`}
      >
        {lifted
          ? revealAsImpostor
            ? "You are the impostor!"
            : `The word is: ${currentPlayer.impostor ? impostorWord : word}`
          : "Tap to reveal"}
      </button>

      <button
        onClick={handleNextPlayer}
        disabled={!lifted}
        className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {currentIndex === players.length - 1 ? "Done" : "Next player"}
      </button>
    </div>
  );
}

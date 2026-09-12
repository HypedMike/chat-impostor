interface IGameConfigProps {
  playerCount: number;
  impostorCount: number;
  impostorsKnow: boolean;
  setImpostorCount: (count: number) => void;
  setImpostorsKnow: (impostorsKnow: boolean) => void;
}

export function GameConfig(props: IGameConfigProps) {
  const {
    playerCount,
    impostorCount,
    impostorsKnow,
    setImpostorCount,
    setImpostorsKnow,
  } = props;

  const maxImpostors = Math.max(playerCount - 1, 1);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="impostor-count" className="text-sm text-slate-300">
          Number of impostors
        </label>
        <input
          id="impostor-count"
          type="number"
          min={1}
          max={maxImpostors}
          value={Math.min(impostorCount, maxImpostors)}
          onChange={(event) =>
            setImpostorCount(
              Math.min(
                Math.max(Number(event.target.value) || 1, 1),
                maxImpostors,
              ),
            )
          }
          className="w-16 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-center text-slate-100 outline-none focus:border-indigo-500"
        />
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-sm text-slate-300">
          Impostors know they are the impostor
        </span>
        <input
          type="checkbox"
          checked={impostorsKnow}
          onChange={(event) => setImpostorsKnow(event.target.checked)}
          className="h-5 w-5 rounded border-slate-700 bg-slate-800 accent-indigo-600"
        />
      </label>
    </div>
  );
}

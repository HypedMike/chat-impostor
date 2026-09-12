import type { Player } from "../models/player";

interface IPlayerListProps {
  players: Player[];
}

export function PlayerList(props: IPlayerListProps) {
  if (props.players.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {props.players.map((player) => (
        <li
          key={player.id}
          className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200"
        >
          {player.name}
        </li>
      ))}
    </ul>
  );
}

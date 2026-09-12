import { AddPlayers } from "../components/add_players";
import { GameConfig } from "../components/game_config";
import { ImportChat } from "../components/import_chat";
import { PlayerList } from "../components/player_list";
import { ShowResults } from "../components/show_results";
import useGameStore from "../stores/game_store";

export function OnboardingView() {
  const {
    addPlayer,
    players,
    pickImpostor,
    started,
    startGame,
    word,
    impostorWord,
    chatImported,
    importChatExport,
    pickWord,
    resetGame,
    impostorCount,
    impostorsKnow,
    setImpostorCount,
    setImpostorsKnow,
  } = useGameStore();

  async function handleGameStart() {
    await pickWord();
    pickImpostor();
    startGame();
  }

  if (started) {
    return (
      <ShowResults
        word={word}
        impostorWord={impostorWord}
        impostorsKnow={impostorsKnow}
        players={players}
        resetGame={resetGame}
      />
    );
  }

  return (
    <main className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-xl">
      <h1 className="mb-6 text-center text-2xl font-bold">Chat Impostor</h1>

      <ImportChat imported={chatImported} importChatExport={importChatExport} />

      <AddPlayers addPlayer={addPlayer} />

      <PlayerList players={players} />

      <GameConfig
        playerCount={players.length}
        impostorCount={impostorCount}
        impostorsKnow={impostorsKnow}
        setImpostorCount={setImpostorCount}
        setImpostorsKnow={setImpostorsKnow}
      />

      <button
        onClick={handleGameStart}
        disabled={players.length < 2 || !chatImported}
        className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start game
      </button>
    </main>
  );
}

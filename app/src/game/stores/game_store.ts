import type { Player } from "../models/player";
import { create } from "zustand";
import * as analyzer from "../services/analyzer";

type State = {
  players: (Player & {
    impostor: boolean;
  })[];
  started: boolean;
  word: string;
  impostorWord: string;
  chatImported: boolean;
  impostorCount: number;
  impostorsKnow: boolean;
};

type Actions = {
  updatePlayer: (
    playerId: string,
    updates: Partial<Player & { impostor: boolean }>,
  ) => void;
  addPlayer: (player: Player, impostor?: boolean) => void;
  pickImpostor: () => void;
  startGame: () => void;
  importChatExport: (content: string) => Promise<void>;
  pickWord: () => Promise<void>;
  resetGame: () => void;
  setImpostorCount: (count: number) => void;
  setImpostorsKnow: (impostorsKnow: boolean) => void;
};

const useGameStore = create<State & Actions>()((set) => ({
  players: [],
  started: false,
  word: "",
  impostorWord: "",
  chatImported: false,
  impostorCount: 1,
  impostorsKnow: false,

  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player,
      ),
    })),

  addPlayer: (player, impostor) =>
    set((state) => ({
      players: [...state.players, { ...player, impostor: !!impostor }],
    })),

  pickImpostor: () =>
    set((state) => {
      const count = Math.min(
        Math.max(state.impostorCount, 1),
        Math.max(state.players.length - 1, 0),
      );

      const indices = state.players.map((_, index) => index);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const impostorIndices = new Set(indices.slice(0, count));

      return {
        players: state.players.map((player, index) => ({
          ...player,
          impostor: impostorIndices.has(index),
        })),
      };
    }),

  startGame: () => set({ started: true }),

  importChatExport: async (content) => {
    await analyzer.importChatExport(content);
    set({ chatImported: true });
  },

  pickWord: async () => {
    const word = await analyzer.pickWord();

    let impostorWord = await analyzer.pickWord();
    for (let attempt = 0; attempt < 5 && impostorWord === word; attempt++) {
      impostorWord = await analyzer.pickWord();
    }

    set({ word: word ?? "", impostorWord: impostorWord ?? word ?? "" });
  },

  resetGame: () =>
    set((state) => ({
      players: state.players.map((player) => ({
        ...player,
        impostor: false,
      })),
      started: false,
      word: "",
      impostorWord: "",
    })),

  setImpostorCount: (count) => set({ impostorCount: count }),

  setImpostorsKnow: (impostorsKnow) => set({ impostorsKnow }),
}));

export default useGameStore;

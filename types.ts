
export enum GameMode {
  SINGLE_PLAYER = 'SINGLE_PLAYER',
  MULTIPLAYER = 'MULTIPLAYER'
}

export enum GameState {
  IDLE = 'IDLE',
  WAGERING = 'WAGERING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface Player {
  address?: string;
  name: string;
  isAI: boolean;
}

export interface MatchSession {
  id: string;
  mode: GameMode;
  white: Player;
  black: Player;
  stake: string; // e.g. "0.01"
  status: GameState;
}

export interface GeminiMoveResponse {
  move: string; // e.g. "e2e4"
  explanation: string;
  evaluation: number; // centipawns or similar
}

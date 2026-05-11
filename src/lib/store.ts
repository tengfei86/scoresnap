import { Board, Player } from './types';
import { nanoid } from 'nanoid';

const BOARDS_KEY = 'scoresnap_boards';
const PLAYERS_KEY = 'scoresnap_players';

function getBoards(): Board[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BOARDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveBoardsList(boards: Board[]) {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

function getPlayersList(): Player[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PLAYERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePlayersList(players: Player[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

const PLAYER_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#14b8a6', '#6366f1',
];

export interface CreateBoardOptions {
  theme?: Board['theme'];
  layout?: Board['layout'];
  stepSize?: number;
  scoreMode?: Board['scoreMode'];
  startScore?: number;
  templateId?: string;
  bestOfRounds?: number;
  timerDirection?: 'up' | 'down';
  timerDuration?: number;
  chessClockTime?: number;
}

export function createBoard(name: string, playerNames: string[], opts?: CreateBoardOptions): Board {
  const slug = nanoid(8);
  const adminToken = nanoid(16);
  const board: Board = {
    id: nanoid(),
    slug,
    adminToken,
    name,
    theme: opts?.theme ?? 'modern-dark',
    layout: opts?.layout ?? 'leaderboard',
    createdAt: new Date().toISOString(),
    stepSize: opts?.stepSize ?? 1,
    scoreMode: opts?.scoreMode ?? 'add',
    startScore: opts?.startScore ?? 0,
    templateId: opts?.templateId,
    bestOfRounds: opts?.bestOfRounds,
    timerDirection: opts?.timerDirection,
    timerDuration: opts?.timerDuration,
    chessClockTime: opts?.chessClockTime,
  };

  const boards = getBoards();
  boards.push(board);
  saveBoardsList(boards);

  const players = getPlayersList();
  playerNames.forEach((pName, i) => {
    players.push({
      id: nanoid(),
      boardId: board.id,
      name: pName,
      score: board.startScore,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      position: i,
    });
  });
  savePlayersList(players);

  return board;
}

export function getBoard(slug: string): Board | null {
  return getBoards().find(b => b.slug === slug) || null;
}

export function updateBoard(board: Board) {
  const boards = getBoards();
  const idx = boards.findIndex(b => b.id === board.id);
  if (idx >= 0) {
    boards[idx] = board;
    saveBoardsList(boards);
  }
}

export function getPlayers(boardId: string): Player[] {
  return getPlayersList().filter(p => p.boardId === boardId);
}

export function updatePlayer(player: Player) {
  const players = getPlayersList();
  const idx = players.findIndex(p => p.id === player.id);
  if (idx >= 0) {
    players[idx] = player;
    savePlayersList(players);
  }
}

export function addPlayer(boardId: string, name: string): Player {
  const players = getPlayersList();
  const boardPlayers = players.filter(p => p.boardId === boardId);
  const player: Player = {
    id: nanoid(),
    boardId,
    name,
    score: 0,
    color: PLAYER_COLORS[boardPlayers.length % PLAYER_COLORS.length],
    position: boardPlayers.length,
  };
  players.push(player);
  savePlayersList(players);
  return player;
}

export function removePlayer(playerId: string) {
  const players = getPlayersList().filter(p => p.id !== playerId);
  savePlayersList(players);
}

export function resetScores(boardId: string) {
  const players = getPlayersList();
  players.forEach(p => {
    if (p.boardId === boardId) p.score = 0;
  });
  savePlayersList(players);
}

// Storage event listener for cross-tab sync
export function onStorageChange(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === BOARDS_KEY || e.key === PLAYERS_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// For same-tab reactivity, broadcast via BroadcastChannel
const CHANNEL_NAME = 'scoresnap_sync';

export function broadcastUpdate() {
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ type: 'update', ts: Date.now() });
    bc.close();
  } catch {}
}

export function onBroadcastUpdate(callback: () => void) {
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = () => callback();
    return () => bc.close();
  } catch {
    return () => {};
  }
}

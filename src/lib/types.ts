export type ThemeName = 'modern-dark' | 'neon' | 'chalk' | 'sport' | 'clean';
export type LayoutName = 'leaderboard' | 'versus' | 'grid';

export type ScoreMode = 'add' | 'countdown' | 'timer' | 'bestof' | 'chess-clock';

export interface Board {
  id: string;
  slug: string;
  adminToken: string;
  name: string;
  theme: ThemeName;
  layout: LayoutName;
  createdAt: string;
  stepSize: number;
  scoreMode: ScoreMode;
  startScore: number;
  templateId?: string;
  /** For bestof mode: total rounds (3, 5, 7) */
  bestOfRounds?: number;
  /** Timer: direction */
  timerDirection?: 'up' | 'down';
  /** Timer: duration in seconds (for countdown) */
  timerDuration?: number;
  /** Chess clock: time per player in seconds */
  chessClockTime?: number;
}

export interface Player {
  id: string;
  boardId: string;
  name: string;
  score: number;
  color: string;
  position: number;
}

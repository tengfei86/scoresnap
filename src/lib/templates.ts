import { ThemeName, LayoutName } from './types';

export interface ScoreTemplate {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  theme: ThemeName;
  layout: LayoutName;
  stepSize: number;
  /** Scoring mode: 'add' = up/down, 'countdown' = starts high goes down, 'timer' = time-based, 'bestof' = best-of series, 'chess-clock' = per-player countdown */
  scoreMode: 'add' | 'countdown' | 'timer' | 'bestof' | 'chess-clock';
  /** Default starting score (for countdown mode) */
  startScore: number;
  /** For bestof mode: total rounds */
  bestOfRounds?: number;
  /** For chess-clock mode: time per player in seconds */
  chessClockTime?: number;
  /** Suggested player/team count */
  suggestedPlayers: number;
  /** Keywords for AI matching */
  keywords: string[];
}

export const templates: ScoreTemplate[] = [
  {
    id: 'general',
    name: 'General Scoreboard',
    emoji: '📊',
    desc: 'Simple add/subtract scoring for anything',
    theme: 'modern-dark',
    layout: 'leaderboard',
    stepSize: 1,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 4,
    keywords: ['score', 'points', 'general', 'default', '记分', '计分', '通用'],
  },
  {
    id: 'board-game',
    name: 'Board Game Night',
    emoji: '🎲',
    desc: 'Multi-player free scoring with leaderboard',
    theme: 'chalk',
    layout: 'leaderboard',
    stepSize: 5,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 4,
    keywords: ['board game', 'tabletop', 'catan', 'monopoly', 'uno', 'card', '桌游', '卡牌', '纸牌', '三国杀', '狼人杀'],
  },
  {
    id: 'mahjong',
    name: 'Mahjong',
    emoji: '🀄',
    desc: 'Mahjong scoring with larger increments',
    theme: 'chalk',
    layout: 'leaderboard',
    stepSize: 10,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 4,
    keywords: ['mahjong', '麻将', '麻雀', '打牌'],
  },
  {
    id: 'sports-match',
    name: 'Sports Match',
    emoji: '⚽',
    desc: 'Two-team head-to-head scoring',
    theme: 'sport',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 2,
    keywords: ['soccer', 'football', 'hockey', 'match', 'game', '足球', '比赛', '对战', '排球', 'volleyball', 'handball'],
  },
  {
    id: 'basketball-3x3',
    name: '3x3 Basketball',
    emoji: '🏀',
    desc: 'Street-style 3x3, first to 21 wins',
    theme: 'sport',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 2,
    keywords: ['3x3', '3v3', '三人篮球', '三对三', 'streetball', '街球'],
  },
  {
    id: 'basketball-5v5',
    name: '5v5 Basketball',
    emoji: '🏀',
    desc: 'Full-court basketball scoring (1/2/3 pts)',
    theme: 'sport',
    layout: 'versus',
    stepSize: 2,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 2,
    keywords: ['basketball', '5v5', '5x5', '篮球', '五人篮球', '全场', 'nba'],
  },
  {
    id: 'racing',
    name: 'Racing / Motorsport',
    emoji: '🏎️',
    desc: 'Points-based standings for race series',
    theme: 'sport',
    layout: 'leaderboard',
    stepSize: 5,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 6,
    keywords: ['f1', 'formula', 'racing', 'motogp', 'nascar', 'rally', 'kart', 'karting', '赛车', '摩托', 'motorcycle', '卡丁车', 'race', 'season', 'grand prix'],
  },
  {
    id: 'darts',
    name: 'Darts',
    emoji: '🎯',
    desc: 'Countdown from 501/301',
    theme: 'neon',
    layout: 'leaderboard',
    stepSize: 20,
    scoreMode: 'countdown',
    startScore: 501,
    suggestedPlayers: 2,
    keywords: ['darts', 'dart', '飞镖', '501', '301'],
  },
  {
    id: 'billiards',
    name: 'Billiards / Pool',
    emoji: '🎱',
    desc: 'Track frames or points won',
    theme: 'neon',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 2,
    keywords: ['pool', 'billiards', 'snooker', '台球', '桌球', '斯诺克'],
  },
  {
    id: 'trivia',
    name: 'Trivia / Quiz',
    emoji: '🧠',
    desc: 'Team quiz with point scoring',
    theme: 'modern-dark',
    layout: 'grid',
    stepSize: 10,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 4,
    keywords: ['trivia', 'quiz', 'question', '知识竞赛', '答题', '竞猜', '抢答'],
  },
  {
    id: 'classroom',
    name: 'Classroom Points',
    emoji: '🎓',
    desc: 'Track student or group participation',
    theme: 'clean',
    layout: 'grid',
    stepSize: 5,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 6,
    keywords: ['class', 'classroom', 'student', 'school', 'teacher', '课堂', '学生', '积分', '奖励'],
  },
  {
    id: 'esports',
    name: 'Esports / Gaming',
    emoji: '🎮',
    desc: 'Best-of series or round tracking',
    theme: 'neon',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 2,
    keywords: ['esports', 'gaming', 'csgo', 'valorant', 'bo3', 'bo5', '电竞', 'overwatch'],
  },
  {
    id: 'moba',
    name: 'MOBA (王者/LOL)',
    emoji: '👑',
    desc: 'Best-of series (BO3/BO5) for MOBA matches',
    theme: 'neon',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'bestof',
    startScore: 0,
    bestOfRounds: 5,
    suggestedPlayers: 2,
    keywords: ['moba', '王者', '王者荣耀', 'lol', 'league', 'dota', '英雄联盟', 'mlbb', '荣耀'],
  },
  {
    id: 'battle-royale',
    name: 'Battle Royale',
    emoji: '🔫',
    desc: 'Multi-squad ranking + kill scoring',
    theme: 'modern-dark',
    layout: 'leaderboard',
    stepSize: 5,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 6,
    keywords: ['吃鸡', 'pubg', 'fortnite', '和平精英', 'battle royale', 'apex', '大逃杀', 'warzone', '绝地求生'],
  },
  {
    id: 'poker',
    name: 'Poker / Chips',
    emoji: '♠️',
    desc: 'Track chip counts with large increments',
    theme: 'modern-dark',
    layout: 'leaderboard',
    stepSize: 50,
    scoreMode: 'add',
    startScore: 100,
    suggestedPlayers: 6,
    keywords: ['poker', 'chips', 'texas', 'holdem', '德州', '扑克', '筹码'],
  },
  {
    id: 'tournament',
    name: 'Tournament',
    emoji: '🏆',
    desc: 'Multi-round tournament standings',
    theme: 'sport',
    layout: 'leaderboard',
    stepSize: 3,
    scoreMode: 'add',
    startScore: 0,
    suggestedPlayers: 8,
    keywords: ['tournament', 'bracket', 'championship', 'league', '锦标赛', '联赛', '冠军'],
  },
  {
    id: 'chess',
    name: 'Chess / Go',
    emoji: '♟️',
    desc: 'Per-player countdown clock',
    theme: 'modern-dark',
    layout: 'versus',
    stepSize: 1,
    scoreMode: 'chess-clock',
    startScore: 0,
    suggestedPlayers: 2,
    chessClockTime: 600,
    keywords: ['chess', 'go', '围棋', '象棋', '棋', '将棋', 'shogi', '国际象棋', '下棋'],
  },
];

/**
 * Match user input to a template using keyword matching.
 * Returns the best match or null if no confident match.
 */
export function matchTemplate(input: string): ScoreTemplate | null {
  const lower = input.toLowerCase().trim();
  
  let bestMatch: ScoreTemplate | null = null;
  let bestScore = 0;

  for (const t of templates) {
    let score = 0;
    for (const kw of t.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        // Longer keyword matches are worth more
        score += kw.length;
      }
    }
    // Also check template name
    if (lower.includes(t.name.toLowerCase())) {
      score += t.name.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = t;
    }
  }

  // Require minimum confidence
  return bestScore >= 2 ? bestMatch : null;
}

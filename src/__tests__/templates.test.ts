import { describe, it, expect } from 'vitest';
import { matchTemplate, templates } from '@/lib/templates';

describe('Template Definitions', () => {
  it('should have unique IDs', () => {
    const ids = templates.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have non-empty required fields', () => {
    templates.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.emoji).toBeTruthy();
      expect(t.desc).toBeTruthy();
      expect(t.keywords.length).toBeGreaterThan(0);
      expect(t.suggestedPlayers).toBeGreaterThan(0);
    });
  });

  it('should have valid theme values', () => {
    const validThemes = ['modern-dark', 'neon', 'chalk', 'sport', 'clean'];
    templates.forEach(t => {
      expect(validThemes).toContain(t.theme);
    });
  });

  it('should have valid layout values', () => {
    const validLayouts = ['leaderboard', 'versus', 'grid'];
    templates.forEach(t => {
      expect(validLayouts).toContain(t.layout);
    });
  });

  it('should have valid scoreMode values', () => {
    const validModes = ['add', 'countdown', 'timer', 'bestof', 'chess-clock'];
    templates.forEach(t => {
      expect(validModes).toContain(t.scoreMode);
    });
  });

  it('bestof templates should have bestOfRounds set', () => {
    templates.filter(t => t.scoreMode === 'bestof').forEach(t => {
      expect(t.bestOfRounds).toBeDefined();
      expect(t.bestOfRounds).toBeGreaterThanOrEqual(3);
      expect(t.bestOfRounds! % 2).toBe(1); // must be odd
    });
  });

  it('countdown templates should have startScore > 0', () => {
    templates.filter(t => t.scoreMode === 'countdown').forEach(t => {
      expect(t.startScore).toBeGreaterThan(0);
    });
  });

  it('chess-clock templates should have chessClockTime set', () => {
    templates.filter(t => t.scoreMode === 'chess-clock').forEach(t => {
      expect(t.chessClockTime).toBeDefined();
      expect(t.chessClockTime).toBeGreaterThan(0);
    });
  });
});

describe('matchTemplate - Chinese Input', () => {
  it('麻将 → mahjong template', () => {
    const m = matchTemplate('麻将');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('mahjong');
  });

  it('打麻将 → mahjong template', () => {
    const m = matchTemplate('打麻将');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('mahjong');
  });

  it('王者荣耀 → moba template', () => {
    const m = matchTemplate('王者荣耀');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('moba');
  });

  it('王者 → moba template', () => {
    const m = matchTemplate('王者');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('moba');
  });

  it('英雄联盟 → moba template', () => {
    const m = matchTemplate('英雄联盟');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('moba');
  });

  it('吃鸡 → battle-royale template', () => {
    const m = matchTemplate('吃鸡');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('battle-royale');
  });

  it('和平精英 → battle-royale template', () => {
    const m = matchTemplate('和平精英');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('battle-royale');
  });

  it('篮球 → basketball-5v5 template', () => {
    const m = matchTemplate('篮球');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('basketball-5v5');
  });

  it('三人篮球 → basketball-3x3 template', () => {
    const m = matchTemplate('三人篮球');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('basketball-3x3');
  });

  it('足球 → sports-match template', () => {
    const m = matchTemplate('足球');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('sports-match');
  });

  it('飞镖 → darts template', () => {
    const m = matchTemplate('飞镖');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('darts');
  });

  it('台球 → billiards template', () => {
    const m = matchTemplate('台球');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('billiards');
  });

  it('桌游 → board-game template', () => {
    const m = matchTemplate('桌游');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('board-game');
  });

  it('德州扑克 → poker template', () => {
    const m = matchTemplate('德州扑克');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('poker');
  });

  it('电竞 → esports template', () => {
    const m = matchTemplate('电竞');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('esports');
  });

  it('课堂积分 → classroom template', () => {
    const m = matchTemplate('课堂积分');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('classroom');
  });

  it('赛车 → racing template', () => {
    const m = matchTemplate('赛车');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('racing');
  });

  it('下棋 → chess template', () => {
    const m = matchTemplate('下棋');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('chess');
  });

  it('围棋 → chess template', () => {
    const m = matchTemplate('围棋');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('chess');
  });
});

describe('matchTemplate - English Input', () => {
  it('F1 → racing template', () => {
    const m = matchTemplate('F1');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('racing');
  });

  it('F1 Season Points → racing template', () => {
    const m = matchTemplate('F1 Season Points');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('racing');
  });

  it('MotoGP → racing template', () => {
    const m = matchTemplate('MotoGP');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('racing');
  });

  it('LOL → moba template', () => {
    const m = matchTemplate('LOL');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('moba');
  });

  it('PUBG → battle-royale template', () => {
    const m = matchTemplate('PUBG');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('battle-royale');
  });

  it('Fortnite → battle-royale template', () => {
    const m = matchTemplate('Fortnite');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('battle-royale');
  });

  it('basketball → basketball-5v5 template', () => {
    const m = matchTemplate('basketball');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('basketball-5v5');
  });

  it('3x3 basketball → basketball-3x3 template', () => {
    const m = matchTemplate('3x3 basketball');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('basketball-3x3');
  });

  it('darts 501 → darts template', () => {
    const m = matchTemplate('darts 501');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('darts');
  });

  it('poker night → poker template', () => {
    const m = matchTemplate('poker night');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('poker');
  });

  it('pub quiz → trivia template', () => {
    const m = matchTemplate('pub quiz');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('trivia');
  });

  it('Valorant → esports template', () => {
    const m = matchTemplate('Valorant');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('esports');
  });

  it('CSGO → esports template', () => {
    const m = matchTemplate('CSGO');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('esports');
  });

  it('snooker → billiards template', () => {
    const m = matchTemplate('snooker');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('billiards');
  });

  it('soccer match → sports-match template', () => {
    const m = matchTemplate('soccer match');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('sports-match');
  });

  it('championship tournament → tournament template', () => {
    const m = matchTemplate('championship tournament');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('tournament');
  });

  it('classroom points → classroom template', () => {
    const m = matchTemplate('classroom points');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('classroom');
  });
});

describe('matchTemplate - No Match / Fallback', () => {
  it('random gibberish → null', () => {
    expect(matchTemplate('xyzabc123')).toBeNull();
  });

  it('empty string → null', () => {
    expect(matchTemplate('')).toBeNull();
  });

  it('single letter → null', () => {
    expect(matchTemplate('a')).toBeNull();
  });

  it('Friday Game Night → should match board-game or null (ambiguous)', () => {
    const m = matchTemplate('Friday Game Night');
    // "game" is a keyword for sports-match, that's acceptable
    if (m) {
      expect(['board-game', 'sports-match']).toContain(m.id);
    }
  });
});

describe('matchTemplate - Case Insensitivity', () => {
  it('f1 (lowercase) → racing', () => {
    expect(matchTemplate('f1')!.id).toBe('racing');
  });

  it('MAHJONG (uppercase) → mahjong', () => {
    expect(matchTemplate('MAHJONG')!.id).toBe('mahjong');
  });

  it('LoL (mixed case) → moba', () => {
    expect(matchTemplate('LoL')!.id).toBe('moba');
  });

  it('Pubg (title case) → battle-royale', () => {
    expect(matchTemplate('Pubg')!.id).toBe('battle-royale');
  });
});

describe('matchTemplate - Compound Inputs', () => {
  it('周五打麻将 → mahjong', () => {
    const m = matchTemplate('周五打麻将');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('mahjong');
  });

  it('今晚王者荣耀 BO5 → moba', () => {
    const m = matchTemplate('今晚王者荣耀 BO5');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('moba');
  });

  it('NBA Finals Basketball → basketball-5v5', () => {
    const m = matchTemplate('NBA Finals Basketball');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('basketball-5v5');
  });

  it('Go Kart Racing → racing', () => {
    const m = matchTemplate('Go Kart Racing');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('racing');
  });
});

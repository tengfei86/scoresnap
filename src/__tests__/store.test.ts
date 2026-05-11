import { describe, it, expect, beforeEach } from 'vitest';
import { createBoard, getBoard, getPlayers, updatePlayer, resetScores, addPlayer, removePlayer } from '@/lib/store';

describe('Board Creation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create a board with default options', () => {
    const board = createBoard('Test Board', ['Alice', 'Bob']);
    expect(board.name).toBe('Test Board');
    expect(board.theme).toBe('modern-dark');
    expect(board.layout).toBe('leaderboard');
    expect(board.stepSize).toBe(1);
    expect(board.scoreMode).toBe('add');
    expect(board.startScore).toBe(0);
    expect(board.slug).toBeTruthy();
    expect(board.adminToken).toBeTruthy();
  });

  it('should create a board with custom template options', () => {
    const board = createBoard('Mahjong Night', ['P1', 'P2', 'P3', 'P4'], {
      theme: 'chalk',
      layout: 'leaderboard',
      stepSize: 10,
      scoreMode: 'add',
      startScore: 0,
      templateId: 'mahjong',
    });
    expect(board.theme).toBe('chalk');
    expect(board.stepSize).toBe(10);
    expect(board.templateId).toBe('mahjong');
  });

  it('should create a bestof board', () => {
    const board = createBoard('LOL BO5', ['Team A', 'Team B'], {
      scoreMode: 'bestof',
      bestOfRounds: 5,
      theme: 'neon',
      layout: 'versus',
    });
    expect(board.scoreMode).toBe('bestof');
    expect(board.bestOfRounds).toBe(5);
  });

  it('should create a countdown board with startScore', () => {
    const board = createBoard('Darts 501', ['Player 1', 'Player 2'], {
      scoreMode: 'countdown',
      startScore: 501,
    });
    expect(board.scoreMode).toBe('countdown');
    expect(board.startScore).toBe(501);

    const players = getPlayers(board.id);
    players.forEach(p => {
      expect(p.score).toBe(501);
    });
  });

  it('should retrieve board by slug', () => {
    const board = createBoard('Test', ['A']);
    const found = getBoard(board.slug);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(board.id);
  });

  it('should return null for unknown slug', () => {
    expect(getBoard('nonexistent')).toBeNull();
  });
});

describe('Player Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create players with correct initial scores', () => {
    const board = createBoard('Test', ['Alice', 'Bob', 'Charlie']);
    const players = getPlayers(board.id);
    expect(players).toHaveLength(3);
    expect(players[0].name).toBe('Alice');
    expect(players[1].name).toBe('Bob');
    expect(players[2].name).toBe('Charlie');
    players.forEach(p => {
      expect(p.score).toBe(0);
      expect(p.boardId).toBe(board.id);
    });
  });

  it('should assign different colors to players', () => {
    const board = createBoard('Test', ['A', 'B', 'C', 'D']);
    const players = getPlayers(board.id);
    const colors = players.map(p => p.color);
    // First 4 should be unique
    expect(new Set(colors).size).toBe(4);
  });

  it('should create players with startScore for countdown mode', () => {
    const board = createBoard('Darts', ['P1', 'P2'], {
      scoreMode: 'countdown',
      startScore: 301,
    });
    const players = getPlayers(board.id);
    players.forEach(p => {
      expect(p.score).toBe(301);
    });
  });

  it('should update player score', () => {
    const board = createBoard('Test', ['Alice']);
    const players = getPlayers(board.id);
    const alice = players[0];
    updatePlayer({ ...alice, score: 42 });
    const updated = getPlayers(board.id);
    expect(updated[0].score).toBe(42);
  });

  it('should add a new player', () => {
    const board = createBoard('Test', ['Alice']);
    addPlayer(board.id, 'Bob');
    const players = getPlayers(board.id);
    expect(players).toHaveLength(2);
    expect(players[1].name).toBe('Bob');
  });

  it('should remove a player', () => {
    const board = createBoard('Test', ['Alice', 'Bob']);
    const players = getPlayers(board.id);
    removePlayer(players[0].id);
    const remaining = getPlayers(board.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Bob');
  });

  it('should reset all scores to 0', () => {
    const board = createBoard('Test', ['Alice', 'Bob']);
    const players = getPlayers(board.id);
    updatePlayer({ ...players[0], score: 100 });
    updatePlayer({ ...players[1], score: 50 });
    resetScores(board.id);
    const reset = getPlayers(board.id);
    reset.forEach(p => expect(p.score).toBe(0));
  });
});

describe('Best-of Mode Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('BO3: winsNeeded should be 2', () => {
    const board = createBoard('BO3 Test', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 3,
    });
    const winsNeeded = Math.ceil((board.bestOfRounds || 3) / 2);
    expect(winsNeeded).toBe(2);
  });

  it('BO5: winsNeeded should be 3', () => {
    const board = createBoard('BO5 Test', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 5,
    });
    const winsNeeded = Math.ceil((board.bestOfRounds || 5) / 2);
    expect(winsNeeded).toBe(3);
  });

  it('BO7: winsNeeded should be 4', () => {
    const board = createBoard('BO7 Test', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 7,
    });
    const winsNeeded = Math.ceil((board.bestOfRounds || 7) / 2);
    expect(winsNeeded).toBe(4);
  });

  it('should detect winner when score reaches winsNeeded', () => {
    const board = createBoard('BO3', ['Team A', 'Team B'], {
      scoreMode: 'bestof',
      bestOfRounds: 3,
    });
    const winsNeeded = 2;
    const players = getPlayers(board.id);
    updatePlayer({ ...players[0], score: 2 });

    const updated = getPlayers(board.id);
    const winner = updated.find(p => p.score >= winsNeeded);
    expect(winner).toBeTruthy();
    expect(winner!.name).toBe('Team A');
  });

  it('should not have winner before reaching winsNeeded', () => {
    const board = createBoard('BO5', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 5,
    });
    const winsNeeded = 3;
    const players = getPlayers(board.id);
    updatePlayer({ ...players[0], score: 2 });
    updatePlayer({ ...players[1], score: 1 });

    const updated = getPlayers(board.id);
    const winner = updated.find(p => p.score >= winsNeeded);
    expect(winner).toBeUndefined();
  });

  it('BO5: score 3-2 should have winner', () => {
    const board = createBoard('BO5', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 5,
    });
    const winsNeeded = 3;
    const players = getPlayers(board.id);
    updatePlayer({ ...players[0], score: 3 });
    updatePlayer({ ...players[1], score: 2 });

    const updated = getPlayers(board.id);
    const winner = updated.find(p => p.score >= winsNeeded);
    expect(winner).toBeTruthy();
    expect(winner!.name).toBe('A');
  });

  it('reset should clear bestof scores', () => {
    const board = createBoard('BO3', ['A', 'B'], {
      scoreMode: 'bestof',
      bestOfRounds: 3,
    });
    const players = getPlayers(board.id);
    updatePlayer({ ...players[0], score: 2 });
    updatePlayer({ ...players[1], score: 1 });
    resetScores(board.id);

    const reset = getPlayers(board.id);
    reset.forEach(p => expect(p.score).toBe(0));
  });
});

describe('Multiple Boards Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not mix players between boards', () => {
    const board1 = createBoard('Board 1', ['Alice', 'Bob']);
    const board2 = createBoard('Board 2', ['Charlie', 'Dave', 'Eve']);

    expect(getPlayers(board1.id)).toHaveLength(2);
    expect(getPlayers(board2.id)).toHaveLength(3);
  });

  it('reset should only affect target board', () => {
    const board1 = createBoard('Board 1', ['Alice']);
    const board2 = createBoard('Board 2', ['Bob']);

    const p1 = getPlayers(board1.id);
    const p2 = getPlayers(board2.id);
    updatePlayer({ ...p1[0], score: 100 });
    updatePlayer({ ...p2[0], score: 200 });

    resetScores(board1.id);

    expect(getPlayers(board1.id)[0].score).toBe(0);
    expect(getPlayers(board2.id)[0].score).toBe(200);
  });
});

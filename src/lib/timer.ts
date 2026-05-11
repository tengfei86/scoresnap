import { useEffect, useState, useCallback, useRef } from 'react';
import { broadcastUpdate } from './store';

const TIMER_KEY_PREFIX = 'scoresnap_timer_';

export interface TimerState {
  /** Is the timer currently running */
  running: boolean;
  /** Elapsed time in ms (for up timer) or remaining time in ms (for down timer) */
  elapsed: number;
  /** Timestamp when timer was started/resumed (for calculating current value) */
  startedAt: number | null;
  /** Direction */
  direction: 'up' | 'down';
  /** Total duration in ms (for countdown) */
  duration: number;
}

export interface ChessClockState {
  /** Time remaining per player in ms, keyed by player ID */
  times: Record<string, number>;
  /** Currently active player ID (whose clock is ticking) */
  activePlayerId: string | null;
  /** Is the clock running */
  running: boolean;
  /** Timestamp when active player's clock started ticking */
  tickStartedAt: number | null;
  /** Initial time per player in ms */
  initialTime: number;
}

function getTimerState(boardId: string): TimerState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(TIMER_KEY_PREFIX + boardId);
  return raw ? JSON.parse(raw) : null;
}

function saveTimerState(boardId: string, state: TimerState) {
  localStorage.setItem(TIMER_KEY_PREFIX + boardId, JSON.stringify(state));
  broadcastUpdate();
}

function getChessClockState(boardId: string): ChessClockState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(TIMER_KEY_PREFIX + 'chess_' + boardId);
  return raw ? JSON.parse(raw) : null;
}

function saveChessClockState(boardId: string, state: ChessClockState) {
  localStorage.setItem(TIMER_KEY_PREFIX + 'chess_' + boardId, JSON.stringify(state));
  broadcastUpdate();
}

// ============ Match Timer Hook ============

export function useMatchTimer(boardId: string, direction: 'up' | 'down' = 'up', durationSec: number = 600) {
  const [state, setState] = useState<TimerState>({
    running: false,
    elapsed: 0,
    startedAt: null,
    direction,
    duration: durationSec * 1000,
  });
  const rafRef = useRef<number>(0);

  const load = useCallback(() => {
    const saved = getTimerState(boardId);
    if (saved) {
      setState(saved);
    } else {
      setState({
        running: false,
        elapsed: 0,
        startedAt: null,
        direction,
        duration: durationSec * 1000,
      });
    }
  }, [boardId, direction, durationSec]);

  useEffect(() => { load(); }, [load]);

  // Listen for cross-tab updates
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TIMER_KEY_PREFIX + boardId) load();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [boardId, load]);

  // Animation frame loop for display
  useEffect(() => {
    const tick = () => {
      setState(prev => {
        if (!prev.running || !prev.startedAt) return prev;
        return { ...prev }; // force re-render to recalculate display
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const getCurrentMs = useCallback((): number => {
    if (!state.running || !state.startedAt) {
      return state.direction === 'down' ? state.duration - state.elapsed : state.elapsed;
    }
    const now = Date.now();
    const additionalMs = now - state.startedAt;
    if (state.direction === 'down') {
      return Math.max(0, state.duration - (state.elapsed + additionalMs));
    }
    return state.elapsed + additionalMs;
  }, [state]);

  const start = useCallback(() => {
    const newState: TimerState = {
      ...state,
      running: true,
      startedAt: Date.now(),
    };
    setState(newState);
    saveTimerState(boardId, newState);
  }, [boardId, state]);

  const pause = useCallback(() => {
    if (!state.running || !state.startedAt) return;
    const additionalMs = Date.now() - state.startedAt;
    const newState: TimerState = {
      ...state,
      running: false,
      elapsed: state.elapsed + additionalMs,
      startedAt: null,
    };
    setState(newState);
    saveTimerState(boardId, newState);
  }, [boardId, state]);

  const reset = useCallback(() => {
    const newState: TimerState = {
      running: false,
      elapsed: 0,
      startedAt: null,
      direction: state.direction,
      duration: state.duration,
    };
    setState(newState);
    saveTimerState(boardId, newState);
  }, [boardId, state.direction, state.duration]);

  const setDuration = useCallback((sec: number) => {
    const newState: TimerState = {
      ...state,
      running: false,
      elapsed: 0,
      startedAt: null,
      duration: sec * 1000,
    };
    setState(newState);
    saveTimerState(boardId, newState);
  }, [boardId, state]);

  const isExpired = state.direction === 'down' && getCurrentMs() <= 0;

  return { state, getCurrentMs, start, pause, reset, setDuration, isExpired };
}

// ============ Chess Clock Hook ============

export function useChessClock(boardId: string, playerIds: string[], initialTimeSec: number = 300) {
  const [state, setState] = useState<ChessClockState>({
    times: {},
    activePlayerId: null,
    running: false,
    tickStartedAt: null,
    initialTime: initialTimeSec * 1000,
  });
  const rafRef = useRef<number>(0);

  const load = useCallback(() => {
    const saved = getChessClockState(boardId);
    if (saved) {
      setState(saved);
    } else {
      const times: Record<string, number> = {};
      playerIds.forEach(id => { times[id] = initialTimeSec * 1000; });
      setState({
        times,
        activePlayerId: null,
        running: false,
        tickStartedAt: null,
        initialTime: initialTimeSec * 1000,
      });
    }
  }, [boardId, playerIds, initialTimeSec]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TIMER_KEY_PREFIX + 'chess_' + boardId) load();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [boardId, load]);

  // Animation frame for display
  useEffect(() => {
    const tick = () => {
      setState(prev => {
        if (!prev.running) return prev;
        return { ...prev };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const getPlayerTime = useCallback((playerId: string): number => {
    const base = state.times[playerId] ?? 0;
    if (!state.running || state.activePlayerId !== playerId || !state.tickStartedAt) {
      return base;
    }
    return Math.max(0, base - (Date.now() - state.tickStartedAt));
  }, [state]);

  const switchTo = useCallback((playerId: string) => {
    // Deduct time from current active player
    const newTimes = { ...state.times };
    if (state.running && state.activePlayerId && state.tickStartedAt) {
      const elapsed = Date.now() - state.tickStartedAt;
      newTimes[state.activePlayerId] = Math.max(0, (newTimes[state.activePlayerId] ?? 0) - elapsed);
    }

    const newState: ChessClockState = {
      ...state,
      times: newTimes,
      activePlayerId: playerId,
      running: true,
      tickStartedAt: Date.now(),
    };
    setState(newState);
    saveChessClockState(boardId, newState);
  }, [boardId, state]);

  const pauseClock = useCallback(() => {
    const newTimes = { ...state.times };
    if (state.running && state.activePlayerId && state.tickStartedAt) {
      const elapsed = Date.now() - state.tickStartedAt;
      newTimes[state.activePlayerId] = Math.max(0, (newTimes[state.activePlayerId] ?? 0) - elapsed);
    }
    const newState: ChessClockState = {
      ...state,
      times: newTimes,
      running: false,
      tickStartedAt: null,
    };
    setState(newState);
    saveChessClockState(boardId, newState);
  }, [boardId, state]);

  const resetClock = useCallback(() => {
    const times: Record<string, number> = {};
    playerIds.forEach(id => { times[id] = state.initialTime; });
    const newState: ChessClockState = {
      times,
      activePlayerId: null,
      running: false,
      tickStartedAt: null,
      initialTime: state.initialTime,
    };
    setState(newState);
    saveChessClockState(boardId, newState);
  }, [boardId, playerIds, state.initialTime]);

  const setTime = useCallback((sec: number) => {
    const times: Record<string, number> = {};
    playerIds.forEach(id => { times[id] = sec * 1000; });
    const newState: ChessClockState = {
      times,
      activePlayerId: null,
      running: false,
      tickStartedAt: null,
      initialTime: sec * 1000,
    };
    setState(newState);
    saveChessClockState(boardId, newState);
  }, [boardId, playerIds]);

  const isPlayerExpired = useCallback((playerId: string) => {
    return getPlayerTime(playerId) <= 0;
  }, [getPlayerTime]);

  return { state, getPlayerTime, switchTo, pauseClock, resetClock, setTime, isPlayerExpired };
}

// ============ Format Helper ============

export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

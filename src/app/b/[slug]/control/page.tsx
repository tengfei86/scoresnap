'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  getBoard, getPlayers, updateBoard, updatePlayer,
  addPlayer, removePlayer, resetScores, broadcastUpdate,
} from '@/lib/store';
import { Board, Player, ThemeName, LayoutName } from '@/lib/types';
import { themes } from '@/lib/themes';
import { useMatchTimer, useChessClock, formatTime } from '@/lib/timer';

const DEFAULT_STEP_OPTIONS = [1, 2, 5, 10];
const LARGE_STEP_OPTIONS = [10, 25, 50, 100];
const XLARGE_STEP_OPTIONS = [50, 100, 200, 500];
const THEME_LIST: ThemeName[] = ['modern-dark', 'neon', 'chalk', 'sport', 'clean'];
const LAYOUT_LIST: { value: LayoutName; label: string; icon: string }[] = [
  { value: 'leaderboard', label: 'Leaderboard', icon: '📊' },
  { value: 'versus', label: 'Versus', icon: '⚔️' },
  { value: 'grid', label: 'Grid', icon: '🔲' },
];

const BO_OPTIONS = [3, 5, 7];

function ControlContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get('token');

  const [board, setBoard] = useState<Board | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [stepSize, setStepSize] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const b = getBoard(slug);
    if (b) {
      setBoard(b);
      setPlayers(getPlayers(b.id));
      setStepSize(b.stepSize || 1);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { refresh(); }, [refresh]);

  // Hooks must be called unconditionally (before any early returns)
  const matchTimer = useMatchTimer(
    board?.id ?? '__none__',
    board?.timerDirection || 'up',
    board?.timerDuration || 600
  );
  const chessClock = useChessClock(
    board?.id ?? '__none__',
    players.map(p => p.id),
    board?.chessClockTime || 300
  );

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center"><p>Loading...</p></div>;

  if (!board || board.adminToken !== token) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-400">Invalid or missing admin token.</p>
        <a href="/" className="text-blue-400 hover:underline">← Go home</a>
      </div>
    );
  }

  const isBestOf = board.scoreMode === 'bestof';
  const bestOfRounds = board.bestOfRounds || 3;
  const winsNeeded = Math.ceil(bestOfRounds / 2);

  // Check if someone has won in bestof mode
  const getWinner = (): Player | null => {
    if (!isBestOf) return null;
    return players.find(p => p.score >= winsNeeded) || null;
  };

  const winner = getWinner();
  const isFinished = winner !== null;

  const viewUrl = typeof window !== 'undefined' ? `${window.location.origin}/b/${slug}` : '';
  const overlayUrl = typeof window !== 'undefined' ? `${window.location.origin}/b/${slug}/overlay?style=versus` : '';

  const changeScore = (player: Player, delta: number) => {
    if (isBestOf) {
      const newScore = player.score + delta;
      // Don't allow negative or exceeding wins needed
      if (newScore < 0 || (delta > 0 && isFinished)) return;
      const updated = { ...player, score: newScore };
      updatePlayer(updated);
    } else {
      const updated = { ...player, score: player.score + delta };
      updatePlayer(updated);
    }
    broadcastUpdate();
    refresh();
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    addPlayer(board.id, newPlayerName.trim());
    broadcastUpdate();
    setNewPlayerName('');
    refresh();
  };

  const handleRemove = (id: string) => {
    removePlayer(id);
    broadcastUpdate();
    refresh();
  };

  const handleReset = () => {
    if (confirm('Reset all scores to 0?')) {
      resetScores(board.id);
      broadcastUpdate();
      refresh();
    }
  };

  const handleThemeChange = (theme: ThemeName) => {
    updateBoard({ ...board, theme });
    broadcastUpdate();
    refresh();
  };

  const handleLayoutChange = (layout: LayoutName) => {
    updateBoard({ ...board, layout });
    broadcastUpdate();
    refresh();
  };

  const handleStepChange = (step: number) => {
    setStepSize(step);
    updateBoard({ ...board, stepSize: step });
    broadcastUpdate();
  };

  const handleBoChange = (rounds: number) => {
    updateBoard({ ...board, bestOfRounds: rounds });
    broadcastUpdate();
    refresh();
  };

  const isChessClock = board.scoreMode === 'chess-clock';

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const totalRoundsPlayed = players.reduce((sum, p) => sum + p.score, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg truncate">{board.name}</h1>
            <p className="text-xs text-gray-500">
              Control Panel{isBestOf ? ` · BO${bestOfRounds}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowShare(!showShare)} className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm">
              📤 Share
            </button>
            <a href={viewUrl} target="_blank" className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm">
              👁 View
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Share Panel */}
        {showShare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
          >
            <h3 className="font-semibold">Share View Link</h3>
            <div className="bg-gray-800 rounded-lg p-3 text-sm break-all text-blue-400">
              {viewUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(viewUrl)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm w-full"
            >
              📋 Copy Link
            </button>
            <div className="flex justify-center bg-white rounded-xl p-4">
              <QRCodeSVG value={viewUrl} size={180} />
            </div>
            {/* OBS Overlay */}
            <div className="border-t border-gray-700 pt-4 mt-2">
              <h3 className="font-semibold text-sm mb-2">🎥 OBS / Streaming Overlay</h3>
              <p className="text-xs text-gray-500 mb-2">Add as Browser Source in OBS for a transparent scoreboard overlay on your stream.</p>
              <div className="flex gap-1 mb-2">
                {(['bar', 'versus', 'minimal'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      const url = `${window.location.origin}/b/${slug}/overlay?style=${s}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1.5 rounded-lg text-xs text-center capitalize"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(overlayUrl)}
                className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm w-full"
              >
                📋 Copy Overlay URL
              </button>
            </div>
          </motion.div>
        )}

        {/* Winner Banner */}
        <AnimatePresence>
          {isFinished && winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-600/50 rounded-xl p-5 text-center"
            >
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-xl font-black text-yellow-300">{winner.name} Wins!</div>
              <div className="text-sm text-yellow-400/70 mt-1">
                {winner.score} - {Math.max(...players.filter(p => p.id !== winner.id).map(p => p.score))} · BO{bestOfRounds}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BO Selector (bestof mode) */}
        {isBestOf && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 shrink-0">Series:</span>
            {BO_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => handleBoChange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  bestOfRounds === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                BO{r}
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-auto">
              Round {totalRoundsPlayed + 1}/{bestOfRounds}
            </span>
          </div>
        )}

        {/* Step Size (non-bestof, non-chess-clock) */}
        {!isBestOf && !isChessClock && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 shrink-0">Step:</span>
            {(stepSize >= 50 ? XLARGE_STEP_OPTIONS : stepSize >= 10 ? LARGE_STEP_OPTIONS : DEFAULT_STEP_OPTIONS).map(s => (
              <button
                key={s}
                onClick={() => handleStepChange(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  stepSize === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ±{s}
              </button>
            ))}
          </div>
        )}

        {/* Match Timer */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400">⏱ Match Timer</h3>
            <div className="flex gap-1">
              {([{l:'↑',v:'up' as const},{l:'↓',v:'down' as const}]).map(d => (
                <button
                  key={d.v}
                  onClick={() => {
                    updateBoard({ ...board, timerDirection: d.v });
                    broadcastUpdate();
                    matchTimer.reset();
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    (board.timerDirection || 'up') === d.v ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {d.l} {d.v === 'up' ? 'Count Up' : 'Countdown'}
                </button>
              ))}
            </div>
          </div>
          {/* Duration presets for countdown */}
          {(board.timerDirection || 'up') === 'down' && !matchTimer.state.running && (
            <div className="flex gap-1 mb-3">
              {[5, 10, 15, 20, 30, 45, 60].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    updateBoard({ ...board, timerDuration: m * 60 });
                    broadcastUpdate();
                    matchTimer.setDuration(m * 60);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs py-1 rounded"
                >
                  {m}m
                </button>
              ))}
            </div>
          )}
          <div className={`text-center text-5xl font-black tabular-nums mb-4 ${
            matchTimer.isExpired ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {formatTime(matchTimer.getCurrentMs())}
          </div>
          <div className="flex gap-2">
            {!matchTimer.state.running ? (
              <button
                onClick={matchTimer.start}
                disabled={matchTimer.isExpired}
                className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-40 py-2.5 rounded-lg font-medium"
              >
                ▶ Start
              </button>
            ) : (
              <button
                onClick={matchTimer.pause}
                className="flex-1 bg-yellow-700 hover:bg-yellow-600 py-2.5 rounded-lg font-medium"
              >
                ⏸ Pause
              </button>
            )}
            <button
              onClick={matchTimer.reset}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-lg font-medium"
            >
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Chess Clock */}
        {isChessClock && players.length >= 2 && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400">♟ Chess Clock</h3>
              <div className="flex gap-1">
                {[3, 5, 10, 15, 30].map(m => (
                  <button
                    key={m}
                    onClick={() => chessClock.setTime(m * 60)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs px-2 py-1 rounded"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {players.map(p => {
                const timeMs = chessClock.getPlayerTime(p.id);
                const isActive = chessClock.state.activePlayerId === p.id && chessClock.state.running;
                const expired = chessClock.isPlayerExpired(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      // Switch to the OTHER player (this player's turn is done)
                      const otherPlayer = players.find(op => op.id !== p.id);
                      if (otherPlayer) chessClock.switchTo(otherPlayer.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      expired ? 'bg-red-900/50 border-2 border-red-500/50' :
                      isActive ? 'bg-blue-900/50 border-2 border-blue-500/50' :
                      'bg-gray-800/50 border border-gray-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className={`ml-auto text-2xl font-black tabular-nums ${
                      expired ? 'text-red-400' : isActive ? 'text-blue-300' : 'text-gray-400'
                    }`}>
                      {formatTime(timeMs)}
                    </span>
                    {isActive && <span className="text-xs text-blue-400 animate-pulse">●</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {chessClock.state.running && (
                <button
                  onClick={chessClock.pauseClock}
                  className="flex-1 bg-yellow-700 hover:bg-yellow-600 py-2 rounded-lg font-medium text-sm"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={chessClock.resetClock}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-medium text-sm"
              >
                ↺ Reset Clock
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Tap a player to end their turn</p>
          </div>
        )}

        {/* Players */}
        <div className="space-y-2">
          {sorted.map(p => {
            const isWinner = isBestOf && p.score >= winsNeeded;
            return (
              <motion.div
                key={p.id}
                layout
                className={`rounded-xl p-3 flex items-center gap-3 ${
                  isWinner
                    ? 'bg-yellow-900/30 border-2 border-yellow-500/50'
                    : 'bg-gray-900/80 border border-gray-800'
                }`}
              >
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: p.color }}>
                  {isWinner ? '👑' : p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  {isBestOf ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      {Array.from({ length: winsNeeded }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-full ${
                            i < p.score ? 'bg-green-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                      <span className="text-lg font-black text-blue-400 ml-2">{p.score}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-blue-400">{p.score}</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isBestOf ? (
                    <>
                      <button
                        onClick={() => changeScore(p, -1)}
                        disabled={p.score <= 0}
                        className="w-10 h-10 bg-red-900/50 hover:bg-red-800/70 disabled:opacity-30 text-red-300 rounded-lg font-bold text-lg flex items-center justify-center"
                      >
                        −
                      </button>
                      <button
                        onClick={() => changeScore(p, 1)}
                        disabled={isFinished}
                        className="h-10 px-3 bg-green-900/50 hover:bg-green-800/70 disabled:opacity-30 text-green-300 rounded-lg font-bold text-sm flex items-center justify-center"
                      >
                        🏆 Win
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => changeScore(p, -stepSize)}
                        className="w-10 h-10 bg-red-900/50 hover:bg-red-800/70 text-red-300 rounded-lg font-bold text-lg flex items-center justify-center"
                      >
                        −
                      </button>
                      <button
                        onClick={() => changeScore(p, stepSize)}
                        className="w-10 h-10 bg-green-900/50 hover:bg-green-800/70 text-green-300 rounded-lg font-bold text-lg flex items-center justify-center"
                      >
                        +
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="w-8 h-8 text-gray-600 hover:text-red-400 text-sm flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Player */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder={isBestOf ? 'Add team...' : 'Add player...'}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
          />
          <button onClick={handleAddPlayer} className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl font-medium">
            Add
          </button>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Theme</h3>
          <div className="grid grid-cols-5 gap-2">
            {THEME_LIST.map(t => {
              const tc = themes[t];
              return (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-colors border-2 ${
                    board.theme === t
                      ? 'border-blue-400 ring-2 ring-blue-400'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <div className={`w-full h-6 rounded mb-1 ${tc.bg} ${tc.border} border`}>
                    <div className={`w-3/4 mx-auto mt-1 h-2 rounded-sm ${tc.scoreBg}`} />
                  </div>
                  <span className="text-gray-300">{tc.label}</span>
                </button>
              );
            })}
          </div>
          {/* Theme preview strip */}
          <div className={`mt-3 rounded-xl p-3 ${themes[board.theme].bg} ${themes[board.theme].text} ${themes[board.theme].border} border transition-colors duration-300`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${themes[board.theme].textSecondary}`}>Preview</span>
              <span className={`text-sm font-bold ${themes[board.theme].accent}`}>{themes[board.theme].label}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {players.slice(0, 3).map(p => (
                <div key={p.id} className={`flex-1 rounded-lg p-2 text-center ${themes[board.theme].cardBg}`}>
                  <div className="text-xs truncate">{p.name}</div>
                  <div className={`text-lg font-bold ${themes[board.theme].accent}`}>{p.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Layout</h3>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUT_LIST.map(l => (
              <button
                key={l.value}
                onClick={() => handleLayoutChange(l.value)}
                className={`py-3 rounded-lg text-sm font-medium text-center transition-colors border-2 ${
                  board.layout === l.value
                    ? 'border-blue-400 ring-2 ring-blue-400 bg-gray-800'
                    : 'border-transparent bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {l.icon} {l.label}
              </button>
            ))}
          </div>
          {/* Layout preview */}
          <div className={`mt-3 rounded-xl p-3 ${themes[board.theme].bg} ${themes[board.theme].border} border transition-all duration-300`}>
            <span className={`text-xs ${themes[board.theme].textSecondary}`}>Layout Preview</span>
            <div className={`mt-2 ${
              board.layout === 'versus' ? 'flex gap-3 justify-center' :
              board.layout === 'grid' ? 'grid grid-cols-3 gap-2' :
              'flex flex-col gap-1'
            }`}>
              {(board.layout === 'versus' ? players.slice(0, 2) : players.slice(0, board.layout === 'grid' ? 6 : 4)).map((p, i) => (
                <div key={p.id} className={`rounded-lg p-2 text-center ${themes[board.theme].cardBg} ${
                  board.layout === 'versus' ? 'flex-1' : ''
                }`}>
                  <div className={`text-xs truncate ${themes[board.theme].text}`}>{p.name}</div>
                  <div className={`font-bold ${themes[board.theme].accent} ${
                    board.layout === 'versus' ? 'text-2xl' : 'text-sm'
                  }`}>{p.score}</div>
                </div>
              ))}
              {board.layout === 'versus' && players.length >= 2 && (
                <div className={`absolute-none text-xs ${themes[board.theme].textSecondary} self-center`} />
              )}
            </div>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 py-3 rounded-xl font-medium"
        >
          🔄 {isBestOf ? 'Reset Series' : 'Reset All Scores'}
        </button>
      </div>
    </div>
  );
}

export default function ControlPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center"><p>Loading...</p></div>}>
      <ControlContent />
    </Suspense>
  );
}

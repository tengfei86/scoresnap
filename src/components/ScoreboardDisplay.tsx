'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Player, LayoutName, ThemeName, ScoreMode } from '@/lib/types';
import { themes, ThemeConfig } from '@/lib/themes';
import { useMatchTimer, useChessClock, formatTime } from '@/lib/timer';

interface Props {
  players: Player[];
  layout: LayoutName;
  theme: ThemeName;
  boardName: string;
  scoreMode?: ScoreMode;
  bestOfRounds?: number;
  boardId?: string;
  timerDirection?: 'up' | 'down';
  timerDuration?: number;
  chessClockTime?: number;
}

function getRankEmoji(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function AnimatedScore({ score, t }: { score: number; t: ThemeConfig }) {
  return (
    <motion.span
      key={score}
      initial={{ scale: 1.3, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`font-black ${t.accent}`}
    >
      {score.toLocaleString()}
    </motion.span>
  );
}

function RoundDots({ score, winsNeeded, size = 'md' }: { score: number; winsNeeded: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {Array.from({ length: winsNeeded }).map((_, i) => (
        <div
          key={i}
          className={`${sizeClass} rounded-full ${i < score ? 'bg-green-500' : 'bg-gray-600/50'}`}
        />
      ))}
    </div>
  );
}

function LeaderboardLayout({ players, t, isBestOf, winsNeeded }: { players: Player[]; t: ThemeConfig; isBestOf: boolean; winsNeeded: number }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 px-4">
      <AnimatePresence mode="popLayout">
        {sorted.map((p, i) => {
          const isWinner = isBestOf && p.score >= winsNeeded;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`${t.cardBg} border rounded-xl p-4 md:p-6 flex items-center gap-4 backdrop-blur-sm ${
                isWinner ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : t.border
              }`}
            >
              <div className="text-2xl md:text-3xl w-12 text-center shrink-0">
                {isWinner ? '👑' : getRankEmoji(i + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-lg md:text-xl truncate ${t.text}`}>
                  {p.name}
                </div>
                {isBestOf && <RoundDots score={p.score} winsNeeded={winsNeeded} />}
              </div>
              <div className={`text-3xl md:text-5xl ${t.special === 'neon' ? 'neon-text' : ''}`}>
                <AnimatedScore score={p.score} t={t} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function VersusLayout({ players, t, isBestOf, winsNeeded }: { players: Player[]; t: ThemeConfig; isBestOf: boolean; winsNeeded: number }) {
  const sorted = [...players].sort((a, b) => a.position - b.position);
  const left = sorted[0];
  const right = sorted[1];
  if (!left || !right) return <LeaderboardLayout players={players} t={t} isBestOf={isBestOf} winsNeeded={winsNeeded} />;

  const leftWon = isBestOf && left.score >= winsNeeded;
  const rightWon = isBestOf && right.score >= winsNeeded;

  return (
    <div className="flex items-center justify-center gap-4 md:gap-12 px-4 w-full max-w-4xl mx-auto">
      {/* Left */}
      <motion.div layout className={`flex-1 ${t.cardBg} border rounded-2xl p-6 md:p-10 text-center backdrop-blur-sm ${
        leftWon ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : t.border
      }`}>
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl md:text-5xl font-black text-white" style={{ backgroundColor: left.color }}>
          {leftWon ? '👑' : left.name[0]}
        </div>
        <div className={`font-bold text-xl md:text-2xl mb-4 truncate ${t.text}`}>{left.name}</div>
        {isBestOf && <div className="mb-3"><RoundDots score={left.score} winsNeeded={winsNeeded} size="lg" /></div>}
        <div className={`text-5xl md:text-8xl font-black ${t.accent} ${t.special === 'neon' ? 'neon-text' : ''}`}>
          <AnimatedScore score={left.score} t={t} />
        </div>
      </motion.div>

      {/* VS */}
      <div className={`text-2xl md:text-4xl font-black ${t.textSecondary} shrink-0`}>VS</div>

      {/* Right */}
      <motion.div layout className={`flex-1 ${t.cardBg} border rounded-2xl p-6 md:p-10 text-center backdrop-blur-sm ${
        rightWon ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : t.border
      }`}>
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl md:text-5xl font-black text-white" style={{ backgroundColor: right.color }}>
          {rightWon ? '👑' : right.name[0]}
        </div>
        <div className={`font-bold text-xl md:text-2xl mb-4 truncate ${t.text}`}>{right.name}</div>
        {isBestOf && <div className="mb-3"><RoundDots score={right.score} winsNeeded={winsNeeded} size="lg" /></div>}
        <div className={`text-5xl md:text-8xl font-black ${t.accent} ${t.special === 'neon' ? 'neon-text' : ''}`}>
          <AnimatedScore score={right.score} t={t} />
        </div>
      </motion.div>
    </div>
  );
}

function GridLayout({ players, t, isBestOf, winsNeeded }: { players: Player[]; t: ThemeConfig; isBestOf: boolean; winsNeeded: number }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 w-full max-w-5xl mx-auto">
      <AnimatePresence mode="popLayout">
        {sorted.map((p, i) => {
          const isWinner = isBestOf && p.score >= winsNeeded;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${t.cardBg} border rounded-2xl p-5 md:p-6 text-center backdrop-blur-sm ${
                isWinner ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : t.border
              }`}
            >
              <div className="text-lg mb-1">{isWinner ? '👑' : getRankEmoji(i + 1)}</div>
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: p.color }}>
                {p.name[0]}
              </div>
              <div className={`font-semibold truncate mb-2 ${t.text}`}>{p.name}</div>
              {isBestOf && <div className="mb-2"><RoundDots score={p.score} winsNeeded={winsNeeded} size="sm" /></div>}
              <div className={`text-3xl md:text-4xl font-black ${t.accent} ${t.special === 'neon' ? 'neon-text' : ''}`}>
                <AnimatedScore score={p.score} t={t} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function ScoreboardDisplay({ players, layout, theme, boardName, scoreMode, bestOfRounds, boardId, timerDirection, timerDuration, chessClockTime }: Props) {
  const t = themes[theme];
  const isBestOf = scoreMode === 'bestof';
  const isChessClock = scoreMode === 'chess-clock';
  const winsNeeded = isBestOf ? Math.ceil((bestOfRounds || 3) / 2) : 0;
  const winner = isBestOf ? players.find(p => p.score >= winsNeeded) : null;
  const matchTimer = useMatchTimer(boardId || '', timerDirection || 'up', timerDuration || 600);
  const chessClock = useChessClock(boardId || '', players.map(p => p.id), chessClockTime || 300);

  return (
    <div className={`fullscreen-container ${t.bg} ${t.text} ${t.fontClass || ''} ${theme === 'chalk' ? 'chalk-texture' : ''} flex flex-col items-center justify-center py-10 relative`}>
      {/* Board Name */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-3xl md:text-5xl font-black mb-2 md:mb-4 text-center px-4 ${t.special === 'neon' ? 'neon-text' : ''}`}
      >
        {boardName}
      </motion.h1>

      {/* BO indicator */}
      {isBestOf && (
        <div className={`text-sm mb-6 md:mb-10 ${t.textSecondary}`}>
          Best of {bestOfRounds || 3} · First to {winsNeeded}
        </div>
      )}

      {/* Winner banner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center"
          >
            <div className="text-5xl md:text-7xl mb-2">🏆</div>
            <div className="text-2xl md:text-3xl font-black text-yellow-300">
              {winner.name} Wins!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isBestOf && <div className="mb-4 md:mb-8" />}

      {/* Match Timer Display */}
      {boardId && matchTimer.state.running || (matchTimer.state.elapsed > 0) ? (
        <div className={`text-4xl md:text-6xl font-black tabular-nums mb-6 md:mb-10 ${
          matchTimer.isExpired ? 'text-red-400 animate-pulse' : t.accent
        } ${t.special === 'neon' ? 'neon-text' : ''}`}>
          {formatTime(matchTimer.getCurrentMs())}
        </div>
      ) : null}

      {/* Chess Clock Display */}
      {isChessClock && boardId && players.length >= 2 && (
        <div className="flex gap-4 md:gap-8 mb-6 md:mb-10">
          {players.map(p => {
            const timeMs = chessClock.getPlayerTime(p.id);
            const isActive = chessClock.state.activePlayerId === p.id && chessClock.state.running;
            const expired = chessClock.isPlayerExpired(p.id);
            return (
              <div key={p.id} className={`text-center px-6 py-4 rounded-xl ${
                expired ? 'bg-red-900/30 border-2 border-red-500/50' :
                isActive ? 'bg-blue-900/20 border-2 border-blue-500/50' :
                'border border-gray-700/30'
              }`}>
                <div className={`text-sm mb-1 ${t.textSecondary}`}>{p.name}</div>
                <div className={`text-3xl md:text-5xl font-black tabular-nums ${
                  expired ? 'text-red-400' : isActive ? t.accent : t.textSecondary
                } ${isActive && t.special === 'neon' ? 'neon-text' : ''}`}>
                  {formatTime(timeMs)}
                </div>
                {isActive && <div className="text-xs mt-1 text-blue-400 animate-pulse">● Active</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Layout */}
      {layout === 'leaderboard' && <LeaderboardLayout players={players} t={t} isBestOf={isBestOf} winsNeeded={winsNeeded} />}
      {layout === 'versus' && <VersusLayout players={players} t={t} isBestOf={isBestOf} winsNeeded={winsNeeded} />}
      {layout === 'grid' && <GridLayout players={players} t={t} isBestOf={isBestOf} winsNeeded={winsNeeded} />}

      {/* Watermark */}
      <div className={`absolute bottom-4 text-xs ${t.textSecondary} opacity-50`}>
        Powered by ScoreSnap
      </div>
    </div>
  );
}

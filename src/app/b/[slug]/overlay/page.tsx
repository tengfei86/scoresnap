'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoard, getPlayers, onStorageChange, onBroadcastUpdate } from '@/lib/store';
import { Board, Player } from '@/lib/types';

type OverlayStyle = 'bar' | 'minimal' | 'versus';

function OverlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const style = (searchParams.get('style') || 'bar') as OverlayStyle;
  const position = searchParams.get('position') || 'top'; // top | bottom
  const showName = searchParams.get('name') !== 'false';

  const [board, setBoard] = useState<Board | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const refresh = useCallback(() => {
    const b = getBoard(slug);
    if (b) {
      setBoard(b);
      setPlayers(getPlayers(b.id));
    }
  }, [slug]);

  useEffect(() => {
    refresh();
    const unsub1 = onStorageChange(refresh);
    const unsub2 = onBroadcastUpdate(refresh);
    const interval = setInterval(refresh, 1000);
    return () => { unsub1(); unsub2(); clearInterval(interval); };
  }, [refresh]);

  if (!board || players.length === 0) {
    return <div className="bg-transparent" />;
  }

  const isBestOf = board.scoreMode === 'bestof';
  const bestOfRounds = board.bestOfRounds || 3;
  const winsNeeded = Math.ceil(bestOfRounds / 2);
  const sorted = [...players].sort((a, b) => a.position - b.position);

  // Versus style: two teams side by side (best for 2 players)
  if (style === 'versus' && sorted.length >= 2) {
    const left = sorted[0];
    const right = sorted[1];
    const leftWon = isBestOf && left.score >= winsNeeded;
    const rightWon = isBestOf && right.score >= winsNeeded;

    return (
      <div className={`fixed ${position === 'bottom' ? 'bottom-4' : 'top-4'} left-1/2 -translate-x-1/2 z-50`}>
        <div className="flex items-center gap-0 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Left team */}
          <div className={`flex items-center gap-3 px-5 py-3 ${leftWon ? 'bg-yellow-600/90' : 'bg-blue-600/90'}`}>
            <span className="font-bold text-white text-lg">{left.name}</span>
            {isBestOf && <RoundDots score={left.score} winsNeeded={winsNeeded} />}
            <motion.span key={left.score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-3xl font-black text-white">
              {left.score}
            </motion.span>
          </div>

          {/* Center divider */}
          <div className="bg-gray-900/95 px-3 py-3 text-gray-400 font-bold text-sm">
            {isBestOf ? `BO${bestOfRounds}` : 'VS'}
          </div>

          {/* Right team */}
          <div className={`flex items-center gap-3 px-5 py-3 ${rightWon ? 'bg-yellow-600/90' : 'bg-red-600/90'}`}>
            <motion.span key={right.score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-3xl font-black text-white">
              {right.score}
            </motion.span>
            {isBestOf && <RoundDots score={right.score} winsNeeded={winsNeeded} />}
            <span className="font-bold text-white text-lg">{right.name}</span>
          </div>
        </div>

        {/* Board name */}
        {showName && (
          <div className="text-center mt-1">
            <span className="text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded">{board.name}</span>
          </div>
        )}
      </div>
    );
  }

  // Minimal style: just scores, super compact
  if (style === 'minimal') {
    return (
      <div className={`fixed ${position === 'bottom' ? 'bottom-4' : 'top-4'} left-4 z-50`}>
        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-2xl">
          {showName && <div className="text-xs text-gray-400 mb-1">{board.name}</div>}
          {sorted.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-sm text-white/80 w-24 truncate">{p.name}</span>
              <motion.span key={p.score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-bold text-white ml-auto tabular-nums">
                {p.score}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar style (default): horizontal bar across top/bottom
  return (
    <div className={`fixed ${position === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 z-50`}>
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-4 py-2 shadow-2xl">
        <div className="flex items-center justify-center gap-6 max-w-4xl mx-auto">
          {showName && (
            <span className="text-sm text-gray-400 font-medium shrink-0">{board.name}</span>
          )}
          {isBestOf && (
            <span className="text-xs text-gray-500 shrink-0">BO{bestOfRounds}</span>
          )}
          <AnimatePresence mode="popLayout">
            {sorted.map((p, i) => {
              const isWinner = isBestOf && p.score >= winsNeeded;
              return (
                <motion.div
                  key={p.id}
                  layout
                  className="flex items-center gap-2"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className={`text-sm font-medium truncate max-w-[100px] ${isWinner ? 'text-yellow-300' : 'text-white'}`}>
                    {p.name}
                  </span>
                  {isBestOf && <RoundDots score={p.score} winsNeeded={winsNeeded} />}
                  <motion.span
                    key={p.score}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className={`text-xl font-black tabular-nums ${isWinner ? 'text-yellow-300' : 'text-white'}`}
                  >
                    {p.score}
                  </motion.span>
                  {i < sorted.length - 1 && (
                    <span className="text-gray-600 ml-2">|</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RoundDots({ score, winsNeeded }: { score: number; winsNeeded: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: winsNeeded }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i < score ? 'bg-green-400' : 'bg-gray-600/50'}`}
        />
      ))}
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div />}>
      <OverlayContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getBoard, getPlayers, onStorageChange, onBroadcastUpdate } from '@/lib/store';
import { Board, Player } from '@/lib/types';
import ScoreboardDisplay from '@/components/ScoreboardDisplay';

export default function BoardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [board, setBoard] = useState<Board | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const b = getBoard(slug);
    if (b) {
      setBoard(b);
      setPlayers(getPlayers(b.id));
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    refresh();
    const unsub1 = onStorageChange(refresh);
    const unsub2 = onBroadcastUpdate(refresh);
    // Poll for same-tab updates (control page in another tab)
    const interval = setInterval(refresh, 1000);
    return () => { unsub1(); unsub2(); clearInterval(interval); };
  }, [refresh]);

  if (loading) {
    return (
      <div className="fullscreen-container bg-gray-950 text-white flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="fullscreen-container bg-gray-950 text-white flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-bold">Board not found</h1>
        <p className="text-gray-400">This scoreboard doesn&apos;t exist or has been removed.</p>
        <a href="/" className="text-blue-400 hover:underline">← Create a new one</a>
      </div>
    );
  }

  return <ScoreboardDisplay players={players} layout={board.layout} theme={board.theme} boardName={board.name} scoreMode={board.scoreMode} bestOfRounds={board.bestOfRounds} boardId={board.id} timerDirection={board.timerDirection} timerDuration={board.timerDuration} chessClockTime={board.chessClockTime} />;
}

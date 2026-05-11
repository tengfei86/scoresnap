'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createBoard } from '@/lib/store';
import { templates, matchTemplate, ScoreTemplate } from '@/lib/templates';

export default function HomePage() {
  const router = useRouter();
  const [boardName, setBoardName] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [matched, setMatched] = useState<ScoreTemplate | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScoreTemplate | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-match template as user types board name
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!boardName.trim()) {
      setMatched(null);
      setSelectedTemplate(null);
      setShowPicker(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const m = matchTemplate(boardName);
      setMatched(m);
      if (m) {
        setSelectedTemplate(m);
        setShowPicker(false);
      }
    }, 300);
  }, [boardName]);

  const activeTemplate = selectedTemplate;

  const handleCreate = () => {
    if (!boardName.trim()) return;
    setCreating(true);
    const names = playerInput
      .split(/[,\n]+/)
      .map(n => n.trim())
      .filter(Boolean);
    if (names.length === 0) {
      const count = activeTemplate?.suggestedPlayers ?? 2;
      for (let i = 1; i <= count; i++) names.push(`Player ${i}`);
    }
    const board = createBoard(boardName.trim(), names, activeTemplate ? {
      theme: activeTemplate.theme,
      layout: activeTemplate.layout,
      stepSize: activeTemplate.stepSize,
      scoreMode: activeTemplate.scoreMode,
      startScore: activeTemplate.startScore,
      templateId: activeTemplate.id,
      bestOfRounds: activeTemplate.bestOfRounds,
      chessClockTime: activeTemplate.chessClockTime,
    } : undefined);
    router.push(`/b/${board.slug}/control?token=${board.adminToken}`);
  };

  const handlePickTemplate = (t: ScoreTemplate) => {
    setSelectedTemplate(t);
    setShowPicker(false);
  };

  return (
    <div className="fullscreen-container bg-gray-950 text-white flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            Score<span className="text-blue-400">Snap</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Beautiful scoreboards in seconds. Just describe what you&apos;re playing.
          </p>

          {/* Create Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 md:p-8 text-left max-w-lg mx-auto"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What are you scoring?
            </label>
            <input
              type="text"
              value={boardName}
              onChange={e => setBoardName(e.target.value)}
              placeholder='e.g. "Friday Mahjong", "F1 Season", "Pub Quiz"'
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              onKeyDown={e => e.key === 'Enter' && !showPicker && handleCreate()}
            />

            {/* Template Match Indicator */}
            <AnimatePresence mode="wait">
              {matched && selectedTemplate?.id === matched.id && (
                <motion.div
                  key={matched.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-950/50 border border-blue-800/50 rounded-lg"
                >
                  <span className="text-xl">{matched.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm text-blue-300 font-medium">{matched.name}</span>
                    <span className="text-xs text-blue-400/60 ml-2">auto-detected</span>
                  </div>
                  <button
                    onClick={() => { setShowPicker(true); }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Change
                  </button>
                </motion.div>
              )}
              {!matched && boardName.trim().length > 0 && (
                <motion.div
                  key="no-match"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg"
                >
                  <span className="text-sm text-gray-400">
                    {selectedTemplate
                      ? <><span className="text-xl mr-1">{selectedTemplate.emoji}</span> {selectedTemplate.name}</>
                      : 'No template matched —'}
                  </span>
                  {!selectedTemplate && (
                    <button
                      onClick={() => setShowPicker(true)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      pick one
                    </button>
                  )}
                  {selectedTemplate && (
                    <button
                      onClick={() => setShowPicker(true)}
                      className="text-xs text-gray-400 hover:text-white ml-auto"
                    >
                      Change
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Template Picker */}
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handlePickTemplate(t)}
                        className={`text-left p-3 rounded-xl border transition-colors ${
                          selectedTemplate?.id === t.id
                            ? 'bg-blue-900/50 border-blue-600'
                            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{t.emoji}</div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="block text-sm font-medium text-gray-300 mb-2">
              Players / Teams <span className="text-gray-500">(comma separated)</span>
            </label>
            <input
              type="text"
              value={playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              placeholder={activeTemplate
                ? `e.g. ${activeTemplate.suggestedPlayers} players`
                : 'e.g. Alice, Bob, Charlie'}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />

            <button
              onClick={handleCreate}
              disabled={!boardName.trim() || creating}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-lg"
            >
              {creating ? 'Creating...' : 'Create Scoreboard →'}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Templates showcase */}
      <div className="border-t border-gray-800/50 bg-gray-900/30 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-3 text-gray-300">
            Smart templates for any game
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Just type what you&apos;re playing — we&apos;ll set up the perfect scoreboard
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.slice(0, 8).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => {
                  setSelectedTemplate(t);
                  setBoardName(t.name);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="text-3xl mb-2">{t.emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{t.name}</h3>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm">
        ScoreSnap — Open source & free forever
      </footer>
    </div>
  );
}

import { ThemeName } from './types';

export interface ThemeConfig {
  name: string;
  label: string;
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentGlow?: string;
  border: string;
  scoreBg: string;
  fontClass?: string;
  special?: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  'modern-dark': {
    name: 'modern-dark',
    label: 'Modern Dark',
    bg: 'bg-gray-950',
    cardBg: 'bg-gray-900/80',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    accent: 'text-blue-400',
    border: 'border-gray-800',
    scoreBg: 'bg-gray-800/50',
  },
  neon: {
    name: 'neon',
    label: 'Neon',
    bg: 'bg-black',
    cardBg: 'bg-gray-950/90',
    text: 'text-green-300',
    textSecondary: 'text-green-500/60',
    accent: 'text-pink-400',
    accentGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    border: 'border-green-500/30',
    scoreBg: 'bg-green-950/30',
    special: 'neon',
  },
  chalk: {
    name: 'chalk',
    label: 'Chalk',
    bg: 'bg-[#2a5a3a]',
    cardBg: 'bg-[#1e4a2e]/80',
    text: 'text-[#e8e0c8]',
    textSecondary: 'text-[#b8b0a0]',
    accent: 'text-yellow-200',
    border: 'border-[#3a6a4a]',
    scoreBg: 'bg-[#1a3a2a]/60',
    fontClass: 'font-serif',
  },
  sport: {
    name: 'sport',
    label: 'Sport',
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800/90',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    accent: 'text-orange-400',
    border: 'border-orange-500/30',
    scoreBg: 'bg-orange-950/30',
  },
  clean: {
    name: 'clean',
    label: 'Clean',
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    accent: 'text-indigo-600',
    border: 'border-gray-200',
    scoreBg: 'bg-gray-100',
  },
};

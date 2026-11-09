import React from 'react';
import { playMenuBlip } from '../game/audio';
import { Play, RotateCcw, Home, Sparkles } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenProgression: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  onOpenProgression,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex flex-col items-center justify-center p-4 select-none font-mono text-white">
      <div className="bg-zinc-950 border-2 border-white max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-widest text-pink-400 mb-1">
          PAUSED / ПАУЗА
        </h2>
        <span className="text-xs text-zinc-400 mb-6">Deltarune: Meow Meow Last Chance</span>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              playMenuBlip();
              onResume();
            }}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 border border-white text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Play size={16} />
            ПРОДОЛЖИТЬ [Esc]
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onOpenProgression();
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-400" />
            ПРОГРЕССИЯ И ОРУЖИЕ
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onRestart();
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw size={16} />
            РЕСТАРТ ЗАБЕГА
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onReturnTitle();
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Home size={16} />
            ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

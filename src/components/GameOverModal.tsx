import React, { useEffect } from 'react';
import { RunStats } from '../types/game';
import { playMenuBlip } from '../game/audio';
import { RotateCcw, Home, Sparkles, Skull } from 'lucide-react';

interface GameOverModalProps {
  stats: RunStats;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenProgression: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onReturnTitle,
  onOpenProgression,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        playMenuBlip();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4 select-none font-mono text-white">
      <div className="bg-zinc-950 border-2 border-red-600 max-w-lg w-full p-6 shadow-2xl flex flex-col items-center text-center relative">
        <div className="w-14 h-14 rounded-full border-2 border-red-500 bg-red-950/40 flex items-center justify-center mb-3">
          <Skull size={32} className="text-red-500 animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-red-500">
          GAME OVER
        </h2>
        <p className="text-xs text-zinc-400 mt-1 italic">
          &quot;Mew Mew! Don&apos;t give up, stay determined!&quot;
        </p>

        <div className="w-full bg-red-950/40 border border-red-800/60 p-2.5 my-4 text-xs text-red-300">
          Причина гибели: <strong className="text-white">{stats.causeOfDeath}</strong>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-2">
          <div className="bg-black/80 border border-zinc-800 p-2.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Волна / Wave</span>
            <span className="text-xl font-bold text-pink-400 tabular-nums">
              {stats.wave}
            </span>
          </div>

          <div className="bg-black/80 border border-zinc-800 p-2.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Мышей повержено</span>
            <span className="text-xl font-bold text-cyan-400 tabular-nums">
              {stats.enemiesKilled}
            </span>
          </div>

          <div className="bg-black/80 border border-zinc-800 p-2.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Заработано монет</span>
            <span className="text-xl font-bold text-amber-400 tabular-nums">
              +{stats.coinsEarned} D$
            </span>
          </div>

          <div className="bg-black/80 border border-zinc-800 p-2.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Бомб фетуса</span>
            <span className="text-xl font-bold text-fuchsia-300 tabular-nums">
              {stats.bombsThrown}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-4">
          <button
            data-start="true"
            onClick={() => {
              playMenuBlip();
              onRestart();
            }}
            className="flex-1 w-full py-3 bg-red-700 hover:bg-red-600 border border-white text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer shadow-lg"
          >
            <RotateCcw size={16} />
            ПОПРОБОВАТЬ СНОВА [R / Space]
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onOpenProgression();
            }}
            className="w-full sm:w-auto px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-amber-400 text-amber-300 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer font-bold"
          >
            <Sparkles size={16} />
            Прокачка
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onReturnTitle();
            }}
            className="w-full sm:w-auto px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Home size={16} />
            Меню
          </button>
        </div>
      </div>
    </div>
  );
};

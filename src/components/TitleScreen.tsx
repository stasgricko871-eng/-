import React, { useEffect } from 'react';
import { playMenuBlip } from '../game/audio';
import { Sparkles, Play } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenProgression: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenProgression,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        playMenuBlip();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="fixed inset-0 z-30 bg-[#06040d] flex flex-col justify-between items-center p-6 select-none overflow-hidden text-white font-mono">
      {/* Background Cyber Dark World Grid & Ambient Light */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ff55a3 1px, transparent 1px), linear-gradient(to bottom, #00ffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Banner Tagline */}
      <div className="relative z-10 pt-4 flex items-center gap-2 text-xs sm:text-sm text-pink-400 tracking-widest uppercase">
        <Sparkles size={14} className="animate-spin text-pink-500" />
        <span>DELTARUNE FAN GAME · MEOW MEOW LAST CHANCE</span>
        <Sparkles size={14} className="animate-spin text-cyan-400" />
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center my-auto">
        <svg
          viewBox="0 0 560 115"
          className="w-full max-w-lg h-auto filter drop-shadow-[0_0_20px_rgba(255,85,163,0.5)]"
        >
          <defs>
            <linearGradient id="pinkCatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff55a3" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ff88c2" />
            </linearGradient>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="100%" stopColor="#0088cc" />
            </linearGradient>
          </defs>
          <text
            x="280"
            y="48"
            textAnchor="middle"
            fill="url(#pinkCatGrad)"
            fontFamily="'DotGothic16', monospace"
            fontWeight="bold"
            fontSize="42"
            letterSpacing="6"
          >
            DELTARUNE FAN GAME
          </text>
          <text
            x="280"
            y="95"
            textAnchor="middle"
            fill="url(#cyanGrad)"
            fontFamily="'DotGothic16', monospace"
            fontWeight="bold"
            fontSize="34"
            letterSpacing="8"
          >
            MEOW MEOW LAST CHANCE
          </text>
        </svg>

        {/* Character Showcase: Mad Mew Mew Cat Girl */}
        <div className="flex items-center justify-center gap-8 my-6 py-4 px-6 bg-black/75 border-2 border-fuchsia-900/60 shadow-2xl">
          <div className="flex flex-col items-center">
            <span className="text-3xl animate-bounce">🐱🎀</span>
            <span className="text-xs text-pink-300 mt-1 font-bold">
              MAD MEW MEW (Розовая Кошка)
            </span>
          </div>

          <span className="text-xl text-zinc-600 font-bold">VS</span>

          <div className="flex flex-col items-center">
            <span className="text-3xl animate-pulse">🐭⚡</span>
            <span className="text-xs text-cyan-300 mt-1 font-bold">CH.2 CYBER MAUS</span>
          </div>

          <span className="text-xl text-zinc-600 font-bold">✚</span>

          <div className="flex flex-col items-center">
            <span className="text-3xl animate-pulse">💣💥</span>
            <span className="text-xs text-amber-300 mt-1 font-bold">DR. FETUS BOMBS</span>
          </div>
        </div>

        {/* Core Rules Brief */}
        <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed px-4 py-2.5 border-l-2 border-pink-500 bg-black/60 text-left">
          🐾 <strong>Управление как фетусом из Айзека:</strong> запускай бомбы стрелками или мышью, пинай скользящие бомбы в толпу!
          <br />
          💥 Бомба скользит и взрывается крестом (полоса по горизонтали и вертикали).
          <br />
          ⚠️ <strong>Опасность:</strong> твои собственные бомбы могут ранить тебя!
          <br />
          🌟 <strong>Прогрессия:</strong> прокачивай скорость, урон и радиус за монеты D$, и открывай новое оружие каждые 10 волн!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full justify-center">
          <button
            data-start="true"
            onClick={() => {
              playMenuBlip();
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 border-2 border-white text-white font-bold text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,85,163,0.6)] cursor-pointer"
          >
            <Play size={20} className="fill-white" />
            START / НАЧАТЬ ИГРУ
          </button>

          <button
            onClick={() => {
              playMenuBlip();
              onOpenProgression();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 hover:bg-zinc-900 border-2 border-amber-400 text-amber-300 font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Sparkles size={18} className="text-amber-400" />
            ПРОГРЕССИЯ И ОРУЖИЕ
          </button>
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="relative z-10 text-[11px] sm:text-xs text-zinc-400 tracking-wider text-center">
        WASD — Ходьба · Стрелки / ЛКМ — Стрельба фетусом · Esc / P — Пауза
      </div>
    </div>
  );
};

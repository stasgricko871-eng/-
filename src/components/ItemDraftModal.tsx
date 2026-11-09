import React from 'react';
import { Item } from '../types/game';
import { playMenuBlip } from '../game/audio';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ItemDraftModalProps {
  wave: number;
  options: Item[];
  onSelectItem: (item: Item) => void;
}

export const ItemDraftModal: React.FC<ItemDraftModalProps> = ({
  wave,
  options,
  onSelectItem,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/85 flex flex-col items-center justify-center p-4 select-none">
      {/* Title Lockup */}
      <div className="text-center max-w-lg mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-950/80 border border-pink-500 text-pink-300 text-xs tracking-widest font-mono uppercase mb-2">
          <Sparkles size={14} className="animate-spin text-pink-400" />
          DARK FOUNTAIN BLESSING · WAVE {wave} CLEARED
        </div>
        <h2 className="text-2xl sm:text-3xl text-white font-bold tracking-wider font-mono">
          CHOOSE AN ARTIFACT / ВЫБЕРИТЕ ПРЕДМЕТ
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
          Every 6 waves the Dark World grants you power. Pick one enhancement for your bombs or heroine!
        </p>
      </div>

      {/* 3 Item Upgrade Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {options.map((item, idx) => {
          const rarityBorder =
            item.rarity === 'epic'
              ? 'border-amber-400 shadow-amber-950/50 hover:border-amber-300'
              : item.rarity === 'rare'
              ? 'border-pink-500 shadow-pink-950/50 hover:border-pink-400'
              : 'border-cyan-400 shadow-cyan-950/50 hover:border-cyan-300';

          const rarityBadge =
            item.rarity === 'epic'
              ? 'bg-amber-900/60 text-amber-300 border-amber-500'
              : item.rarity === 'rare'
              ? 'bg-pink-900/60 text-pink-300 border-pink-500'
              : 'bg-cyan-900/60 text-cyan-300 border-cyan-500';

          return (
            <button
              key={item.id || idx}
              onClick={() => {
                playMenuBlip();
                onSelectItem(item);
              }}
              className={`flex flex-col items-center justify-between text-left p-5 bg-black/90 border-2 ${rarityBorder} shadow-2xl transition-all duration-150 hover:-translate-y-1 active:scale-98 cursor-pointer group relative overflow-hidden`}
            >
              {/* Card top banner */}
              <div className="w-full flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 border ${rarityBadge} uppercase font-bold`}
                >
                  {item.rarity}
                </span>
                <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
              </div>

              {/* Icon Centerpiece */}
              <div className="w-16 h-16 border-2 border-white/40 bg-purple-950/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition shadow-inner">
                {item.id === 'cross_amplifier' && '⚡'}
                {item.id === 'cyber_skates' && '⛸️'}
                {item.id === 'dark_candy' && '🍬'}
                {item.id === 'kevlar_ribbon' && '🎀'}
                {item.id === 'double_pocket' && '💣'}
                {item.id === 'quick_fuse' && '⏳'}
                {item.id === 'cheese_decoy' && '🧀'}
                {item.id === 'heart_locket' && '💖'}
                {item.id === 'long_throw' && '🧤'}
                {item.id === 'lingering_plasma' && '✨'}
              </div>

              {/* Title & Russian Name */}
              <div className="w-full text-center mb-2">
                <h3 className="text-lg font-bold text-white font-mono group-hover:text-pink-300 transition">
                  {item.nameRu}
                </h3>
                <span className="text-xs text-zinc-400 font-mono block">
                  {item.name}
                </span>
              </div>

              {/* Description */}
              <div className="w-full bg-zinc-950/70 border border-zinc-800 p-2.5 my-3 text-center">
                <p className="text-xs text-pink-200 font-mono leading-relaxed">
                  {item.descriptionRu}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono mt-1 italic">
                  {item.description}
                </p>
              </div>

              {/* Select CTA */}
              <div className="w-full mt-2 pt-2 border-t border-zinc-800 flex items-center justify-center gap-1.5 text-xs text-white font-mono group-hover:text-cyan-300 transition">
                <span>SELECT / ВЫБРАТЬ</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

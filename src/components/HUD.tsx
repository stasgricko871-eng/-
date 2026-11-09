import React from 'react';
import { Player, Item } from '../types/game';
import { Volume2, VolumeX, Pause, Sparkles } from 'lucide-react';
import { toggleMuted, getMuted, playMenuBlip } from '../game/audio';

interface HUDProps {
  player: Player;
  wave: number;
  miceRemaining: number;
  activeItems: Item[];
  onPause: () => void;
  onOpenProgression: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  wave,
  miceRemaining,
  activeItems,
  onPause,
  onOpenProgression,
}) => {
  const [muted, setLocalMuted] = React.useState(getMuted());

  const handleMuteToggle = () => {
    const next = toggleMuted();
    setLocalMuted(next);
    playMenuBlip();
  };

  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const cooldownPercent = Math.max(
    0,
    Math.min(100, ((player.maxThrowCooldown - player.throwCooldown) / player.maxThrowCooldown) * 100)
  );

  const nextShopIn = 6 - (wave % 6 === 0 ? 0 : wave % 6);
  const nextWeaponIn = 10 - (wave % 10 === 0 ? 0 : wave % 10);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none font-mono">
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full">
        {/* Deltarune Player HP & Mad Mew Mew Name Plate */}
        <div className="flex items-center gap-3 bg-black/90 border-2 border-white px-3 py-1.5 shadow-lg">
          {/* Cat Ear / Soul Heart Icon */}
          <div className="text-pink-500 text-lg animate-pulse font-bold">♥</div>

          {/* Name & LV */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-bold tracking-wider text-sm flex items-center gap-1">
                MEW MEW <span className="text-xs">🐱</span>
              </span>
              <span className="text-zinc-400 text-xs">LV 1</span>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-amber-400 text-xs font-bold">HP</span>
              <div className="w-28 sm:w-36 h-3 bg-red-900 border border-zinc-700 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-white font-mono">
                {Math.max(0, player.hp)}/{player.maxHp}
              </span>
            </div>
          </div>

          {/* Dr. Fetus Bomb Cooldown Meter */}
          <div className="hidden sm:flex flex-col border-l border-zinc-700 pl-3">
            <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              FETUS BOMB
            </span>
            <div className="w-20 h-2 bg-zinc-800 border border-zinc-600 mt-1">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${cooldownPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Wave Counter & Milestone info */}
        <div className="bg-black/90 border-2 border-pink-500 px-4 py-1.5 flex flex-col items-center shadow-lg">
          <div className="text-pink-400 text-xs font-bold tracking-widest">
            WAVE <span className="text-white text-base tabular-nums font-mono">{wave}</span>
          </div>
          <div className="text-[10px] text-zinc-300 font-mono">
            {nextWeaponIn === 0 ? '⚡ WEAPON UNLOCKED!' : `Next Weapon in ${nextWeaponIn} wave(s)`}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
            Maus left: <span className="tabular-nums font-bold text-white">{miceRemaining}</span>
          </div>
        </div>

        {/* Top-Right Utility Cluster */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Progression Upgrades Button */}
          <button
            onClick={() => {
              playMenuBlip();
              onOpenProgression();
            }}
            title="Progression & Weapons"
            aria-label="Open Progression and Weapons"
            tabIndex={-1}
            className="h-8 px-2.5 bg-black/90 border-2 border-amber-400 text-amber-300 hover:bg-amber-950 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md text-xs font-bold"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="hidden sm:inline">ПРОКАЧКА</span>
            <span className="text-white tabular-nums">{player.coinsEarned} D$</span>
          </button>

          {/* Mute Button */}
          <button
            onClick={handleMuteToggle}
            title={muted ? 'Unmute' : 'Mute'}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            tabIndex={-1}
            className="w-8 h-8 bg-black/90 border-2 border-white text-white hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              playMenuBlip();
              onPause();
            }}
            title="Pause Game [Esc / P]"
            aria-label="Pause game"
            tabIndex={-1}
            className="w-8 h-8 bg-black/90 border-2 border-white text-white hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Bottom/Secondary Row: Active Items Shelf (cleanly placed above joystick on mobile) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pointer-events-auto gap-2 mb-28 sm:mb-0">
        <div className="flex items-center gap-1.5 bg-black/90 border border-zinc-700 px-2.5 py-1.5 shadow-lg max-w-full overflow-x-auto">
          <span className="text-[10px] text-zinc-400 font-mono mr-1 uppercase">ITEMS:</span>
          {activeItems.length === 0 ? (
            <span className="text-zinc-500 text-xs italic font-mono">
              Shop in {nextShopIn} wave(s)
            </span>
          ) : (
            activeItems.map((item, idx) => (
              <div
                key={idx}
                title={`${item.nameRu} (${item.name}): ${item.descriptionRu}`}
                className="w-6 h-6 border border-pink-400/60 bg-purple-950/70 flex items-center justify-center text-xs cursor-help hover:scale-110 transition shadow"
              >
                {item.id === 'cross_amplifier' && '⚡'}
                {item.id === 'cyber_skates' && '⛸️'}
                {item.id === 'dark_candy' && '🍬'}
                {item.id === 'kevlar_ribbon' && '🎀'}
                {item.id === 'double_pocket' && '💣'}
                {item.id === 'quick_fuse' && '⏳'}
                {item.id === 'cheese_decoy' && '🧀'}
                {item.id === 'heart_locket' && '💖'}
              </div>
            ))
          )}
        </div>

        {/* Self-Damage Warning hint */}
        <div className="hidden md:block bg-black/85 border border-pink-900/60 px-3 py-1 text-xs text-pink-300 font-mono">
          ⚠️ <span className="text-pink-400 font-bold">Осторожно:</span> бомбы фетуса взрываются крестом и ранят вас!
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  loadProgression,
  upgradeStat,
  selectWeapon,
  calculateUpgradeCost,
  exportProgressionJson,
  importProgressionJson,
  resetProgression,
  ProgressionData,
} from '../progression/progressionManager';
import { playMenuBlip } from '../game/audio';
import { X, Check, Lock, Download, Upload, RotateCcw, Sparkles } from 'lucide-react';

interface ProgressionModalProps {
  onClose: () => void;
  onProgressionUpdated?: () => void;
}

export const ProgressionModal: React.FC<ProgressionModalProps> = ({
  onClose,
  onProgressionUpdated,
}) => {
  const [progression, setProgression] = useState<ProgressionData>(() => loadProgression());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const refreshData = () => {
    const updated = loadProgression();
    setProgression({ ...updated });
    onProgressionUpdated?.();
  };

  const handleUpgrade = (statKey: string) => {
    const success = upgradeStat(statKey);
    if (success) {
      playMenuBlip();
      refreshData();
      showToast('Характеристика успешно улучшена!');
    } else {
      showToast('Недостаточно монет для улучшения!');
    }
  };

  const handleSelectWeapon = (weaponId: string) => {
    const success = selectWeapon(weaponId);
    if (success) {
      playMenuBlip();
      refreshData();
      showToast('Оружие выбрано!');
    }
  };

  const handleExportJson = () => {
    const json = exportProgressionJson();
    navigator.clipboard?.writeText(json);
    showToast('JSON прогрессии скопирован в буфер обмена!');
  };

  const handleImportJson = () => {
    const input = prompt('Вставьте JSON данных прогрессии:');
    if (input) {
      const ok = importProgressionJson(input);
      if (ok) {
        refreshData();
        showToast('Прогрессия успешно загружена из JSON!');
      } else {
        alert('Ошибка импорта JSON');
      }
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить весь прогресс прокачки и оружий?')) {
      resetProgression();
      refreshData();
      showToast('Прогресс сброшен!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 select-none overflow-y-auto font-mono text-white">
      <div className="bg-zinc-950 border-2 border-pink-500 max-w-3xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🐱</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-pink-400 tracking-wider">
                MEOW MEOW LAST CHANCE · ПРОГРЕССИЯ
              </h2>
              <p className="text-xs text-zinc-400">
                Улучшайте характеристики Розовой (Mad Mew Mew) и открывайте оружия каждые 10 волн!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playMenuBlip();
              onClose();
            }}
            aria-label="Close progression"
            className="w-8 h-8 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Currency & Records Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-pink-950/40 border border-pink-900/60 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-amber-400">💰</span>
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Баланс монет:</span>
              <span className="text-lg font-bold text-amber-400 tabular-nums">
                {progression.currency} <span className="text-xs text-zinc-300">D$</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block">Рекорд волны:</span>
              <span className="text-pink-300 font-bold tabular-nums">
                {progression.highestWave}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Мышей повержено:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {progression.totalMiceDefeated}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Core Stat Upgrades */}
        <div>
          <h3 className="text-sm font-bold text-pink-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-pink-400" />
            1. Основные характеристики Розовой
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(progression.statUpgrades).map(([key, stat]) => {
              const cost = calculateUpgradeCost(key);
              const isMax = stat.level >= stat.maxLevel;
              const canAfford = progression.currency >= cost && !isMax;

              return (
                <div
                  key={key}
                  className="bg-black/80 border border-zinc-800 p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{stat.nameRu}</span>
                      <span className="text-xs text-pink-400 font-bold">
                        Ур. {stat.level}/{stat.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-tight mb-2">
                      {stat.descRu}
                    </p>

                    {/* Level Bar Pips */}
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: stat.maxLevel }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-1.5 ${
                            idx < stat.level ? 'bg-pink-500' : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleUpgrade(key)}
                    className={`w-full py-1.5 px-3 text-xs font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                      isMax
                        ? 'border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed'
                        : canAfford
                        ? 'border-pink-500 bg-pink-900/60 hover:bg-pink-800 text-pink-200 active:scale-95'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'МАКС. УРОВЕНЬ' : `Улучшить (${cost} D$)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Weapons & Abilities Unlocked every 10 waves */}
        <div className="mt-2">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span>⚡</span>
            2. Разблокировка оружия (каждые 10 волн)
          </h3>

          <div className="flex flex-col gap-2">
            {progression.weaponMilestones.map((w) => {
              const isSelected = progression.selectedWeapon === w.id;

              return (
                <div
                  key={w.id}
                  className={`p-3 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40'
                      : w.unlocked
                      ? 'border-zinc-700 bg-black/60'
                      : 'border-zinc-800 bg-black/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{w.nameRu}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500 text-black font-bold uppercase">
                            ЭКИПИРОВАНО
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{w.descRu}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!w.unlocked ? (
                      <div className="flex items-center gap-1 text-xs text-amber-400 border border-amber-900/60 bg-amber-950/40 px-2 py-1">
                        <Lock size={12} />
                        Дойдите до {w.waveRequired} волны
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center gap-1 text-xs text-cyan-300 font-bold">
                        <Check size={14} /> Выбрано
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectWeapon(w.id)}
                        className="px-3 py-1 bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-500 text-xs text-cyan-200 font-bold transition active:scale-95 cursor-pointer"
                      >
                        ВЫБРАТЬ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON Management Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Download size={13} />
              Экспорт JSON
            </button>
            <button
              onClick={handleImportJson}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Upload size={13} />
              Импорт JSON
            </button>
          </div>

          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-300 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            Сброс прогрессии
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-pink-950 border-2 border-pink-400 text-pink-200 px-4 py-1.5 text-xs shadow-2xl animate-bounce">
            ✨ {toast}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, InputState, Player, Item, RunStats } from './types/game';
import { createPlayerFromProgression, ARENA_WIDTH, ARENA_HEIGHT } from './game/constants';
import { draftItems } from './game/rules';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { ItemDraftModal } from './components/ItemDraftModal';
import { ProgressionModal } from './components/ProgressionModal';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { toggleMuted, playMenuBlip } from './game/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameKey, setGameKey] = useState<number>(1);
  const [draftWave, setDraftWave] = useState<number>(6);
  const [draftOptions, setDraftOptions] = useState<Item[]>([]);
  const [activeItems, setActiveItems] = useState<Item[]>([]);
  const [gameOverStats, setGameOverStats] = useState<RunStats | null>(null);
  const [isProgressionOpen, setIsProgressionOpen] = useState<boolean>(false);

  // HUD sync state
  const [hudPlayer, setHudPlayer] = useState<Player>(createPlayerFromProgression());
  const [hudWave, setHudWave] = useState<number>(1);
  const [hudMiceRemaining, setHudMiceRemaining] = useState<number>(10);

  // Input state (WASD move + Arrow keys Isaac 4-way shooting + mouse/touch throw)
  const [inputState, setInputState] = useState<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    shootUp: false,
    shootDown: false,
    shootLeft: false,
    shootRight: false,
    throwBomb: false,
    aimX: ARENA_WIDTH / 2,
    aimY: ARENA_HEIGHT / 2 - 80,
  });

  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
    }
  }, []);

  // Keyboard controls: WASD move + Arrow keys Isaac shoot + Space fire
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      // WASD Movement
      if (e.code === 'KeyW') setInputState((prev) => ({ ...prev, up: true }));
      else if (e.code === 'KeyS') setInputState((prev) => ({ ...prev, down: true }));
      else if (e.code === 'KeyA') setInputState((prev) => ({ ...prev, left: true }));
      else if (e.code === 'KeyD') setInputState((prev) => ({ ...prev, right: true }));

      // Isaac 4-Way Shooting (Dr. Fetus)
      else if (e.code === 'ArrowUp') setInputState((prev) => ({ ...prev, shootUp: true }));
      else if (e.code === 'ArrowDown') setInputState((prev) => ({ ...prev, shootDown: true }));
      else if (e.code === 'ArrowLeft') setInputState((prev) => ({ ...prev, shootLeft: true }));
      else if (e.code === 'ArrowRight') setInputState((prev) => ({ ...prev, shootRight: true }));

      // Space / J fire towards mouse
      else if (e.code === 'Space' || e.code === 'KeyJ') {
        setInputState((prev) => ({ ...prev, throwBomb: true }));
      }

      // Pause & Progression
      else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'playing') {
          playMenuBlip();
          setGameState('paused');
        } else if (gameState === 'paused') {
          playMenuBlip();
          setGameState('playing');
        }
      } else if (e.code === 'KeyU') {
        if (gameState === 'playing' || gameState === 'paused' || gameState === 'title') {
          playMenuBlip();
          setIsProgressionOpen(true);
        }
      } else if (e.code === 'KeyM') {
        toggleMuted();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') setInputState((prev) => ({ ...prev, up: false }));
      else if (e.code === 'KeyS') setInputState((prev) => ({ ...prev, down: false }));
      else if (e.code === 'KeyA') setInputState((prev) => ({ ...prev, left: false }));
      else if (e.code === 'KeyD') setInputState((prev) => ({ ...prev, right: false }));

      else if (e.code === 'ArrowUp') setInputState((prev) => ({ ...prev, shootUp: false }));
      else if (e.code === 'ArrowDown') setInputState((prev) => ({ ...prev, shootDown: false }));
      else if (e.code === 'ArrowLeft') setInputState((prev) => ({ ...prev, shootLeft: false }));
      else if (e.code === 'ArrowRight') setInputState((prev) => ({ ...prev, shootRight: false }));

      else if (e.code === 'Space' || e.code === 'KeyJ') {
        setInputState((prev) => ({ ...prev, throwBomb: false }));
      }
    };

    const handleBlur = () => {
      setInputState((prev) => ({
        ...prev,
        up: false,
        down: false,
        left: false,
        right: false,
        shootUp: false,
        shootDown: false,
        shootLeft: false,
        shootRight: false,
        throwBomb: false,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleBlur);
    };
  }, [gameState]);

  // Start game with latest upgraded stats
  const handleStartGame = () => {
    setActiveItems([]);
    setHudPlayer(createPlayerFromProgression());
    setHudWave(1);
    setGameKey((k) => k + 1);
    setGameState('playing');
  };

  const handleWaveCompleteItemDraft = useCallback((wave: number) => {
    setDraftWave(wave);
    const existingIds = activeItems.map((i) => i.id);
    const options = draftItems(3, existingIds);
    setDraftOptions(options);
    setGameState('item_draft');
  }, [activeItems]);

  const handleSelectItem = (item: Item) => {
    item.apply(hudPlayer);
    setActiveItems((prev) => [...prev, item]);
    setGameState('playing');
  };

  const handleGameOver = useCallback((stats: RunStats) => {
    setGameOverStats(stats);
    setGameState('gameover');
  }, []);

  const handleSyncHud = useCallback(
    (player: Player, wave: number, miceRemaining: number) => {
      setHudPlayer(player);
      setHudWave(wave);
      setHudMiceRemaining(miceRemaining);
    },
    []
  );

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative select-none font-mono">
      {/* Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenProgression={() => setIsProgressionOpen(true)}
        />
      )}

      {/* Active Game World */}
      {(gameState === 'playing' ||
        gameState === 'paused' ||
        gameState === 'item_draft' ||
        gameState === 'gameover') && (
        <>
          <GameCanvas
            key={gameKey}
            inputState={inputState}
            onGameOver={handleGameOver}
            onWaveCompleteItemDraft={handleWaveCompleteItemDraft}
            onSyncHud={handleSyncHud}
            activeItemsCount={activeItems.length}
          />

          <HUD
            player={hudPlayer}
            wave={hudWave}
            miceRemaining={hudMiceRemaining}
            activeItems={activeItems}
            onPause={() => setGameState('paused')}
            onOpenProgression={() => setIsProgressionOpen(true)}
          />

          {gameState === 'playing' && (
            <MobileControls onUpdateInput={setInputState} />
          )}
        </>
      )}

      {/* Item Draft Modal (every 6 waves) */}
      {gameState === 'item_draft' && (
        <ItemDraftModal
          wave={draftWave}
          options={draftOptions}
          onSelectItem={handleSelectItem}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={handleStartGame}
          onReturnTitle={() => setGameState('title')}
          onOpenProgression={() => setIsProgressionOpen(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && gameOverStats && (
        <GameOverModal
          stats={gameOverStats}
          onRestart={handleStartGame}
          onReturnTitle={() => setGameState('title')}
          onOpenProgression={() => setIsProgressionOpen(true)}
        />
      )}

      {/* Progression & Weapons Upgrades Modal */}
      {isProgressionOpen && (
        <ProgressionModal
          onClose={() => setIsProgressionOpen(false)}
          onProgressionUpdated={() => setHudPlayer(createPlayerFromProgression())}
        />
      )}
    </main>
  );
}

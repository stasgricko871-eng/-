import React, { useRef, useState, useEffect } from 'react';
import { InputState } from '../types/game';

interface MobileControlsProps {
  onUpdateInput: (updater: (prev: InputState) => InputState) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onUpdateInput }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current === null) return;
    let targetTouch: React.Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        targetTouch = e.changedTouches[i];
        break;
      }
    }
    if (!targetTouch || !joystickBaseRef.current) return;

    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = targetTouch.clientX - centerX;
    const dy = targetTouch.clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    const deadzone = 12;
    const isMoving = dist > deadzone;

    onUpdateInput((prev) => ({
      ...prev,
      up: isMoving && knobY < -10,
      down: isMoving && knobY > 10,
      left: isMoving && knobX < -10,
      right: isMoving && knobX > 10,
    }));
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onUpdateInput((prev) => ({
          ...prev,
          up: false,
          down: false,
          left: false,
          right: false,
        }));
        break;
      }
    }
  };

  // Isaac 4-way shooting button handlers
  const handleShoot = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    onUpdateInput((prev) => ({
      ...prev,
      shootUp: dir === 'up' ? pressed : prev.shootUp,
      shootDown: dir === 'down' ? pressed : prev.shootDown,
      shootLeft: dir === 'left' ? pressed : prev.shootLeft,
      shootRight: dir === 'right' ? pressed : prev.shootRight,
    }));
  };

  const handleBombDown = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onUpdateInput((prev) => ({ ...prev, throwBomb: true }));
  };

  const handleBombUp = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onUpdateInput((prev) => ({ ...prev, throwBomb: false }));
  };

  if (!isTouchDevice) return null;

  return (
    <div className="fixed inset-x-0 bottom-3 z-30 pointer-events-none flex justify-between items-end px-3 pb-2 select-none">
      {/* Left Virtual Joystick for Movement */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        className="w-28 h-28 rounded-full border-2 border-pink-500/50 bg-black/60 pointer-events-auto relative flex items-center justify-center touch-none shadow-lg active:border-pink-400"
      >
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-fuchsia-400 border border-white shadow-md absolute pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <span className="absolute top-1 text-[10px] text-pink-300/60 font-mono">▲</span>
        <span className="absolute bottom-1 text-[10px] text-pink-300/60 font-mono">▼</span>
        <span className="absolute left-1 text-[10px] text-pink-300/60 font-mono">◀</span>
        <span className="absolute right-1 text-[10px] text-pink-300/60 font-mono">▶</span>
      </div>

      {/* Right Isaac 4-way Shooting Pad + Center Bomb Trigger */}
      <div className="relative w-32 h-32 flex items-center justify-center pointer-events-auto touch-none">
        {/* Center Bomb Action */}
        <button
          onTouchStart={handleBombDown}
          onTouchEnd={handleBombUp}
          onMouseDown={handleBombDown}
          onMouseUp={handleBombUp}
          className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-black/85 text-cyan-300 flex items-center justify-center font-bold active:scale-90 transition cursor-pointer shadow-lg z-10"
        >
          <span className="text-xl">💣</span>
        </button>

        {/* Isaac 4-Directional Shoot Buttons */}
        <button
          onTouchStart={() => handleShoot('up', true)}
          onTouchEnd={() => handleShoot('up', false)}
          className="absolute top-0 w-10 h-8 bg-zinc-900/90 border border-pink-500 text-pink-300 text-xs font-bold active:bg-pink-700 flex items-center justify-center cursor-pointer"
        >
          ▲
        </button>

        <button
          onTouchStart={() => handleShoot('down', true)}
          onTouchEnd={() => handleShoot('down', false)}
          className="absolute bottom-0 w-10 h-8 bg-zinc-900/90 border border-pink-500 text-pink-300 text-xs font-bold active:bg-pink-700 flex items-center justify-center cursor-pointer"
        >
          ▼
        </button>

        <button
          onTouchStart={() => handleShoot('left', true)}
          onTouchEnd={() => handleShoot('left', false)}
          className="absolute left-0 w-8 h-10 bg-zinc-900/90 border border-pink-500 text-pink-300 text-xs font-bold active:bg-pink-700 flex items-center justify-center cursor-pointer"
        >
          ◀
        </button>

        <button
          onTouchStart={() => handleShoot('right', true)}
          onTouchEnd={() => handleShoot('right', false)}
          className="absolute right-0 w-8 h-10 bg-zinc-900/90 border border-pink-500 text-pink-300 text-xs font-bold active:bg-pink-700 flex items-center justify-center cursor-pointer"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

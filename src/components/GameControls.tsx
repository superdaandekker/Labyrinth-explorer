import React from 'react';
import { RotateCcw, ChevronsUp, Crosshair, Gamepad2, Navigation } from 'lucide-react';

interface GameControlsProps {
  controlScheme: 'joystick' | 'swipe';
  currentLevel: number;
  startLevel: (level: number) => void;
  jumpCount: number;
  jumpProCount: number;
  useJump: () => void;
  useJumpPro: () => void;
  teleportCount: number;
  useTeleport: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  controlScheme, currentLevel, startLevel,
  jumpCount, jumpProCount, useJump, useJumpPro,
  teleportCount, useTeleport,
}) => (
  <div className="flex flex-col sm:flex-row gap-8 items-center mt-12 w-full max-w-2xl">
    <div className="flex gap-4 flex-wrap justify-center">
      <button
        onClick={() => startLevel(currentLevel)}
        className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400 active:scale-95 flex items-center gap-2 shadow-lg"
      >
        <RotateCcw size={20} />
        <span className="sm:hidden text-sm font-medium uppercase tracking-widest">Reset</span>
      </button>
      <button
        onClick={useJump}
        disabled={jumpCount <= 0}
        className="relative p-4 bg-violet-500/10 border border-violet-400/40 rounded-2xl hover:bg-violet-500/20 transition-all text-violet-400 active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        title="Jump (2 cells in current direction)"
      >
        <ChevronsUp size={20} />
        <span className="text-xs font-black">x{jumpCount}</span>
      </button>
      <button
        onClick={useJumpPro}
        disabled={jumpProCount <= 0}
        className="relative p-4 bg-rose-500/10 border border-rose-400/40 rounded-2xl hover:bg-rose-500/20 transition-all text-rose-400 active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        title="Jump Pro (choose direction)"
      >
        <Crosshair size={20} />
        <span className="text-xs font-black">x{jumpProCount}</span>
      </button>
      <button
        onClick={useTeleport}
        disabled={teleportCount <= 0}
        className="relative p-4 bg-fuchsia-500/10 border border-fuchsia-400/40 rounded-2xl hover:bg-fuchsia-500/20 transition-all text-fuchsia-400 active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        title="Teleport (random cell closer to exit)"
      >
        <Navigation size={20} />
        <span className="text-xs font-black">x{teleportCount}</span>
      </button>
    </div>
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      {controlScheme === 'joystick' && (
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
            <Gamepad2 size={32} className="animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-black">Hold to Move</span>
        </div>
      )}
    </div>
  </div>
);

export default GameControls;

import React from 'react';
import { RotateCcw, ChevronsUp, Crosshair, Gamepad2, Navigation, Shield, Zap, Map, Ghost, Magnet, Snowflake } from 'lucide-react';

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
  powerupInventory: Record<string, number>;
  activatePowerup: (id: string) => void;
}

const TIMED_POWERUPS = [
  { id: 'shield', Icon: Shield, color: 'blue' },
  { id: 'speed', Icon: Zap, color: 'yellow' },
  { id: 'map', Icon: Map, color: 'emerald' },
  { id: 'ghost', Icon: Ghost, color: 'slate' },
  { id: 'magnet', Icon: Magnet, color: 'amber' },
  { id: 'freeze', Icon: Snowflake, color: 'cyan' },
] as const;

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-400/40 text-blue-400 hover:bg-blue-500/20',
  yellow: 'bg-yellow-500/10 border-yellow-400/40 text-yellow-400 hover:bg-yellow-500/20',
  emerald: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/20',
  slate: 'bg-slate-500/10 border-slate-400/40 text-slate-300 hover:bg-slate-500/20',
  amber: 'bg-amber-500/10 border-amber-400/40 text-amber-400 hover:bg-amber-500/20',
  cyan: 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20',
};

const GameControls: React.FC<GameControlsProps> = ({
  controlScheme, currentLevel, startLevel,
  jumpCount, jumpProCount, useJump, useJumpPro,
  teleportCount, useTeleport,
  powerupInventory, activatePowerup,
}) => {
  const timedWithStock = TIMED_POWERUPS.filter(({ id }) => (powerupInventory[id] || 0) > 0);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3 px-1 sm:gap-4 sm:px-3">
      <div className="flex w-full flex-col items-center gap-2.5 sm:gap-3">
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          <button
            onClick={() => startLevel(currentLevel)}
            className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-zinc-400 shadow-lg transition-all active:scale-95 hover:bg-zinc-800 sm:min-h-0 sm:p-4"
          >
            <RotateCcw size={18} className="sm:h-5 sm:w-5" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] sm:hidden">Reset</span>
          </button>

          <button
            onClick={useJump}
            disabled={jumpCount <= 0}
            className="relative flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-violet-400/40 bg-violet-500/10 px-3 py-3 text-violet-400 shadow-lg transition-all active:scale-95 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0 sm:p-4"
            title="Jump (2 cells in current direction)"
          >
            <ChevronsUp size={18} className="sm:h-5 sm:w-5" />
            <span className="text-xs font-black">x{jumpCount}</span>
          </button>

          <button
            onClick={useJumpPro}
            disabled={jumpProCount <= 0}
            className="relative flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-3 py-3 text-rose-400 shadow-lg transition-all active:scale-95 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0 sm:p-4"
            title="Jump Pro (choose direction)"
          >
            <Crosshair size={18} className="sm:h-5 sm:w-5" />
            <span className="text-xs font-black">x{jumpProCount}</span>
          </button>

          <button
            onClick={useTeleport}
            disabled={teleportCount <= 0}
            className="relative flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-3 text-fuchsia-400 shadow-lg transition-all active:scale-95 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0 sm:p-4"
            title="Teleport (random cell closer to exit)"
          >
            <Navigation size={18} className="sm:h-5 sm:w-5" />
            <span className="text-xs font-black">x{teleportCount}</span>
          </button>
        </div>

        {timedWithStock.length > 0 && (
          <div className="grid w-full max-w-sm grid-cols-3 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
            {timedWithStock.map(({ id, Icon, color }) => (
              <button
                key={id}
                onClick={() => activatePowerup(id)}
                className={`relative flex min-h-[2.85rem] items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 shadow-md transition-all active:scale-95 sm:min-h-0 sm:p-3 ${COLOR_MAP[color]}`}
                title={`Activate ${id}`}
              >
                <Icon size={15} className="sm:h-4 sm:w-4" />
                <span className="text-[11px] font-black sm:text-xs">x{powerupInventory[id] || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {controlScheme === 'joystick' && (
        <div className="relative flex h-20 w-full items-center justify-center sm:h-24">
          <div className="flex flex-col items-center gap-1.5 text-zinc-600 sm:gap-2">
            <div className="rounded-full border border-zinc-800/50 bg-zinc-900/50 p-3 sm:p-4">
              <Gamepad2 size={24} className="animate-pulse sm:h-8 sm:w-8" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-widest">Hold to Move</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;

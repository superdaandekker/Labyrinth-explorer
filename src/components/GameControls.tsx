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
  { id: 'speed',  Icon: Zap,    color: 'yellow' },
  { id: 'map',    Icon: Map,    color: 'emerald' },
  { id: 'ghost',  Icon: Ghost,  color: 'slate' },
  { id: 'magnet', Icon: Magnet, color: 'amber' },
  { id: 'freeze', Icon: Snowflake, color: 'cyan' },
] as const;

const COLOR_MAP: Record<string, string> = {
  blue:    'bg-blue-500/10 border-blue-400/40 text-blue-400 hover:bg-blue-500/20',
  yellow:  'bg-yellow-500/10 border-yellow-400/40 text-yellow-400 hover:bg-yellow-500/20',
  emerald: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/20',
  slate:   'bg-slate-500/10 border-slate-400/40 text-slate-300 hover:bg-slate-500/20',
  amber:   'bg-amber-500/10 border-amber-400/40 text-amber-400 hover:bg-amber-500/20',
  cyan:    'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20',
};

const GameControls: React.FC<GameControlsProps> = ({
  controlScheme, currentLevel, startLevel,
  jumpCount, jumpProCount, useJump, useJumpPro,
  teleportCount, useTeleport,
  powerupInventory, activatePowerup,
}) => {
  const timedWithStock = TIMED_POWERUPS.filter(({ id }) => (powerupInventory[id] || 0) > 0);

  return (
    <div className="flex flex-col sm:flex-row gap-8 items-center mt-12 w-full max-w-2xl">
      <div className="flex flex-col gap-3 items-center">
        {/* Main action buttons */}
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

        {/* Timed powerup activate buttons (only shown when in inventory) */}
        {timedWithStock.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {timedWithStock.map(({ id, Icon, color }) => (
              <button
                key={id}
                onClick={() => activatePowerup(id)}
                className={`relative p-3 border rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md ${COLOR_MAP[color]}`}
                title={`Activate ${id}`}
              >
                <Icon size={16} />
                <span className="text-xs font-black">x{powerupInventory[id] || 0}</span>
              </button>
            ))}
          </div>
        )}
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
};

export default GameControls;

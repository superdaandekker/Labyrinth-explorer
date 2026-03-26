import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Settings, Volume2, VolumeX, Zap, Music, Gamepad2 
} from 'lucide-react';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  controlScheme: 'swipe' | 'joystick';
  setControlScheme: (scheme: 'swipe' | 'joystick') => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettings,
  setShowSettings,
  soundEnabled,
  setSoundEnabled,
  sfxVolume,
  setSfxVolume,
  musicVolume,
  setMusicVolume,
  controlScheme,
  setControlScheme,
  onSave
}) => {
  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl mx-4"
          >
            <div className="p-6 sm:p-8 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-zinc-800 rounded-2xl text-zinc-400">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white">SETTINGS</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Master Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Master Sound</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Enable all audio</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                >
                  <motion.div 
                    animate={{ x: soundEnabled ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* SFX Volume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <Zap size={20} />
                    </div>
                    <div className="font-bold text-sm text-white">Sound Effects</div>
                  </div>
                  <span className="font-mono text-xs text-zinc-500">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
                />
              </div>

              {/* Music Volume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <Music size={20} />
                    </div>
                    <div className="font-bold text-sm text-white">Background Music</div>
                  </div>
                  <span className="font-mono text-xs text-zinc-500">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30"
                />
              </div>

              {/* Control Scheme */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <Gamepad2 size={20} />
                  </div>
                  <div className="font-bold text-sm text-white">Control Scheme</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['swipe', 'joystick'] as const).map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => {
                        setControlScheme(scheme);
                        onSave();
                      }}
                      className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                        controlScheme === scheme
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'
                      }`}
                    >
                      {scheme}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-zinc-950 flex justify-center">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full sm:w-auto px-12 py-3 sm:py-4 bg-white text-black font-black italic rounded-2xl hover:scale-105 transition-transform text-sm sm:text-base"
              >
                DONE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

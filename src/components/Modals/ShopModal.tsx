import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingBag, Coins, Zap, Shield, Map, Palette, Sparkles, ChevronsUp, Crosshair,
  Ghost, Magnet, Snowflake, Navigation, Lock
} from 'lucide-react';
import { SkinConfig, SkinType } from '../../types';
import { THEMES, SKINS, POWERUPS } from '../../constants';

interface ShopModalProps {
  showShop: boolean;
  setShowShop: (show: boolean) => void;
  coins: number;
  shopCategory: 'all' | 'themes' | 'skins' | 'powerups' | 'coins';
  setShopCategory: (cat: 'all' | 'themes' | 'skins' | 'powerups' | 'coins') => void;
  shopSort: 'name' | 'price';
  setShopSort: (sort: 'name' | 'price') => void;
  unlockedThemes: string[];
  selectedSkin: SkinType;
  unlockedSkins: SkinType[];
  buyTheme: (themeId: string, price: number) => void;
  buyPowerup: (powerupId: string, price: number) => void;
  buySkin: (skinId: SkinType) => void;
  buyCoins: (amount: number, price: number) => void;
  currentLevel: number;
  powerupInventory: Record<string, number>;
}

const renderSkinPreview = (skin: SkinConfig, skinId: SkinType) => {
  const outline = `1.5px solid ${skin.outlineColor}`;

  if (skinId === 'knight') {
    return (
      <div className="relative w-10 h-10">
        <div className="absolute left-[18%] right-[18%] top-[10%] h-[28%] rounded-[28%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[28%] right-[28%] top-[19%] h-[6%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute left-[17%] right-[17%] top-[42%] h-[25%] rounded-[24%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
      </div>
    );
  }

  if (skinId === 'rogue') {
    return (
      <div className="relative w-10 h-10">
        <div className="absolute left-[20%] right-[20%] top-[10%] h-[30%] rounded-[40%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[28%] right-[28%] top-[22%] h-[8%] rounded-full" style={{ backgroundColor: skin.detailColor }} />
        <div className="absolute left-[22%] right-[22%] top-[42%] h-[28%] rounded-[34%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
      </div>
    );
  }

  if (skinId === 'mech') {
    return (
      <div className="relative w-10 h-10">
        <div className="absolute left-[23%] right-[23%] top-[12%] h-[24%] rounded-[20%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[20%] right-[20%] top-[42%] h-[26%] rounded-[18%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[31%] right-[31%] top-[49%] h-[9%] rounded-md" style={{ backgroundColor: skin.detailColor }} />
      </div>
    );
  }

  if (skinId === 'mage') {
    return (
      <div className="relative w-10 h-10">
        <div className="absolute left-[26%] right-[26%] top-[2%] h-[18%]" style={{ backgroundColor: skin.baseColor, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        <div className="absolute left-[20%] right-[20%] top-[18%] h-[5%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
        <div className="absolute left-[23%] right-[23%] top-[22%] h-[22%] rounded-full" style={{ backgroundColor: skin.baseColor, border: outline }} />
        <div className="absolute left-[17%] right-[17%] top-[44%] h-[32%]" style={{ backgroundColor: skin.baseColor, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10">
      <div className="absolute left-[24%] right-[24%] top-[12%] h-[24%] rounded-full" style={{ backgroundColor: skin.baseColor, border: outline }} />
      <div className="absolute left-[22%] right-[22%] top-[42%] h-[28%] rounded-[34%]" style={{ backgroundColor: skin.baseColor, border: outline }} />
      <div className="absolute left-[18%] right-[18%] top-[49%] h-[6%] rounded-full" style={{ backgroundColor: skin.accentColor }} />
    </div>
  );
};

const ShopModal: React.FC<ShopModalProps> = ({
  showShop,
  setShowShop,
  coins,
  shopCategory,
  setShopCategory,
  shopSort,
  setShopSort,
  unlockedThemes,
  selectedSkin,
  unlockedSkins,
  buyTheme,
  buyPowerup,
  buySkin,
  buyCoins,
  currentLevel,
  powerupInventory,
}) => {
  const sortedThemes = Object.entries(THEMES)
    .filter(([id]) => id !== 'default')
    .sort((a, b) => {
      if (shopSort === 'name') return a[1].label.localeCompare(b[1].label);
      return (a[1].price || 0) - (b[1].price || 0);
    });

  const sortedPowerups = Object.entries(POWERUPS)
    .sort((a, b) => {
      if (shopSort === 'name') return a[1].name.localeCompare(b[1].name);
      return a[1].price - b[1].price;
    });

  const sortedSkins = Object.entries(SKINS)
    .sort((a, b) => {
      if (shopSort === 'name') return a[1].label.localeCompare(b[1].label);
      return a[1].price - b[1].price;
    }) as [SkinType, SkinConfig][];

  return (
    <AnimatePresence>
      {showShop && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden mx-4"
          >
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
            
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white">CRYPTO SHOP</h2>
                  <div className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm font-bold">
                    <Coins size={12} />
                    <span>{coins} COINS</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowShop(false)}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl overflow-x-auto custom-scrollbar no-scrollbar">
                {(['all', 'themes', 'skins', 'powerups', 'coins'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShopCategory(cat)}
                    className={`flex-1 py-2 text-[10px] font-black italic rounded-lg transition-all uppercase tracking-wider ${
                      shopCategory === cat ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {shopCategory !== 'coins' && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Sort By</span>
                  <div className="flex gap-2">
                    {(['name', 'price'] as const).map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setShopSort(sort)}
                        className={`px-3 py-1 text-[10px] font-black italic rounded-md transition-all uppercase ${
                          shopSort === sort ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {(shopCategory === 'all' || shopCategory === 'powerups') && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">Power-Ups</div>
                  <div className="grid gap-3">
                    {sortedPowerups.map(([id, powerup]) => {
                      const isLocked = powerup.unlockedLevel !== undefined && currentLevel < powerup.unlockedLevel;
                      return (
                        <button
                          key={id}
                          onClick={() => !isLocked && buyPowerup(id, powerup.price)}
                          disabled={isLocked || coins < powerup.price}
                          className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800/80 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-zinc-800 text-white group-hover:scale-110 transition-transform">
                              {id === 'shield' && <Shield size={20} className="text-blue-400" />}
                              {id === 'speed' && <Zap size={20} className="text-yellow-400" />}
                              {id === 'map' && <Map size={20} className="text-emerald-400" />}
                              {id === 'jump' && <ChevronsUp size={20} className="text-violet-400" />}
                              {id === 'jumpPro' && <Crosshair size={20} className="text-rose-400" />}
                              {id === 'ghost' && <Ghost size={20} className="text-slate-300" />}
                              {id === 'magnet' && <Magnet size={20} className="text-amber-300" />}
                              {id === 'freeze' && <Snowflake size={20} className="text-cyan-300" />}
                              {id === 'teleport' && <Navigation size={20} className="text-fuchsia-400" />}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white">{powerup.name}</div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                {isLocked ? `Unlocks at level ${powerup.unlockedLevel}` : powerup.description}
                              </div>
                            </div>
                          </div>
                          {isLocked ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-zinc-500">
                              <Lock size={14} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {(powerupInventory[id] || 0) > 0 && (
                                <div className="px-2 py-1 bg-zinc-700/60 rounded-lg text-zinc-300 font-black text-[10px]">
                                  ×{powerupInventory[id]}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg text-amber-500 font-mono font-bold text-sm">
                                <Coins size={14} />
                                {powerup.price}
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(shopCategory === 'all' || shopCategory === 'themes') && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">Themes</div>
                  <div className="grid gap-3">
                    {sortedThemes.map(([id, themeData]) => {
                      const isUnlocked = unlockedThemes.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => !isUnlocked && buyTheme(id, themeData.price || 0)}
                          disabled={!isUnlocked && coins < (themeData.price || 0)}
                          className={`flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all group ${!isUnlocked && coins < (themeData.price || 0) ? 'opacity-50' : 'hover:bg-zinc-800/80'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${themeData.bgClass} border ${themeData.borderClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Palette size={20} className="text-white/50" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white">{themeData.label}</div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Visual Overhaul</div>
                            </div>
                          </div>
                          {isUnlocked ? (
                            <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                              OWNED
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg text-amber-500 font-mono font-bold text-sm">
                              <Coins size={14} />
                              {themeData.price}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(shopCategory === 'all' || shopCategory === 'skins') && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">Skins</div>
                  <div className="grid gap-3">
                    {sortedSkins.map(([id, skin]) => {
                      const isUnlocked = unlockedSkins.includes(id);
                      const isEquipped = selectedSkin === id;
                      return (
                        <button
                          key={id}
                          onClick={() => buySkin(id)}
                          disabled={!isUnlocked && coins < skin.price}
                          className={`flex items-center justify-between p-4 bg-zinc-900/50 border rounded-2xl transition-all group ${
                            isEquipped
                              ? 'border-cyan-400/60 bg-cyan-500/10'
                              : 'border-zinc-800'
                          } ${!isUnlocked && coins < skin.price ? 'opacity-50' : 'hover:bg-zinc-800/80'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: `${skin.baseColor}22`, border: `1px solid ${skin.outlineColor}` }}
                            >
                              {renderSkinPreview(skin, id)}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white">{skin.label}</div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{skin.description}</div>
                            </div>
                          </div>
                          {isEquipped ? (
                            <div className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest text-cyan-300 bg-cyan-500/10">
                              Equipped
                            </div>
                          ) : isUnlocked ? (
                            <div className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10">
                              Equip
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg text-amber-500 font-mono font-bold text-sm">
                              <Coins size={14} />
                              {skin.price}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(shopCategory === 'all' || shopCategory === 'coins') && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">Currency</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { amount: 100, price: 0, label: 'Free Gift', icon: <Sparkles /> },
                      { amount: 500, price: 0, label: 'Starter Pack', icon: <Coins /> }
                    ].map((pack, i) => (
                      <button
                        key={i}
                        onClick={() => buyCoins(pack.amount, pack.price)}
                        className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl hover:border-amber-500/50 transition-all group text-center"
                      >
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 mx-auto mb-3 group-hover:scale-110 transition-transform">
                          {pack.icon}
                        </div>
                        <div className="font-black italic text-white">+{pack.amount}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-3">{pack.label}</div>
                        <div className="py-1.5 bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {pack.price === 0 ? 'CLAIM' : `$${pack.price}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowShop(false)}
              className="mt-8 w-full py-4 bg-zinc-900 text-zinc-500 font-black italic rounded-2xl border border-zinc-800 hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShopModal;

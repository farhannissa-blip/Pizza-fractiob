import React, { useState } from 'react';
import {
  CURRICULUM_CATEGORIES,
  LEVELS,
  WORLDS,
} from '../data/curriculum';
import { PlayerProgress } from '../engine/storageEngine';
import { RestaurantStage25D } from './RestaurantScene';
import { soundEngine } from '../engine/soundEngine';

interface WorldMapViewProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onOpenCurriculum: (categoryId?: number) => void;
  onOpenShop: (tab?: 'shop' | 'achievements' | 'guide') => void;
  onOpenLeaderboard: () => void;
  onOpenMultiplayer: () => void;
  onBackToTitle: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  progress,
  onSelectLevel,
  onOpenCurriculum,
  onOpenShop,
  onOpenLeaderboard,
  onOpenMultiplayer,
  onBackToTitle,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);

  const activeWorld =
    WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
  const worldLevels = LEVELS.filter((l) => l.worldId === selectedWorldId);
  const totalStars = (Object.values(progress.levelStars) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      {/* Header Peta Level & Status Koki */}
      <div className="bg-stone-900 text-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onBackToTitle();
            }}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold border border-stone-600 cursor-pointer"
          >
            ← Menu Utama
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-amber-300">
              Peta Ekspansi Pizza Empire — {progress.identity?.name} (Kelas {progress.identity?.grade})
            </h1>
            <p className="text-xs text-stone-300">
              {progress.identity?.school} · Level Terbuka: {progress.highestLevelUnlocked}/15 · Koleksi Bintang: ★ {totalStars}/45
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-stone-950 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-400 tabular-nums">
            Kasir: ${progress.money} · Skor: {progress.totalScore.toLocaleString('id-ID')}
          </div>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onOpenCurriculum(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
          >
            Pilih Materi (13 Kategori)
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onOpenShop('shop');
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
          >
            Restoran Saya ({progress.purchasedUpgrades.length}/11)
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onOpenMultiplayer();
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
          >
            Kompetisi Kelas
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onOpenLeaderboard();
            }}
            className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-amber-200 text-xs font-bold cursor-pointer"
          >
            🏆 TOP 100
          </button>
        </div>
      </div>

      {/* Visual Restoran 2.5D Saat Ini */}
      <RestaurantStage25D
        purchasedUpgrades={progress.purchasedUpgrades}
        modeHemat={progress.modeHemat}
        compact
      />

      {/* Pemilih 5 Dunia (World 1 - World 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {WORLDS.map((w) => {
          const isSelected = w.id === selectedWorldId;
          return (
            <button
              key={w.id}
              onClick={() => {
                soundEngine.playOrderPop();
                setSelectedWorldId(w.id);
              }}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-900 text-white border-amber-400 shadow-md scale-[1.01]'
                  : 'bg-amber-50/95 hover:bg-white text-stone-900 border-amber-300'
              }`}
            >
              <div className="text-[11px] font-mono font-bold text-amber-400">
                DUNIA {w.id}
              </div>
              <div className="font-display font-bold text-sm leading-tight mt-0.5">
                {w.name.replace(`WORLD ${w.id}: `, '')}
              </div>
              <div
                className={`text-[11px] mt-1 line-clamp-1 ${
                  isSelected ? 'text-amber-200' : 'text-stone-600'
                }`}
              >
                {w.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Dunia & Daftar Level di Dalamnya */}
      <div className="bg-amber-50 rounded-2xl p-4 sm:p-6 border-2 border-amber-700/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div>
            <h2 className="text-xl font-display font-bold text-stone-900">
              {activeWorld.name} — {activeWorld.subtitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 mt-0.5">
              {activeWorld.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeWorld.categories.map((catId) => {
              const cat = CURRICULUM_CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playOrderPop();
                    onOpenCurriculum(cat.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-xs font-bold cursor-pointer"
                >
                  Pelajari Materi {cat.id}: {cat.shortTitle}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kartu-kartu Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldLevels.map((lvl) => {
            const unlocked = lvl.id <= progress.highestLevelUnlocked;
            const stars = progress.levelStars[lvl.id] || 0;
            return (
              <div
                key={lvl.id}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-4 ${
                  unlocked
                    ? 'bg-white border-amber-400 shadow-sm'
                    : 'bg-stone-100 border-stone-300 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-amber-800">
                      LEVEL {lvl.id} · {lvl.difficulty.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-0.5 text-base">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={s <= stars ? 'text-yellow-500' : 'text-stone-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-bold text-stone-900 mt-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">{lvl.subtitle}</p>

                  <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs font-mono text-stone-700 tabular-nums">
                    <span>Target: {lvl.targetOrders} Pelanggan</span>
                    <span>Target Uang: +${lvl.targetMoney}</span>
                  </div>
                </div>

                {unlocked ? (
                  <button
                    onClick={() => {
                      soundEngine.playCustomerArrive();
                      onSelectLevel(lvl.id);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm shadow-sm cursor-pointer active:scale-95"
                  >
                    🍕 Buka Dapur & Mulai Level {lvl.id}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Tetap izinkan latihan langsung atau beri petunjuk jelas
                      soundEngine.playOrderPop();
                      onSelectLevel(progress.highestLevelUnlocked);
                    }}
                    className="w-full py-3 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-xs cursor-pointer"
                  >
                    🔒 Selesaikan Level {lvl.id - 1} Terlebih Dahulu
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

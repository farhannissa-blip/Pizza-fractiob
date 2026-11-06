import React, { useEffect, useMemo, useState } from 'react';
import { LEVELS, LevelConfig } from '../data/curriculum';
import { soundEngine } from '../engine/soundEngine';

interface LevelUpCelebrationProps {
  levelConfig: LevelConfig;
  isCategoryPractice: boolean;
  practiceTitle?: string;
  playerName: string;
  stars: number;
  sessionMoney: number;
  bonusMoney: number;
  sessionScore: number;
  bonusScore: number;
  lives: number;
  maxLives: number;
  modeHemat?: boolean;
  onNextLevel: (nextLevelId: number) => void;
  onReplayCurrentLevel: () => void;
  onOpenShop: () => void;
  onOpenRestaurantTour: () => void;
  onOpenLeaderboard: () => void;
  onBackToMap: () => void;
}

const CONFETTI_COLORS = [
  '#FACC15', // Kuning Emas
  '#10B981', // Hijau Zamrud
  '#F43F5E', // Merah Rose
  '#38BDF8', // Biru Langit
  '#F97316', // Oranye Pizza
  '#A855F7', // Ungu Royal
  '#FDE047', // Kuning Cerah
];

interface ConfettiPiece {
  id: number;
  leftPct: number;
  color: string;
  widthPx: number;
  heightPx: number;
  durationSec: number;
  delaySec: number;
  driftStartPx: number;
  driftEndPx: number;
  rotEndDeg: number;
  isCircle: boolean;
}

interface StarBurstParticle {
  id: number;
  tx: number;
  ty: number;
  rot: number;
  scale: number;
  delaySec: number;
  durationSec: number;
  color: string;
  symbol: 'star' | 'sparkle' | 'pizza' | 'crown';
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  levelConfig,
  isCategoryPractice,
  practiceTitle,
  playerName,
  stars,
  sessionMoney,
  bonusMoney,
  sessionScore,
  bonusScore,
  lives,
  maxLives,
  modeHemat = false,
  onNextLevel,
  onReplayCurrentLevel,
  onOpenShop,
  onOpenRestaurantTour,
  onOpenLeaderboard,
  onBackToMap,
}) => {
  const [burstKey, setBurstKey] = useState<number>(1);
  const [isCheeringActive, setIsCheeringActive] = useState<boolean>(true);

  const nextLevelConfig = LEVELS.find((l) => l.id === levelConfig.id + 1);
  const levelUpXpBonus = stars * 50 + 50; // +100 s/d +200 XP

  // Picu efek suara 'cheering' & 'applause' otomatis saat animasi Level Up muncul di tengah layar
  useEffect(() => {
    soundEngine.playCheerAndApplause();
    setIsCheeringActive(true);

    const t1 = window.setTimeout(() => {
      setBurstKey((prev) => prev + 1);
      soundEngine.playCoin();
    }, 850);

    const t2 = window.setTimeout(() => {
      setIsCheeringActive(false);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Buat partikel hujan confetti di seluruh layar
  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    const count = modeHemat ? 18 : 48;
    return Array.from({ length: count }, (_, idx) => {
      const seed = (idx * 37 + 13) % 100;
      return {
        id: idx,
        leftPct: (idx * (100 / count) + (seed % 7)) % 100,
        color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
        widthPx: idx % 3 === 0 ? 10 : 8,
        heightPx: idx % 2 === 0 ? 18 : 12,
        durationSec: 2.3 + (seed % 18) * 0.1,
        delaySec: (idx % 12) * 0.14,
        driftStartPx: (seed % 30) - 15,
        driftEndPx: ((seed * 3) % 110) - 55,
        rotEndDeg: 540 + (seed % 4) * 180,
        isCircle: idx % 5 === 0,
      };
    });
  }, [modeHemat]);

  // Buat partikel ledakan bintang radial dari titik tengah layar
  const starBurstParticles = useMemo<StarBurstParticle[]>(() => {
    const count = modeHemat ? 10 : 22;
    const symbols: Array<'star' | 'sparkle' | 'pizza' | 'crown'> = [
      'star',
      'star',
      'sparkle',
      'pizza',
      'star',
      'crown',
    ];
    return Array.from({ length: count }, (_, idx) => {
      const angleRad = (idx / count) * Math.PI * 2 + (burstKey % 2) * 0.25;
      const ringRadius = idx % 2 === 0 ? 210 : 145;
      const tx = Math.round(Math.cos(angleRad) * ringRadius);
      const ty = Math.round(Math.sin(angleRad) * ringRadius);
      return {
        id: idx,
        tx,
        ty,
        rot: (idx % 2 === 0 ? 1 : -1) * (180 + idx * 15),
        scale: idx % 3 === 0 ? 1.25 : 0.95,
        delaySec: (idx % 5) * 0.04,
        durationSec: 1.35 + (idx % 4) * 0.12,
        color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
        symbol: symbols[idx % symbols.length],
      };
    });
  }, [modeHemat, burstKey]);

  const triggerManualCelebrationBurst = () => {
    soundEngine.playCheerAndApplause();
    soundEngine.playLevelWin();
    soundEngine.playCoin();
    setBurstKey((prev) => prev + 1);
    setIsCheeringActive(true);
    window.setTimeout(() => setIsCheeringActive(false), 2000);
  };

  const starRankHeadline =
    stars === 3
      ? '🌟 SEMPURNA! GRAND MASTER CHEF PECAHAN!'
      : stars === 2
      ? '⭐ HEBAT! KOKI BINTANG DUA RESTORAN!'
      : '🍕 LEVEL TUNTAS! KOKI MUDA PANTANG MENYERAH!';

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/88 flex items-center justify-center p-3 sm:p-5 overflow-hidden pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Perayaan Level Up"
    >
      {/* =====================================================================
          1. LAPISAN HUJAN CONFETTI PERAYAAN (CONFETTI RAIN)
         ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {confettiPieces.map((c) => (
          <div
            key={c.id}
            className="absolute top-0 animate-confetti-fall"
            style={
              {
                left: `${c.leftPct}%`,
                width: `${c.widthPx}px`,
                height: `${c.isCircle ? c.widthPx : c.heightPx}px`,
                backgroundColor: c.color,
                borderRadius: c.isCircle ? '9999px' : '3px',
                boxShadow: `0 0 8px ${c.color}88`,
                '--dur': `${c.durationSec}s`,
                '--delay': `${c.delaySec}s`,
                '--drift-start': `${c.driftStartPx}px`,
                '--drift-end': `${c.driftEndPx}px`,
                '--rot-end': `${c.rotEndDeg}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* =====================================================================
          2. LAPISAN LEDAKAN BINTANG RADIAL DARI TENGAH LAYAR (STARBURST)
         ===================================================================== */}
      <div
        key={burstKey}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
        aria-hidden="true"
      >
        {starBurstParticles.map((p) => (
          <div
            key={p.id}
            className="absolute -left-4 -top-4 animate-star-burst flex items-center justify-center"
            style={
              {
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                '--rot': `${p.rot}deg`,
                '--dur': `${p.durationSec}s`,
                '--delay': `${p.delaySec}s`,
              } as React.CSSProperties
            }
          >
            {p.symbol === 'star' ? (
              <svg width="34" height="34" viewBox="0 0 36 36">
                <polygon
                  points="18,2 22.9,12.2 34,13.8 25.9,21.6 27.9,32.7 18,27.4 8.1,32.7 10.1,21.6 2,13.8 13.1,12.2"
                  fill={p.color}
                  stroke="#FFFBEB"
                  strokeWidth="2"
                />
              </svg>
            ) : p.symbol === 'sparkle' ? (
              <span className="text-2xl drop-shadow">✨</span>
            ) : p.symbol === 'crown' ? (
              <span className="text-2xl drop-shadow">👑</span>
            ) : (
              <span className="text-2xl drop-shadow">🍕</span>
            )}
          </div>
        ))}
      </div>

      {/* =====================================================================
          3. KARTU UTAMA PERAYAAN "LEVEL UP!" DI TENGAH LAYAR
         ===================================================================== */}
      <div className="relative z-10 max-w-xl w-full animate-level-up-pop">
        {/* Cahaya Sunburst Berputar di Belakang Badge Level Up */}
        {!modeHemat && (
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none opacity-45"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full animate-sunburst-spin"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const deg = i * 30;
                return (
                  <polygon
                    key={i}
                    points="100,100 90,6 110,6"
                    fill="#FACC15"
                    transform={`rotate(${deg} 100 100)`}
                  />
                );
              })}
            </svg>
          </div>
        )}

        <div className="relative bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-amber-50 border-4 border-amber-400 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
          {/* Pita Mahkota "LEVEL UP!" */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 font-display font-bold text-sm sm:text-base shadow-lg border-2 border-white">
              <span>🎉</span>
              <span>
                {isCategoryPractice
                  ? 'LEVEL UP! MATERI DIKUASAI!'
                  : `LEVEL UP! LEVEL ${levelConfig.id} TUNTAS!`}
              </span>
              <span>🎉</span>
            </div>

            <div className="text-xs font-mono font-bold text-emerald-300 mt-2 tracking-wider">
              {isCategoryPractice
                ? `LATIHAN CPA: ${(practiceTitle || '').toUpperCase()}`
                : `${levelConfig.title.toUpperCase()} · ${levelConfig.subtitle.toUpperCase()}`}
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              Luar Biasa, Chef {playerName || 'Muda'}!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-300">
              {starRankHeadline}
            </p>

            {/* Indikator Visual Suara Sorak-Sorai ('Cheering') & Tepuk Tangan ('Applause') */}
            <div
              className={`mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                isCheeringActive
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 animate-bounce'
                  : 'bg-stone-900 border-stone-700 text-amber-200/80'
              }`}
            >
              <span>👏🎺</span>
              <span>
                {isCheeringActive
                  ? 'Sorak-Sorai & Tepuk Tangan Pelanggan Bergema!'
                  : 'Pelanggan Restoran Bertepuk Tangan Meriah!'}
              </span>
              <span>🎉👏</span>
            </div>
          </div>

          {/* 3 Bintang Beranimasi Pop-In Bertahap */}
          <div className="py-2">
            <div className="flex justify-center items-center gap-3 sm:gap-5">
              {[1, 2, 3].map((s) => {
                const earned = s <= stars;
                return (
                  <div
                    key={`${s}_${burstKey}`}
                    style={{ '--delay': `${s * 0.14}s` } as React.CSSProperties}
                    className={`relative animate-star-pop flex flex-col items-center ${
                      s === 2 ? '-translate-y-2 scale-110' : ''
                    }`}
                  >
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-transform ${
                        earned
                          ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-white text-stone-950'
                          : 'bg-stone-800 border-stone-700 text-stone-600'
                      }`}
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 36 36"
                        className={earned ? 'drop-shadow' : 'opacity-35'}
                      >
                        <polygon
                          points="18,2 22.9,12.2 34,13.8 25.9,21.6 27.9,32.7 18,27.4 8.1,32.7 10.1,21.6 2,13.8 13.1,12.2"
                          fill={earned ? '#FFFBEB' : '#57534E'}
                          stroke={earned ? '#92400E' : '#292524'}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold mt-1 ${
                        earned ? 'text-yellow-300' : 'text-stone-500'
                      }`}
                    >
                      {earned ? `★ BINTANG ${s}` : `☆ BINTANG ${s}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Hadiah Level Up (Uang Kasir, Bonus Bintang, XP, & Skor) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left bg-stone-900/95 p-3.5 rounded-2xl border border-amber-500/40 font-mono text-xs tabular-nums">
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-emerald-500/30">
              <div className="text-[11px] text-stone-400 font-sans">Pendapatan Saji:</div>
              <div className="font-bold text-emerald-400 text-sm sm:text-base">
                +${sessionMoney}
              </div>
            </div>
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-yellow-500/30">
              <div className="text-[11px] text-stone-400 font-sans">Bonus {stars} Bintang:</div>
              <div className="font-bold text-yellow-300 text-sm sm:text-base">
                +${bonusMoney}
              </div>
            </div>
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-sky-500/30">
              <div className="text-[11px] text-stone-400 font-sans">Bonus Level Up:</div>
              <div className="font-bold text-sky-300 text-sm sm:text-base">
                +{levelUpXpBonus} XP
              </div>
            </div>
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-amber-500/30">
              <div className="text-[11px] text-stone-400 font-sans">Total Skor Sesi:</div>
              <div className="font-bold text-amber-300 text-sm sm:text-base">
                +{sessionScore + bonusScore} pts
              </div>
            </div>
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-rose-500/30">
              <div className="text-[11px] text-stone-400 font-sans">Sisa Nyawa Koki:</div>
              <div className="font-bold text-rose-400 text-sm sm:text-base">
                ❤️ {lives} / {maxLives}
              </div>
            </div>
            <div className="bg-stone-950/90 p-2.5 rounded-xl border border-purple-500/30 flex items-center justify-center">
              <button
                type="button"
                onClick={triggerManualCelebrationBurst}
                className="w-full h-full py-1 px-2 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/50 text-purple-200 font-sans font-bold text-[11px] cursor-pointer active:scale-95"
              >
                👏🎆 Sorak & Bintang Lagi!
              </button>
            </div>
          </div>

          {/* Info Level Berikutnya yang Terbuka */}
          {!isCategoryPractice && nextLevelConfig && (
            <div className="bg-emerald-950/80 border border-emerald-400/50 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-left">
              <div>
                <div className="text-[10px] font-mono font-bold text-emerald-300">
                  🔓 LEVEL BARU TERBUKA!
                </div>
                <div className="text-xs sm:text-sm font-display font-bold text-white">
                  {nextLevelConfig.title}: {nextLevelConfig.subtitle}
                </div>
              </div>
              <span className="text-xl">🚀</span>
            </div>
          )}

          {/* Tombol Navigasi Utama Perayaan Level Up */}
          <div className="space-y-2 pt-1">
            {!isCategoryPractice && nextLevelConfig ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCustomerArrive();
                  onNextLevel(nextLevelConfig.id);
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-display font-bold text-base sm:text-lg shadow-xl cursor-pointer transition-transform active:scale-95"
              >
                🚀 Lanjut ke {nextLevelConfig.title} Sekarang →
              </button>
            ) : (
              <button
                type="button"
                onClick={onReplayCurrentLevel}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-display font-bold text-base shadow-xl cursor-pointer transition-transform active:scale-95"
              >
                🔄 Mainkan Lagi untuk Skor Lebih Tinggi!
              </button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenShop();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
              >
                🏪 Upgrade Restoran
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenRestaurantTour();
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
              >
                🏛️ Restoran 3D
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenLeaderboard();
                }}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer"
              >
                🏆 TOP 100
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playOrderPop();
                  onBackToMap();
                }}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs cursor-pointer"
              >
                🗺️ Peta Level
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  PizzaToppingId,
  RESTAURANT_UPGRADES,
  RestaurantUpgrade,
  TOPPINGS,
} from './data/curriculum';
import {
  DailyMissionTemplate,
  PlayerIdentity,
  PlayerProgress,
  generatePlayerId,
  getDailyMissionTemplate,
  loadProgress,
  saveProgress,
  submitBestScoreToLeaderboard,
} from './engine/storageEngine';
import { soundEngine } from './engine/soundEngine';
import { SinglePizza25D } from './components/Pizza25D';
import {
  Camera3DPreset,
  Gameplay3DTableState,
  Pizzeria3DBackground,
} from './components/Pizzeria3DBackground';
import { WorldMapView } from './components/WorldMapView';
import { GameplayArena, ToppingIllustrationSVG } from './components/GameplayArena';
import { CurriculumModal } from './components/CurriculumModal';
import { RestaurantShopModal } from './components/RestaurantShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ClassroomMultiplayerModal } from './components/ClassroomMultiplayerModal';
import { DailyMissionModal } from './components/DailyMissionModal';

type ScreenState = 'TITLE_MENU' | 'WORLD_MAP' | 'PLAYING';
type FrontMenuPage = 1 | 2 | 3;

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [screen, setScreen] = useState<ScreenState>('TITLE_MENU');
  const [frontPage, setFrontPage] = useState<FrontMenuPage>(1);

  // Mode Tur Kamera Restoran 3D Elegan
  const [restaurantTourMode, setRestaurantTourMode] = useState<boolean>(false);
  const [tourCameraAngle, setTourCameraAngle] = useState<
    'restaurant_tour' | 'tour_counter' | 'tour_oven' | 'tour_vip'
  >('restaurant_tour');
  const [recentUpgradeKey, setRecentUpgradeKey] = useState<number>(0);

  // Form Identitas Pemain (Bagian 12)
  const [playerName, setPlayerName] = useState<string>(
    progress.identity?.name || ''
  );
  const [playerSchool, setPlayerSchool] = useState<string>(
    progress.identity?.school || 'SDN 66 Banda Aceh'
  );
  const [playerGrade, setPlayerGrade] = useState<number>(
    progress.identity?.grade || 0
  );
  const [formError, setFormError] = useState<string>('');

  // State Level & Latihan Materi Aktif
  const [activeLevelId, setActiveLevelId] = useState<number>(
    progress.highestLevelUnlocked || 1
  );
  const [practiceCategoryId, setPracticeCategoryId] = useState<number | null>(
    null
  );

  // Modal Navigasi
  const [curriculumModalCat, setCurriculumModalCat] = useState<number | null>(
    null
  );
  const [shopModalTab, setShopModalTab] = useState<
    'shop' | 'achievements' | 'guide' | null
  >(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showMultiplayer, setShowMultiplayer] = useState<boolean>(false);
  const [showDailyMission, setShowDailyMission] = useState<boolean>(false);

  // Audio & Showcase Pizza Mewah di Halaman 1
  const [sfxOn, setSfxOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(false);
  const [heroPizzaSlices, setHeroPizzaSlices] = useState<number>(3);
  const [heroPizzaDenom, setHeroPizzaDenom] = useState<number>(4);
  const [heroTopping, setHeroTopping] = useState<PizzaToppingId>('pepperoni');
  const [heroToppingBurst, setHeroToppingBurst] = useState<number>(1);
  const [gameplayTableState, setGameplayTableState] =
    useState<Gameplay3DTableState | null>(null);

  const [sessionId] = useState<string>(
    () => `sess_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  );

  // Simpan setiap perubahan progress ke LocalStorage
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Hitung waktu bermain aktif
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    const t = window.setInterval(() => {
      setProgress((prev) => ({
        ...prev,
        totalPlayTimeSeconds: prev.totalPlayTimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  const validateAndSaveIdentity = (): PlayerIdentity | null => {
    const trimmedName = playerName.trim();
    const trimmedSchool = playerSchool.trim();
    if (!trimmedName || !trimmedSchool || playerGrade < 1 || playerGrade > 6) {
      setFormError(
        'Silakan lengkapi Nama Pemain, Asal Sekolah, dan Pilih Kelas (1–6) terlebih dahulu.'
      );
      setFrontPage(2);
      setRestaurantTourMode(false);
      soundEngine.playWrong();
      return null;
    }
    setFormError('');
    const playerId = generatePlayerId(trimmedName, trimmedSchool, playerGrade);
    const identity: PlayerIdentity = {
      playerId,
      name: trimmedName,
      school: trimmedSchool,
      grade: playerGrade,
    };
    setProgress((prev) => ({
      ...prev,
      identity,
    }));
    return identity;
  };

  const handleStartGame = (continueSaved = false) => {
    const id = validateAndSaveIdentity();
    if (!id) return;

    soundEngine.playCustomerArrive();
    setRestaurantTourMode(false);
    if (continueSaved) {
      setActiveLevelId(progress.highestLevelUnlocked || 1);
      setPracticeCategoryId(null);
      setScreen('PLAYING');
    } else {
      setScreen('WORLD_MAP');
    }
  };

  const handleOpenCategoryOrMenu = (callback: () => void) => {
    if (!progress.identity) {
      const trimmedName = playerName.trim() || 'Chef Muda';
      const trimmedSchool = playerSchool.trim() || 'SDN 66 Banda Aceh';
      const validGrade = playerGrade >= 1 && playerGrade <= 6 ? playerGrade : 5;
      const identity: PlayerIdentity = {
        playerId: generatePlayerId(trimmedName, trimmedSchool, validGrade),
        name: trimmedName,
        school: trimmedSchool,
        grade: validGrade,
      };
      setProgress((prev) => ({ ...prev, identity }));
    }
    callback();
  };

  const handleCompleteOrder = (result: {
    earnedMoney: number;
    earnedScore: number;
    wasFirstTryCorrect: boolean;
    categoryId: number;
  }) => {
    setProgress((prev) => {
      const newScore = prev.totalScore + result.earnedScore;
      const newMoney = prev.money + result.earnedMoney;
      const newXp = (prev.xp || 0) + 25;
      const newServed = prev.customersServed + 1;
      const newTotalQ = prev.totalQuestions + 1;
      const newCorrect =
        prev.correctAnswers + (result.wasFirstTryCorrect ? 1 : 0);
      const newWrong = prev.wrongAnswers + (result.wasFirstTryCorrect ? 0 : 1);

      // Update progres Misi Harian (Daily Mission) jika kategori soal sesuai
      const missionTemplate = getDailyMissionTemplate(prev.dailyMission.missionId);
      const matchesMissionCategory =
        missionTemplate.targetCategories.length === 0 ||
        missionTemplate.targetCategories.includes(result.categoryId);

      const nextMissionCount = matchesMissionCategory
        ? Math.min(prev.dailyMission.targetCount, prev.dailyMission.currentCount + 1)
        : prev.dailyMission.currentCount;

      const updated: PlayerProgress = {
        ...prev,
        money: newMoney,
        xp: newXp,
        totalScore: newScore,
        customersServed: newServed,
        totalQuestions: newTotalQ,
        correctAnswers: newCorrect,
        wrongAnswers: newWrong,
        dailyMission: {
          ...prev.dailyMission,
          currentCount: nextMissionCount,
        },
      };

      if (updated.identity) {
        submitBestScoreToLeaderboard(updated, sessionId);
      }

      return updated;
    });
  };

  const handleClaimChefsReward = () => {
    setProgress((prev) => {
      if (
        prev.dailyMission.claimed ||
        prev.dailyMission.currentCount < prev.dailyMission.targetCount
      ) {
        return prev;
      }
      const tmpl = getDailyMissionTemplate(prev.dailyMission.missionId);
      const streakDays = Math.max(1, prev.dailyMission.loginStreakDays || 1);
      const streakBonusMoney = Math.min(streakDays - 1, 7) * 5;
      const streakBonusXp = Math.min(streakDays - 1, 7) * 50;
      const totalRewardMoney = tmpl.rewardMoney + streakBonusMoney;
      const totalRewardXp = tmpl.rewardXp + streakBonusXp;

      const updated: PlayerProgress = {
        ...prev,
        money: prev.money + totalRewardMoney,
        xp: (prev.xp || 0) + totalRewardXp,
        totalScore: prev.totalScore + totalRewardXp,
        dailyMission: {
          ...prev.dailyMission,
          claimed: true,
          completedMissionsCount: prev.dailyMission.completedMissionsCount + 1,
        },
      };

      if (updated.identity) {
        submitBestScoreToLeaderboard(updated, sessionId);
      }

      return updated;
    });
  };

  const handleSelectMissionTemplate = (mission: DailyMissionTemplate) => {
    setProgress((prev) => ({
      ...prev,
      dailyMission: {
        ...prev.dailyMission,
        missionId: mission.id,
        targetCount: mission.targetCount,
        currentCount: Math.min(prev.dailyMission.currentCount, mission.targetCount),
      },
    }));
  };

  const handleCompleteLevel = (result: {
    levelId: number;
    stars: number;
    bonusMoney: number;
    bonusScore: number;
    categoryId?: number;
  }) => {
    setProgress((prev) => {
      const prevStars = prev.levelStars[result.levelId] || 0;
      const bestStars = Math.max(prevStars, result.stars);
      const nextUnlocked = Math.min(
        15,
        Math.max(prev.highestLevelUnlocked, result.levelId + 1)
      );
      const levelUpXp = result.stars * 50 + 50;
      const newXp = (prev.xp || 0) + levelUpXp;
      const newScore = prev.totalScore + result.bonusScore;
      const newMoney = prev.money + result.bonusMoney;

      const mastered = new Set(prev.masteredCategories);
      if (result.categoryId) {
        mastered.add(result.categoryId);
      }

      const updated: PlayerProgress = {
        ...prev,
        money: newMoney,
        xp: newXp,
        totalScore: newScore,
        highestLevelUnlocked: nextUnlocked,
        levelStars: {
          ...prev.levelStars,
          [result.levelId]: bestStars,
        },
        masteredCategories: Array.from(mastered),
      };

      if (updated.identity) {
        submitBestScoreToLeaderboard(updated, sessionId);
      }

      return updated;
    });
    // Trigger ledakan partikel 3D di restoran saat Level Up
    setRecentUpgradeKey((prev) => prev + 1);
  };

  const handleBuyUpgrade = (upgrade: RestaurantUpgrade) => {
    setProgress((prev) => {
      if (
        prev.money < upgrade.price ||
        prev.purchasedUpgrades.includes(upgrade.id)
      ) {
        return prev;
      }
      return {
        ...prev,
        money: prev.money - upgrade.price,
        purchasedUpgrades: [...prev.purchasedUpgrades, upgrade.id],
      };
    });
    setRecentUpgradeKey((prev) => prev + 1);
  };

  const openElegantRestaurantTour = () => {
    soundEngine.playUpgrade();
    setShopModalTab(null);
    setCurriculumModalCat(null);
    setShowLeaderboard(false);
    setShowMultiplayer(false);
    setTourCameraAngle('restaurant_tour');
    setRestaurantTourMode(true);
  };

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    soundEngine.setSfxEnabled(next);
    if (next) soundEngine.playOrderPop();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    soundEngine.setMusicEnabled(next);
  };

  const toggleModeHemat = () => {
    soundEngine.playOrderPop();
    setProgress((prev) => ({
      ...prev,
      modeHemat: !prev.modeHemat,
    }));
  };

  const cameraPreset: Camera3DPreset = restaurantTourMode
    ? tourCameraAngle
    : screen !== 'TITLE_MENU'
    ? 'gameplay'
    : frontPage === 1
    ? 'title'
    : frontPage === 2
    ? 'form'
    : 'menu';

  const totalTipBonus = RESTAURANT_UPGRADES.filter((u) =>
    progress.purchasedUpgrades.includes(u.id)
  ).reduce((acc, u) => acc + u.tipBonus, 0);

  return (
    <div
      className={`relative min-h-screen text-stone-900 flex flex-col justify-between overflow-x-hidden ${
        progress.modeHemat ? 'mode-hemat' : ''
      }`}
    >
      {/* BACKGROUND 3D RESTORAN PIZZA DENGAN ANIMASI PELANGGAN, MEJA SAJI 3D, & 11 UPGRADE RESTORAN */}
      <Pizzeria3DBackground
        purchasedUpgrades={progress.purchasedUpgrades}
        modeHemat={progress.modeHemat}
        cameraPreset={cameraPreset}
        recentUpgradeKey={recentUpgradeKey}
        gameplayTableState={
          screen === 'PLAYING' && !restaurantTourMode
            ? gameplayTableState
            : {
                pizzas: [
                  {
                    totalSlices: heroPizzaDenom,
                    activeSlices: heroPizzaSlices,
                  },
                ],
                topping: heroTopping,
                servingState: 'preparing',
                customerType: 'kid',
                toppingBurstKey: heroToppingBurst,
              }
        }
      />

      {/* TOP BAR CONTRACT: 3 ZONES (Brand Wordmark — Structured Nav — Quick Actions) */}
      <header className="relative z-20 bg-stone-950/95 border-b border-amber-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            soundEngine.playOrderPop();
            setRestaurantTourMode(false);
            setScreen('TITLE_MENU');
            setFrontPage(1);
          }}
          className="text-sm sm:text-lg font-display font-bold text-amber-300 tracking-wide whitespace-nowrap shrink-0 cursor-pointer text-left flex items-center gap-2"
        >
          <span>🍕 PIZZA FRACTION FRENZY 3D</span>
          <span className="hidden xl:inline-block text-[11px] font-sans font-semibold bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/30">
            SDN 66 Banda Aceh
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-amber-100">
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              setRestaurantTourMode(false);
              setScreen('TITLE_MENU');
              setFrontPage(1);
            }}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer ${
              screen === 'TITLE_MENU' && frontPage === 1 && !restaurantTourMode
                ? 'text-amber-400 underline underline-offset-4 font-bold'
                : ''
            }`}
          >
            Hal 1: Beranda & Pizza 3D
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              setRestaurantTourMode(false);
              setScreen('TITLE_MENU');
              setFrontPage(2);
            }}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer ${
              screen === 'TITLE_MENU' && frontPage === 2 && !restaurantTourMode
                ? 'text-amber-400 underline underline-offset-4 font-bold'
                : ''
            }`}
          >
            Hal 2: Identitas Koki
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              setRestaurantTourMode(false);
              setScreen('TITLE_MENU');
              setFrontPage(3);
            }}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer ${
              screen === 'TITLE_MENU' && frontPage === 3 && !restaurantTourMode
                ? 'text-amber-400 underline underline-offset-4 font-bold'
                : ''
            }`}
          >
            Hal 3: Menu Pilihan (7)
          </button>
          <button
            onClick={openElegantRestaurantTour}
            className={`px-3 py-1 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
              restaurantTourMode
                ? 'bg-emerald-500 text-stone-950 border-emerald-300 font-bold'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
            }`}
          >
            🏛️ Tampilan Restoran 3D ({progress.purchasedUpgrades.length}/11)
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              handleOpenCategoryOrMenu(() => setShopModalTab('shop'));
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            🏪 Upgrade Restoran
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={openElegantRestaurantTour}
            className="lg:hidden px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white cursor-pointer whitespace-nowrap"
          >
            🏛️ Restoran 3D
          </button>
          <button
            onClick={toggleSfx}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
              sfxOn
                ? 'bg-stone-800 text-amber-200 border-amber-500/40'
                : 'bg-stone-900 text-stone-500 border-stone-700'
            }`}
          >
            SFX: {sfxOn ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={toggleMusic}
            className={`hidden sm:inline-block px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
              musicOn
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-800 text-amber-200 border-amber-500/40'
            }`}
          >
            Musik: {musicOn ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={toggleModeHemat}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
              progress.modeHemat
                ? 'bg-emerald-700 text-white border-emerald-400'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}
            title="Mode Ringan untuk Perangkat Spesifikasi Rendah"
          >
            {progress.modeHemat ? '⚡ Ringan' : '✨ 3D HD'}
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              setShowDailyMission(true);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
              progress.dailyMission.currentCount >= progress.dailyMission.targetCount &&
              !progress.dailyMission.claimed
                ? 'bg-emerald-500 text-stone-950 border-emerald-300 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30'
            }`}
          >
            🎯 Misi ({progress.dailyMission.currentCount}/{progress.dailyMission.targetCount})
          </button>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              setShowLeaderboard(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer whitespace-nowrap"
          >
            🏆 TOP 100
          </button>
        </div>
      </header>

      {/* =====================================================================
          MODE TUR TAMPILAN RESTORAN 3D ELEGAN (SAAT TOMBOL RESTORAN 3D DIKLIK)
         ===================================================================== */}
      {restaurantTourMode ? (
        <main className="relative z-10 flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto px-4 sm:px-6 pt-3 pb-14 sm:pb-10 pointer-events-none">
          {/* Header Informasi Upgrade Restoran 3D di Atas */}
          <div className="bg-stone-950/90 text-amber-50 px-4 sm:px-5 py-3 rounded-2xl border-2 border-amber-500/60 shadow-2xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
            <div>
              <div className="text-xs font-bold text-emerald-400 tracking-wider">
                ✨ MODE TUR ELEGAN INTERIOR RESTORAN 3D — SDN 66 BANDA ACEH
              </div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                Restoran Pizza Empire Anda ({progress.purchasedUpgrades.length} dari 11 Upgrade Terpasang)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/40 text-xs font-mono text-amber-300">
                Kasir: <strong>${progress.money}</strong> · Bonus Tip: <strong>+${totalTipBonus}/pesanan</strong>
              </span>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  setRestaurantTourMode(false);
                  handleOpenCategoryOrMenu(() => setShopModalTab('shop'));
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs shadow cursor-pointer"
              >
                🏪 Beli Upgrade Baru
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  setRestaurantTourMode(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs shadow cursor-pointer"
              >
                ✕ Tutup Tampilan Restoran
              </button>
            </div>
          </div>

          {/* Tengah Layar 100% Terbuka Agar Animasi Restoran 3D & Upgrade Terlihat Jelas */}
          <div className="my-auto" />

          {/* Dock Bawah Pemilih Sudut Kamera Elegan & Daftar Upgrade Aktif (Aman dari Tombol Bawah HP) */}
          <div className="bg-stone-950/92 text-amber-50 p-3.5 sm:p-4 rounded-2xl border-2 border-amber-500/60 shadow-2xl space-y-3 pointer-events-auto mb-4 sm:mb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300">
                🎥 Pilih Sudut Kamera Animasi Restoran 3D:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'restaurant_tour', label: '🔄 Kamera Keliling Otomatis' },
                  { id: 'tour_counter', label: '🍕 Meja Saji & Loyang 3D' },
                  { id: 'tour_oven', label: '🔥 Oven Batu Api & Dapur' },
                  { id: 'tour_vip', label: '👑 Area VIP & Plakat SDN 66' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setTourCameraAngle(cam.id as typeof tourCameraAngle);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      tourCameraAngle === cam.id
                        ? 'bg-emerald-500 text-stone-950 shadow'
                        : 'bg-stone-800 text-amber-100 hover:bg-stone-700'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daftar Singkat Status 11 Upgrade Restoran */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-stone-800">
              {RESTAURANT_UPGRADES.map((up) => {
                const owned = progress.purchasedUpgrades.includes(up.id);
                return (
                  <span
                    key={up.id}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border ${
                      owned
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-stone-900 text-stone-500 border-stone-800'
                    }`}
                  >
                    {owned ? '✓ ' : '🔒 '}
                    {up.name}
                  </span>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        /* ===================================================================
           MAIN CONTENT OVER 3D VIEWPORT (HALAMAN 1-3, PETA LEVEL, GAMEPLAY)
           =================================================================== */
        <main className="relative z-10 flex-1 flex flex-col justify-between">
          {screen === 'TITLE_MENU' && (
            <div className="flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto px-3 sm:px-6 pt-3 pb-12 sm:pb-6">
              {/* STEPPER BAR TERSTRUKTUR (Halaman 1 -> Halaman 2 -> Halaman 3 + Tombol Lihat Restoran 3D) */}
              <div className="bg-stone-950/92 border border-amber-500/50 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2">
                <div className="grid grid-cols-3 gap-1.5 flex-1 min-w-[280px]">
                  {[
                    { page: 1 as FrontMenuPage, step: 'HALAMAN 1', title: 'Showcase & Pizza 3D' },
                    { page: 2 as FrontMenuPage, step: 'HALAMAN 2', title: 'Identitas Koki Muda' },
                    { page: 3 as FrontMenuPage, step: 'HALAMAN 3', title: '7 Menu Permainan' },
                  ].map((item) => {
                    const active = frontPage === item.page;
                    return (
                      <button
                        key={item.page}
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setFrontPage(item.page);
                        }}
                        className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                          active
                            ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md'
                            : 'bg-stone-900/90 text-amber-100 border-stone-800 hover:bg-stone-800'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-mono font-bold ${
                            active ? 'text-stone-900' : 'text-amber-400'
                          }`}
                        >
                          {item.step}
                        </div>
                        <div className="text-xs sm:text-sm font-display font-bold truncate">
                          {item.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Tombol Elegan Menuju Tampilan Restoran 3D */}
                <button
                  onClick={openElegantRestaurantTour}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs sm:text-sm border border-emerald-300/50 shadow-lg cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                >
                  🏛️ Lihat Restoran 3D ({progress.purchasedUpgrades.length}/11)
                </button>
              </div>

              {/* ===============================================================
                  ISI HALAMAN 1, 2, DAN 3 YANG RAPI & TERSTRUKTUR
                 =============================================================== */}
              <div className="my-auto py-3">
                {/* -------------------------------------------------------------
                    HALAMAN 1: BERANDA UTAMA & SIMULASI PIZZA GOURMET 3D
                   ------------------------------------------------------------- */}
                {frontPage === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                    {/* Kolom Kiri (7 Kolom): Informasi Terstruktur & Navigasi Utama */}
                    <div className="lg:col-span-7 bg-stone-950/92 text-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                          <span>🏫 MEDIA PEMBELAJARAN INTERAKTIF SDN 66 BANDA ACEH</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
                          PIZZA FRACTION FRENZY 3D
                        </h1>
                        <p className="text-sm sm:text-base font-display font-semibold text-amber-300">
                          Master the Fractions, Build Your Pizza Empire!
                        </p>
                        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                          Belajar <strong>13 Materi Matematika Pecahan</strong> dengan <strong>Metode GASING Prof. Yohanes Surya</strong> & <strong>Singapore Math (Concrete–Pictorial–Abstract)</strong> sambil melayani pelanggan di meja saji 3D dan membangun restoran impianmu!
                        </p>

                        {/* 4 Kotak Fitur Terstruktur */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="bg-stone-900/95 p-2.5 rounded-xl border border-rose-500/40">
                            <div className="text-xs font-bold text-rose-400">❤️❤️❤️ 3 Nyawa</div>
                            <div className="text-[11px] text-stone-300 mt-0.5">
                              Jaga pelanggan tetap senang!
                            </div>
                          </div>
                          <div className="bg-stone-900/95 p-2.5 rounded-xl border border-sky-500/40">
                            <div className="text-xs font-bold text-sky-300">⏱️ 10–20 Detik</div>
                            <div className="text-[11px] text-stone-300 mt-0.5">
                              Waktu saji sesuai kesulitan soal
                            </div>
                          </div>
                          <div className="bg-stone-900/95 p-2.5 rounded-xl border border-amber-500/40">
                            <div className="text-xs font-bold text-amber-300">🍕 Topping 3D</div>
                            <div className="text-[11px] text-stone-300 mt-0.5">
                              Animasi taburan topping pizza
                            </div>
                          </div>
                          <div className="bg-stone-900/95 p-2.5 rounded-xl border border-emerald-500/40">
                            <div className="text-xs font-bold text-emerald-300">🏛️ 11 Upgrade</div>
                            <div className="text-[11px] text-stone-300 mt-0.5">
                              Dekorasi & perluas restoran 3D
                            </div>
                          </div>
                        </div>

                        {/* BANNER MISI HARIAN (DAILY MISSION) & CHEF'S REWARD */}
                        {(() => {
                          const dm = progress.dailyMission;
                          const tmpl = getDailyMissionTemplate(dm.missionId);
                          const readyToClaim = dm.currentCount >= dm.targetCount && !dm.claimed;
                          return (
                            <div className="bg-gradient-to-r from-amber-950/90 via-stone-900 to-emerald-950/85 border-2 border-amber-400/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-300">
                                  <span>🎯 MISI HARIAN KOKI ({dm.currentCount}/{dm.targetCount})</span>
                                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/40">
                                    🔥 Streak {dm.loginStreakDays} Hari
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm font-display font-bold text-white">
                                  🍕 {tmpl.title}: <span className="text-amber-200 font-sans font-normal">{tmpl.englishSubtitle}</span>
                                </div>
                                <div className="text-[11px] text-emerald-300 font-bold">
                                  🎁 Chef&apos;s Reward: +${tmpl.rewardMoney} Uang Kasir & +{tmpl.rewardXp} XP
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  soundEngine.playOrderPop();
                                  setShowDailyMission(true);
                                }}
                                className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs cursor-pointer shadow whitespace-nowrap transition-transform active:scale-95 ${
                                  readyToClaim
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 animate-bounce'
                                    : dm.claimed
                                    ? 'bg-stone-800 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                                }`}
                              >
                                {readyToClaim
                                  ? "🎁 Klaim Chef's Reward!"
                                  : dm.claimed
                                  ? '✓ Hadiah Diklaim (Lihat Misi)'
                                  : '🎯 Buka Misi Harian →'}
                              </button>
                            </div>
                          );
                        })()}

                        {/* Ringkasan Profil Koki Aktif */}
                        <div className="bg-amber-950/70 border border-amber-500/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          {progress.identity ? (
                            <>
                              <div>
                                <span className="text-amber-300 font-bold">Koki Terdaftar:</span>{' '}
                                <strong className="text-white">{progress.identity.name}</strong> · Kelas{' '}
                                {progress.identity.grade} ({progress.identity.school})
                              </div>
                              <div className="font-mono text-emerald-300 font-bold">
                                Kasir: ${progress.money} · XP: {(progress.xp || 0).toLocaleString('id-ID')} · Skor: {progress.totalScore.toLocaleString('id-ID')}
                              </div>
                            </>
                          ) : (
                            <div className="text-amber-200">
                              👋 Belum ada identitas koki. Silakan lanjut ke <strong>Halaman 2</strong> untuk mengisi Nama, Sekolah, dan Kelas!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Baris Tombol Aksi Terstruktur Halaman 1 */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-800">
                        <button
                          onClick={() => {
                            soundEngine.playOrderPop();
                            setFrontPage(2);
                          }}
                          className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm sm:text-base shadow-lg cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                        >
                          Lanjut ke Halaman 2: Identitas Koki →
                        </button>
                        <button
                          onClick={() => {
                            soundEngine.playOrderPop();
                            setFrontPage(3);
                          }}
                          className="py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs sm:text-sm shadow cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                        >
                          Halaman 3: 7 Menu Pilihan
                        </button>
                      </div>
                    </div>

                    {/* Kolom Kanan (5 Kolom): Simulasi Pizza Gourmet & Animasi Topping */}
                    <div className="lg:col-span-5 bg-stone-950/92 text-amber-50 rounded-3xl p-5 border-2 border-amber-500/60 shadow-2xl flex flex-col items-center justify-between gap-3">
                      <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
                        <span className="text-xs font-bold text-amber-300">
                          🍕 SIMULASI PECAHAN & TOPPING PIZZA
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Nilai: {heroPizzaSlices}/{heroPizzaDenom}
                        </span>
                      </div>

                      {/* Ilustrasi Pizza 2.5D + Badge Animasi Topping */}
                      <div className="relative flex flex-col items-center my-auto">
                        <div
                          key={heroToppingBurst}
                          className="flex items-center gap-2 mb-1 animate-bounce"
                        >
                          <ToppingIllustrationSVG topping={heroTopping} size={24} />
                          <span className="text-[11px] font-bold text-amber-200 bg-stone-900 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                            Topping: {TOPPINGS.find((t) => t.id === heroTopping)?.name}
                          </span>
                          <ToppingIllustrationSVG topping={heroTopping} size={24} />
                        </div>

                        <SinglePizza25D
                          totalSlices={heroPizzaDenom}
                          activeSlices={heroPizzaSlices}
                          topping={heroTopping}
                          size={185}
                          interactive
                          showSliceNumbers
                          modeHemat={progress.modeHemat}
                          onToggleSlice={() => {
                            soundEngine.playSlicePizza();
                            soundEngine.playToppingSprinkle();
                            setHeroToppingBurst((prev) => prev + 1);
                            setHeroPizzaSlices((prev) =>
                              prev >= heroPizzaDenom ? 1 : prev + 1
                            );
                          }}
                        />
                      </div>

                      {/* Kontrol Potongan & Topping */}
                      <div className="w-full space-y-2 pt-2 border-t border-stone-800">
                        <div className="flex flex-wrap justify-center gap-1">
                          {TOPPINGS.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                soundEngine.playToppingSprinkle();
                                setHeroTopping(t.id);
                                setHeroToppingBurst((prev) => prev + 1);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                heroTopping === t.id
                                  ? 'bg-amber-500 text-stone-950'
                                  : 'bg-stone-800 text-amber-100 hover:bg-stone-700'
                              }`}
                            >
                              <ToppingIllustrationSVG topping={t.id} size={14} />
                              <span>{t.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-center items-center gap-1.5">
                          <span className="text-[11px] text-stone-400">Penyebut:</span>
                          {[2, 3, 4, 6, 8, 12].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                soundEngine.playSlicePizza();
                                setHeroPizzaDenom(d);
                                setHeroPizzaSlices(Math.min(heroPizzaSlices, d));
                                setHeroToppingBurst((prev) => prev + 1);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                                heroPizzaDenom === d
                                  ? 'bg-emerald-500 text-stone-950'
                                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                              }`}
                            >
                              ÷{d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    HALAMAN 2: FORMULIR IDENTITAS KOKI MUDA YANG RAPI & TERSTRUKTUR
                   ------------------------------------------------------------- */}
                {frontPage === 2 && (
                  <div className="max-w-2xl mx-auto bg-stone-950/94 text-amber-50 rounded-3xl p-5 sm:p-7 border-2 border-amber-500/70 shadow-2xl space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-400">
                          HALAMAN 2 DARI 3 · REGISTRASI KOKI RESTORAN
                        </div>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                          Formulir Identitas Pemain
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setFrontPage(1);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold border border-stone-700 cursor-pointer"
                      >
                        ← Kembali ke Hal 1
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. NAMA PEMAIN */}
                      <div>
                        <label
                          htmlFor="input-player-name"
                          className="block text-xs font-bold text-amber-200 mb-1.5"
                        >
                          1. NAMA PEMAIN <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="input-player-name"
                          type="text"
                          value={playerName}
                          onChange={(e) => {
                            setPlayerName(e.target.value);
                            if (formError) setFormError('');
                          }}
                          placeholder="Masukkan nama lengkap"
                          className="w-full px-4 py-3 rounded-xl bg-stone-900 border-2 border-amber-500/40 focus:border-amber-400 focus:outline-none text-sm sm:text-base font-bold text-white placeholder:text-stone-500"
                        />
                      </div>

                      {/* 2. ASAL SEKOLAH */}
                      <div>
                        <label
                          htmlFor="input-player-school"
                          className="block text-xs font-bold text-amber-200 mb-1.5"
                        >
                          2. ASAL SEKOLAH <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="input-player-school"
                          type="text"
                          value={playerSchool}
                          onChange={(e) => {
                            setPlayerSchool(e.target.value);
                            if (formError) setFormError('');
                          }}
                          placeholder="SDN 66 Banda Aceh"
                          className="w-full px-4 py-3 rounded-xl bg-stone-900 border-2 border-amber-500/40 focus:border-amber-400 focus:outline-none text-sm sm:text-base font-bold text-white"
                        />
                      </div>
                    </div>

                    {/* 3. PILIH KELAS (1 - 6) */}
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1.5">
                        3. PILIH KELAS (1 SAMPAI 6) <span className="text-rose-400">*</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((g) => {
                          const active = playerGrade === g;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                soundEngine.playOrderPop();
                                setPlayerGrade(g);
                                if (formError) setFormError('');
                              }}
                              className={`py-2.5 px-2 rounded-xl font-display font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                                active
                                  ? 'bg-amber-500 text-stone-950 border-amber-200 shadow-md scale-[1.02]'
                                  : 'bg-stone-900 hover:bg-stone-800 text-amber-100 border-stone-700'
                              }`}
                            >
                              Kelas {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {formError && (
                      <div
                        role="alert"
                        className="p-3 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs font-bold"
                      >
                        ⚠️ {formError}
                      </div>
                    )}

                    {/* Tombol Aksi Terstruktur Halaman 2 */}
                    <div className="space-y-2.5 pt-2 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => handleStartGame(false)}
                        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base sm:text-lg shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        🍕 SIMPAN & MULAI BERMAIN SEKARANG
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartGame(true)}
                          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          ▶ Lanjutkan (Lv.{progress.highestLevelUnlocked})
                        </button>
                        <button
                          type="button"
                          onClick={openElegantRestaurantTour}
                          className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          🏛️ Lihat Restoran 3D
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playOrderPop();
                            setFrontPage(3);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 font-display font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Halaman 3: Menu Pilihan →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    HALAMAN 3: 7 MENU PILIHAN UTAMA YANG RAPI & TERSTRUKTUR
                   ------------------------------------------------------------- */}
                {frontPage === 3 && (
                  <div className="bg-stone-950/94 text-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-500/70 shadow-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-400">
                          HALAMAN 3 DARI 3 · PUSAT KENDALI PERMAINAN & PEMBELAJARAN
                        </div>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                          Pilih Menu Permainan, Materi CPA, atau Upgrade Restoran 3D
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            soundEngine.playOrderPop();
                            setShowDailyMission(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer shadow"
                        >
                          🎯 Misi Harian & Chef&apos;s Reward ({progress.dailyMission.currentCount}/{progress.dailyMission.targetCount})
                        </button>
                        <button
                          onClick={openElegantRestaurantTour}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow"
                        >
                          🎥 Tur Animasi Restoran 3D
                        </button>
                        <button
                          onClick={() => {
                            soundEngine.playOrderPop();
                            setFrontPage(2);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold border border-stone-700 cursor-pointer"
                        >
                          ← Hal 2
                        </button>
                      </div>
                    </div>

                    {/* BARIS 1: 3 MENU UTAMA (BERMAIN, MATERI 13 KATEGORI, & RESTORAN SAYA) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* 1. MULAI BERMAIN */}
                      <button
                        onClick={() => handleStartGame(false)}
                        className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-stone-900 hover:from-emerald-900 border-2 border-emerald-400/70 text-left flex flex-col justify-between gap-3 cursor-pointer transition-transform active:scale-95"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300">
                            <span>01. PETUALANGAN UTAMA</span>
                            <span>❤️❤️❤️ · 10–20 dtk</span>
                          </div>
                          <h3 className="text-lg font-display font-bold text-white mt-1">
                            🍕 Mulai Bermain (15 Level)
                          </h3>
                          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                            Layani pelanggan di Meja Saji 3D dengan batas waktu 10–20 detik dan 3 nyawa koki!
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-300">
                          Buka Peta Level (Terbuka: Lv.{progress.highestLevelUnlocked}/15) →
                        </span>
                      </button>

                      {/* 2. PILIH MATERI */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          handleOpenCategoryOrMenu(() => setCurriculumModalCat(1));
                        }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-sky-950 to-stone-900 hover:from-sky-900 border-2 border-sky-400/70 text-left flex flex-col justify-between gap-3 cursor-pointer transition-transform active:scale-95"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-300">
                            <span>02. LABORATORIUM CPA</span>
                            <span>13 Kategori</span>
                          </div>
                          <h3 className="text-lg font-display font-bold text-white mt-1">
                            📚 Pilih Materi Pecahan
                          </h3>
                          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                            Pelajari konsep Concrete–Pictorial–Abstract & Metode GASING lengkap dengan simulasi.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-sky-300">
                          Buka Laboratorium 13 Materi →
                        </span>
                      </button>

                      {/* 3. RESTORAN SAYA */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          handleOpenCategoryOrMenu(() => setShopModalTab('shop'));
                        }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-amber-950 to-stone-900 hover:from-amber-900 border-2 border-amber-400/70 text-left flex flex-col justify-between gap-3 cursor-pointer transition-transform active:scale-95"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                            <span>03. TOKO UPGRADE 3D</span>
                            <span>Kasir: ${progress.money}</span>
                          </div>
                          <h3 className="text-lg font-display font-bold text-white mt-1">
                            🏪 Restoran Saya
                          </h3>
                          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                            Upgrade oven emas, lampu kristal, lantai marmer, pohon zaitun, & cabang SDN 66!
                          </p>
                        </div>
                        <span className="text-xs font-bold text-amber-300">
                          Upgrade Terpasang: {progress.purchasedUpgrades.length}/11 →
                        </span>
                      </button>
                    </div>

                    {/* BARIS 2: 4 MENU PENDUKUNG TERSTRUKTUR (PENCAPAIAN, PETUNJUK, MULTIPLAYER, TOP 100) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* 4. PENCAPAIAN */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          handleOpenCategoryOrMenu(() => setShopModalTab('achievements'));
                        }}
                        className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-purple-400/60 text-left flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="text-[10px] font-mono font-bold text-purple-300">
                            04. PRESTASI & STATISTIK
                          </div>
                          <div className="text-sm font-display font-bold text-white mt-0.5">
                            🏅 Pencapaian & Evaluasi
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-purple-300">
                          Lihat Medali & Akurasi →
                        </span>
                      </button>

                      {/* 5. PETUNJUK PERMAINAN */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          handleOpenCategoryOrMenu(() => setShopModalTab('guide'));
                        }}
                        className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-rose-400/60 text-left flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="text-[10px] font-mono font-bold text-rose-300">
                            05. PANDUAN BERMAIN
                          </div>
                          <div className="text-sm font-display font-bold text-white mt-0.5">
                            📖 Petunjuk Permainan
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-rose-300">
                          Aturan 3 Nyawa & Waktu →
                        </span>
                      </button>

                      {/* 6. KOMPETISI KELAS */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          handleOpenCategoryOrMenu(() => setShowMultiplayer(true));
                        }}
                        className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-indigo-400/60 text-left flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="text-[10px] font-mono font-bold text-indigo-300">
                            06. MULTIPLAYER KELAS
                          </div>
                          <div className="text-sm font-display font-bold text-white mt-0.5">
                            ⚔️ Kompetisi 2–4 Siswa
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-300">
                          Mulai Lomba Cepat Tepat →
                        </span>
                      </button>

                      {/* 7. TOP 100 LEADERBOARD */}
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setShowLeaderboard(true);
                        }}
                        className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-yellow-400/60 text-left flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="text-[10px] font-mono font-bold text-yellow-300">
                            07. PERINGKAT GLOBAL/LOKAL
                          </div>
                          <div className="text-sm font-display font-bold text-white mt-0.5">
                            🏆 TOP 100 Leaderboard
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-yellow-300">
                          Lihat Peringkat Terbaik →
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DOCK NAVIGASI BAWAH HALAMAN 1-3 (TERANGKAT AMAN DARI TOMBOL BAWAH HP) */}
              <div className="mx-auto w-full max-w-3xl mb-4 sm:mb-1 bg-stone-950/92 border border-amber-500/50 rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xl">
                <span className="text-xs text-stone-300">
                  Halaman Aktif: <strong className="text-amber-300">{frontPage} dari 3</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={frontPage === 1}
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setFrontPage((prev) => (prev > 1 ? ((prev - 1) as FrontMenuPage) : 1));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    ← Halaman Sebelumnya
                  </button>
                  <button
                    disabled={frontPage === 3}
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setFrontPage((prev) => (prev < 3 ? ((prev + 1) as FrontMenuPage) : 3));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 text-xs font-bold cursor-pointer"
                  >
                    Halaman Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === 'WORLD_MAP' && (
            <WorldMapView
              progress={progress}
              onSelectLevel={(lvlId) => {
                setActiveLevelId(lvlId);
                setPracticeCategoryId(null);
                setScreen('PLAYING');
              }}
              onOpenCurriculum={(catId) => setCurriculumModalCat(catId || 1)}
              onOpenShop={(tab) => setShopModalTab(tab || 'shop')}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenMultiplayer={() => setShowMultiplayer(true)}
              onBackToTitle={() => {
                setScreen('TITLE_MENU');
                setFrontPage(3);
              }}
            />
          )}

          {screen === 'PLAYING' && (
            <GameplayArena
              levelId={activeLevelId}
              practiceCategoryId={practiceCategoryId}
              progress={progress}
              onUpdate3DTable={setGameplayTableState}
              onCompleteOrder={handleCompleteOrder}
              onCompleteLevel={handleCompleteLevel}
              onAdvanceToNextLevel={(nextLvlId) => {
                setActiveLevelId(nextLvlId);
                setPracticeCategoryId(null);
              }}
              onOpenShop={() => setShopModalTab('shop')}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenRestaurantTour={openElegantRestaurantTour}
              onOpenDailyMission={() => setShowDailyMission(true)}
              onBackToMap={() => setScreen('WORLD_MAP')}
            />
          )}
        </main>
      )}

      {/* MODALS */}
      {showDailyMission && (
        <DailyMissionModal
          progress={progress}
          onClaimChefsReward={handleClaimChefsReward}
          onStartMissionPractice={(catId) => {
            handleOpenCategoryOrMenu(() => {
              setShowDailyMission(false);
              setRestaurantTourMode(false);
              setPracticeCategoryId(catId);
              setScreen('PLAYING');
            });
          }}
          onSelectMissionTemplate={handleSelectMissionTemplate}
          onClose={() => setShowDailyMission(false)}
        />
      )}

      {curriculumModalCat !== null && (
        <CurriculumModal
          selectedCategoryId={curriculumModalCat}
          masteredCategories={progress.masteredCategories}
          modeHemat={progress.modeHemat}
          onStartCategoryPractice={(catId) => {
            if (!progress.identity) {
              const fallbackName = playerName.trim() || 'Chef Muda';
              const fallbackSchool = playerSchool.trim() || 'SDN 66 Banda Aceh';
              const fallbackGrade = playerGrade >= 1 ? playerGrade : 5;
              const identity: PlayerIdentity = {
                playerId: generatePlayerId(fallbackName, fallbackSchool, fallbackGrade),
                name: fallbackName,
                school: fallbackSchool,
                grade: fallbackGrade,
              };
              setProgress((prev) => ({ ...prev, identity }));
            }
            setCurriculumModalCat(null);
            setPracticeCategoryId(catId);
            setScreen('PLAYING');
          }}
          onClose={() => setCurriculumModalCat(null)}
        />
      )}

      {shopModalTab !== null && (
        <RestaurantShopModal
          initialTab={shopModalTab}
          progress={progress}
          onBuyUpgrade={handleBuyUpgrade}
          onOpenRestaurantTour={openElegantRestaurantTour}
          onClose={() => setShopModalTab(null)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          currentPlayerId={progress.identity?.playerId}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showMultiplayer && (
        <ClassroomMultiplayerModal
          modeHemat={progress.modeHemat}
          onClose={() => setShowMultiplayer(false)}
        />
      )}
    </div>
  );
}

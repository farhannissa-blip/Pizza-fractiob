import React, { useEffect, useState } from 'react';
import {
  CURRICULUM_CATEGORIES,
  LEVELS,
  LevelConfig,
  PizzaToppingId,
  RESTAURANT_UPGRADES,
  TOPPINGS,
} from '../data/curriculum';
import {
  Fraction,
  areEquivalent,
  formatFraction,
  isStrictEqual,
  toImproper,
} from '../engine/fractionEngine';
import {
  DynamicQuestion,
  generateQuestionForCategory,
} from '../engine/questionGenerator';
import { PlayerProgress } from '../engine/storageEngine';
import { CustomerCharacter, CustomerMood } from './RestaurantScene';
import { Gameplay3DTableState, Pizza3DTableSpec } from './Pizzeria3DBackground';
import { soundEngine } from '../engine/soundEngine';

interface GameplayArenaProps {
  levelId: number;
  practiceCategoryId?: number | null;
  progress: PlayerProgress;
  onUpdate3DTable: (state: Gameplay3DTableState | null) => void;
  onCompleteOrder: (result: {
    earnedMoney: number;
    earnedScore: number;
    wasFirstTryCorrect: boolean;
    categoryId: number;
  }) => void;
  onCompleteLevel: (result: {
    levelId: number;
    stars: number;
    bonusMoney: number;
    bonusScore: number;
    categoryId?: number;
  }) => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenRestaurantTour: () => void;
  onOpenDailyMission: () => void;
  onBackToMap: () => void;
}

const MAX_LIVES = 3;

/**
 * Menentukan tingkat kesulitan soal berdasarkan kategori (1-13) dan level (1-15)
 */
function getQuestionDifficulty(
  categoryId: number,
  levelId: number
): 'mudah' | 'sedang' | 'sulit' {
  if (categoryId >= 10 || levelId >= 10) return 'sulit';
  if (categoryId >= 4 || levelId >= 5) return 'sedang';
  return 'mudah';
}

/**
 * Menghitung batas waktu penyajian pizza per pesanan (10 sampai 20 detik)
 * tergantung tingkat kesulitan soal dan level.
 */
function getOrderTimeLimitSeconds(
  difficulty: 'mudah' | 'sedang' | 'sulit',
  levelId: number
): number {
  if (difficulty === 'mudah') {
    return levelId <= 2 ? 20 : 18;
  }
  if (difficulty === 'sedang') {
    return levelId <= 6 ? 16 : 14;
  }
  // Tingkat kesulitan 'sulit': 10 sampai 12 detik
  return levelId >= 13 ? 10 : 12;
}

/**
 * Mengonversi objek Fraction menjadi daftar loyang 3D di meja saji
 */
function fractionTo3DPizzaSpecs(f: Fraction): Pizza3DTableSpec[] {
  const whole = f.whole ?? 0;
  const num = f.num;
  const den = Math.max(1, f.den);
  const list: Pizza3DTableSpec[] = [];

  if (whole > 0) {
    for (let i = 0; i < Math.min(whole, 2); i++) {
      list.push({ totalSlices: den, activeSlices: den, label: '1 Utuh' });
    }
    if (num > 0) {
      list.push({ totalSlices: den, activeSlices: num, label: `${num}/${den}` });
    }
  } else if (num > den) {
    let rem = num;
    let count = 0;
    while (rem > 0 && count < 3) {
      const take = Math.min(rem, den);
      list.push({ totalSlices: den, activeSlices: take, label: `${take}/${den}` });
      rem -= take;
      count++;
    }
  } else {
    list.push({ totalSlices: den, activeSlices: num, label: `${num}/${den}` });
  }
  return list;
}

/**
 * Komponen Gambar Ilustrasi SVG Topping Pizza Beranimasi
 */
export const ToppingIllustrationSVG: React.FC<{
  topping: PizzaToppingId;
  size?: number;
  className?: string;
}> = ({ topping, size = 34, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      {topping === 'pepperoni' && (
        <g>
          <circle cx="24" cy="24" r="19" fill="#991B1B" stroke="#F87171" strokeWidth="2" />
          <circle cx="24" cy="24" r="15" fill="#DC2626" />
          <circle cx="17" cy="18" r="3" fill="#FCA5A5" />
          <circle cx="30" cy="17" r="2.5" fill="#FCA5A5" />
          <circle cx="26" cy="29" r="3.2" fill="#FCA5A5" />
          <circle cx="16" cy="28" r="2" fill="#FEE2E2" />
        </g>
      )}
      {topping === 'mushroom' && (
        <g>
          <path
            d="M10 26 C10 13, 38 13, 38 26 Z"
            fill="#A8A29E"
            stroke="#57534E"
            strokeWidth="2.5"
          />
          <rect x="19" y="25" width="10" height="14" rx="3" fill="#F5F5F4" stroke="#78716C" strokeWidth="2" />
          <circle cx="19" cy="19" r="2.5" fill="#E7E5E4" />
          <circle cx="29" cy="20" r="2" fill="#E7E5E4" />
        </g>
      )}
      {topping === 'paprika' && (
        <g>
          <circle
            cx="24"
            cy="24"
            r="16"
            fill="none"
            stroke="#15803D"
            strokeWidth="6"
          />
          <circle
            cx="24"
            cy="24"
            r="14"
            fill="none"
            stroke="#4ADE80"
            strokeWidth="2"
          />
        </g>
      )}
      {topping === 'corn' && (
        <g>
          <circle cx="17" cy="24" r="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="31" cy="20" r="8" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="26" cy="31" r="8" fill="#EAB308" stroke="#A16207" strokeWidth="2" />
          <circle cx="15" cy="22" r="2" fill="#FEF9C3" />
          <circle cx="29" cy="18" r="2" fill="#FEF9C3" />
        </g>
      )}
      {topping === 'sausage' && (
        <g>
          <ellipse cx="24" cy="24" rx="18" ry="13" fill="#7C2D12" stroke="#FDBA74" strokeWidth="2" />
          <ellipse cx="24" cy="22" rx="15" ry="10" fill="#9A3412" />
          <path d="M14 21 L20 25 M24 19 L30 23 M28 21 L34 25" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {topping === 'extra_cheese' && (
        <g>
          <circle cx="24" cy="24" r="17" fill="#FEF9C3" stroke="#FACC15" strokeWidth="2.5" />
          <path d="M24 13 C29 13, 33 18, 24 34 C15 18, 19 13, 24 13 Z" fill="#16A34A" />
          <circle cx="15" cy="20" r="3" fill="#FDE047" />
          <circle cx="33" cy="27" r="3.5" fill="#FDE047" />
        </g>
      )}
    </svg>
  );
};

export const GameplayArena: React.FC<GameplayArenaProps> = ({
  levelId,
  practiceCategoryId = null,
  progress,
  onUpdate3DTable,
  onCompleteOrder,
  onCompleteLevel,
  onOpenShop,
  onOpenLeaderboard,
  onOpenRestaurantTour,
  onOpenDailyMission,
  onBackToMap,
}) => {
  const levelConfig: LevelConfig =
    LEVELS.find((l) => l.id === levelId) || LEVELS[0];

  const isCategoryPractice = Boolean(practiceCategoryId);
  const activePracticeCat = CURRICULUM_CATEGORIES.find(
    (c) => c.id === practiceCategoryId
  );

  const targetOrders = isCategoryPractice ? 5 : levelConfig.targetOrders;

  const [ordersDone, setOrdersDone] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionMoney, setSessionMoney] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [hadWrongAttemptOnCurrent, setHadWrongAttemptOnCurrent] = useState<boolean>(false);

  // Sistem 3 Nyawa Pemain & Timer Penyajian 10-20 Detik per Pelanggan
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [isGameOverLives, setIsGameOverLives] = useState<boolean>(false);

  const [question, setQuestion] = useState<DynamicQuestion>(() => {
    const catId = isCategoryPractice
      ? practiceCategoryId!
      : levelConfig.categories[0];
    return generateQuestionForCategory(catId, levelConfig.worldId);
  });

  const currentDifficulty = getQuestionDifficulty(question.categoryId, levelConfig.id);
  const maxOrderSeconds = getOrderTimeLimitSeconds(currentDifficulty, levelConfig.id);
  const [orderTimeLeft, setOrderTimeLeft] = useState<number>(maxOrderSeconds);

  // Topping Aktif & Animasi Taburan Topping Saat Penyajian
  const [activeTopping, setActiveTopping] = useState<PizzaToppingId>(question.topping);
  const [toppingBurstKey, setToppingBurstKey] = useState<number>(1);
  const [showToppingRainUI, setShowToppingRainUI] = useState<boolean>(true);

  const [minimizeBottomBar, setMinimizeBottomBar] = useState<boolean>(false);

  // State interaksi untuk SLICE_PICKER (Kategori 1)
  const [selectedSlices, setSelectedSlices] = useState<boolean[]>([]);
  // State interaksi untuk ORDER_LIST (Kategori 5)
  const [orderedList, setOrderedList] = useState<Fraction[]>([]);

  const [customerMood, setCustomerMood] = useState<CustomerMood>('ordering');
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [angryPopup, setAngryPopup] = useState<boolean>(false);

  const [evaluationState, setEvaluationState] = useState<{
    status: 'idle' | 'correct' | 'wrong_retry' | 'timeout_angry';
    headline: string;
    earnedMoney?: number;
    earnedPoints?: number;
  }>({ status: 'idle', headline: '' });

  const [levelFinishedSummary, setLevelFinishedSummary] = useState<{
    stars: number;
    bonusMoney: number;
    bonusScore: number;
  } | null>(null);

  const upgradeTipBonus = RESTAURANT_UPGRADES.filter((u) =>
    progress.purchasedUpgrades.includes(u.id)
  ).reduce((acc, u) => acc + u.tipBonus, 0);

  // Inisialisasi ulang kontrol & timer 10-20 detik saat soal berganti
  useEffect(() => {
    if (question.interactionType === 'SLICE_PICKER') {
      const den = question.targetFraction.den;
      const initArr = Array.from({ length: den }, (_, i) => i === 0);
      setSelectedSlices(initArr);
    } else if (question.interactionType === 'ORDER_LIST' && question.initialOrderFractions) {
      setOrderedList([...question.initialOrderFractions]);
    }
    const diff = getQuestionDifficulty(question.categoryId, levelConfig.id);
    const freshLimit = getOrderTimeLimitSeconds(diff, levelConfig.id);
    setOrderTimeLeft(freshLimit);
    setActiveTopping(question.topping);
    setToppingBurstKey((prev) => prev + 1);
    setShowToppingRainUI(true);
    setCustomerMood('ordering');
    setEvaluationState({ status: 'idle', headline: '' });
    setHadWrongAttemptOnCurrent(false);
  }, [question, levelConfig.id]);

  // Sembunyikan efek partikel topping UI setelah 1.4 detik
  useEffect(() => {
    setShowToppingRainUI(true);
    const t = window.setTimeout(() => setShowToppingRainUI(false), 1400);
    return () => clearTimeout(t);
  }, [toppingBurstKey]);

  // Sinkronkan kondisi pizza, topping, dan animasi pelanggan ke Meja Saji 3D
  useEffect(() => {
    let pizzasFor3D: Pizza3DTableSpec[] = [];

    if (question.interactionType === 'SLICE_PICKER') {
      const count = selectedSlices.filter(Boolean).length;
      pizzasFor3D = [
        {
          totalSlices: question.targetFraction.den,
          activeSlices: count,
          selectedSliceIndices: selectedSlices,
          label: `${count}/${question.targetFraction.den}`,
        },
      ];
    } else if (question.interactionType === 'ORDER_LIST') {
      pizzasFor3D = orderedList.map((f) => ({
        totalSlices: f.den,
        activeSlices: f.num,
        label: formatFraction(f),
      }));
    } else if (evaluationState.status === 'correct') {
      pizzasFor3D = fractionTo3DPizzaSpecs(question.targetFraction);
    } else {
      for (const pf of question.promptFractions) {
        pizzasFor3D.push(...fractionTo3DPizzaSpecs(pf));
      }
      pizzasFor3D = pizzasFor3D.slice(0, 3);
    }

    onUpdate3DTable({
      pizzas: pizzasFor3D,
      topping: activeTopping,
      servingState:
        evaluationState.status === 'correct'
          ? 'serving_success'
          : evaluationState.status === 'timeout_angry'
          ? 'customer_angry_leave'
          : evaluationState.status === 'wrong_retry'
          ? 'wrong_shake'
          : 'preparing',
      customerType: question.customer.type,
      interactiveSlices:
        question.interactionType === 'SLICE_PICKER' &&
        evaluationState.status === 'idle',
      toppingBurstKey,
      onToggle3DSlice: (sliceIdx: number) => {
        soundEngine.playSlicePizza();
        soundEngine.playToppingSprinkle();
        setToppingBurstKey((prev) => prev + 1);
        setSelectedSlices((prev) =>
          prev.map((v, i) => (i === sliceIdx ? !v : v))
        );
      },
    });
  }, [
    question,
    selectedSlices,
    orderedList,
    activeTopping,
    toppingBurstKey,
    evaluationState.status,
    onUpdate3DTable,
  ]);

  const spawnNextCustomerOrder = (nextOrderIndex: number) => {
    const pool = isCategoryPractice
      ? [practiceCategoryId!]
      : levelConfig.categories;
    const pickedCat = pool[nextOrderIndex % pool.length];
    soundEngine.playCustomerArrive();
    setQuestion(generateQuestionForCategory(pickedCat, levelConfig.worldId));
  };

  // Handler saat batas waktu 10-20 detik habis: Pelanggan Marah & Pergi (-1 Nyawa)
  const handleOrderTimeoutAngry = () => {
    soundEngine.playCustomerAngry();
    setCombo(0);
    setCustomerMood('sad');
    setAngryPopup(true);
    setTimeout(() => setAngryPopup(false), 2100);

    const nextLives = Math.max(0, lives - 1);
    setLives(nextLives);

    setEvaluationState({
      status: 'timeout_angry',
      headline:
        nextLives > 0
          ? `⏰ WAKTU HABIS! Pelanggan Marah & Pergi! Nyawa Berkurang 1 (Sisa ❤️ ${nextLives}/${MAX_LIVES})`
          : `⏰ WAKTU HABIS! Pelanggan Marah & Pergi! Seluruh 3 Nyawa Koki Habis!`,
    });

    if (nextLives <= 0) {
      window.setTimeout(() => {
        setIsGameOverLives(true);
      }, 1900);
    }
  };

  // Countdown Timer Penyajian Pizza (10-20 Detik per Soal)
  useEffect(() => {
    if (
      levelFinishedSummary ||
      isGameOverLives ||
      evaluationState.status === 'correct' ||
      evaluationState.status === 'timeout_angry'
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setOrderTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleOrderTimeoutAngry();
          return 0;
        }
        if (prev <= 6) {
          soundEngine.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [levelFinishedSummary, isGameOverLives, evaluationState.status, lives]);

  const handleCorrectOrder = () => {
    const newCombo = hadWrongAttemptOnCurrent ? 1 : combo + 1;
    setCombo(newCombo);

    const speedBonus = orderTimeLeft >= Math.ceil(maxOrderSeconds * 0.5) ? 4 : 2;
    const baseMoney = 10 + speedBonus;
    const comboBonus = Math.min(newCombo - 1, 5) * 3;
    const totalOrderMoney = baseMoney + comboBonus + upgradeTipBonus;
    const totalOrderPoints =
      (hadWrongAttemptOnCurrent ? 70 : 100) +
      (newCombo - 1) * 15 +
      orderTimeLeft * 3;

    if (!hadWrongAttemptOnCurrent) {
      setFirstTryCorrectCount((prev) => prev + 1);
    }

    setSessionMoney((prev) => prev + totalOrderMoney);
    setSessionScore((prev) => prev + totalOrderPoints);
    setCustomerMood('happy');
    setToppingBurstKey((prev) => prev + 1);
    setCoinPopup(totalOrderMoney);
    setTimeout(() => setCoinPopup(null), 1400);

    soundEngine.playToppingSprinkle();
    soundEngine.playOvenDing();
    soundEngine.playCorrect(newCombo);
    soundEngine.playCoin();

    onCompleteOrder({
      earnedMoney: totalOrderMoney,
      earnedScore: totalOrderPoints,
      wasFirstTryCorrect: !hadWrongAttemptOnCurrent,
      categoryId: question.categoryId,
    });

    setEvaluationState({
      status: 'correct',
      headline: `Pizza 3D & Topping ${
        TOPPINGS.find((t) => t.id === activeTopping)?.name || ''
      } Disajikan Tepat Waktu! (+$${totalOrderMoney} & +${totalOrderPoints} Skor)`,
      earnedMoney: totalOrderMoney,
      earnedPoints: totalOrderPoints,
    });
  };

  const handleWrongOrder = () => {
    soundEngine.playWrong();
    setCombo(0);
    setHadWrongAttemptOnCurrent(true);
    setCustomerMood('sad');
    setEvaluationState({
      status: 'wrong_retry',
      headline: 'Pesanan Belum Tepat — Cepat Perbaiki Sebelum Waktu Habis!',
    });
  };

  const submitSlicePicker = () => {
    const countSelected = selectedSlices.filter(Boolean).length;
    if (countSelected === question.targetFraction.num) {
      handleCorrectOrder();
    } else {
      handleWrongOrder();
    }
  };

  const submitCompareSymbol = (sym: '<' | '=' | '>') => {
    if (sym === question.correctCompareSymbol) {
      handleCorrectOrder();
    } else {
      handleWrongOrder();
    }
  };

  const submitOrderList = () => {
    if (!question.correctOrderedFractions) return;
    const isRight = orderedList.every((item, idx) =>
      areEquivalent(item, question.correctOrderedFractions![idx])
    );
    if (isRight) {
      handleCorrectOrder();
    } else {
      handleWrongOrder();
    }
  };

  const submitMultipleChoice = (chosen: Fraction) => {
    const isRight = question.strictChoiceMatch
      ? isStrictEqual(chosen, question.targetFraction)
      : areEquivalent(chosen, question.targetFraction);
    if (isRight) {
      handleCorrectOrder();
    } else {
      handleWrongOrder();
    }
  };

  const handleProceedAfterOrder = () => {
    const nextDone = ordersDone + 1;
    setOrdersDone(nextDone);

    if (nextDone >= targetOrders) {
      const accuracyRatio = firstTryCorrectCount / targetOrders;
      const stars = accuracyRatio >= 0.8 ? 3 : accuracyRatio >= 0.5 ? 2 : 1;
      const starBonusMoney = stars === 3 ? 35 : stars === 2 ? 20 : 10;
      const starBonusScore = stars * 100;

      soundEngine.playLevelWin();
      setLevelFinishedSummary({
        stars,
        bonusMoney: starBonusMoney,
        bonusScore: starBonusScore,
      });

      onCompleteLevel({
        levelId: levelConfig.id,
        stars,
        bonusMoney: starBonusMoney,
        bonusScore: starBonusScore,
        categoryId: isCategoryPractice ? practiceCategoryId! : undefined,
      });
    } else {
      spawnNextCustomerOrder(nextDone);
    }
  };

  const handleRetryAfterGameOver = () => {
    soundEngine.playCustomerArrive();
    setLives(MAX_LIVES);
    setIsGameOverLives(false);
    setOrdersDone(0);
    setSessionScore(0);
    setSessionMoney(0);
    setCombo(0);
    setFirstTryCorrectCount(0);
    spawnNextCustomerOrder(0);
  };

  const adjustSliceCount = (delta: number) => {
    if (evaluationState.status === 'correct' || evaluationState.status === 'timeout_angry') return;
    soundEngine.playSlicePizza();
    soundEngine.playToppingSprinkle();
    setToppingBurstKey((prev) => prev + 1);
    const currentCount = selectedSlices.filter(Boolean).length;
    const nextCount = Math.max(1, Math.min(selectedSlices.length, currentCount + delta));
    setSelectedSlices(
      Array.from({ length: selectedSlices.length }, (_, i) => i < nextCount)
    );
  };

  const moveOrderItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= orderedList.length) return;
    soundEngine.playSlicePizza();
    setToppingBurstKey((prev) => prev + 1);
    const copy = [...orderedList];
    [copy[index], copy[targetIdx]] = [copy[targetIdx], copy[index]];
    setOrderedList(copy);
  };

  const activeSliceCount = selectedSlices.filter(Boolean).length;
  const timerPercent = Math.max(
    0,
    Math.min(100, Math.round((orderTimeLeft / maxOrderSeconds) * 100))
  );
  const activeToppingInfo =
    TOPPINGS.find((t) => t.id === activeTopping) || TOPPINGS[0];

  return (
    <div className="relative flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto px-3 sm:px-6 pt-2 pb-14 sm:pb-16 min-h-[calc(100vh-56px)] pointer-events-none">
      {/* =====================================================================
          1. ZONA ATAS: HUD RINGKAS, 3 NYAWA KOKI, & TIMER PENYAJIAN 10-20 DETIK
         ===================================================================== */}
      <div className="space-y-2 pointer-events-auto">
        {/* Bar HUD Status Koki, 3 Nyawa (❤️❤️❤️), & Skor */}
        <div className="bg-stone-950/92 text-amber-50 rounded-2xl px-3.5 py-2 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onUpdate3DTable(null);
                onBackToMap();
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold border border-stone-600 cursor-pointer shrink-0"
            >
              ← Peta
            </button>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300 truncate">
                Chef {progress.identity?.name || 'Siswa'} · Kelas {progress.identity?.grade || 5}
              </div>
              <div className="text-[11px] text-stone-300 truncate">
                {isCategoryPractice
                  ? `Latihan: ${activePracticeCat?.title}`
                  : `${levelConfig.title} (${currentDifficulty.toUpperCase()})`}
              </div>
            </div>
          </div>

          {/* Indikator 3 Nyawa Pemain & Waktu Penyajian 10-20 Detik */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums">
            {/* 3 Nyawa Pemain */}
            <div
              className="flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded-xl border border-rose-500/40"
              title="Nyawa Koki (Maksimal 3 Nyawa)"
            >
              <span className="text-[11px] font-sans font-bold text-rose-300 mr-0.5">
                Nyawa:
              </span>
              {[1, 2, 3].map((heartIdx) => (
                <span
                  key={heartIdx}
                  className={`text-sm transition-transform ${
                    heartIdx <= lives
                      ? 'text-rose-500 scale-100'
                      : 'text-stone-600 scale-75 opacity-40'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>

            {/* Timer Penyajian 10-20 Detik */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold ${
                orderTimeLeft <= 5
                  ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                  : orderTimeLeft <= 10
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
              }`}
            >
              <span>⏱️ Saji:</span>
              <span className="text-sm">{orderTimeLeft} dtk</span>
              <span className="text-[10px] text-stone-400">/{maxOrderSeconds}d</span>
            </div>

            <span className="hidden sm:inline">
              Pesanan: <strong className="text-white">{ordersDone}/{targetOrders}</strong>
            </span>
            <span>
              Kasir: <strong className="text-emerald-400">${progress.money}</strong>
            </span>
            <span>
              Skor: <strong className="text-amber-300">{progress.totalScore.toLocaleString('id-ID')}</strong>
            </span>

            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onOpenDailyMission();
              }}
              className={`px-2.5 py-1 rounded-lg font-sans font-bold text-xs cursor-pointer border ${
                progress.dailyMission.currentCount >= progress.dailyMission.targetCount &&
                !progress.dailyMission.claimed
                  ? 'bg-yellow-400 text-stone-950 border-yellow-200 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border-emerald-500/40'
              }`}
              title="Buka Misi Harian & Klaim Chef's Reward"
            >
              {progress.dailyMission.currentCount >= progress.dailyMission.targetCount &&
              !progress.dailyMission.claimed
                ? '🎁 Klaim Hadiah Koki!'
                : `🎯 Misi: ${progress.dailyMission.currentCount}/${progress.dailyMission.targetCount}`}
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onOpenRestaurantTour();
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 font-sans font-bold text-xs cursor-pointer"
              title="Lihat Tampilan Restoran 3D yang Di-upgrade"
            >
              🏛️ Restoran 3D
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onOpenShop();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold text-xs cursor-pointer"
            >
              🏪 Upgrade
            </button>
          </div>
        </div>

        {/* Kartu Dialog Pesanan Pelanggan + Progress Bar Waktu Penyajian */}
        <div className="bg-amber-50/95 rounded-2xl px-4 py-2 border-2 border-amber-500 shadow-lg space-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <CustomerCharacter
              customer={question.customer}
              mood={customerMood}
              modeHemat={progress.modeHemat}
            />
            <div className="flex-1 bg-amber-100/90 rounded-xl px-3.5 py-1.5 border border-amber-300">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-amber-900">
                <span>
                  PESANAN PELANGGAN ({question.categoryTitle.toUpperCase()}):
                </span>
                <span className="font-mono text-stone-700">
                  Kesulitan: {currentDifficulty.toUpperCase()} (Batas Waktu {maxOrderSeconds} Detik)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-display font-bold text-stone-900 leading-snug">
                {question.dialogue}
              </p>
            </div>
          </div>

          {/* Progress Bar Visual Batas Waktu Penyajian (10-20 Detik) */}
          <div className="w-full bg-stone-300 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                orderTimeLeft <= 5
                  ? 'bg-rose-600'
                  : orderTimeLeft <= 10
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. ZONA TENGAH: PANGGUNG MEJA SAJI PIZZA 3D & ANIMASI GAMBAR TOPPING
         ===================================================================== */}
      <div className="relative my-auto py-4 flex flex-col items-center justify-center pointer-events-none">
        {/* Animasi Gambar Topping Pizza Berjatuhan ke Atas Loyang 3D Saat Penyajian */}
        {(showToppingRainUI || evaluationState.status === 'correct') && (
          <div
            key={toppingBurstKey}
            className="flex items-center justify-center gap-4 sm:gap-7 mb-2 animate-bounce"
          >
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-stone-950/80 p-1.5 rounded-full border border-amber-400/60 shadow-lg"
                style={{
                  transform: `translateY(${idx % 2 === 0 ? '-6px' : '6px'})`,
                }}
              >
                <ToppingIllustrationSVG topping={activeTopping} size={28} />
              </div>
            ))}
          </div>
        )}

        {coinPopup !== null && (
          <div className="animate-coin-fly bg-emerald-600 text-white font-mono font-bold px-4 py-2 rounded-full shadow-xl border-2 border-yellow-300 text-sm sm:text-base">
            🍕 Pizza 3D Disajikan! +${coinPopup} Masuk Kasir!
          </div>
        )}

        {angryPopup && (
          <div className="bg-rose-600 text-white font-display font-bold px-5 py-2.5 rounded-full shadow-2xl border-2 border-rose-200 text-sm sm:text-base animate-bounce">
            😡 Waktu {maxOrderSeconds} Detik Habis! Pelanggan Marah & Pergi! (-1 ❤️ Nyawa)
          </div>
        )}

        {/* Label Pecahan Mengambang di Atas Loyang Meja Saji 3D */}
        <div className="mt-20 sm:mt-24 flex flex-wrap items-center justify-center gap-2.5">
          {question.interactionType === 'SLICE_PICKER' ? (
            <div className="bg-stone-950/90 text-amber-300 px-4 py-1.5 rounded-full border border-amber-400/60 text-xs sm:text-sm font-mono font-bold shadow-lg flex items-center gap-2">
              <ToppingIllustrationSVG topping={activeTopping} size={20} />
              <span>
                Meja Saji 3D: {activeSliceCount}/{question.targetFraction.den} Bagian ({activeToppingInfo.name})
              </span>
            </div>
          ) : question.interactionType === 'ORDER_LIST' ? (
            orderedList.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-950/90 text-amber-300 px-3.5 py-1 rounded-full border border-amber-400/60 text-xs sm:text-sm font-mono font-bold shadow-lg tabular-nums flex items-center gap-1.5"
              >
                <ToppingIllustrationSVG topping={activeTopping} size={18} />
                <span>
                  Loyang #{idx + 1}: {formatFraction(item)}
                </span>
              </div>
            ))
          ) : (
            question.promptFractions.map((pf, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="bg-amber-500 text-stone-950 w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-sm shadow">
                    {question.categoryId === 13 ? '−' : question.interactionType === 'COMPARE_SYMBOL' ? 'vs' : '+'}
                  </span>
                )}
                <div className="bg-stone-950/90 text-amber-300 px-4 py-1 rounded-full border border-amber-400/60 text-xs sm:text-sm font-mono font-bold shadow-lg tabular-nums flex items-center gap-1.5">
                  <ToppingIllustrationSVG topping={activeTopping} size={18} />
                  <span>Loyang 3D: {formatFraction(pf)}</span>
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* =====================================================================
          3. ZONA BAWAH: BARISAN SOAL, ANIMASI TOPPING, & PILIHAN JAWABAN
             Diposisikan aman di atas area tombol navigasi bawah HP (pb-14 / mb-4)
         ===================================================================== */}
      <div className="pointer-events-auto w-full max-w-4xl mx-auto mb-3 sm:mb-4">
        {/* Baris Atas Dock: Selector Gambar Animasi Topping + Tombol Lipat Soal */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          {/* Baris Pilihan Gambar Animasi Topping Pizza Saat Penyajian */}
          <div className="flex items-center gap-1.5 bg-stone-950/92 px-3 py-1 rounded-t-xl border-t border-x border-amber-500/50 overflow-x-auto max-w-full">
            <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap mr-1">
              🍕 Tabur Topping:
            </span>
            {TOPPINGS.map((t) => {
              const isSelected = activeTopping === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playToppingSprinkle();
                    setActiveTopping(t.id);
                    setToppingBurstKey((prev) => prev + 1);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-transform active:scale-95 whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-800 text-amber-100 hover:bg-stone-700'
                  }`}
                >
                  <ToppingIllustrationSVG topping={t.id} size={16} />
                  <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playOrderPop();
              setMinimizeBottomBar(!minimizeBottomBar);
            }}
            className="px-3.5 py-1 rounded-t-xl bg-stone-950/92 text-amber-300 border-t border-x border-amber-500/50 text-xs font-bold cursor-pointer shadow"
          >
            {minimizeBottomBar ? '▴ Tampilkan Soal' : '▾ Lipat Soal'}
          </button>
        </div>

        {!minimizeBottomBar && (
          <div className="bg-stone-950/95 text-amber-50 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-500/70 shadow-2xl space-y-3">
            {/* Baris Instruksi Soal & Sisa Waktu Penyajian */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
              <div className="text-xs sm:text-sm font-display font-bold text-amber-300">
                {question.promptInstruction}
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                <span className="text-emerald-400">
                  Tip Saji: +${10 + Math.min(combo, 5) * 3 + upgradeTipBonus}
                </span>
                <span
                  className={`font-bold ${
                    orderTimeLeft <= 5 ? 'text-rose-400' : 'text-sky-300'
                  }`}
                >
                  Sisa Waktu: {orderTimeLeft} dtk
                </span>
              </div>
            </div>

            {/* KONTROL 1: SLICE PICKER (KATEGORI 1 - POTONG & AMBIL LANGSUNG DI MEJA 3D) */}
            {question.interactionType === 'SLICE_PICKER' &&
              evaluationState.status === 'idle' && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustSliceCount(-1)}
                      className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 font-display font-bold text-sm border border-stone-600 cursor-pointer active:scale-95"
                    >
                      − Potong
                    </button>
                    <div className="px-4 py-2 rounded-xl bg-amber-950 border border-amber-500/50 text-center font-mono font-bold text-lg text-amber-300 tabular-nums">
                      {activeSliceCount} / {question.targetFraction.den}
                    </div>
                    <button
                      type="button"
                      onClick={() => adjustSliceCount(1)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-sm cursor-pointer active:scale-95"
                    >
                      + Potong
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={submitSlicePicker}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <ToppingIllustrationSVG topping={activeTopping} size={22} />
                    <span>Sajikan Pizza 3D ke Pelanggan!</span>
                  </button>
                </div>
              )}

            {/* KONTROL 2: COMPARE SYMBOL (KATEGORI 3 & 4) */}
            {question.interactionType === 'COMPARE_SYMBOL' &&
              evaluationState.status === 'idle' && (
                <div className="space-y-2.5">
                  {question.showNumberLine && (
                    <div className="relative h-7 bg-stone-900 rounded-lg px-4 flex items-center border border-stone-700">
                      <div className="w-full h-1 bg-stone-600 relative">
                        <span className="absolute -left-1 -top-3.5 text-[10px] font-mono text-stone-400">0</span>
                        <span className="absolute -right-1 -top-3.5 text-[10px] font-mono text-stone-400">1</span>
                        {question.promptFractions.map((pf, idx) => {
                          const imp = toImproper(pf);
                          const pct = Math.min(100, Math.max(0, (imp.num / imp.den) * 100));
                          return (
                            <div
                              key={idx}
                              style={{ left: `${pct}%` }}
                              className="absolute -top-2 -translate-x-1/2 flex items-center gap-1"
                            >
                              <div
                                className={`w-3 h-3 rounded-full border border-white ${
                                  idx === 0 ? 'bg-amber-400' : 'bg-sky-400'
                                }`}
                              />
                              <span className="text-[10px] font-mono font-bold text-amber-200">
                                {formatFraction(pf)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => submitCompareSymbol('<')}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-sm sm:text-base shadow cursor-pointer active:scale-95"
                    >
                      <span className="font-mono text-lg mr-1">&lt;</span> Lebih Kecil
                    </button>
                    <button
                      type="button"
                      onClick={() => submitCompareSymbol('=')}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-sm sm:text-base shadow cursor-pointer active:scale-95"
                    >
                      <span className="font-mono text-lg mr-1">=</span> Sama Dengan
                    </button>
                    <button
                      type="button"
                      onClick={() => submitCompareSymbol('>')}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-sm sm:text-base shadow cursor-pointer active:scale-95"
                    >
                      <span className="font-mono text-lg mr-1">&gt;</span> Lebih Besar
                    </button>
                  </div>
                </div>
              )}

            {/* KONTROL 3: ORDER LIST (KATEGORI 5 - MENGURUTKAN PECAHAN DI MEJA 3D) */}
            {question.interactionType === 'ORDER_LIST' &&
              evaluationState.status === 'idle' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {orderedList.map((item, idx) => (
                      <div
                        key={`${item.num}_${item.den}_${idx}`}
                        className="bg-stone-900 rounded-xl p-2 border border-amber-500/40 flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] text-amber-300 font-bold">
                          Posisi #{idx + 1}
                        </span>
                        <span className="text-base font-mono font-bold text-white tabular-nums">
                          {formatFraction(item)}
                        </span>
                        <div className="flex gap-1 w-full">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveOrderItem(idx, -1)}
                            className="flex-1 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-amber-200 text-xs font-bold cursor-pointer"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedList.length - 1}
                            onClick={() => moveOrderItem(idx, 1)}
                            className="flex-1 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-amber-200 text-xs font-bold cursor-pointer"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={submitOrderList}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm shadow-lg cursor-pointer active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <ToppingIllustrationSVG topping={activeTopping} size={20} />
                    <span>Sajikan Urutan 3D!</span>
                  </button>
                </div>
              )}

            {/* KONTROL 4: MULTIPLE CHOICE BARISAN TOMBOL BAWAH (KATEGORI 2, 6–13) */}
            {question.interactionType === 'MULTIPLE_CHOICE' &&
              evaluationState.status === 'idle' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(question.choices || []).map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => submitMultipleChoice(choice)}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 border-2 border-amber-300 shadow-md flex items-center justify-between gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <ToppingIllustrationSVG topping={activeTopping} size={18} />
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <span className="text-lg sm:text-xl font-mono font-bold text-stone-950 tabular-nums">
                        {formatFraction(choice)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

            {/* PANEL PEMBAHASAN CPA & METODE GASING SAAT JAWABAN BENAR / SALAH / WAKTU HABIS */}
            {evaluationState.status !== 'idle' && (
              <div
                className={`rounded-xl p-3 border-2 space-y-2 ${
                  evaluationState.status === 'correct'
                    ? 'bg-emerald-950/95 border-emerald-400 text-emerald-50'
                    : 'bg-rose-950/95 border-rose-400 text-rose-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display font-bold text-xs sm:text-sm">
                    {evaluationState.status === 'correct'
                      ? '✓ '
                      : evaluationState.status === 'timeout_angry'
                      ? '😡 '
                      : '💡 '}
                    {evaluationState.headline}
                  </div>
                  {evaluationState.status === 'correct' ? (
                    <button
                      type="button"
                      onClick={handleProceedAfterOrder}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-display font-bold text-xs sm:text-sm shadow cursor-pointer whitespace-nowrap"
                    >
                      {ordersDone + 1 >= targetOrders
                        ? 'Selesaikan Level & Ambil Bintang! →'
                        : 'Layani Pelanggan Berikutnya →'}
                    </button>
                  ) : evaluationState.status === 'timeout_angry' ? (
                    lives > 0 && (
                      <button
                        type="button"
                        onClick={() => spawnNextCustomerOrder(ordersDone + 1)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-display font-bold text-xs sm:text-sm shadow cursor-pointer whitespace-nowrap"
                      >
                        Panggil Pelanggan Berikutnya (Sisa ❤️ {lives}) →
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playOrderPop();
                        setEvaluationState({ status: 'idle', headline: '' });
                        setCustomerMood('ordering');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      Perbaiki Pesanan (Sisa {orderTimeLeft} dtk)
                    </button>
                  )}
                </div>

                <div className="text-xs text-stone-200 space-y-0.5 border-t border-white/15 pt-1.5">
                  {question.cpaExplanation.steps.map((st, i) => (
                    <div key={i}>• {st}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          4. MODAL KEHABISAN 3 NYAWA (GAME OVER — PELANGGAN MARAH & PERGI)
         ===================================================================== */}
      {isGameOverLives && (
        <div className="fixed inset-0 z-50 bg-stone-950/88 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-amber-50 border-2 border-rose-600 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="text-4xl">😡💔🍕</div>
            <div className="text-xs font-bold text-rose-700 tracking-wider">
              3 NYAWA KOKI HABIS!
            </div>
            <h2 className="text-2xl font-display font-bold text-stone-900">
              Pelanggan Kecewa & Meninggalkan Restoran
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Jangan menyerah, Chef <strong>{progress.identity?.name || 'Muda'}</strong>! Ingat trik <strong>Metode GASING & CPA</strong> agar kamu bisa menyajikan pizza dalam batas waktu <strong>10–20 detik</strong>.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleRetryAfterGameOver}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base shadow-lg cursor-pointer"
              >
                🔄 Coba Lagi Level Ini (Isi Ulang 3 ❤️ Nyawa)
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenShop();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
              >
                🏪 Buka Restoran Saya & Upgrade
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onUpdate3DTable(null);
                  onBackToMap();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer"
              >
                ← Kembali ke Peta Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. MODAL HASIL LEVEL SELESAI (VICTORY SUMMARY)
         ===================================================================== */}
      {levelFinishedSummary && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="text-xs font-bold text-amber-800 tracking-wider">
              {isCategoryPractice ? 'LATIHAN MATERI SELESAI!' : `${levelConfig.title.toUpperCase()} SELESAI!`}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
              Luar Biasa, Chef {progress.identity?.name}!
            </h2>

            <div className="flex justify-center gap-3 py-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-md ${
                    s <= levelFinishedSummary.stars
                      ? 'bg-yellow-400 border-yellow-600 text-stone-950'
                      : 'bg-stone-200 border-stone-300 text-stone-400'
                  }`}
                >
                  ★
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-left bg-white p-4 rounded-xl border border-amber-200 font-mono text-xs sm:text-sm tabular-nums">
              <div>
                <div className="text-stone-500 font-sans">Pendapatan Pesanan:</div>
                <div className="font-bold text-emerald-700 text-base">+${sessionMoney}</div>
              </div>
              <div>
                <div className="text-stone-500 font-sans">Bonus Bintang Level:</div>
                <div className="font-bold text-emerald-700 text-base">+${levelFinishedSummary.bonusMoney}</div>
              </div>
              <div>
                <div className="text-stone-500 font-sans">Skor Sesi Ini:</div>
                <div className="font-bold text-amber-800 text-base">
                  +{sessionScore + levelFinishedSummary.bonusScore} pts
                </div>
              </div>
              <div>
                <div className="text-stone-500 font-sans">Sisa Nyawa Koki:</div>
                <div className="font-bold text-rose-600 text-base">
                  ❤️ {lives} / {MAX_LIVES}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {!isCategoryPractice && levelConfig.id < LEVELS.length && (
                <button
                  onClick={() => {
                    soundEngine.playCustomerArrive();
                    setLevelFinishedSummary(null);
                    setOrdersDone(0);
                    setSessionScore(0);
                    setSessionMoney(0);
                    setFirstTryCorrectCount(0);
                    onUpdate3DTable(null);
                    onBackToMap();
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base shadow-md cursor-pointer"
                >
                  Lanjut ke Level Berikutnya →
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenShop();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
              >
                🏪 Upgrade Restoran
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenRestaurantTour();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
              >
                🏛️ Lihat Restoran 3D
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenLeaderboard();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs cursor-pointer"
              >
                🏆 TOP 100
              </button>
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onUpdate3DTable(null);
                  onBackToMap();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer"
              >
                Kembali ke Peta Level & Menu Utama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

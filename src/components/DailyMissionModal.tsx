import React, { useState } from 'react';
import { CURRICULUM_CATEGORIES } from '../data/curriculum';
import {
  DAILY_MISSION_POOL,
  DailyMissionTemplate,
  PlayerProgress,
  getDailyMissionTemplate,
} from '../engine/storageEngine';
import { soundEngine } from '../engine/soundEngine';

interface DailyMissionModalProps {
  progress: PlayerProgress;
  onStartMissionPractice: (categoryId: number) => void;
  onClaimChefsReward: () => void;
  onSelectMissionTemplate: (template: DailyMissionTemplate) => void;
  onClose: () => void;
}

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  progress,
  onStartMissionPractice,
  onClaimChefsReward,
  onSelectMissionTemplate,
  onClose,
}) => {
  const [justClaimedAnim, setJustClaimedAnim] = useState<boolean>(false);

  const dm = progress.dailyMission;
  const activeTemplate = getDailyMissionTemplate(dm.missionId);

  const streakDays = Math.max(1, dm.loginStreakDays || 1);
  const streakBonusMoney = Math.min(streakDays - 1, 7) * 5;
  const streakBonusXp = Math.min(streakDays - 1, 7) * 50;

  const totalRewardMoney = activeTemplate.rewardMoney + streakBonusMoney;
  const totalRewardXp = activeTemplate.rewardXp + streakBonusXp;

  const isCompleted = dm.currentCount >= dm.targetCount;
  const canClaim = isCompleted && !dm.claimed;

  const progressPct = Math.min(
    100,
    Math.round((dm.currentCount / Math.max(1, dm.targetCount)) * 100)
  );

  const targetCategoryNames =
    activeTemplate.targetCategories.length > 0
      ? activeTemplate.targetCategories
          .map(
            (id) =>
              CURRICULUM_CATEGORIES.find((c) => c.id === id)?.shortTitle ||
              `Kat ${id}`
          )
          .join(', ')
      : 'Semua 13 Kategori Pecahan';

  const handleClaimClick = () => {
    if (!canClaim) return;
    soundEngine.playLevelWin();
    soundEngine.playCoin();
    setJustClaimedAnim(true);
    onClaimChefsReward();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-amber-50 border-2 border-amber-500 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Misi Harian & Login Streak */}
        <div className="bg-stone-950 text-amber-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <span>🎯 DAILY MISSION & CHEF&apos;S REWARD</span>
              <span>·</span>
              <span>📅 {dm.dateKey}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
              Misi Harian Koki & Bonus Login Harian
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <span>🔥 Streak Login:</span>
              <span className="font-mono text-sm text-white">{streakDays} Hari</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Banner Hadiah Klaim Sukses */}
          {justClaimedAnim && (
            <div className="bg-emerald-900 text-emerald-50 p-4 rounded-2xl border-2 border-yellow-400 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-bounce">
              <div>
                <div className="text-xs font-bold text-yellow-300">
                  🎉 SELAMAT! CHEF&apos;S REWARD BERHASIL DIKLAIM!
                </div>
                <div className="text-sm sm:text-base font-display font-bold">
                  +${totalRewardMoney} Uang Restoran & +{totalRewardXp} XP Skor telah ditambahkan ke akunmu!
                </div>
              </div>
              <span className="text-2xl">🎁🍕🏆</span>
            </div>
          )}

          {/* Kartu Utama Tantangan Matematika Hari Ini */}
          <div className="bg-stone-950 text-amber-50 rounded-2xl p-5 border-2 border-amber-500/70 shadow-xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold">
                  <span>TANTANGAN HARI INI</span>
                  <span>·</span>
                  <span>{activeTemplate.englishSubtitle}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white pt-1">
                  {activeTemplate.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {activeTemplate.description}
                </p>
              </div>

              {/* Kotak Hadiah Spesial Koki (Chef's Reward) */}
              <div className="bg-gradient-to-br from-amber-900/90 to-stone-900 p-3.5 rounded-2xl border-2 border-yellow-400/80 text-center min-w-[190px] shrink-0">
                <div className="text-[11px] font-mono font-bold text-yellow-300">
                  🎁 CHEF&apos;S REWARD BONUS
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  +${totalRewardMoney} Kasir
                </div>
                <div className="text-sm font-mono font-bold text-amber-300">
                  +{totalRewardXp} XP & Skor
                </div>
                {streakDays > 1 && (
                  <div className="text-[10px] text-yellow-200 mt-1">
                    (Termasuk Bonus Streak {streakDays} Hari!)
                  </div>
                )}
              </div>
            </div>

            {/* Kategori yang Dihitung & Trik GASING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-900/90 p-3.5 rounded-xl border border-stone-800 text-xs">
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  📚 Materi Pecahan Target:
                </span>
                <span className="text-stone-200">{targetCategoryNames}</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400 block mb-0.5">
                  💡 Trik Metode GASING:
                </span>
                <span className="text-stone-200">{activeTemplate.gasingTip}</span>
              </div>
            </div>

            {/* Progress Bar Visual 5 Potong Pizza */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-200">
                  Progres Misi Harian: {dm.currentCount} / {dm.targetCount} Soal Selesai
                </span>
                <span className="font-mono text-emerald-400">{progressPct}%</span>
              </div>

              <div className="w-full h-3.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Indikator 5 Loyang Pizza */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {Array.from({ length: dm.targetCount }).map((_, idx) => {
                  const done = idx < dm.currentCount;
                  return (
                    <div
                      key={idx}
                      className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all ${
                        done
                          ? 'bg-emerald-900/90 border-emerald-400 text-emerald-200 shadow'
                          : 'bg-stone-900 border-stone-800 text-stone-500'
                      }`}
                    >
                      <div className="text-base">{done ? '🍕✓' : '🍽️'}</div>
                      <div className="text-[10px] font-mono">Soal #{idx + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tombol Aksi Utama (Kerjakan Misi atau Klaim Chef's Reward) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
              {canClaim ? (
                <button
                  onClick={handleClaimClick}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400 hover:from-yellow-300 hover:to-emerald-300 text-stone-950 font-display font-bold text-base sm:text-lg shadow-xl cursor-pointer animate-pulse"
                >
                  🎁 KLAIM CHEF&apos;S REWARD SEKARANG (+${totalRewardMoney} & +{totalRewardXp} XP)!
                </button>
              ) : dm.claimed ? (
                <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-emerald-950/90 border border-emerald-500/60 px-4 py-3 rounded-2xl">
                  <div className="text-xs sm:text-sm font-bold text-emerald-300">
                    ✓ Chef&apos;s Reward Hari Ini Sudah Diklaim! Total Misi Tuntas: {dm.completedMissionsCount} Misi
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playCustomerArrive();
                      onStartMissionPractice(activeTemplate.recommendedCategoryId);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs cursor-pointer"
                  >
                    🍕 Latihan Lagi Materi Ini →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playCustomerArrive();
                    onStartMissionPractice(activeTemplate.recommendedCategoryId);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  🍕 Kerjakan Soal Misi Harian Sekarang ({dm.currentCount}/{dm.targetCount}) →
                </button>
              )}
            </div>
          </div>

          {/* Pilihan Rotasi Tantangan Harian (Memungkinkan Siswa/Guru Memilih Fokus Tantangan Harian) */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-display font-bold text-stone-900">
                🔄 Daftar Tantangan Matematika Harian Koki (Pilih Fokus Latihan Hari Ini):
              </h4>
              <span className="text-[11px] font-mono text-stone-500">
                Total XP Koki: {progress.xp.toLocaleString('id-ID')} XP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAILY_MISSION_POOL.map((item) => {
                const isSelected = item.id === activeTemplate.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setJustClaimedAnim(false);
                      onSelectMissionTemplate(item);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-display font-bold truncate">
                        {isSelected ? '★ ' : ''}
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {item.englishSubtitle}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0">
                      +${item.rewardMoney} / +{item.rewardXp}XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

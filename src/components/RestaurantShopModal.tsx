import React, { useState } from 'react';
import {
  ACHIEVEMENTS,
  CURRICULUM_CATEGORIES,
  RESTAURANT_UPGRADES,
  RestaurantUpgrade,
} from '../data/curriculum';
import { PlayerProgress } from '../engine/storageEngine';
import { RestaurantStage25D } from './RestaurantScene';
import { soundEngine } from '../engine/soundEngine';

interface RestaurantShopModalProps {
  initialTab?: 'shop' | 'achievements' | 'guide';
  progress: PlayerProgress;
  onBuyUpgrade: (upgrade: RestaurantUpgrade) => void;
  onOpenRestaurantTour: () => void;
  onClose: () => void;
}

export const RestaurantShopModal: React.FC<RestaurantShopModalProps> = ({
  initialTab = 'shop',
  progress,
  onBuyUpgrade,
  onOpenRestaurantTour,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'achievements' | 'guide'>(initialTab);
  const [filterCat, setFilterCat] = useState<'all' | 'interior' | 'kitchen' | 'decor' | 'expansion'>('all');
  const [peek3DBackground, setPeek3DBackground] = useState<boolean>(false);
  const [recentBoughtName, setRecentBoughtName] = useState<string | null>(null);

  const filteredUpgrades =
    filterCat === 'all'
      ? RESTAURANT_UPGRADES
      : RESTAURANT_UPGRADES.filter((u) => u.category === filterCat);

  const totalBonusTip = RESTAURANT_UPGRADES.filter((u) =>
    progress.purchasedUpgrades.includes(u.id)
  ).reduce((acc, u) => acc + u.tipBonus, 0);

  const accuracy =
    progress.totalQuestions > 0
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
      : 100;

  const isAchievementUnlocked = (id: string): boolean => {
    switch (id) {
      case 'fraction_beginner':
        return progress.highestLevelUnlocked >= 2 || Object.keys(progress.levelStars).length >= 1;
      case 'pizza_expert':
        return progress.customersServed >= 15;
      case 'fraction_master':
        return progress.highestLevelUnlocked >= 9 || Boolean(progress.levelStars[8]);
      case 'mixed_fraction_master':
        return progress.highestLevelUnlocked >= 15 || Boolean(progress.levelStars[14]);
      case 'super_pizza_chef':
        return Boolean(progress.levelStars[15]) && progress.purchasedUpgrades.length >= 4;
      default:
        return false;
    }
  };

  const totalStarsEarned = (Object.values(progress.levelStars) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 flex flex-col justify-between p-2 sm:p-4 overflow-y-auto ${
        peek3DBackground ? 'bg-stone-950/20 pointer-events-none' : 'bg-stone-950/65 items-center justify-center'
      }`}
    >
      {/* Mode Intip Background Restoran 3D Saat Upgrade */}
      {peek3DBackground ? (
        <div className="mt-auto mb-10 mx-auto max-w-3xl w-full bg-stone-950/92 text-amber-50 p-4 rounded-2xl border-2 border-amber-400 shadow-2xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div>
            <div className="text-xs font-bold text-amber-300">
              ✨ PRATINJAU LANGSUNG BACKGROUND RESTORAN 3D ({progress.purchasedUpgrades.length}/11 UPGRADE AKTIF)
            </div>
            <div className="text-xs text-stone-300">
              Perhatikan perubahan lantai marmer, oven emas, lampu kristal, pohon zaitun, & plakat SDN 66 Banda Aceh di latar 3D!
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                setPeek3DBackground(false);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
            >
              ▴ Kembali ke Daftar Belanja Upgrade
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onOpenRestaurantTour();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              🎥 Tur Kamera Restoran 3D Penuh
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/96 border-2 border-amber-600 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="bg-stone-950 text-amber-50 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/50">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-amber-300">
                {activeTab === 'shop'
                  ? '🏪 Restoran Saya & Toko Upgrade Empire 3D'
                  : activeTab === 'achievements'
                  ? '🏅 Pencapaian, Medali & Statistik Evaluasi'
                  : '📖 Petunjuk Permainan & Metode Pembelajaran'}
              </h2>
              <p className="text-xs text-stone-300">
                Saldo Kasir: <strong className="font-mono text-emerald-400">${progress.money}</strong> · Bonus Tip Upgrade: <strong className="font-mono text-amber-300">+${totalBonusTip}/pesanan</strong> · Koleksi Bintang: <strong className="font-mono text-yellow-300">★ {totalStarsEarned}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Elegan Menuju Tampilan Restoran 3D */}
              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onOpenRestaurantTour();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-display font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-300/50 shadow-md cursor-pointer whitespace-nowrap"
              >
                🏛️ Lihat Restoran 3D
              </button>

              <div className="flex bg-stone-900 p-1 rounded-xl border border-amber-500/40">
                <button
                  onClick={() => {
                    soundEngine.playOrderPop();
                    setActiveTab('shop');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                    activeTab === 'shop' ? 'bg-amber-500 text-stone-950' : 'text-amber-200 hover:text-white'
                  }`}
                >
                  Restoran Saya
                </button>
                <button
                  onClick={() => {
                    soundEngine.playOrderPop();
                    setActiveTab('achievements');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                    activeTab === 'achievements' ? 'bg-amber-500 text-stone-950' : 'text-amber-200 hover:text-white'
                  }`}
                >
                  Pencapaian
                </button>
                <button
                  onClick={() => {
                    soundEngine.playOrderPop();
                    setActiveTab('guide');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                    activeTab === 'guide' ? 'bg-amber-500 text-stone-950' : 'text-amber-200 hover:text-white'
                  }`}
                >
                  Petunjuk
                </button>
              </div>

              <button
                onClick={() => {
                  soundEngine.playOrderPop();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer whitespace-nowrap"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Isi Modal */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === 'shop' && (
              <>
                {/* Banner Notifikasi Saat Baru Membeli Upgrade */}
                {recentBoughtName && (
                  <div className="bg-emerald-900 text-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-400 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-bounce">
                    <div className="text-xs sm:text-sm font-bold">
                      ✨ Upgrade <span className="text-yellow-300">"{recentBoughtName}"</span> berhasil dipasang di Restoran 3D!
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playOrderPop();
                        onOpenRestaurantTour();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-display font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      🎥 Lihat Animasi Restoran 3D Sekarang →
                    </button>
                  </div>
                )}

                {/* Pratinjau Restoran 2.5D & Tombol Intip Background 3D */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-display font-bold text-stone-900">
                        Tampilan Visual Restoran Pizza Anda ({progress.purchasedUpgrades.length}/11 Upgrade Terpasang)
                      </h3>
                      <p className="text-xs text-stone-600">
                        Setiap upgrade langsung mengubah interior Restoran 3D di latar belakang dan menambah uang tip pelanggan!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setPeek3DBackground(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold border border-amber-500/40 cursor-pointer"
                      >
                        👁️ Intip Background Restoran 3D
                      </button>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/80 px-3 py-1.5 rounded-xl tabular-nums">
                        Kasir: ${progress.money}
                      </span>
                    </div>
                  </div>
                  <RestaurantStage25D
                    purchasedUpgrades={progress.purchasedUpgrades}
                    modeHemat={progress.modeHemat}
                  />
                </div>

                {/* Filter Kategori Upgrade */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'Semua Upgrade (11)' },
                    { id: 'interior', label: '1. Interior Restoran' },
                    { id: 'kitchen', label: '2. Dapur Pizza' },
                    { id: 'decor', label: '3. Dekorasi' },
                    { id: 'expansion', label: '4. Pengembangan Restoran' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundEngine.playOrderPop();
                        setFilterCat(tab.id as typeof filterCat);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        filterCat === tab.id
                          ? 'bg-amber-800 text-white'
                          : 'bg-white text-stone-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Daftar Item Upgrade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredUpgrades.map((up) => {
                    const owned = progress.purchasedUpgrades.includes(up.id);
                    const canAfford = progress.money >= up.price;
                    return (
                      <div
                        key={up.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          owned
                            ? 'bg-emerald-50/95 border-emerald-400'
                            : 'bg-white border-amber-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs text-amber-800 font-semibold">
                            <span>{up.categoryLabel}</span>
                            <span className="font-mono font-bold text-emerald-700">{up.bonusText}</span>
                          </div>
                          <h4 className="text-base font-display font-bold text-stone-900 mt-0.5">
                            {up.name}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {up.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-amber-100">
                          <span className="text-sm font-mono font-bold text-stone-900 tabular-nums">
                            Harga: ${up.price}
                          </span>
                          {owned ? (
                            <span className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                              ✓ Terpasang di Restoran 3D
                            </span>
                          ) : (
                            <button
                              disabled={!canAfford}
                              onClick={() => {
                                soundEngine.playUpgrade();
                                setRecentBoughtName(up.name);
                                onBuyUpgrade(up);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-transform cursor-pointer ${
                                canAfford
                                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm active:scale-95'
                                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                              }`}
                            >
                              {canAfford ? `Beli & Pasang ($${up.price})` : `Butuh $${up.price - progress.money} Lagi`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold text-stone-900 mb-2.5">
                    Statistik Evaluasi & Rekam Jejak Pembelajaran
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Total Soal Dikerjakan</div>
                      <div className="text-xl font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                        {progress.totalQuestions} Soal
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Jawaban Benar / Salah</div>
                      <div className="text-xl font-mono font-bold text-emerald-700 tabular-nums mt-0.5">
                        {progress.correctAnswers} / <span className="text-rose-600">{progress.wrongAnswers}</span>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Persentase Ketepatan</div>
                      <div className="text-xl font-mono font-bold text-amber-800 tabular-nums mt-0.5">
                        {accuracy}%
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Total Pelanggan Dilayani</div>
                      <div className="text-xl font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                        {progress.customersServed} Orang
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Total Skor Terkumpul</div>
                      <div className="text-xl font-mono font-bold text-amber-700 tabular-nums mt-0.5">
                        {progress.totalScore.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Uang Kasir Saat Ini</div>
                      <div className="text-xl font-mono font-bold text-emerald-700 tabular-nums mt-0.5">
                        ${progress.money}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Level Tertinggi Terbuka</div>
                      <div className="text-xl font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                        Level {progress.highestLevelUnlocked} / 15
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                      <div className="text-xs text-stone-500">Materi Pecahan Dikuasai</div>
                      <div className="text-xl font-mono font-bold text-purple-700 tabular-nums mt-0.5">
                        {progress.masteredCategories.length} / {CURRICULUM_CATEGORIES.length}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-display font-bold text-stone-900 mb-2.5">
                    Penghargaan & Medali Prestasi Koki Pecahan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ACHIEVEMENTS.map((ach) => {
                      const unlocked = isAchievementUnlocked(ach.id);
                      return (
                        <div
                          key={ach.id}
                          className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                            unlocked
                              ? 'bg-amber-100/80 border-amber-400'
                              : 'bg-stone-100 border-stone-300 opacity-75'
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0 shadow-sm"
                            style={{ backgroundColor: unlocked ? ach.medalColor : '#78716C' }}
                          >
                            {unlocked ? '★' : '🔒'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-display font-bold text-stone-900 text-base">
                                {ach.title}
                              </h4>
                              <span
                                className={`text-xs font-bold ${
                                  unlocked ? 'text-emerald-700' : 'text-stone-500'
                                }`}
                              >
                                {unlocked ? '✓ TERBUKA' : ach.requirementText}
                              </span>
                            </div>
                            <p className="text-xs text-stone-700 mt-1">{ach.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4 bg-white p-5 rounded-xl border border-amber-200 text-sm text-stone-800 leading-relaxed">
                <h3 className="text-lg font-display font-bold text-amber-900">
                  Selamat Datang di Pizza Fraction Frenzy 3D — SDN 66 Banda Aceh!
                </h3>
                <p>
                  Dalam permainan ini, kamu berperan sebagai <strong>Master Chef sekaligus Pemilik Restoran Pizza 3D</strong>. Tugasmu adalah melayani pesanan pelanggan di meja saji 3D dengan menyelesaikan tantangan matematika pecahan secara cepat dan tepat!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                    <h4 className="font-display font-bold text-amber-950">Aturan Waktu (10–20 Detik) & 3 Nyawa Koki:</h4>
                    <ul className="space-y-1.5 text-xs">
                      <li>• <strong>3 Nyawa Koki (❤️❤️❤️):</strong> Setiap memulai level, kamu memiliki 3 nyawa.</li>
                      <li>• <strong>Batas Waktu Penyajian 10–20 Detik:</strong> Soal Mudah memberi waktu 18–20 detik, Soal Sedang 14–16 detik, dan Soal Sulit 10–12 detik.</li>
                      <li>• <strong>Pelanggan Marah & Pergi:</strong> Jika waktu habis sebelum pizza disajikan, pelanggan akan marah dan meninggalkan restoran, serta nyawamu berkurang 1!</li>
                      <li>• <strong>Taburan Topping & Upgrade 3D:</strong> Pilih topping favorit saat menyajikan pizza dan gunakan uang kasir untuk meng-upgrade restoran 3D!</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <h4 className="font-display font-bold text-emerald-950">Prinsip Belajar CPA & Metode GASING:</h4>
                    <ul className="space-y-1.5 text-xs">
                      <li>• <strong>Concrete (Nyata):</strong> Belajar langsung dari loyang pizza 3D di atas meja saji.</li>
                      <li>• <strong>Pictorial (Gambar):</strong> Melihat perbandingan luas juring pizza dan garis bilangan.</li>
                      <li>• <strong>Abstract (Simbol):</strong> Menyelesaikan operasi pembilang, penyebut, FPB, dan KPK.</li>
                      <li>• <strong>Tur Kamera Restoran 3D:</strong> Tekan tombol <strong>🏛️ Lihat Restoran 3D</strong> kapan saja untuk menikmati animasi interior restoran yang telah kamu upgrade!</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

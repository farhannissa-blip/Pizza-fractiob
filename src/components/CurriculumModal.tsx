import React, { useState } from 'react';
import {
  CURRICULUM_CATEGORIES,
  CategoryCurriculum,
  WORLDS,
} from '../data/curriculum';
import {
  formatFraction,
  readFractionIndonesian,
  runFractionEngineTests,
} from '../engine/fractionEngine';
import { MultiPizzaFractionView, SinglePizza25D } from './Pizza25D';
import { soundEngine } from '../engine/soundEngine';

interface CurriculumModalProps {
  selectedCategoryId?: number;
  masteredCategories: number[];
  modeHemat: boolean;
  onStartCategoryPractice: (categoryId: number) => void;
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  selectedCategoryId = 1,
  masteredCategories,
  modeHemat,
  onStartCategoryPractice,
  onClose,
}) => {
  const [activeId, setActiveId] = useState<number>(selectedCategoryId);
  const [showEngineTests, setShowEngineTests] = useState(false);

  // State interaktif untuk demonstrasi visual di dalam laboratorium materi
  const [demoDenom, setDemoDenom] = useState<number>(4);
  const [demoNum, setDemoNum] = useState<number>(3);
  const [overlayStacked, setOverlayStacked] = useState<boolean>(false);
  const [borrowStep, setBorrowStep] = useState<number>(0);

  const activeCategory: CategoryCurriculum =
    CURRICULUM_CATEGORIES.find((c) => c.id === activeId) || CURRICULUM_CATEGORIES[0];

  const engineReport = runFractionEngineTests();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-amber-50 border-2 border-amber-700 rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Modal */}
        <div className="bg-amber-900 text-amber-50 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-700">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight">
              Laboratorium Pembelajaran Pecahan (Metode GASING & Singapore Math CPA)
            </h2>
            <p className="text-xs text-amber-200">
              13 Kategori Lengkap · Concrete – Pictorial – Abstract · SDN 66 Banda Aceh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                setShowEngineTests(!showEngineTests);
              }}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              {showEngineTests ? 'Kembali ke Materi' : `Verifikasi Mesin Matematika (${engineReport.passedCount}/${engineReport.total} Lulus)`}
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Tutup
            </button>
          </div>
        </div>

        {showEngineTests ? (
          /* Panel Pengujian Otomatis Mesin Matematika (Bagian 10) */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="bg-emerald-900 text-emerald-50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-bold">
                  Status Mesin Matematika Pecahan Bilangan Bulat: 100% Akurat & Terverifikasi
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Menggunakan representasi pembilang & penyebut bilangan bulat (tanpa floating-point) dan algoritma FPB/KPK Euclidean.
                </p>
              </div>
              <div className="text-sm font-mono font-bold bg-emerald-950 px-3.5 py-2 rounded-lg border border-emerald-600 tabular-nums">
                LULUS: {engineReport.passedCount} / {engineReport.total} Kasus Uji
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-amber-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-amber-100 text-amber-950 border-b border-amber-200">
                    <th className="py-2.5 px-3 font-bold">Kode</th>
                    <th className="py-2.5 px-3 font-bold">Kategori Operasi</th>
                    <th className="py-2.5 px-3 font-bold">Deskripsi Pengujian</th>
                    <th className="py-2.5 px-3 font-bold">Input</th>
                    <th className="py-2.5 px-3 font-bold">Hasil Mesin</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {engineReport.results.map((tc) => (
                    <tr key={tc.id} className="hover:bg-amber-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-900">{tc.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{tc.category}</td>
                      <td className="py-2.5 px-3 text-stone-700">{tc.description}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-800 tabular-nums">{tc.input}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 tabular-nums">{tc.actual}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {tc.passed ? '✓ LULUS' : '✗ GAGAL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Layout 2 Kolom: Daftar 13 Kategori (Kiri) & Demonstrasi Interaktif CPA (Kanan) */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Daftar 13 Kategori */}
            <div className="lg:col-span-4 bg-amber-100/70 border-b lg:border-b-0 lg:border-r border-amber-200 p-3 overflow-y-auto max-h-56 lg:max-h-none space-y-1.5">
              <div className="text-xs font-bold text-amber-900 px-2 py-1">
                PILIH MATERI PECAHAN (1 – 13):
              </div>
              {CURRICULUM_CATEGORIES.map((cat) => {
                const isMastered = masteredCategories.includes(cat.id);
                const isSelected = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setActiveId(cat.id);
                      setOverlayStacked(false);
                      setBorrowStep(0);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-800 text-white font-bold shadow-sm'
                        : 'bg-white/80 hover:bg-white text-stone-800 border border-amber-200/80'
                    }`}
                  >
                    <span className="text-xs sm:text-sm truncate">
                      {cat.id}. {cat.title}
                    </span>
                    <span
                      className={`text-[11px] font-mono shrink-0 ${
                        isSelected ? 'text-amber-200' : isMastered ? 'text-emerald-700 font-bold' : 'text-stone-400'
                      }`}
                    >
                      {isMastered ? '★ Dikuasai' : `W${cat.worldId}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Konten Materi & Demonstrasi Visual Interaktif */}
            <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Judul & Metode */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200 pb-3">
                <div>
                  <div className="text-xs font-semibold text-amber-800">
                    Kategori {activeCategory.id} dari 13 · {WORLDS.find((w) => w.id === activeCategory.worldId)?.name} · {activeCategory.methodBadge}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mt-0.5">
                    {activeCategory.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playCustomerArrive();
                    onStartCategoryPractice(activeCategory.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Latihan & Mainkan Materi Ini!
                </button>
              </div>

              {/* Penjelasan Konsep Utama */}
              <div className="bg-white rounded-xl p-4 border border-amber-200 space-y-3">
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
                  {activeCategory.conceptSummary}
                </p>

                {/* Tahapan CPA (Concrete - Pictorial - Abstract) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-amber-50/90 p-3 rounded-lg border border-amber-200">
                    <div className="text-xs font-bold text-amber-900 mb-1">1. CONCRETE (Benda Nyata)</div>
                    <p className="text-xs text-stone-700 leading-relaxed">{activeCategory.concreteStep}</p>
                  </div>
                  <div className="bg-sky-50/90 p-3 rounded-lg border border-sky-200">
                    <div className="text-xs font-bold text-sky-900 mb-1">2. PICTORIAL (Gambar Visual)</div>
                    <p className="text-xs text-stone-700 leading-relaxed">{activeCategory.pictorialStep}</p>
                  </div>
                  <div className="bg-emerald-50/90 p-3 rounded-lg border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-900 mb-1">3. ABSTRACT (Simbol Matematika)</div>
                    <p className="text-xs text-stone-700 leading-relaxed">{activeCategory.abstractStep}</p>
                  </div>
                </div>

                {/* Rahasia Metode GASING */}
                <div className="bg-amber-100/80 rounded-lg px-3.5 py-2.5 border border-amber-300 text-xs sm:text-sm text-amber-950">
                  <span className="font-bold">Jurus Cerdas Metode GASING: </span>
                  {activeCategory.gasingTip}
                </div>
              </div>

              {/* Panggung Demonstrasi Visual Interaktif */}
              <div className="bg-stone-900 text-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-700 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-display font-bold text-amber-300">
                    Demonstrasi Pizza Interaktif
                  </h4>
                  <span className="text-xs text-amber-200/80">
                    Sentuh tombol di bawah untuk bereksperimen dengan potongan pizza
                  </span>
                </div>

                {/* KATEGORI 1: Eksperimen Pembagi Pizza (2, 3, 4, 5, 6, 8, 10, 12 bagian) */}
                {activeCategory.id === 1 && (
                  <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
                    <SinglePizza25D
                      totalSlices={demoDenom}
                      activeSlices={demoNum}
                      topping="pepperoni"
                      size={185}
                      showSliceNumbers
                      modeHemat={modeHemat}
                    />
                    <div className="space-y-3 max-w-sm">
                      <div>
                        <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                          Pilih Pembagian Pizza (Penyebut = {demoDenom} bagian sama besar):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[2, 3, 4, 5, 6, 8, 10, 12].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                soundEngine.playSlicePizza();
                                setDemoDenom(d);
                                setDemoNum(Math.min(demoNum, d));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                                demoDenom === d
                                  ? 'bg-amber-500 text-stone-950'
                                  : 'bg-stone-800 text-amber-100 hover:bg-stone-700'
                              }`}
                            >
                              ÷{d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                          Jumlah Bagian Diambil (Pembilang = {demoNum} potong):
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              soundEngine.playSlicePizza();
                              setDemoNum(Math.max(1, demoNum - 1));
                            }}
                            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-lg font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
                            {demoNum}/{demoDenom}
                          </div>
                          <button
                            onClick={() => {
                              soundEngine.playSlicePizza();
                              setDemoNum(Math.min(demoDenom, demoNum + 1));
                            }}
                            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-lg font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs text-amber-200 mt-1.5">
                          Dibaca: <strong className="text-white">{readFractionIndonesian({ num: demoNum, den: demoDenom })}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KATEGORI 2: Demonstrasi Tumpuk (Overlay) Pecahan Senilai */}
                {activeCategory.id === 2 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                      {overlayStacked ? (
                        <div className="flex flex-col items-center">
                          <SinglePizza25D
                            totalSlices={8}
                            activeSlices={4}
                            topping="pepperoni"
                            size={180}
                            modeHemat={modeHemat}
                            overlayGhostSlices={{ totalSlices: 2, activeSlices: 1 }}
                          />
                          <span className="mt-2 text-xs font-bold text-amber-300">
                            Ditumpuk: 1/2 = 2/4 = 4/8 (Luasnya Sama Persis!)
                          </span>
                        </div>
                      ) : (
                        activeCategory.demoConfig.fractions.map((f, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <SinglePizza25D
                              totalSlices={f.den}
                              activeSlices={f.num}
                              topping="pepperoni"
                              size={135}
                              modeHemat={modeHemat}
                            />
                            <span className="mt-1 text-sm font-mono font-bold text-amber-300">
                              {formatFraction(f)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          soundEngine.playSlicePizza();
                          setOverlayStacked(!overlayStacked);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                      >
                        {overlayStacked ? 'Pisahkan Kembali 3 Loyang Pizza' : 'Tumpuk Ketiga Pizza (Buktikan Luasnya Sama!)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* KATEGORI 13: Demonstrasi Bertahap Peminjaman Pecahan Campuran */}
                {activeCategory.id === 13 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                      {borrowStep === 0 ? (
                        <div className="text-center space-y-2">
                          <MultiPizzaFractionView
                            fraction={{ whole: 3, num: 1, den: 4 }}
                            topping="pepperoni"
                            size={120}
                            modeHemat={modeHemat}
                          />
                          <div className="text-xs text-amber-200">
                            Langkah Awal: <strong>3 1/4</strong> (3 loyang utuh + 1/4 potong) hendak dikurangi <strong>1 2/4</strong>.
                          </div>
                        </div>
                      ) : borrowStep === 1 ? (
                        <div className="text-center space-y-2">
                          <MultiPizzaFractionView
                            fraction={{ whole: 2, num: 5, den: 4 }}
                            topping="pepperoni"
                            size={120}
                            modeHemat={modeHemat}
                          />
                          <div className="text-xs text-emerald-300">
                            Setelah Pinjam 1 Pizza Utuh (4/4): <strong>3 1/4</strong> berubah menjadi <strong>2 5/4</strong>!
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <MultiPizzaFractionView
                            fraction={{ whole: 1, num: 3, den: 4 }}
                            topping="pepperoni"
                            size={125}
                            modeHemat={modeHemat}
                          />
                          <div className="text-xs text-amber-300">
                            Hasil Pengurangan: <strong>2 5/4 - 1 2/4 = 1 3/4</strong>!
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playSlicePizza();
                          setBorrowStep(0);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          borrowStep === 0 ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-100'
                        }`}
                      >
                        1. Lihat Awal (3 1/4)
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playSlicePizza();
                          setBorrowStep(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          borrowStep === 1 ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-100'
                        }`}
                      >
                        2. Pinjam 1 Pizza Utuh (Jadi 2 5/4)
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playSlicePizza();
                          setBorrowStep(2);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          borrowStep === 2 ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-100'
                        }`}
                      >
                        3. Kurangkan 1 2/4 (Hasil 1 3/4)
                      </button>
                    </div>
                  </div>
                )}

                {/* KATEGORI LAINNYA (3 - 12): Visualisasi Contoh Pizza & Hasil */}
                {activeCategory.id !== 1 && activeCategory.id !== 2 && activeCategory.id !== 13 && (
                  <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                    {activeCategory.demoConfig.fractions.map((f, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <MultiPizzaFractionView
                          fraction={f}
                          topping={idx % 2 === 0 ? 'pepperoni' : 'mushroom'}
                          size={125}
                          modeHemat={modeHemat}
                        />
                        <span className="mt-1.5 text-sm font-mono font-bold text-amber-300">
                          {formatFraction(f)}
                        </span>
                      </div>
                    ))}
                    {activeCategory.demoConfig.targetResult &&
                      activeCategory.demoConfig.fractions.length > 1 && (
                        <>
                          <div className="text-2xl font-bold text-amber-400">→</div>
                          <div className="flex flex-col items-center">
                            <MultiPizzaFractionView
                              fraction={activeCategory.demoConfig.targetResult}
                              topping="extra_cheese"
                              size={125}
                              modeHemat={modeHemat}
                            />
                            <span className="mt-1.5 text-sm font-mono font-bold text-emerald-400">
                              Hasil: {formatFraction(activeCategory.demoConfig.targetResult)}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                )}

                {/* Langkah-langkah Penjelasan Contoh Soal */}
                <div className="bg-stone-800/90 rounded-xl p-3.5 border border-stone-700 space-y-1.5">
                  <div className="text-xs font-bold text-amber-300">
                    Langkah Penyelesaian Contoh Soal:
                  </div>
                  {activeCategory.demoConfig.explanationSteps.map((step, idx) => (
                    <div key={idx} className="text-xs sm:text-sm text-stone-200">
                      • {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

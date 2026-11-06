import React, { useState } from 'react';
import {
  DynamicQuestion,
  generateQuestionForCategory,
} from '../engine/questionGenerator';
import {
  Fraction,
  areEquivalent,
  formatFraction,
  isStrictEqual,
} from '../engine/fractionEngine';
import { MultiPizzaFractionView } from './Pizza25D';
import { WORLDS } from '../data/curriculum';
import { soundEngine } from '../engine/soundEngine';

interface MultiplayerStudent {
  id: number;
  name: string;
  grade: number;
  score: number;
  correctCount: number;
  color: string;
}

interface ClassroomMultiplayerModalProps {
  modeHemat: boolean;
  onClose: () => void;
}

export const ClassroomMultiplayerModal: React.FC<ClassroomMultiplayerModalProps> = ({
  modeHemat,
  onClose,
}) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(0); // 0 = Semua Materi
  const [totalRounds, setTotalRounds] = useState<number>(3);

  const [students, setStudents] = useState<MultiplayerStudent[]>([
    { id: 1, name: 'Tim Koki Merah', grade: 5, score: 0, correctCount: 0, color: '#DC2626' },
    { id: 2, name: 'Tim Koki Biru', grade: 5, score: 0, correctCount: 0, color: '#2563EB' },
    { id: 3, name: 'Tim Koki Hijau', grade: 5, score: 0, correctCount: 0, color: '#16A34A' },
    { id: 4, name: 'Tim Koki Ungu', grade: 5, score: 0, correctCount: 0, color: '#9333EA' },
  ]);

  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [question, setQuestion] = useState<DynamicQuestion | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const pickNextQuestion = (): DynamicQuestion => {
    const world = WORLDS.find((w) => w.id === selectedWorldId);
    // Gunakan kategori yang menghasilkan pilihan tombol cepat untuk turnamen kelas
    const multiCategories = world
      ? world.categories.filter((c) => c !== 1 && c !== 5)
      : [2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13];
    const pool = multiCategories.length > 0 ? multiCategories : [2, 3, 6, 7];
    const catId = pool[Math.floor(Math.random() * pool.length)];
    return generateQuestionForCategory(catId, 2);
  };

  const handleStartMatch = () => {
    soundEngine.playCustomerArrive();
    setStudents((prev) =>
      prev.map((s) => ({ ...s, score: 0, correctCount: 0 }))
    );
    setCurrentTurnIdx(0);
    setCurrentRound(1);
    setFeedback(null);
    setQuestion(pickNextQuestion());
    setPhase('playing');
  };

  const activePlayers = students.slice(0, playerCount);
  const currentStudent = activePlayers[currentTurnIdx] || activePlayers[0];

  const handleAnswerChoice = (chosenFraction?: Fraction, chosenSymbol?: '<' | '=' | '>') => {
    if (!question || feedback) return;

    let isCorrect = false;
    if (question.interactionType === 'COMPARE_SYMBOL' && chosenSymbol) {
      isCorrect = chosenSymbol === question.correctCompareSymbol;
    } else if (chosenFraction) {
      isCorrect = question.strictChoiceMatch
        ? isStrictEqual(chosenFraction, question.targetFraction)
        : areEquivalent(chosenFraction, question.targetFraction);
    }

    if (isCorrect) {
      soundEngine.playCorrect(2);
      setStudents((prev) =>
        prev.map((s, idx) =>
          idx === currentTurnIdx
            ? { ...s, score: s.score + 100, correctCount: s.correctCount + 1 }
            : s
        )
      );
      setFeedback({
        correct: true,
        message: `TEPAT SEKALI! +100 Poin untuk ${currentStudent.name}!`,
      });
    } else {
      soundEngine.playWrong();
      setFeedback({
        correct: false,
        message: `Kurang tepat. Jawaban yang benar: ${
          question.interactionType === 'COMPARE_SYMBOL'
            ? question.correctCompareSymbol
            : formatFraction(question.targetFraction)
        }.`,
      });
    }
  };

  const handleNextTurn = () => {
    soundEngine.playOrderPop();
    setFeedback(null);
    if (currentTurnIdx + 1 < playerCount) {
      setCurrentTurnIdx(currentTurnIdx + 1);
      setQuestion(pickNextQuestion());
    } else if (currentRound < totalRounds) {
      setCurrentTurnIdx(0);
      setCurrentRound(currentRound + 1);
      setQuestion(pickNextQuestion());
    } else {
      soundEngine.playLevelWin();
      setPhase('finished');
    }
  };

  const sortedStandings = [...activePlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-amber-50 border-2 border-amber-600 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Kompetisi Kelas */}
        <div className="bg-gradient-to-r from-red-900 via-amber-900 to-red-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-700">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-amber-300">
              Mode Kompetisi Kelas (Multiplayer Lokal PID — SDN 66 Banda Aceh)
            </h2>
            <p className="text-xs text-amber-100">
              Turnamen Cepat 2–4 Siswa di Layar Interaktif (Interactive Flat Panel)
            </p>
          </div>
          <button
            onClick={() => {
              soundEngine.playOrderPop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
          >
            Kembali ke Menu Utama
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {phase === 'setup' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pilih Jumlah Tim/Siswa */}
                <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    1. Jumlah Peserta / Tim Kelas:
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setPlayerCount(n);
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-display font-bold text-sm cursor-pointer ${
                          playerCount === n
                            ? 'bg-amber-800 text-white'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {n} Pemain
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilih Babak */}
                <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    2. Jumlah Babak (Putaran):
                  </label>
                  <div className="flex gap-2">
                    {[3, 5, 7].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          soundEngine.playOrderPop();
                          setTotalRounds(r);
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-display font-bold text-sm cursor-pointer ${
                          totalRounds === r
                            ? 'bg-amber-800 text-white'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {r} Babak
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilih Materi Dunia */}
                <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    3. Cakupan Materi Soal:
                  </label>
                  <select
                    value={selectedWorldId}
                    onChange={(e) => setSelectedWorldId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-300 font-bold text-xs text-stone-900"
                  >
                    <option value={0}>Campuran Seluruh Materi Pecahan</option>
                    {WORLDS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Peserta */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3">
                <h3 className="text-xs font-bold text-amber-900">
                  Masukkan Nama Siswa / Kelompok yang Bertanding:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePlayers.map((st, idx) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: st.color }}
                      >
                        P{idx + 1}
                      </div>
                      <input
                        type="text"
                        value={st.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudents((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm font-bold text-stone-900"
                        placeholder={`Nama Pemain ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleStartMatch}
                  className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-lg shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  🍕 Mulai Turnamen Kelas Sekarang!
                </button>
              </div>
            </div>
          )}

          {phase === 'playing' && question && (
            <div className="space-y-4">
              {/* Bar Skor Semua Pemain */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {activePlayers.map((st, idx) => {
                  const isTurn = idx === currentTurnIdx;
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isTurn
                          ? 'bg-amber-900 text-white border-amber-400 scale-[1.02] shadow-md'
                          : 'bg-white text-stone-800 border-amber-200 opacity-80'
                      }`}
                    >
                      <div className="text-[11px] font-bold opacity-80">
                        {isTurn ? '▶ GILIRAN MENJAWAB' : `Pemain ${idx + 1}`}
                      </div>
                      <div className="font-display font-bold text-sm truncate">{st.name}</div>
                      <div className="font-mono font-bold text-base text-amber-400 tabular-nums mt-0.5">
                        {st.score} pts ({st.correctCount} Benar)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Area Soal Turnamen */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-amber-300 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                  <span className="text-xs font-bold text-amber-800">
                    Babak {currentRound} dari {totalRounds} · {question.categoryTitle}
                  </span>
                  <span
                    className="px-3 py-1 rounded-lg text-white text-xs font-bold"
                    style={{ backgroundColor: currentStudent.color }}
                  >
                    Giliran: {currentStudent.name}
                  </span>
                </div>

                <p className="text-base sm:text-lg font-display font-bold text-stone-900 text-center">
                  {question.promptInstruction}
                </p>

                {/* Visual Pizza Soal */}
                <div className="flex flex-wrap items-center justify-center gap-6 py-2 bg-amber-50/70 rounded-xl p-4 border border-amber-200/70">
                  {question.promptFractions.map((pf, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <MultiPizzaFractionView
                        fraction={pf}
                        topping={idx % 2 === 0 ? question.topping : question.secondTopping || 'mushroom'}
                        size={130}
                        modeHemat={modeHemat}
                      />
                      <span className="mt-1.5 text-base font-mono font-bold text-stone-900">
                        {formatFraction(pf)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tombol Pilihan Jawaban Besar untuk PID */}
                {question.interactionType === 'COMPARE_SYMBOL' ? (
                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                    {(['<', '=', '>'] as const).map((sym) => (
                      <button
                        key={sym}
                        disabled={Boolean(feedback)}
                        onClick={() => handleAnswerChoice(undefined, sym)}
                        className="py-4 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white font-mono font-bold text-2xl shadow-md cursor-pointer active:scale-95"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(question.choices || []).map((ch, idx) => (
                      <button
                        key={idx}
                        disabled={Boolean(feedback)}
                        onClick={() => handleAnswerChoice(ch)}
                        className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
                      >
                        <MultiPizzaFractionView
                          fraction={ch}
                          topping={question.topping}
                          size={85}
                          showLabel={false}
                          modeHemat={modeHemat}
                        />
                        <span className="text-lg font-mono font-bold text-stone-900 tabular-nums">
                          {formatFraction(ch)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Feedback & Tombol Lanjut Giliran */}
                {feedback && (
                  <div
                    className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                      feedback.correct
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                        : 'bg-rose-100 border-rose-400 text-rose-950'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold text-sm sm:text-base">
                        {feedback.message}
                      </div>
                      <div className="text-xs mt-0.5">{question.cpaExplanation.abstract}</div>
                    </div>
                    <button
                      onClick={handleNextTurn}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      Giliran Berikutnya →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'finished' && (
            <div className="text-center space-y-5 py-4">
              <div>
                <div className="text-xs font-bold text-amber-800">HASIL AKHIR KOMPETISI KELAS</div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 mt-1">
                  🏆 Juara Turnamen: {sortedStandings[0]?.name}!
                </h3>
              </div>

              <div className="max-w-lg mx-auto space-y-2.5">
                {sortedStandings.map((st, idx) => (
                  <div
                    key={st.id}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                      idx === 0
                        ? 'bg-yellow-100 border-yellow-500 font-bold'
                        : 'bg-white border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-amber-900">
                        #{idx + 1}
                      </span>
                      <span className="text-base font-display font-bold text-stone-900">
                        {st.name}
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold text-stone-900 tabular-nums">
                      {st.score} pts ({st.correctCount}/{totalRounds} Benar)
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleStartMatch}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer"
                >
                  Main Lagi
                </button>
                <button
                  onClick={() => setPhase('setup')}
                  className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-sm cursor-pointer"
                >
                  Atur Ulang Peserta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

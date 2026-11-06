import React, { useEffect, useState } from 'react';
import {
  CustomFirebaseRTDBConfig,
  DEFAULT_FIREBASE_CONFIG,
  LeaderboardEntry,
  fetchAndSyncTop100Leaderboard,
  loadCustomFirebaseConfig,
  saveCustomFirebaseConfig,
} from '../engine/storageEngine';
import { soundEngine } from '../engine/soundEngine';

interface LeaderboardModalProps {
  currentPlayerId?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentPlayerId,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('-');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>('');
  const [showFbConfig, setShowFbConfig] = useState<boolean>(false);
  const [fbConfig, setFbConfig] = useState<CustomFirebaseRTDBConfig>(loadCustomFirebaseConfig());
  const [configSavedMsg, setConfigSavedMsg] = useState<string>('');

  const refreshBoard = async () => {
    setLoading(true);
    const res = await fetchAndSyncTop100Leaderboard();
    setEntries(res.entries);
    setIsOnline(res.isOnlineConnected);
    setLastUpdated(res.lastUpdated);
    setStatusNote(res.errorMessage || '');
    setLoading(false);
  };

  useEffect(() => {
    refreshBoard();
  }, []);

  const top3 = entries.slice(0, 3);
  const top4To10 = entries.slice(3, 10);
  const rest11To100 = entries.slice(10, 100);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playOrderPop();
    saveCustomFirebaseConfig(fbConfig);
    setConfigSavedMsg('Konfigurasi tersimpan! Menyegarkan papan peringkat...');
    setTimeout(() => {
      setConfigSavedMsg('');
      refreshBoard();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border-2 border-amber-500 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl text-amber-50">
        {/* Header Arcade Leaderboard */}
        <div className="bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 px-4 sm:px-6 py-4 border-b border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-amber-300 tracking-wide">
              🏆 TOP 100 PIZZA FRACTION MASTERS
            </h2>
            <p className="text-xs text-amber-100/90 mt-0.5">
              Papan Peringkat Skor Terbaik (Best Score Policy) · SDN 66 Banda Aceh · Pembaruan Terakhir: {lastUpdated}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                setShowFbConfig(!showFbConfig);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/40 cursor-pointer whitespace-nowrap"
            >
              {showFbConfig ? 'Lihat Peringkat' : 'Konfigurasi Firebase RTDB'}
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                refreshBoard();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer whitespace-nowrap"
            >
              Segarkan Leaderboard
            </button>
            <button
              onClick={() => {
                soundEngine.playOrderPop();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer whitespace-nowrap"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {showFbConfig ? (
            /* Bagian 13.A & 13.E: Konfigurasi Firebase Realtime Database & Security Rules */
            <div className="bg-stone-800 rounded-2xl p-4 sm:p-6 border border-amber-500/30 space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-amber-300">
                  Konfigurasi Firebase Realtime Database (Proyek: {fbConfig.projectId || 'pizza-79a0e'})
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Konfigurasi proyek Firebase (<code className="text-emerald-300">pizza-79a0e</code>) telah terpasang secara bawaan dan berjalan di latar belakang tanpa mengganggu jalannya game. Saat jaringan offline, skor terbaik disimpan secara lokal dan disinkronkan otomatis saat koneksi tersedia.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-amber-200 mb-1">apiKey</label>
                  <input
                    type="text"
                    value={fbConfig.apiKey}
                    onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                    placeholder="Contoh: AIzaSyB..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-200 mb-1">authDomain</label>
                  <input
                    type="text"
                    value={fbConfig.authDomain}
                    onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                    placeholder="pizza-79a0e.firebaseapp.com"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-amber-300 mb-1">
                    databaseURL (Realtime Database Asia-Southeast1)
                  </label>
                  <input
                    type="text"
                    value={fbConfig.databaseURL}
                    onChange={(e) => setFbConfig({ ...fbConfig, databaseURL: e.target.value })}
                    placeholder="https://pizza-79a0e-default-rtdb.asia-southeast1.firebasedatabase.app"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-amber-500/50 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-200 mb-1">projectId</label>
                  <input
                    type="text"
                    value={fbConfig.projectId}
                    onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                    placeholder="pizza-79a0e"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-200 mb-1">storageBucket</label>
                  <input
                    type="text"
                    value={fbConfig.storageBucket}
                    onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                    placeholder="pizza-79a0e.firebasestorage.app"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-200 mb-1">messagingSenderId</label>
                  <input
                    type="text"
                    value={fbConfig.messagingSenderId}
                    onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                    placeholder="200030515109"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-200 mb-1">appId</label>
                  <input
                    type="text"
                    value={fbConfig.appId}
                    onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                    placeholder="1:200030515109:web:0efdb39a42a29a4e74c24c"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-amber-200 mb-1">measurementId</label>
                  <input
                    type="text"
                    value={fbConfig.measurementId || ''}
                    onChange={(e) => setFbConfig({ ...fbConfig, measurementId: e.target.value })}
                    placeholder="G-HF4NTNDZFL"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    Simpan & Hubungkan Firebase RTDB
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playOrderPop();
                      setFbConfig(DEFAULT_FIREBASE_CONFIG);
                      saveCustomFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
                      setConfigSavedMsg('Dikembalikan ke konfigurasi bawaan pizza-79a0e!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-amber-200 font-bold cursor-pointer"
                  >
                    Reset ke Default (pizza-79a0e)
                  </button>
                  {configSavedMsg && (
                    <span className="text-emerald-400 font-semibold">{configSavedMsg}</span>
                  )}
                </div>
              </form>

              {/* Contoh Security Rules sesuai Bagian 13.E */}
              <div className="bg-stone-950 rounded-xl p-4 border border-stone-700 space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  Rekomendasi Firebase Realtime Database Security Rules (Bagian 13.E):
                </div>
                <p className="text-xs text-stone-400">
                  Salin aturan ini ke tab Rules pada Firebase Realtime Database untuk memvalidasi tipe data, mencegah penghapusan, dan memastikan skor hanya meningkat (kebijakan Best Score). Catatan: validasi skor yang sepenuhnya kebal manipulasi klien memerlukan verifikasi backend atau Cloud Functions.
                </p>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto bg-stone-900 p-3 rounded-lg">
{`{
  "rules": {
    "leaderboard": {
      ".read": true,
      "$playerId": {
        ".write": "newData.exists() && (!data.exists() || newData.child('score').val() >= data.child('score').val())",
        ".validate": "newData.hasChildren(['playerId', 'name', 'school', 'grade', 'score', 'accuracyPercent']) && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('grade').val() >= 1 && newData.child('grade').val() <= 6"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-xl font-display font-bold text-amber-300">
                Memuat Data TOP 100 Pizza Fraction Masters...
              </div>
              <p className="text-xs text-stone-400">Menyinkronkan skor terbaik pemain</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              Belum ada data skor pada papan peringkat. Jadilah yang pertama!
            </div>
          ) : (
            <>
              {/* Bar Status Sinkronisasi */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300 bg-stone-800/80 px-4 py-2.5 rounded-xl border border-stone-700">
                <span>
                  Status Penyimpanan:{' '}
                  <strong className={isOnline ? 'text-emerald-400' : 'text-amber-300'}>
                    {isOnline
                      ? 'Terhubung ke Firebase Realtime Database Online'
                      : 'Penyimpanan Lokal & Sinkronisasi Otomatis Aktif'}
                  </strong>
                  {statusNote ? ` · ${statusNote}` : ''}
                </span>
                <span className="font-mono tabular-nums">
                  Menampilkan {entries.length} dari maksimal 100 Pemain Terbaik
                </span>
              </div>

              {/* PODIUM TOP 3 (Medali Emas, Perak, Perunggu) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {top3.map((item, idx) => {
                  const rank = idx + 1;
                  const medal = rank === 1 ? '🥇 MEDALI EMAS' : rank === 2 ? '🥈 MEDALI PERAK' : '🥉 MEDALI PERUNGGU';
                  const borderStyle =
                    rank === 1
                      ? 'border-yellow-400 bg-gradient-to-b from-yellow-950/70 to-stone-900'
                      : rank === 2
                      ? 'border-slate-300 bg-gradient-to-b from-slate-800/70 to-stone-900'
                      : 'border-amber-600 bg-gradient-to-b from-amber-950/70 to-stone-900';

                  const isMe = currentPlayerId && item.playerId === currentPlayerId;

                  return (
                    <div
                      key={item.playerId}
                      className={`p-4 rounded-2xl border-2 ${borderStyle} flex flex-col justify-between gap-2 ${
                        isMe ? 'ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          #{rank} · {medal}
                        </span>
                        <span className="text-xs text-stone-300 font-semibold">
                          Kelas {item.grade}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-display font-bold text-white truncate">
                          {item.name} {isMe && '(Anda)'}
                        </div>
                        <div className="text-xs text-amber-200/80 truncate">{item.school}</div>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-stone-400">
                          Ketepatan {item.accuracyPercent}% · Lv.{item.highestLevel}
                        </span>
                        <span className="text-xl font-mono font-bold text-amber-300 tabular-nums">
                          {item.score.toLocaleString('id-ID')} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SOROTAN KHUSUS PERINGKAT 4 - 10 */}
              {top4To10.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-amber-300 tracking-wider">
                    SOROTAN 10 BESAR (PERINGKAT 4 – 10)
                  </h3>
                  <div className="bg-stone-800/90 rounded-xl border border-amber-500/30 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-stone-950/70 text-amber-200 border-b border-stone-700">
                          <th className="py-2.5 px-3 font-bold">Peringkat</th>
                          <th className="py-2.5 px-3 font-bold">Nama Pemain</th>
                          <th className="py-2.5 px-3 font-bold">Sekolah</th>
                          <th className="py-2.5 px-3 font-bold">Kelas</th>
                          <th className="py-2.5 px-3 font-bold text-right">Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-700/70">
                        {top4To10.map((item, i) => {
                          const rank = i + 4;
                          const isMe = currentPlayerId && item.playerId === currentPlayerId;
                          return (
                            <tr
                              key={item.playerId}
                              className={
                                isMe
                                  ? 'bg-emerald-950/60 text-emerald-200 font-bold'
                                  : 'hover:bg-stone-700/40'
                              }
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-400 tabular-nums">
                                #{rank}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {item.name} {isMe && '★'}
                              </td>
                              <td className="py-2.5 px-3 text-stone-300">{item.school}</td>
                              <td className="py-2.5 px-3 text-stone-300">Kelas {item.grade}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-300 text-right tabular-nums">
                                {item.score.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DAFTAR PERINGKAT 11 - 100 */}
              {rest11To100.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-stone-300 tracking-wider">
                    DAFTAR PERINGKAT 11 – 100
                  </h3>
                  <div className="bg-stone-800/60 rounded-xl border border-stone-700 max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <tbody className="divide-y divide-stone-700/50">
                        {rest11To100.map((item, i) => {
                          const rank = i + 11;
                          const isMe = currentPlayerId && item.playerId === currentPlayerId;
                          return (
                            <tr
                              key={item.playerId}
                              className={
                                isMe
                                  ? 'bg-emerald-950/60 text-emerald-200 font-bold'
                                  : 'hover:bg-stone-700/30'
                              }
                            >
                              <td className="py-2 px-3 font-mono text-stone-400 tabular-nums w-20">
                                #{rank}
                              </td>
                              <td className="py-2 px-3 font-medium text-white">{item.name}</td>
                              <td className="py-2 px-3 text-stone-400">{item.school}</td>
                              <td className="py-2 px-3 text-stone-400">Kelas {item.grade}</td>
                              <td className="py-2 px-3 font-mono font-bold text-amber-200 text-right tabular-nums">
                                {item.score.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

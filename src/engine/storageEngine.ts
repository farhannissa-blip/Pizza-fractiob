/**
 * SISTEM PENYIMPANAN PROGRES PEMAIN & TOP 100 LEADERBOARD (BEST SCORE POLICY)
 * Pizza Fraction Frenzy — SDN 66 Banda Aceh
 *
 * Fitur:
 * 1. Menyimpan identitas pemain (Nama, Asal Sekolah, Kelas, ID Unik).
 * 2. Menyimpan progres level, bintang, uang, upgrade restoran, dan statistik di LocalStorage.
 * 3. Sistem TOP 100 Leaderboard dengan kebijakan BEST SCORE (tanpa duplikasi pemain),
 *    antrean sinkronisasi offline (Offline Sync Queue), serta opsi sinkronisasi Realtime Database.
 */

export interface PlayerIdentity {
  playerId: string;
  name: string;
  school: string;
  grade: number; // Kelas 1 - 6
}

export interface DailyMissionTemplate {
  id: string;
  title: string;
  englishSubtitle: string;
  description: string;
  targetCount: number;
  targetCategories: number[]; // Kategori kurikulum yang dihitung (kosong = semua kategori)
  recommendedCategoryId: number; // Kategori yang langsung dibuka saat klik "Kerjakan Misi"
  rewardMoney: number;
  rewardXp: number;
  gasingTip: string;
}

export interface DailyMissionState {
  dateKey: string; // YYYY-MM-DD
  missionId: string;
  currentCount: number;
  targetCount: number;
  claimed: boolean;
  loginStreakDays: number;
  lastLoginDate: string;
  completedMissionsCount: number;
}

export interface PlayerProgress {
  identity: PlayerIdentity | null;
  money: number;
  totalScore: number;
  xp: number;
  highestLevelUnlocked: number;
  levelStars: Record<number, number>; // levelId -> 1..3 bintang
  purchasedUpgrades: string[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  customersServed: number;
  masteredCategories: number[];
  totalPlayTimeSeconds: number;
  modeHemat: boolean;
  dailyMission: DailyMissionState;
}

export interface LeaderboardEntry {
  playerId: string;
  sessionId: string;
  name: string;
  school: string;
  grade: number;
  score: number;
  totalMoney: number;
  highestLevel: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyPercent: number;
  playTimeSeconds: number;
  completedAt: string;
}

/**
 * KONFIGURASI OPSIONAL FIREBASE REALTIME DATABASE
 * Guru/Admin dapat memasukkan databaseURL proyek Firebase Realtime Database di bawah ini
 * atau melalui menu Pengaturan Leaderboard di dalam game.
 * Contoh format databaseURL: "https://nama-proyek-default-rtdb.asia-southeast1.firebasedatabase.app"
 */
export interface CustomFirebaseRTDBConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: CustomFirebaseRTDBConfig = {
  apiKey: 'AIzaSyB5rNFhykItulkadbfi4uOrlNw7TdGJGuc',
  authDomain: 'pizza-79a0e.firebaseapp.com',
  databaseURL:
    'https://pizza-79a0e-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'pizza-79a0e',
  storageBucket: 'pizza-79a0e.firebasestorage.app',
  messagingSenderId: '200030515109',
  appId: '1:200030515109:web:0efdb39a42a29a4e74c24c',
  measurementId: 'G-HF4NTNDZFL',
};

const STORAGE_KEY_PROGRESS = 'pff_sdn66_progress_v1';
const STORAGE_KEY_LEADERBOARD = 'pff_sdn66_leaderboard_v1';
const STORAGE_KEY_PENDING_SYNC = 'pff_sdn66_pending_sync_v1';
const STORAGE_KEY_FB_CONFIG = 'pff_sdn66_fb_config_v1';

export const DAILY_MISSION_POOL: DailyMissionTemplate[] = [
  {
    id: 'dm_mixed_fractions_5',
    title: 'Misi Harian: Master Pecahan Campuran',
    englishSubtitle: 'Solve 5 Mixed Fraction Problems',
    description:
      'Selesaikan 5 soal Pecahan Campuran (Mengenal, Mengubah, Menjumlahkan, atau Mengurangkan Pecahan Campuran) untuk meraih Hadiah Spesial Koki!',
    targetCount: 5,
    targetCategories: [8, 9, 11, 12, 13],
    recommendedCategoryId: 12,
    rewardMoney: 50,
    rewardXp: 350,
    gasingTip:
      'Trik GASING Pecahan Campuran: Pisahkan loyang pizza utuh (bilangan bulat) dan potongan pecahannya agar lebih cepat dihitung!',
  },
  {
    id: 'dm_equivalent_simplify_5',
    title: 'Misi Harian: Ahli Pecahan Senilai & FPB',
    englishSubtitle: 'Solve 5 Equivalent & Simplifying Fraction Problems',
    description:
      'Selesaikan 5 soal Pecahan Senilai atau Menyederhanakan Pecahan dengan FPB untuk menjaga kualitas potongan pizza restoran!',
    targetCount: 5,
    targetCategories: [2, 10],
    recommendedCategoryId: 2,
    rewardMoney: 45,
    rewardXp: 300,
    gasingTip:
      'Trik GASING: Bagi atau kalikan pembilang dan penyebut dengan angka yang sama besar!',
  },
  {
    id: 'dm_add_fractions_5',
    title: 'Misi Harian: Spesialis Penjumlahan Pizza (KPK)',
    englishSubtitle: 'Solve 5 Fraction Addition Problems',
    description:
      'Selesaikan 5 soal Penjumlahan Pecahan (Penyebut Sama atau Berbeda) di meja saji 3D!',
    targetCount: 5,
    targetCategories: [6, 7, 12],
    recommendedCategoryId: 7,
    rewardMoney: 45,
    rewardXp: 320,
    gasingTip:
      'Trik GASING KPK: Samakan ukuran potongan loyang (penyebut) terlebih dahulu sebelum menjumlahkan pembilang!',
  },
  {
    id: 'dm_compare_order_5',
    title: 'Misi Harian: Juri Perbandingan & Urutan Pizza',
    englishSubtitle: 'Solve 5 Fraction Comparison & Ordering Problems',
    description:
      'Selesaikan 5 soal Membandingkan atau Mengurutkan Pecahan untuk melayani pelanggan VIP!',
    targetCount: 5,
    targetCategories: [3, 4, 5],
    recommendedCategoryId: 4,
    rewardMoney: 40,
    rewardXp: 280,
    gasingTip:
      'Trik GASING Kali Silang: Kalikan silang pembilang dan penyebut untuk mengetahui pecahan mana yang lebih besar dalam 3 detik!',
  },
  {
    id: 'dm_concept_master_5',
    title: 'Misi Harian: Koki Cepat Segala Pesanan',
    englishSubtitle: 'Serve 5 Accurate Pizza Fraction Orders',
    description:
      'Selesaikan 5 pesanan pecahan dari kategori mana saja dengan tepat waktu di meja saji 3D!',
    targetCount: 5,
    targetCategories: [],
    recommendedCategoryId: 1,
    rewardMoney: 40,
    rewardXp: 250,
    gasingTip:
      'Ingat Prinsip CPA: Perhatikan loyang pizza 3D (Concrete), bandingkan juringnya (Pictorial), lalu pastikan angkanya (Abstract)!',
  },
];

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyMissionTemplate(missionId?: string): DailyMissionTemplate {
  if (missionId) {
    const found = DAILY_MISSION_POOL.find((m) => m.id === missionId);
    if (found) return found;
  }
  return DAILY_MISSION_POOL[0];
}

export function createInitialDailyMissionState(): DailyMissionState {
  const today = getTodayDateKey();
  return {
    dateKey: today,
    missionId: DAILY_MISSION_POOL[0].id, // Default hari pertama: Solve 5 Mixed Fraction Problems
    currentCount: 0,
    targetCount: DAILY_MISSION_POOL[0].targetCount,
    claimed: false,
    loginStreakDays: 1,
    lastLoginDate: today,
    completedMissionsCount: 0,
  };
}

export function syncDailyMissionForToday(existing?: DailyMissionState): DailyMissionState {
  const today = getTodayDateKey();
  if (!existing) {
    return createInitialDailyMissionState();
  }
  if (existing.dateKey === today) {
    return existing;
  }

  // Hari baru: hitung login streak harian
  const yesterday = getYesterdayDateKey();
  const nextStreak =
    existing.lastLoginDate === yesterday ? existing.loginStreakDays + 1 : 1;

  // Pilih misi harian berdasarkan tanggal agar berganti setiap hari
  const daySeed = Number(today.replace(/-/g, '')) || 0;
  const pickedTemplate = DAILY_MISSION_POOL[daySeed % DAILY_MISSION_POOL.length];

  return {
    dateKey: today,
    missionId: pickedTemplate.id,
    currentCount: 0,
    targetCount: pickedTemplate.targetCount,
    claimed: false,
    loginStreakDays: nextStreak,
    lastLoginDate: today,
    completedMissionsCount: existing.completedMissionsCount || 0,
  };
}

const INITIAL_PROGRESS: PlayerProgress = {
  identity: null,
  money: 30, // Modal awal pembukaan restoran pizza
  totalScore: 0,
  xp: 0,
  highestLevelUnlocked: 1,
  levelStars: {},
  purchasedUpgrades: [],
  totalQuestions: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  customersServed: 0,
  masteredCategories: [],
  totalPlayTimeSeconds: 0,
  modeHemat: false,
  dailyMission: createInitialDailyMissionState(),
};

/**
 * Data awal peringkat siswa SDN 66 Banda Aceh agar papan peringkat
 * langsung ramai dan memotivasi kompetisi sehat di kelas.
 */
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    playerId: 'seed_sdn66_01',
    sessionId: 'sess_seed_01',
    name: 'Teuku Muhammad Farhan',
    school: 'SDN 66 Banda Aceh',
    grade: 5,
    score: 2850,
    totalMoney: 420,
    highestLevel: 15,
    correctAnswers: 42,
    wrongAnswers: 2,
    accuracyPercent: 95,
    playTimeSeconds: 540,
    completedAt: '2026-11-05T04:15:00.000Z',
  },
  {
    playerId: 'seed_sdn66_02',
    sessionId: 'sess_seed_02',
    name: 'Cut Annisa Humaira',
    school: 'SDN 66 Banda Aceh',
    grade: 6,
    score: 2640,
    totalMoney: 390,
    highestLevel: 14,
    correctAnswers: 38,
    wrongAnswers: 3,
    accuracyPercent: 93,
    playTimeSeconds: 510,
    completedAt: '2026-11-05T04:20:00.000Z',
  },
  {
    playerId: 'seed_sdn66_03',
    sessionId: 'sess_seed_03',
    name: 'M. Rizky Al-Fatih',
    school: 'SDN 66 Banda Aceh',
    grade: 5,
    score: 2390,
    totalMoney: 345,
    highestLevel: 13,
    correctAnswers: 35,
    wrongAnswers: 3,
    accuracyPercent: 92,
    playTimeSeconds: 480,
    completedAt: '2026-11-05T04:30:00.000Z',
  },
  {
    playerId: 'seed_sdn66_04',
    sessionId: 'sess_seed_04',
    name: 'Siti Nabila Azzahra',
    school: 'SDN 66 Banda Aceh',
    grade: 4,
    score: 2120,
    totalMoney: 310,
    highestLevel: 12,
    correctAnswers: 31,
    wrongAnswers: 4,
    accuracyPercent: 89,
    playTimeSeconds: 460,
    completedAt: '2026-11-05T04:40:00.000Z',
  },
  {
    playerId: 'seed_sdn66_05',
    sessionId: 'sess_seed_05',
    name: 'Zaki Maulana Putra',
    school: 'SDN 66 Banda Aceh',
    grade: 6,
    score: 1950,
    totalMoney: 280,
    highestLevel: 11,
    correctAnswers: 29,
    wrongAnswers: 4,
    accuracyPercent: 88,
    playTimeSeconds: 430,
    completedAt: '2026-11-05T04:50:00.000Z',
  },
  {
    playerId: 'seed_sdn66_06',
    sessionId: 'sess_seed_06',
    name: 'Pocut Khaira Syifa',
    school: 'SDN 66 Banda Aceh',
    grade: 4,
    score: 1780,
    totalMoney: 255,
    highestLevel: 10,
    correctAnswers: 26,
    wrongAnswers: 3,
    accuracyPercent: 90,
    playTimeSeconds: 400,
    completedAt: '2026-11-05T05:00:00.000Z',
  },
  {
    playerId: 'seed_sdn66_07',
    sessionId: 'sess_seed_07',
    name: 'Ahmad Danish Pratama',
    school: 'SDN 66 Banda Aceh',
    grade: 5,
    score: 1620,
    totalMoney: 230,
    highestLevel: 9,
    correctAnswers: 24,
    wrongAnswers: 4,
    accuracyPercent: 86,
    playTimeSeconds: 390,
    completedAt: '2026-11-05T05:05:00.000Z',
  },
  {
    playerId: 'seed_sdn66_08',
    sessionId: 'sess_seed_08',
    name: 'Nasywa Kamila',
    school: 'SDN 66 Banda Aceh',
    grade: 3,
    score: 1450,
    totalMoney: 210,
    highestLevel: 8,
    correctAnswers: 21,
    wrongAnswers: 3,
    accuracyPercent: 88,
    playTimeSeconds: 360,
    completedAt: '2026-11-05T05:10:00.000Z',
  },
  {
    playerId: 'seed_sdn66_09',
    sessionId: 'sess_seed_09',
    name: 'Rayyan Ghifari',
    school: 'SDN 66 Banda Aceh',
    grade: 4,
    score: 1290,
    totalMoney: 185,
    highestLevel: 7,
    correctAnswers: 19,
    wrongAnswers: 4,
    accuracyPercent: 83,
    playTimeSeconds: 340,
    completedAt: '2026-11-05T05:15:00.000Z',
  },
  {
    playerId: 'seed_sdn66_10',
    sessionId: 'sess_seed_10',
    name: 'Aisyah Meutuah',
    school: 'SDN 66 Banda Aceh',
    grade: 3,
    score: 1140,
    totalMoney: 165,
    highestLevel: 6,
    correctAnswers: 17,
    wrongAnswers: 3,
    accuracyPercent: 85,
    playTimeSeconds: 310,
    completedAt: '2026-11-05T05:20:00.000Z',
  },
];

/**
 * Menghasilkan ID Pemain deterministik berdasarkan nama + sekolah + kelas
 * agar satu siswa yang sama tidak terduplikasi pada Top 100 Leaderboard.
 */
export function generatePlayerId(name: string, school: string, grade: number): string {
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanSchool = school.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `player_${cleanName}_${cleanSchool}_k${grade}`;
}

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      levelStars: parsed.levelStars || {},
      purchasedUpgrades: parsed.purchasedUpgrades || [],
      masteredCategories: parsed.masteredCategories || [],
      dailyMission: syncDailyMissionForToday(parsed.dailyMission),
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCustomFirebaseConfig(): CustomFirebaseRTDBConfig {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_FB_CONFIG);
    if (!raw) return DEFAULT_FIREBASE_CONFIG;
    const parsed = JSON.parse(raw) as Partial<CustomFirebaseRTDBConfig>;
    return {
      apiKey: parsed.apiKey?.trim() || DEFAULT_FIREBASE_CONFIG.apiKey,
      authDomain:
        parsed.authDomain?.trim() || DEFAULT_FIREBASE_CONFIG.authDomain,
      databaseURL:
        parsed.databaseURL?.trim() || DEFAULT_FIREBASE_CONFIG.databaseURL,
      projectId: parsed.projectId?.trim() || DEFAULT_FIREBASE_CONFIG.projectId,
      storageBucket:
        parsed.storageBucket?.trim() || DEFAULT_FIREBASE_CONFIG.storageBucket,
      messagingSenderId:
        parsed.messagingSenderId?.trim() ||
        DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: parsed.appId?.trim() || DEFAULT_FIREBASE_CONFIG.appId,
      measurementId:
        parsed.measurementId?.trim() || DEFAULT_FIREBASE_CONFIG.measurementId,
    };
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}

export function saveCustomFirebaseConfig(cfg: CustomFirebaseRTDBConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_FB_CONFIG, JSON.stringify(cfg));
  } catch {
    // Ignore
  }
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = 4000
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Memuat Top 100 Leaderboard lokal (diurutkan dari skor tertinggi ke terendah)
 */
export function loadLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return SEED_LEADERBOARD;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(SEED_LEADERBOARD));
      return SEED_LEADERBOARD;
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return sortAndCapTop100(parsed);
  } catch {
    return SEED_LEADERBOARD;
  }
}

function sortAndCapTop100(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  // Pastikan deduplikasi berdasarkan playerId dengan kebijakan BEST SCORE
  const map = new Map<string, LeaderboardEntry>();
  for (const item of entries) {
    if (!item || typeof item.playerId !== 'string' || typeof item.score !== 'number') {
      continue;
    }
    const existing = map.get(item.playerId);
    if (!existing || item.score > existing.score) {
      map.set(item.playerId, item);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.score - a.score || b.accuracyPercent - a.accuracyPercent)
    .slice(0, 100);
}

/**
 * Menyimpan atau memperbarui skor pemain dengan kebijakan BEST SCORE:
 * - Jika skor baru > skor lama: perbarui skor terbaik.
 * - Jika skor baru <= skor lama: pertahankan skor terbaik sebelumnya.
 * - Jika sedang offline atau Firebase RTDB dikonfigurasi, simpan ke antrean sinkronisasi tanpa mengganggu jalannya game.
 */
export async function submitBestScoreToLeaderboard(
  progress: PlayerProgress,
  sessionId: string
): Promise<{
  updatedBest: boolean;
  rank: number;
  entries: LeaderboardEntry[];
  syncedOnline: boolean;
}> {
  if (!progress.identity || progress.totalScore <= 0) {
    const current = loadLocalLeaderboard();
    return { updatedBest: false, rank: -1, entries: current, syncedOnline: false };
  }

  const totalAns = progress.correctAnswers + progress.wrongAnswers;
  const accuracy = totalAns > 0 ? Math.round((progress.correctAnswers / totalAns) * 100) : 100;

  const newEntry: LeaderboardEntry = {
    playerId: progress.identity.playerId,
    sessionId,
    name: progress.identity.name,
    school: progress.identity.school,
    grade: progress.identity.grade,
    score: progress.totalScore,
    totalMoney: progress.money,
    highestLevel: progress.highestLevelUnlocked,
    correctAnswers: progress.correctAnswers,
    wrongAnswers: progress.wrongAnswers,
    accuracyPercent: accuracy,
    playTimeSeconds: progress.totalPlayTimeSeconds,
    completedAt: new Date().toISOString(),
  };

  const currentList = loadLocalLeaderboard();
  const existingIdx = currentList.findIndex((e) => e.playerId === newEntry.playerId);

  let updatedBest = false;
  if (existingIdx === -1) {
    currentList.push(newEntry);
    updatedBest = true;
  } else if (newEntry.score > currentList[existingIdx].score) {
    currentList[existingIdx] = newEntry;
    updatedBest = true;
  }

  const sorted = sortAndCapTop100(currentList);
  try {
    window.localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(sorted));
  } catch {
    // Ignore
  }

  const rank = sorted.findIndex((e) => e.playerId === newEntry.playerId) + 1;

  // Sinkronisasi latar belakang ke Firebase Realtime Database (pizza-79a0e) tanpa mengganggu game
  let syncedOnline = false;
  const fbConfig = loadCustomFirebaseConfig();
  if (fbConfig.databaseURL && fbConfig.databaseURL.startsWith('https://')) {
    try {
      const cleanUrl = fbConfig.databaseURL.replace(/\/$/, '');
      const targetEntry = sorted.find((e) => e.playerId === newEntry.playerId) || newEntry;
      const res = await fetchWithTimeout(
        `${cleanUrl}/leaderboard/${encodeURIComponent(targetEntry.playerId)}.json`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetEntry),
        },
        4000
      );
      if (res.ok) {
        syncedOnline = true;
      } else {
        queuePendingSync(targetEntry);
      }
    } catch {
      queuePendingSync(newEntry);
    }
  }

  return { updatedBest, rank, entries: sorted, syncedOnline };
}

function queuePendingSync(entry: LeaderboardEntry) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PENDING_SYNC);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((e) => e.playerId !== entry.playerId);
    filtered.push(entry);
    window.localStorage.setItem(STORAGE_KEY_PENDING_SYNC, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}

/**
 * Mengambil & menyinkronkan Top 100 Leaderboard dari Firebase Realtime Database (pizza-79a0e)
 * dan menggabungkannya dengan penyimpanan lokal secara aman tanpa mengganggu jalannya game.
 */
export async function fetchAndSyncTop100Leaderboard(): Promise<{
  entries: LeaderboardEntry[];
  isOnlineConnected: boolean;
  lastUpdated: string;
  errorMessage?: string;
}> {
  const localEntries = loadLocalLeaderboard();
  const fbConfig = loadCustomFirebaseConfig();
  const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (!fbConfig.databaseURL || !fbConfig.databaseURL.startsWith('https://')) {
    return {
      entries: localEntries,
      isOnlineConnected: false,
      lastUpdated: nowStr,
    };
  }

  try {
    const cleanUrl = fbConfig.databaseURL.replace(/\/$/, '');

    // Kirim antrean offline jika ada
    const pendingRaw = window.localStorage.getItem(STORAGE_KEY_PENDING_SYNC);
    if (pendingRaw) {
      const pendingList: LeaderboardEntry[] = JSON.parse(pendingRaw);
      for (const item of pendingList) {
        await fetchWithTimeout(
          `${cleanUrl}/leaderboard/${encodeURIComponent(item.playerId)}.json`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          },
          3500
        );
      }
      window.localStorage.removeItem(STORAGE_KEY_PENDING_SYNC);
    }

    const response = await fetchWithTimeout(`${cleanUrl}/leaderboard.json`, undefined, 4000);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const remoteEntries: LeaderboardEntry[] =
      data && typeof data === 'object' ? Object.values(data) : [];
    const merged = sortAndCapTop100([...localEntries, ...remoteEntries]);
    window.localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(merged));

    return {
      entries: merged,
      isOnlineConnected: true,
      lastUpdated: nowStr,
    };
  } catch (err) {
    return {
      entries: localEntries,
      isOnlineConnected: false,
      lastUpdated: nowStr,
      errorMessage:
        err instanceof Error
          ? `Cadangan Lokal Aktif (Sinkronisasi RTDB: ${err.message})`
          : 'Cadangan Lokal Aktif',
    };
  }
}

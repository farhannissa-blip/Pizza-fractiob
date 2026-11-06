/**
 * DATA KURIKULUM 13 KATEGORI PECAHAN (METODE GASING & SINGAPORE MATH CPA),
 * 5 DUNIA (WORLDS), 16 LEVEL, UPGRADE RESTORAN, DAN PENCAPAIAN
 * Pizza Fraction Frenzy — SDN 66 Banda Aceh
 */

import { Fraction } from '../engine/fractionEngine';

export type PizzaToppingId =
  | 'pepperoni'
  | 'mushroom'
  | 'paprika'
  | 'corn'
  | 'sausage'
  | 'extra_cheese';

export interface ToppingInfo {
  id: PizzaToppingId;
  name: string;
  color: string;
}

export const TOPPINGS: ToppingInfo[] = [
  { id: 'pepperoni', name: 'Pepperoni Sapi', color: '#B91C1C' },
  { id: 'mushroom', name: 'Jamur Segar', color: '#78716C' },
  { id: 'paprika', name: 'Paprika Hijau', color: '#15803D' },
  { id: 'corn', name: 'Jagung Manis', color: '#EAB308' },
  { id: 'sausage', name: 'Sosis Panggang', color: '#9A3412' },
  { id: 'extra_cheese', name: 'Keju Mozzarella Ekstra', color: '#FEF08A' },
];

export interface CategoryCurriculum {
  id: number;
  code: string;
  title: string;
  shortTitle: string;
  worldId: number;
  methodBadge: 'Singapore Math CPA' | 'Metode GASING' | 'GASING & Singapore CPA';
  conceptSummary: string;
  concreteStep: string;
  pictorialStep: string;
  abstractStep: string;
  gasingTip: string;
  demoConfig: {
    type:
      | 'slice_select'
      | 'equivalent_overlay'
      | 'compare_same'
      | 'compare_diff'
      | 'order_fractions'
      | 'add_same'
      | 'add_diff'
      | 'mixed_concept'
      | 'improper_to_mixed'
      | 'simplify'
      | 'mixed_to_improper'
      | 'add_mixed'
      | 'sub_mixed';
    fractions: Fraction[];
    targetResult?: Fraction;
    explanationSteps: string[];
  };
}

export const CURRICULUM_CATEGORIES: CategoryCurriculum[] = [
  {
    id: 1,
    code: 'KAT-1',
    title: 'Mengenal Konsep Pecahan',
    shortTitle: 'Konsep Pecahan',
    worldId: 1,
    methodBadge: 'Singapore Math CPA',
    conceptSummary:
      'Pecahan menyatakan beberapa bagian dari keseluruhan yang dibagi sama besar. Ditulis a/b, di mana a adalah Pembilang (bagian yang diambil) dan b adalah Penyebut (jumlah seluruh bagian sama besar).',
    concreteStep:
      'CONCRETE: Satu loyang pizza utuh dipotong menjadi beberapa bagian yang ukurannya sama persis (2, 3, 4, 5, 6, 8, 10, atau 12 potong).',
    pictorialStep:
      'PICTORIAL: Perhatikan gambar pizza yang dibagi 4 bagian sama besar. Tiga bagian diberi topping pepperoni.',
    abstractStep:
      'ABSTRACT: Ditulis 3/4 (dibaca: tiga per empat). Angka 3 = Pembilang (diambil), Angka 4 = Penyebut (seluruh potongan).',
    gasingTip:
      'Ingat GASING: "Atas diambil (Pembilang), Bawah semuanya (Penyebut)!" Syarat wajib: setiap potong pizza ukurannya harus SAMA BESAR.',
    demoConfig: {
      type: 'slice_select',
      fractions: [{ num: 3, den: 4 }],
      targetResult: { num: 3, den: 4 },
      explanationSteps: [
        'Satu loyang pizza utuh dipotong menjadi 4 bagian yang sama besar.',
        'Pelanggan memesan 3 potong dari 4 bagian tersebut.',
        'Angka 4 di bawah (Penyebut) menunjukkan jumlah seluruh bagian yang sama besar.',
        'Angka 3 di atas (Pembilang) menunjukkan jumlah bagian pizza yang diambil (3/4).',
      ],
    },
  },
  {
    id: 2,
    code: 'KAT-2',
    title: 'Pecahan Senilai',
    shortTitle: 'Pecahan Senilai',
    worldId: 2,
    methodBadge: 'GASING & Singapore CPA',
    conceptSummary:
      'Pecahan senilai adalah pecahan yang memiliki tulisan angka berbeda tetapi mewakili luas bagian pizza yang SAMA BESAR.',
    concreteStep:
      'CONCRETE: Bandingkan 1 potong dari pizza dibagi 2 (1/2), 2 potong dari pizza dibagi 4 (2/4), dan 4 potong dari pizza dibagi 8 (4/8).',
    pictorialStep:
      'PICTORIAL: Ketika potongan pizza 1/2, 2/4, dan 4/8 ditumpuk di atas satu sama lain, ketiganya menutupi tepat setengah loyang pizza!',
    abstractStep:
      'ABSTRACT: 1/2 = (1×2)/(2×2) = 2/4 = (2×2)/(4×2) = 4/8. Pembilang dan penyebut dikali atau dibagi bilangan yang sama.',
    gasingTip:
      'Jika pizza dipotong 2 kali lebih kecil, maka jumlah potongannya juga menjadi 2 kali lebih banyak agar porsinya tetap sama!',
    demoConfig: {
      type: 'equivalent_overlay',
      fractions: [
        { num: 1, den: 2 },
        { num: 2, den: 4 },
        { num: 4, den: 8 },
      ],
      targetResult: { num: 1, den: 2 },
      explanationSteps: [
        'Pizza pertama: 1/2 (1 potong dari 2 bagian).',
        'Pizza kedua: 2/4 (2 potong dari 4 bagian).',
        'Pizza ketiga: 4/8 (4 potong dari 8 bagian).',
        'Saat ditumpuk, luas ketiganya SAMA PERSIS! Karena pembilang & penyebut dikalikan angka yang sama.',
      ],
    },
  },
  {
    id: 3,
    code: 'KAT-3',
    title: 'Membandingkan Pecahan Penyebut Sama',
    shortTitle: 'Bandingkan Penyebut Sama',
    worldId: 2,
    methodBadge: 'Singapore Math CPA',
    conceptSummary:
      'Jika dua pecahan memiliki penyebut yang sama, ukuran tiap potong pizzanya sudah sama besar. Kita cukup membandingkan pembilangnya!',
    concreteStep:
      'CONCRETE: Dua loyang pizza sama-sama dipotong menjadi 5 bagian sama besar (per-limaan).',
    pictorialStep:
      'PICTORIAL: Loyang A berisi 2 potong (2/5), sedangkan Loyang B berisi 4 potong (4/5). Terlihat jelas Loyang B lebih banyak.',
    abstractStep:
      'ABSTRACT: Karena penyebut sama-sama 5 dan 2 < 4, maka 2/5 < 4/5 (2/5 lebih kecil dari 4/5).',
    gasingTip:
      'Ukuran potongannya sudah kembar! Siapa yang jumlah potongannya (pembilang) lebih banyak, dialah yang lebih besar.',
    demoConfig: {
      type: 'compare_same',
      fractions: [
        { num: 2, den: 5 },
        { num: 4, den: 5 },
      ],
      explanationSteps: [
        'Kedua pizza dibagi menjadi 5 bagian yang sama besar (penyebut = 5).',
        'Pizza kiri mengambil 2 potong (2/5), pizza kanan mengambil 4 potong (4/5).',
        'Karena 2 potong lebih sedikit daripada 4 potong, maka 2/5 < 4/5.',
      ],
    },
  },
  {
    id: 4,
    code: 'KAT-4',
    title: 'Membandingkan Pecahan Penyebut Berbeda',
    shortTitle: 'Bandingkan Penyebut Beda',
    worldId: 2,
    methodBadge: 'GASING & Singapore CPA',
    conceptSummary:
      'Untuk membandingkan pecahan dengan penyebut berbeda, kita lihat luas juring pizzanya atau samakan penyebutnya terlebih dahulu.',
    concreteStep:
      'CONCRETE: Pizza A dipotong 2 (1/2) dan Pizza B dipotong 3 lalu diambil 2 (2/3).',
    pictorialStep:
      'PICTORIAL: Potong kembali kedua pizza menjadi 6 bagian sama besar: 1/2 menjadi 3/6, sedangkan 2/3 menjadi 4/6.',
    abstractStep:
      'ABSTRACT: Karena 3/6 < 4/6 (atau perkalian silang GASING: 1×3 = 3 < 2×2 = 4), maka 1/2 < 2/3.',
    gasingTip:
      'Trik Cepat GASING: Kalikan silang ke atas! (1 × 3 = 3) dibanding (2 × 2 = 4). Karena 3 < 4, maka 1/2 < 2/3!',
    demoConfig: {
      type: 'compare_diff',
      fractions: [
        { num: 1, den: 2 },
        { num: 2, den: 3 },
      ],
      explanationSteps: [
        'Bandingkan luas pizza 1/2 dan 2/3 pada ukuran loyang yang sama.',
        'Samakan penyebut menjadi 6: 1/2 = 3/6 dan 2/3 = 4/6.',
        'Pada garis bilangan 0 sampai 1, posisi 2/3 (4/6) berada di sebelah kanan 1/2 (3/6). Jadi 2/3 lebih besar!',
      ],
    },
  },
  {
    id: 5,
    code: 'KAT-5',
    title: 'Mengurutkan Pecahan Penyebut Berbeda',
    shortTitle: 'Mengurutkan Pecahan',
    worldId: 3,
    methodBadge: 'Singapore Math CPA',
    conceptSummary:
      'Mengurutkan beberapa pecahan dari terkecil ke terbesar (atau sebaliknya) dilakukan dengan membandingkan luas pizza dan menyamakan penyebut ke KPK-nya.',
    concreteStep:
      'CONCRETE: Tiga piring pesanan berisi 1/2 pizza, 2/3 pizza, dan 3/4 pizza.',
    pictorialStep:
      'PICTORIAL: Samakan ketiganya menjadi per-12 potong: 1/2 = 6/12, 2/3 = 8/12, dan 3/4 = 9/12.',
    abstractStep:
      'ABSTRACT: Urutan dari terkecil ke terbesar adalah 6/12, 8/12, 9/12 yaitu 1/2, 2/3, 3/4.',
    gasingTip:
      'Ubah semua pizza ke potongan kecil yang sama (KPK penyebut = 12), lalu urutkan jumlah potongannya!',
    demoConfig: {
      type: 'order_fractions',
      fractions: [
        { num: 1, den: 2 },
        { num: 2, den: 3 },
        { num: 3, den: 4 },
      ],
      explanationSteps: [
        'Kita memiliki tiga pecahan: 1/2, 2/3, dan 3/4.',
        'KPK dari penyebut 2, 3, dan 4 adalah 12.',
        '1/2 = 6/12, 2/3 = 8/12, dan 3/4 = 9/12.',
        'Urutan dari terkecil ke terbesar pada garis bilangan: 1/2 → 2/3 → 3/4.',
      ],
    },
  },
  {
    id: 6,
    code: 'KAT-6',
    title: 'Penjumlahan Pecahan Penyebut Sama',
    shortTitle: 'Jumlah Penyebut Sama',
    worldId: 3,
    methodBadge: 'Singapore Math CPA',
    conceptSummary:
      'Menjumlahkan pecahan berpenyebut sama berarti menggabungkan potongan pizza yang ukurannya sudah sama ke dalam satu loyang.',
    concreteStep:
      'CONCRETE: Piring 1 berisi 1/5 pizza dan Piring 2 berisi 2/5 pizza.',
    pictorialStep:
      'PICTORIAL: Pindahkan 1 potong dan 2 potong ke loyang yang sama → menjadi 3 potong dari 5 bagian.',
    abstractStep:
      'ABSTRACT: 1/5 + 2/5 = (1 + 2)/5 = 3/5. Ingat: Penyebut TETAP 5 (tidak ikut dijumlahkan!).',
    gasingTip:
      '1 potong seperlima + 2 potong seperlima = 3 potong seperlima (3/5). Ukuran potongannya tetap seperlima!',
    demoConfig: {
      type: 'add_same',
      fractions: [
        { num: 1, den: 5 },
        { num: 2, den: 5 },
      ],
      targetResult: { num: 3, den: 5 },
      explanationSteps: [
        'Pizza pertama memiliki 1 potong dari 5 bagian (1/5).',
        'Pizza kedua memiliki 2 potong dari 5 bagian (2/5).',
        'Kedua bagian digabungkan menjadi 1 + 2 = 3 potong dari 5 bagian (3/5).',
        'Penyebut tetap 5 karena ukuran tiap potongan tidak berubah.',
      ],
    },
  },
  {
    id: 7,
    code: 'KAT-7',
    title: 'Penjumlahan Pecahan Penyebut Berbeda',
    shortTitle: 'Jumlah Penyebut Beda',
    worldId: 3,
    methodBadge: 'Singapore Math CPA',
    conceptSummary:
      'Potongan pizza yang berbeda ukuran tidak bisa langsung dihitung jumlahnya sebelum dipotong menjadi satuan ukuran yang sama (menyamakan penyebut).',
    concreteStep:
      'CONCRETE: Menggabungkan 1/2 loyang pizza keju dengan 1/4 loyang pizza jamur.',
    pictorialStep:
      'PICTORIAL: Potong bagian 1/2 menjadi 2 potong seperempatan (2/4). Sekarang semua potongan berukuran seperempat!',
    abstractStep:
      'ABSTRACT: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
    gasingTip:
      'Mengapa penyebut harus disamakan? Karena kita hanya bisa menjumlahkan benda yang ukurannya setara (seperempat dengan seperempat).',
    demoConfig: {
      type: 'add_diff',
      fractions: [
        { num: 1, den: 2 },
        { num: 1, den: 4 },
      ],
      targetResult: { num: 3, den: 4 },
      explanationSteps: [
        'Tahap 1 (Concrete): Kita punya 1/2 pizza dan 1/4 pizza. Ukuran potongannya berbeda.',
        'Tahap 2 (Pictorial): Potong 1/2 pizza menjadi 2 bagian kecil sehingga menjadi 2/4.',
        'Tahap 3 (Abstract): Sekarang ukurannya sama! 2/4 + 1/4 = 3/4 pizza.',
      ],
    },
  },
  {
    id: 8,
    code: 'KAT-8',
    title: 'Konsep Pecahan Campuran (Metode GASING)',
    shortTitle: 'Konsep Pecahan Campuran',
    worldId: 4,
    methodBadge: 'Metode GASING',
    conceptSummary:
      'Pecahan campuran terdiri dari Bilangan Bulat (loyang pizza yang masih utuh penuh) dan Pecahan Biasa (sisa potongan pizza).',
    concreteStep:
      'CONCRETE: Di meja ada 2 loyang pizza utuh ditambah 1 potong pizza ukuran seperempat.',
    pictorialStep:
      'PICTORIAL: Lihat 2 lingkaran pizza penuh dan 1 juring dari pizza yang dibagi 4.',
    abstractStep:
      'ABSTRACT: Ditulis 2 1/4 (dibaca: dua satu per empat). Artinya 2 + 1/4.',
    gasingTip:
      'Metode GASING: Hitung dulu berapa pizza UTUH-nya (2), lalu tempelkan pecahan sisanya (1/4) menjadi 2 1/4!',
    demoConfig: {
      type: 'mixed_concept',
      fractions: [{ whole: 2, num: 1, den: 4 }],
      targetResult: { whole: 2, num: 1, den: 4 },
      explanationSteps: [
        '1. Kenali pizza utuh: Terdapat 2 loyang pizza yang utuh penuh (Bilangan Bulat = 2).',
        '2. Kenali sisa potongan: Terdapat 1 potong dari pizza yang dibagi 4 bagian (Pecahan = 1/4).',
        '3. Gabungkan bilangan bulat dan pecahan menjadi Pecahan Campuran: 2 1/4.',
      ],
    },
  },
  {
    id: 9,
    code: 'KAT-9',
    title: 'Mengubah Pecahan Biasa Menjadi Campuran',
    shortTitle: 'Biasa ke Campuran',
    worldId: 4,
    methodBadge: 'GASING & Singapore CPA',
    conceptSummary:
      'Jika pembilang lebih besar dari penyebut (pecahan tidak wajar / improper fraction), kita kumpulkan potongan pizza hingga membentuk loyang-loyang utuh.',
    concreteStep:
      'CONCRETE: Ada 11 potong pizza ukuran seperempat (11/4). Setiap 4 potong dikemas menjadi 1 loyang pizza utuh.',
    pictorialStep:
      'PICTORIAL: 4 potong pertama = 1 pizza utuh. 4 potong kedua (total 8) = 2 pizza utuh. Tersisa 3 potong seperempat.',
    abstractStep:
      'ABSTRACT: 11 ÷ 4 = 2 sisa 3 → Hasil bagi (2) jadi bilangan bulat, Sisa (3) jadi pembilang, Penyebut tetap (4) → 2 3/4.',
    gasingTip:
      '11 dibagi 4 dapat 2 loyang penuh (8 potong), sisanya 3 potong seperempat → langsung tulis 2 3/4!',
    demoConfig: {
      type: 'improper_to_mixed',
      fractions: [{ num: 11, den: 4 }],
      targetResult: { whole: 2, num: 3, den: 4 },
      explanationSteps: [
        'Kita memiliki 11 potong pizza ukuran seperempat (11/4).',
        'Setiap 4 potong seperempat membentuk 1 pizza utuh: 8 potong membentuk 2 pizza utuh.',
        'Masih tersisa 11 - 8 = 3 potong seperempat.',
        'Hubungan pembagian: 11 ÷ 4 = 2 sisa 3 → Ditulis 2 3/4.',
      ],
    },
  },
  {
    id: 10,
    code: 'KAT-10',
    title: 'Menyederhanakan Pecahan',
    shortTitle: 'Menyederhanakan Pecahan',
    worldId: 4,
    methodBadge: 'GASING & Singapore CPA',
    conceptSummary:
      'Menyederhanakan pecahan berarti menyatukan potongan-potongan kecil menjadi potongan lebih besar tanpa mengubah jumlah pizza, dengan membagi pembilang & penyebut menggunakan FPB.',
    concreteStep:
      'CONCRETE: Pesanan 6/8 pizza memiliki 6 potong kecil dari 8 bagian.',
    pictorialStep:
      'PICTORIAL: Gabungkan setiap 2 potong kecil menjadi 1 potong lebih besar → kini menjadi 3 potong dari 4 bagian (3/4).',
    abstractStep:
      'ABSTRACT: FPB dari 6 dan 8 adalah 2. Maka (6 ÷ 2) / (8 ÷ 2) = 3/4 (bentuk paling sederhana).',
    gasingTip:
      'Bagi atas dan bawah dengan angka pembagi terbesar yang sama (FPB) sampai tidak bisa dibagi lagi!',
    demoConfig: {
      type: 'simplify',
      fractions: [
        { num: 6, den: 8 },
        { num: 3, den: 4 },
      ],
      targetResult: { num: 3, den: 4 },
      explanationSteps: [
        'Pecahan awal adalah 6/8 (6 potong dari 8 bagian).',
        'Cari Faktor Persekutuan Terbesar (FPB) dari 6 dan 8, yaitu 2.',
        'Bagi pembilang dan penyebut dengan 2: (6 ÷ 2) / (8 ÷ 2) = 3/4.',
        'Luas pizza 6/8 dan 3/4 tetap sama persis, namun 3/4 adalah bentuk paling sederhana.',
      ],
    },
  },
  {
    id: 11,
    code: 'KAT-11',
    title: 'Mengubah Pecahan Campuran Menjadi Biasa',
    shortTitle: 'Campuran ke Biasa',
    worldId: 4,
    methodBadge: 'Metode GASING',
    conceptSummary:
      'Untuk mengubah pecahan campuran menjadi pecahan biasa, potong seluruh pizza utuh sesuai ukuran penyebut lalu tambahkan sisa potongannya.',
    concreteStep:
      'CONCRETE: Kita memiliki 2 1/3 pizza (2 loyang utuh dan 1 potong sepertiga).',
    pictorialStep:
      'PICTORIAL: Potong masing-masing dari 2 pizza utuh menjadi 3 bagian → didapat 2 × 3 = 6 potong sepertiga. Tambah 1 potong lagi = 7 potong sepertiga.',
    abstractStep:
      'ABSTRACT: Rumus GASING: ((Bilangan Bulat × Penyebut) + Pembilang) / Penyebut = ((2 × 3) + 1) / 3 = 7/3.',
    gasingTip:
      'Putar searah jarum jam: Bawah kali Samping, lalu Tambah Atas! (3 × 2 + 1 = 7) → 7/3.',
    demoConfig: {
      type: 'mixed_to_improper',
      fractions: [{ whole: 2, num: 1, den: 3 }],
      targetResult: { num: 7, den: 3 },
      explanationSteps: [
        '1. Perlihatkan 2 pizza utuh dan 1 potong sepertiga (2 1/3).',
        '2. Setiap pizza utuh dipotong menjadi 3 bagian → 2 × 3 = 6 potongan sepertiga.',
        '3. Tambahkan 1 potongan sepertiga yang ada: 6 + 1 = 7 potongan sepertiga.',
        '4. Hasilnya dalam pecahan biasa adalah 7/3.',
      ],
    },
  },
  {
    id: 12,
    code: 'KAT-12',
    title: 'Penjumlahan Pecahan Campuran',
    shortTitle: 'Jumlah Pecahan Campuran',
    worldId: 5,
    methodBadge: 'Metode GASING',
    conceptSummary:
      'Dengan Metode GASING, kita tidak perlu mengubah ke pecahan biasa yang angkanya besar! Cukup pisahkan: jumlahkan bilangan bulat dengan bilangan bulat, dan pecahan dengan pecahan.',
    concreteStep:
      'CONCRETE: Pesanan Meja 1 adalah 1 1/2 loyang, dan tambahan pesanan 2 1/4 loyang.',
    pictorialStep:
      'PICTORIAL: Gabungkan pizza utuh (1 + 2 = 3 loyang utuh). Lalu gabungkan potongan (1/2 = 2/4 ditambah 1/4 = 3/4).',
    abstractStep:
      'ABSTRACT: 1 1/2 + 2 1/4 = (1 + 2) + (2/4 + 1/4) = 3 + 3/4 = 3 3/4.',
    gasingTip:
      'Keunggulan Metode GASING: Bulat tambah Bulat, Pecahan tambah Pecahan! Cepat, mudah, dan bebas hitung angka besar.',
    demoConfig: {
      type: 'add_mixed',
      fractions: [
        { whole: 1, num: 1, den: 2 },
        { whole: 2, num: 1, den: 4 },
      ],
      targetResult: { whole: 3, num: 3, den: 4 },
      explanationSteps: [
        '1. Pisahkan bilangan bulat dan pecahannya: (1 + 2) dan (1/2 + 1/4).',
        '2. Jumlahkan bilangan bulat: 1 + 2 = 3 pizza utuh.',
        '3. Samakan penyebut pecahan: 1/2 = 2/4, lalu jumlahkan 2/4 + 1/4 = 3/4.',
        '4. Gabungkan hasilnya menjadi 3 3/4 pizza!',
      ],
    },
  },
  {
    id: 13,
    code: 'KAT-13',
    title: 'Pengurangan Pecahan Campuran (Peminjaman)',
    shortTitle: 'Kurang Pecahan Campuran',
    worldId: 5,
    methodBadge: 'GASING & Singapore CPA',
    conceptSummary:
      'Saat mengurangkan pecahan campuran dan bagian pecahannya tidak cukup, kita meminjam 1 loyang pizza utuh lalu memotongnya sesuai penyebut!',
    concreteStep:
      'CONCRETE: Di dapur ada 3 1/4 pizza. Pelanggan membeli 1 1/2 pizza (1 2/4). Potongan 1/4 tidak cukup dikurangi 2/4!',
    pictorialStep:
      'PICTORIAL: Ambil 1 pizza utuh dari 3 pizza, potong menjadi 4/4. Kini kita punya 2 pizza utuh dan (1/4 + 4/4) = 5/4 potong pizza (2 5/4).',
    abstractStep:
      'ABSTRACT: 3 1/4 - 1 1/2 = 3 1/4 - 1 2/4 = 2 5/4 - 1 2/4 = (2 - 1) + (5/4 - 2/4) = 1 3/4.',
    gasingTip:
      'Pinjam 1 loyang utuh = tambah pembilang sebesar penyebutnya! 3 1/4 dipinjam 1 langsung jadi 2 (1+4)/4 = 2 5/4.',
    demoConfig: {
      type: 'sub_mixed',
      fractions: [
        { whole: 3, num: 1, den: 4 },
        { whole: 1, num: 1, den: 2 },
      ],
      targetResult: { whole: 1, num: 3, den: 4 },
      explanationSteps: [
        '1. Persediaan awal: 3 pizza utuh dan 1/4 potong (3 1/4) dikurangi 1 1/2 (yaitu 1 2/4).',
        '2. Karena 1/4 tidak cukup dikurangi 2/4, pinjam 1 pizza utuh lalu potong menjadi 4/4.',
        '3. Sekarang 3 1/4 berubah menjadi 2 pizza utuh dan 5/4 potong (2 5/4).',
        '4. Kurangkan: (2 - 1) utuh dan (5/4 - 2/4) = 1 3/4 pizza!',
      ],
    },
  },
];

export interface WorldInfo {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  badgeColor: string;
  categories: number[];
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'WORLD 1: PIZZA BEGINNER',
    subtitle: 'Dapur Dasar Pecahan',
    description: 'Mengenal arti pecahan, pembilang, penyebut, dan memotong pizza sama besar.',
    badgeColor: '#16A34A',
    categories: [1],
  },
  {
    id: 2,
    name: 'WORLD 2: FRACTION EXPLORER',
    subtitle: 'Restoran Pecahan Senilai & Perbandingan',
    description: 'Menemukan pecahan senilai dan membandingkan porsi pesanan pelanggan.',
    badgeColor: '#0284C7',
    categories: [2, 3, 4],
  },
  {
    id: 3,
    name: 'WORLD 3: FRACTION CHALLENGE',
    subtitle: 'Kafe Urutan & Penjumlahan Pizza',
    description: 'Mengurutkan pesanan pecahan dan menjumlahkan pizza penyebut sama & berbeda.',
    badgeColor: '#D97706',
    categories: [5, 6, 7],
  },
  {
    id: 4,
    name: 'WORLD 4: MIXED FRACTION KITCHEN',
    subtitle: 'Dapur Pecahan Campuran & Penyederhanaan',
    description: 'Menguasai pecahan campuran Metode GASING, konversi, dan penyederhanaan FPB.',
    badgeColor: '#9333EA',
    categories: [8, 9, 10, 11],
  },
  {
    id: 5,
    name: 'WORLD 5: MASTER PIZZA CHEF',
    subtitle: 'Grand Pizzeria Pecahan Campuran',
    description: 'Penjumlahan & pengurangan pecahan campuran dengan peminjaman serta tantangan grand master!',
    badgeColor: '#DC2626',
    categories: [12, 13],
  },
];

export interface LevelConfig {
  id: number;
  worldId: number;
  title: string;
  subtitle: string;
  categories: number[];
  targetOrders: number;
  timeLimitSeconds: number; // 0 atau longgar pada level awal
  targetScore: number;
  targetMoney: number;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan' | 'Master';
}

export const LEVELS: LevelConfig[] = [
  // WORLD 1
  {
    id: 1,
    worldId: 1,
    title: 'Level 1: Potongan Pertama',
    subtitle: 'Pizza dibagi 2, 3, dan 4 bagian sama besar',
    categories: [1],
    targetOrders: 4,
    timeLimitSeconds: 180,
    targetScore: 350,
    targetMoney: 45,
    difficulty: 'Pemula',
  },
  {
    id: 2,
    worldId: 1,
    title: 'Level 2: Pesta Potongan Pizza',
    subtitle: 'Pizza dibagi 5, 6, 8, 10, dan 12 bagian',
    categories: [1],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 450,
    targetMoney: 60,
    difficulty: 'Pemula',
  },
  // WORLD 2
  {
    id: 3,
    worldId: 2,
    title: 'Level 3: Kembar Tapi Beda',
    subtitle: 'Mencocokkan Pecahan Senilai (1/2 = 2/4 = 4/8)',
    categories: [2],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 500,
    targetMoney: 65,
    difficulty: 'Pemula',
  },
  {
    id: 4,
    worldId: 2,
    title: 'Level 4: Porsi Mana Lebih Besar?',
    subtitle: 'Membandingkan pecahan berpenyebut sama',
    categories: [3],
    targetOrders: 5,
    timeLimitSeconds: 170,
    targetScore: 500,
    targetMoney: 70,
    difficulty: 'Pemula',
  },
  {
    id: 5,
    worldId: 2,
    title: 'Level 5: Tantangan Dua Loyang',
    subtitle: 'Membandingkan pecahan berpenyebut berbeda',
    categories: [4],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 550,
    targetMoney: 75,
    difficulty: 'Menengah',
  },
  // WORLD 3
  {
    id: 6,
    worldId: 3,
    title: 'Level 6: Barisan Pizza Rapi',
    subtitle: 'Mengurutkan 3 pecahan berbeda penyebut',
    categories: [5],
    targetOrders: 5,
    timeLimitSeconds: 190,
    targetScore: 550,
    targetMoney: 80,
    difficulty: 'Menengah',
  },
  {
    id: 7,
    worldId: 3,
    title: 'Level 7: Gabungan Topping Kembar',
    subtitle: 'Penjumlahan pecahan dengan penyebut sama',
    categories: [6],
    targetOrders: 5,
    timeLimitSeconds: 170,
    targetScore: 550,
    targetMoney: 80,
    difficulty: 'Menengah',
  },
  {
    id: 8,
    worldId: 3,
    title: 'Level 8: Kombinasi Spesial CPA',
    subtitle: 'Penjumlahan pecahan dengan penyebut berbeda',
    categories: [7],
    targetOrders: 5,
    timeLimitSeconds: 190,
    targetScore: 600,
    targetMoney: 90,
    difficulty: 'Menengah',
  },
  // WORLD 4
  {
    id: 9,
    worldId: 4,
    title: 'Level 9: Loyang Utuh & Potongan',
    subtitle: 'Mengenal konsep pecahan campuran Metode GASING',
    categories: [8],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 600,
    targetMoney: 90,
    difficulty: 'Menengah',
  },
  {
    id: 10,
    worldId: 4,
    title: 'Level 10: Kemas Jadi Utuh',
    subtitle: 'Mengubah pecahan biasa menjadi pecahan campuran',
    categories: [9],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 650,
    targetMoney: 95,
    difficulty: 'Lanjutan',
  },
  {
    id: 11,
    worldId: 4,
    title: 'Level 11: Potongan Paling Sederhana',
    subtitle: 'Menyederhanakan pecahan dengan FPB',
    categories: [10],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 650,
    targetMoney: 95,
    difficulty: 'Lanjutan',
  },
  {
    id: 12,
    worldId: 4,
    title: 'Level 12: Rahasia Putar GASING',
    subtitle: 'Mengubah pecahan campuran menjadi pecahan biasa',
    categories: [11],
    targetOrders: 5,
    timeLimitSeconds: 180,
    targetScore: 650,
    targetMoney: 100,
    difficulty: 'Lanjutan',
  },
  // WORLD 5
  {
    id: 13,
    worldId: 5,
    title: 'Level 13: Pesta Keluarga Besar',
    subtitle: 'Penjumlahan pecahan campuran Metode GASING',
    categories: [12],
    targetOrders: 5,
    timeLimitSeconds: 200,
    targetScore: 700,
    targetMoney: 110,
    difficulty: 'Lanjutan',
  },
  {
    id: 14,
    worldId: 5,
    title: 'Level 14: Jurus Pinjam Satu Loyang',
    subtitle: 'Pengurangan pecahan campuran dengan peminjaman',
    categories: [13],
    targetOrders: 5,
    timeLimitSeconds: 210,
    targetScore: 750,
    targetMoney: 120,
    difficulty: 'Master',
  },
  {
    id: 15,
    worldId: 5,
    title: 'Level 15: Grand Master Pizza Empire',
    subtitle: 'Tantangan campuran seluruh 13 materi pecahan!',
    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    targetOrders: 7,
    timeLimitSeconds: 240,
    targetScore: 1000,
    targetMoney: 160,
    difficulty: 'Master',
  },
];

export interface RestaurantUpgrade {
  id: string;
  category: 'interior' | 'kitchen' | 'decor' | 'expansion';
  categoryLabel: string;
  name: string;
  description: string;
  price: number;
  bonusText: string;
  tipBonus: number; // Tambahan uang per pesanan benar
}

export const RESTAURANT_UPGRADES: RestaurantUpgrade[] = [
  // 1. INTERIOR RESTORAN
  {
    id: 'int_table_wood',
    category: 'interior',
    categoryLabel: 'Interior Restoran',
    name: 'Meja & Kursi Kayu Jati Italia',
    description: 'Mengganti meja standar menjadi meja kayu jati berperspektif 2.5D dengan taplak kotak merah-putih khas Italia.',
    price: 45,
    bonusText: '+$2 Tip Pelanggan',
    tipBonus: 2,
  },
  {
    id: 'int_chandelier',
    category: 'interior',
    categoryLabel: 'Interior Restoran',
    name: 'Lampu Gantung Kristal Hangat',
    description: 'Menambahkan lampu gantung dekoratif bercahaya keemasan di langit-langit restoran.',
    price: 75,
    bonusText: '+$3 Tip Pelanggan',
    tipBonus: 3,
  },
  {
    id: 'int_marble_floor',
    category: 'interior',
    categoryLabel: 'Interior Restoran',
    name: 'Lantai Marmer & Wallpaper Bata Klasik',
    description: 'Mempercantik lantai catur marmer mengilap dan dinding bata ekspos khas restoran Eropa.',
    price: 110,
    bonusText: '+$4 Tip Pelanggan',
    tipBonus: 4,
  },

  // 2. DAPUR PIZZA
  {
    id: 'kit_brick_oven',
    category: 'kitchen',
    categoryLabel: 'Dapur Pizza',
    name: 'Oven Batu Api Turbo Emas',
    description: 'Upgrade oven bata dengan kubah tembaga emas dan nyala api biru-oranye yang memanggang lebih merata.',
    price: 60,
    bonusText: '+$3 Tip Pelanggan',
    tipBonus: 3,
  },
  {
    id: 'kit_prep_counter',
    category: 'kitchen',
    categoryLabel: 'Dapur Pizza',
    name: 'Meja Granit & Mesin Pemotong Presisi',
    description: 'Meja persiapan adonan marmer granit lengkap dengan pemotong laser pecahan presisi tinggi.',
    price: 95,
    bonusText: '+$4 Tip Pelanggan',
    tipBonus: 4,
  },
  {
    id: 'kit_topping_rack',
    category: 'kitchen',
    categoryLabel: 'Dapur Pizza',
    name: 'Rak Topping Stainless Deluxe',
    description: 'Rak bertingkat higienis untuk keju mozzarella, pepperoni, jamur, paprika, dan jagung manis.',
    price: 80,
    bonusText: '+$3 Tip Pelanggan',
    tipBonus: 3,
  },

  // 3. DEKORASI
  {
    id: 'dec_plants',
    category: 'decor',
    categoryLabel: 'Dekorasi',
    name: 'Tanaman Basil & Pohon Zaitun',
    description: 'Menghadirkan tanaman hijau segar di sudut restoran dan pot herbal di dekat jendela.',
    price: 40,
    bonusText: '+$2 Tip Pelanggan',
    tipBonus: 2,
  },
  {
    id: 'dec_neon_sign',
    category: 'decor',
    categoryLabel: 'Dekorasi',
    name: 'Papan Nama & Lampu Neon "PIZZA FRENZY"',
    description: 'Memasang papan lampu neon menyala dan lukisan dinding pecahan pizza di ruang makan.',
    price: 85,
    bonusText: '+$4 Tip Pelanggan',
    tipBonus: 4,
  },

  // 4. PENGEMBANGAN RESTORAN
  {
    id: 'exp_extra_tables',
    category: 'expansion',
    categoryLabel: 'Pengembangan Restoran',
    name: 'Tambah Meja Pelanggan Baru',
    description: 'Menambah deretan meja baru di ruang utama agar restoran terlihat ramai dan megah.',
    price: 120,
    bonusText: '+$5 Tip Pelanggan',
    tipBonus: 5,
  },
  {
    id: 'exp_vip_lounge',
    category: 'expansion',
    categoryLabel: 'Pengembangan Restoran',
    name: 'Buka Area VIP Karpet Merah',
    description: 'Membuka balkon & area VIP eksklusif dengan sofa beludru emas untuk pelanggan VIP.',
    price: 180,
    bonusText: '+$7 Tip Pelanggan',
    tipBonus: 7,
  },
  {
    id: 'exp_aceh_branch',
    category: 'expansion',
    categoryLabel: 'Pengembangan Restoran',
    name: 'Buka Cabang Baru SDN 66 Banda Aceh',
    description: 'Membuka cabang kehormatan "Empire Pizza SDN 66 Banda Aceh" dengan plakat emas di restoran!',
    price: 250,
    bonusText: '+$10 Tip Pelanggan',
    tipBonus: 10,
  },
];

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  medalColor: string;
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'fraction_beginner',
    title: 'Fraction Beginner',
    description: 'Berhasil menyelesaikan level pertama dan memahami konsep pembilang serta penyebut.',
    requirementText: 'Selesaikan Level 1',
    medalColor: '#22C55E',
  },
  {
    id: 'pizza_expert',
    title: 'Pizza Expert',
    description: 'Melayani minimal 15 pelanggan dengan tepat di restoran pizza.',
    requirementText: 'Layani 15 Pelanggan dengan Benar',
    medalColor: '#0EA5E9',
  },
  {
    id: 'fraction_master',
    title: 'Fraction Master',
    description: 'Menguasai perbandingan, pengurutan, dan penjumlahan pecahan berbeda penyebut (Selesaikan World 3).',
    requirementText: 'Selesaikan Level 8 (World 3)',
    medalColor: '#F59E0B',
  },
  {
    id: 'mixed_fraction_master',
    title: 'Mixed Fraction Master',
    description: 'Menguasai seluruh operasi pecahan campuran Metode GASING & penyederhanaan FPB.',
    requirementText: 'Selesaikan Level 14',
    medalColor: '#A855F7',
  },
  {
    id: 'super_pizza_chef',
    title: 'Super Pizza Chef',
    description: 'Menamatkan seluruh 15 Level dan membangun kerajaan bisnis Pizza Empire SDN 66 Banda Aceh!',
    requirementText: 'Tamatkan Level 15 & Miliki 4 Upgrade',
    medalColor: '#EF4444',
  },
];
